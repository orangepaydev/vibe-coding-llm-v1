"""
Slack bot integration for Proxmox Agent.
Handles message parsing, command routing, and sending responses/notifications.
"""
import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from slack_sdk.rtm_v2 import RTMClient
from typing import Callable, Dict, Any

class SlackBot:
    def __init__(self, bot_token: str, app_token: str, channel_notify: str = "#proxmox"):
        """
        Initialize the Slack bot.
        :param bot_token: Slack bot token (xoxb-...)
        :param app_token: Slack app-level token (xapp-...)
        :param channel_notify: Channel to broadcast notifications
        """
        self.client = WebClient(token=bot_token)
        self.rtm = RTMClient(token=app_token)
        self.channel_notify = channel_notify
        self.command_handlers: Dict[str, Callable[[Dict[str, Any]], None]] = {}

    def register_command(self, command: str, handler: Callable[[Dict[str, Any]], None]):
        """Register a command handler."""
        self.command_handlers[command] = handler

    def send_message(self, channel: str, text: str):
        try:
            self.client.chat_postMessage(channel=channel, text=text)
        except SlackApiError as e:
            print(f"Slack API error: {e.response['error']}")

    def broadcast_notification(self, text: str):
        self.send_message(self.channel_notify, text)

    def parse_message(self, text: str) -> str:
        """Simple parser to extract command from message text."""
        # This can be extended for NLP or pattern matching
        return text.strip().lower()

    def handle_event(self, event: Dict[str, Any]):
        if event.get("type") == "message" and "text" in event:
            user = event.get("user")
            channel = event.get("channel")
            text = event["text"]
            command = self.parse_message(text)
            if command in self.command_handlers:
                self.command_handlers[command]({"user": user, "channel": channel, "text": text})
            else:
                self.send_message(channel, "Sorry, I didn't understand that command.")

    def start(self):
        @self.rtm.on("message")
        def handle(**payload):
            event = payload["data"]
            self.handle_event(event)
        self.rtm.start()

# Example usage (tokens should be securely loaded from environment or config)
# bot = SlackBot(
#     bot_token=os.environ['SLACK_BOT_TOKEN'],
#     app_token=os.environ['SLACK_APP_TOKEN']
# )
# bot.start()
