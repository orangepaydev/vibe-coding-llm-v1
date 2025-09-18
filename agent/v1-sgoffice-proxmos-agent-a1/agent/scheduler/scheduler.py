"""
Scheduler for Proxmox Agent
Coordinates scheduled deletions and reminders using Proxmox, Slack, and Google Calendar integrations.
"""
import os
import time
from datetime import datetime, timedelta
from typing import Dict, Any
from agent.integrations.proxmox.client import ProxmoxClient, ProxmoxAPIError
from agent.integrations.slack.bot import SlackBot
from agent.integrations.calendar.google_calendar import GoogleCalendarClient

class DeletionScheduler:
    def __init__(self, proxmox: ProxmoxClient, slack: SlackBot, calendar: GoogleCalendarClient, poll_interval: int = 60):
        """
        :param proxmox: ProxmoxClient instance
        :param slack: SlackBot instance
        :param calendar: GoogleCalendarClient instance
        :param poll_interval: Polling interval in seconds
        """
        self.proxmox = proxmox
        self.slack = slack
        self.calendar = calendar
        self.poll_interval = poll_interval
        self.last_checked = datetime.utcnow()

    def run(self):
        """Main loop to check for reminders and deletions."""
        while True:
            now = datetime.utcnow()
            events = self.calendar.list_deletion_events()
            for event in events:
                start_str = event['start']['dateTime']
                start_time = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
                event_id = event['id']
                summary = event.get('summary', '')
                description = event.get('description', '')
                # Parse container_id, user, channel from summary/description
                container_id = self._extract_container_id(summary)
                user, channel = self._extract_user_channel(description)
                # 1-day-before reminder
                if self._is_time_between(now, start_time - timedelta(days=1), start_time - timedelta(days=1) + timedelta(minutes=self.poll_interval)):
                    reminder = f"Reminder: Container {container_id} will be deleted in 1 day."
                    self.slack.send_message(channel, reminder)
                    self.slack.broadcast_notification(reminder)
                # Deletion time
                if self._is_time_between(now, start_time, start_time + timedelta(minutes=self.poll_interval)):
                    try:
                        self.proxmox.delete_container(int(container_id))
                        msg = f"Container {container_id} has been deleted as scheduled."
                        self.slack.send_message(channel, msg)
                        self.slack.broadcast_notification(msg)
                        self.calendar.delete_event(event_id)
                    except ProxmoxAPIError as e:
                        err_msg = f"Failed to delete container {container_id}: {e}"
                        self.slack.send_message(channel, err_msg)
                        self.slack.broadcast_notification(err_msg)
            self.last_checked = now
            time.sleep(self.poll_interval)

    @staticmethod
    def _extract_container_id(summary: str) -> str:
        # Assumes summary format: 'Proxmox container {ID} scheduled for deletion'
        parts = summary.split()
        for i, part in enumerate(parts):
            if part == 'container' and i + 1 < len(parts):
                return parts[i + 1]
        return ''

    @staticmethod
    def _extract_user_channel(description: str) -> (str, str):
        # Parses 'Requested by: {user}\nChannel: {channel}\n...'
        user, channel = '', ''
        for line in description.split('\n'):
            if line.startswith('Requested by:'):
                user = line.split(':', 1)[1].strip()
            if line.startswith('Channel:'):
                channel = line.split(':', 1)[1].strip()
        return user, channel

    @staticmethod
    def _is_time_between(now: datetime, start: datetime, end: datetime) -> bool:
        return start <= now < end

# Example usage (instances should be created with real credentials)
# scheduler = DeletionScheduler(proxmox, slack, calendar)
# scheduler.run()
