"""
Google Calendar integration for Proxmox Agent.
Handles creation, querying, and deletion of events for scheduled container deletions.
"""
import os
from typing import List, Dict, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime, timedelta

SCOPES = ['https://www.googleapis.com/auth/calendar']

class GoogleCalendarClient:
    def __init__(self, calendar_id: str, credentials_json: str):
        """
        Initialize the Google Calendar client.
        :param calendar_id: Google Calendar ID
        :param credentials_json: Path to service account credentials JSON file
        """
        credentials = service_account.Credentials.from_service_account_file(
            credentials_json, scopes=SCOPES
        )
        self.service = build('calendar', 'v3', credentials=credentials)
        self.calendar_id = calendar_id

    def create_deletion_event(self, container_id: int, user: str, channel: str, metadata: Dict, days_from_now: int = 2) -> str:
        """
        Create a calendar event for scheduled container deletion.
        :return: Event ID
        """
        start_time = datetime.utcnow() + timedelta(days=days_from_now)
        event = {
            'summary': f'Proxmox container {container_id} scheduled for deletion',
            'description': f'Requested by: {user}\nChannel: {channel}\nMetadata: {metadata}',
            'start': {'dateTime': start_time.isoformat() + 'Z'},
            'end': {'dateTime': (start_time + timedelta(hours=1)).isoformat() + 'Z'},
        }
        created_event = self.service.events().insert(calendarId=self.calendar_id, body=event).execute()
        return created_event['id']

    def list_deletion_events(self) -> List[Dict]:
        """
        List all upcoming container deletion events.
        :return: List of event dicts
        """
        now = datetime.utcnow().isoformat() + 'Z'
        events_result = self.service.events().list(
            calendarId=self.calendar_id,
            timeMin=now,
            maxResults=50,
            singleEvents=True,
            orderBy='startTime',
            q='Proxmox container'
        ).execute()
        return events_result.get('items', [])

    def delete_event(self, event_id: str) -> None:
        """Delete a calendar event by ID."""
        self.service.events().delete(calendarId=self.calendar_id, eventId=event_id).execute()

# Example usage (credentials should be securely loaded from environment or config)
# client = GoogleCalendarClient(
#     calendar_id=os.environ['GOOGLE_CALENDAR_ID'],
#     credentials_json=os.environ['GOOGLE_CREDENTIALS_JSON']
# )
# event_id = client.create_deletion_event(103, '@user', '#proxmox', {'name': 'db'}, 2)
# events = client.list_deletion_events()
