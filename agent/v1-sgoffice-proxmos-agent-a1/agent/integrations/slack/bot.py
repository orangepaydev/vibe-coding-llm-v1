"""Slack Bot for Proxmox Agent.""""""

Slack bot integration for Proxmox Agent.

import loggingHandles message parsing, command routing, and sending responses/notifications.

import threading"""

import reimport os

from typing import Any, Callable, Dict, List, Optional, Unionfrom slack_sdk import WebClient

from slack_sdk.errors import SlackApiError

from slack_bolt import App, Ackfrom slack_sdk.rtm_v2 import RTMClient

from slack_bolt.adapter.socket_mode import SocketModeHandlerfrom typing import Callable, Dict, Any

from slack_sdk.web.client import WebClient

class SlackBot:

from agent.config import config    def __init__(self, bot_token: str, app_token: str, channel_notify: str = "#proxmox"):

        """

# Set up logger        Initialize the Slack bot.

logger = logging.getLogger(__name__)        :param bot_token: Slack bot token (xoxb-...)

        :param app_token: Slack app-level token (xapp-...)

class SlackBot:        :param channel_notify: Channel to broadcast notifications

    """Slack Bot for Proxmox Agent."""        """

            self.client = WebClient(token=bot_token)

    def __init__(self, message_callback: Optional[Callable] = None) -> None:        self.rtm = RTMClient(token=app_token)

        """Initialize the Slack Bot.        self.channel_notify = channel_notify

                self.command_handlers: Dict[str, Callable[[Dict[str, Any]], None]] = {}

        Args:

            message_callback: Optional callback function that will be called when a message is received.    def register_command(self, command: str, handler: Callable[[Dict[str, Any]], None]):

                The function should accept a message dictionary with 'text', 'user', 'channel', etc.        """Register a command handler."""

        """        self.command_handlers[command] = handler

        slack_config = config.get_section("slack")

        self.bot_token = slack_config.get("bot_token", "")    def send_message(self, channel: str, text: str):

        self.app_token = slack_config.get("app_token", "")        try:

        self.proxmox_channel = slack_config.get("proxmox_channel", "#proxmox")            self.client.chat_postMessage(channel=channel, text=text)

                except SlackApiError as e:

        # Ensure the proxmox channel has a leading '#' if not a channel ID            print(f"Slack API error: {e.response['error']}")

        if not self.proxmox_channel.startswith("#") and not self.proxmox_channel.startswith("C"):

            self.proxmox_channel = f"#{self.proxmox_channel}"    def broadcast_notification(self, text: str):

                    self.send_message(self.channel_notify, text)

        self.app = App(token=self.bot_token)

        self.client = self.app.client    def parse_message(self, text: str) -> str:

        self.message_callback = message_callback        """Simple parser to extract command from message text."""

                # This can be extended for NLP or pattern matching

        # Set up event listeners        return text.strip().lower()

        self._setup_listeners()

            def handle_event(self, event: Dict[str, Any]):

        # Thread for the bot        if event.get("type") == "message" and "text" in event:

        self.socket_mode_handler = None            user = event.get("user")

        self.bot_thread = None            channel = event.get("channel")

                    text = event["text"]

        logger.info("Slack bot initialized")            command = self.parse_message(text)

                if command in self.command_handlers:

    def _setup_listeners(self) -> None:                self.command_handlers[command]({"user": user, "channel": channel, "text": text})

        """Set up event listeners for Slack messages."""            else:

        # Listen for direct messages                self.send_message(channel, "Sorry, I didn't understand that command.")

        self.app.message()(self._handle_message)

            def start(self):

        # Listen for app_mention events        @self.rtm.on("message")

        self.app.event("app_mention")(self._handle_app_mention)        def handle(**payload):

                event = payload["data"]

    async def _handle_message(self, message: Dict[str, Any], say: Callable) -> None:            self.handle_event(event)

        """Handle direct messages sent to the bot.        self.rtm.start()

        

        Args:# Example usage (tokens should be securely loaded from environment or config)

            message: Message data from Slack.# bot = SlackBot(

            say: Function to send a message to the channel.#     bot_token=os.environ['SLACK_BOT_TOKEN'],

        """#     app_token=os.environ['SLACK_APP_TOKEN']

        # Skip messages from the bot itself# )

        if message.get("user") == self.app.client.auth_test()["user_id"]:# bot.start()

            return
            
        # Skip messages that are in channels and not directed at the bot
        if message.get("channel_type") == "channel" and not self._is_bot_mentioned(message):
            return
            
        logger.info(f"Received message: {message.get('text', '')}")
        
        if self.message_callback:
            try:
                # Call the callback function
                response = await self.message_callback(message)
                if response:
                    await say(response)
            except Exception as e:
                logger.exception(f"Error processing message: {str(e)}")
                await say(f"Sorry, I encountered an error: {str(e)}")
    
    async def _handle_app_mention(self, event: Dict[str, Any], say: Callable) -> None:
        """Handle mentions of the bot in channels.
        
        Args:
            event: Event data from Slack.
            say: Function to send a message to the channel.
        """
        logger.info(f"Received mention: {event.get('text', '')}")
        
        if self.message_callback:
            try:
                # Create a message-like object from the event
                message = {
                    "text": event.get("text", ""),
                    "user": event.get("user", ""),
                    "channel": event.get("channel", ""),
                    "ts": event.get("ts", ""),
                    "event_ts": event.get("event_ts", "")
                }
                
                # Call the callback function
                response = await self.message_callback(message)
                if response:
                    await say(response)
            except Exception as e:
                logger.exception(f"Error processing mention: {str(e)}")
                await say(f"Sorry, I encountered an error: {str(e)}")
    
    def _is_bot_mentioned(self, message: Dict[str, Any]) -> bool:
        """Check if the bot is mentioned in the message.
        
        Args:
            message: Message data from Slack.
            
        Returns:
            True if the bot is mentioned, False otherwise.
        """
        bot_id = self.app.client.auth_test()["user_id"]
        text = message.get("text", "")
        return f"<@{bot_id}>" in text
    
    def start(self) -> None:
        """Start the Slack bot in a separate thread."""
        if not self.bot_token or not self.app_token:
            logger.error("Slack bot or app token not configured. Cannot start bot.")
            return
            
        def _run_socket_mode():
            """Run the SocketModeHandler in a separate thread."""
            try:
                self.socket_mode_handler = SocketModeHandler(self.app, self.app_token)
                self.socket_mode_handler.start()
            except Exception as e:
                logger.exception(f"Error starting Slack bot: {str(e)}")
        
        self.bot_thread = threading.Thread(target=_run_socket_mode, daemon=True)
        self.bot_thread.start()
        logger.info("Slack bot started")
    
    def stop(self) -> None:
        """Stop the Slack bot."""
        if self.socket_mode_handler:
            self.socket_mode_handler.close()
            logger.info("Slack bot stopped")
    
    async def send_message(self, channel: str, text: str, blocks: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Send a message to a Slack channel.
        
        Args:
            channel: Channel ID or name to send the message to.
            text: Text of the message.
            blocks: Optional blocks for rich formatting.
            
        Returns:
            Response from the Slack API.
        """
        try:
            result = await self.client.chat_postMessage(
                channel=channel,
                text=text,
                blocks=blocks
            )
            return result
        except Exception as e:
            logger.error(f"Error sending message to {channel}: {str(e)}")
            raise
    
    async def send_notification(self, text: str, user: Optional[str] = None, blocks: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        """Send a notification to the Proxmox channel and optionally to a specific user.
        
        Args:
            text: Text of the notification.
            user: Optional user ID to notify.
            blocks: Optional blocks for rich formatting.
            
        Returns:
            List of responses from the Slack API.
        """
        responses = []
        
        # Send to the Proxmox channel
        try:
            channel_response = await self.send_message(
                channel=self.proxmox_channel,
                text=text,
                blocks=blocks
            )
            responses.append(channel_response)
        except Exception as e:
            logger.error(f"Error sending notification to channel {self.proxmox_channel}: {str(e)}")
        
        # Send to the specific user if provided
        if user:
            try:
                user_response = await self.send_message(
                    channel=user,
                    text=text,
                    blocks=blocks
                )
                responses.append(user_response)
            except Exception as e:
                logger.error(f"Error sending notification to user {user}: {str(e)}")
        
        return responses
    
    async def create_deletion_notification(self, container_id: Union[int, str], container_name: Optional[str], 
                               deletion_time: str, user: Optional[str] = None) -> List[Dict[str, Any]]:
        """Create and send a notification about a scheduled container deletion.
        
        Args:
            container_id: ID of the container.
            container_name: Optional name of the container.
            deletion_time: When the container will be deleted (formatted string).
            user: Optional user ID who requested the deletion.
            
        Returns:
            List of responses from the Slack API.
        """
        container_name_text = f" ({container_name})" if container_name else ""
        
        text = f"Container {container_id}{container_name_text} is scheduled for deletion on {deletion_time}"
        
        if user:
            text += f" (requested by <@{user}>)"
        
        blocks = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Scheduled Container Deletion*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"Container *{container_id}*{container_name_text} will be deleted on *{deletion_time}*"
                }
            }
        ]
        
        if user:
            blocks.append({
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": f"Requested by <@{user}>"
                    }
                ]
            })
        
        return await self.send_notification(text=text, user=user, blocks=blocks)
    
    async def create_deletion_reminder(self, container_id: Union[int, str], container_name: Optional[str], 
                           deletion_time: str, user: Optional[str] = None) -> List[Dict[str, Any]]:
        """Create and send a reminder about a scheduled container deletion.
        
        Args:
            container_id: ID of the container.
            container_name: Optional name of the container.
            deletion_time: When the container will be deleted (formatted string).
            user: Optional user ID who requested the deletion.
            
        Returns:
            List of responses from the Slack API.
        """
        container_name_text = f" ({container_name})" if container_name else ""
        
        text = f"REMINDER: Container {container_id}{container_name_text} will be deleted on {deletion_time}"
        
        if user:
            text += f" (originally requested by <@{user}>)"
        
        blocks = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*REMINDER: Container Deletion Tomorrow*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"Container *{container_id}*{container_name_text} will be deleted on *{deletion_time}*"
                }
            }
        ]
        
        if user:
            blocks.append({
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": f"Originally requested by <@{user}>"
                    }
                ]
            })
        
        return await self.send_notification(text=text, user=user, blocks=blocks)
    
    async def create_deletion_confirmation(self, container_id: Union[int, str], container_name: Optional[str], 
                               user: Optional[str] = None) -> List[Dict[str, Any]]:
        """Create and send a confirmation that a container was deleted.
        
        Args:
            container_id: ID of the container.
            container_name: Optional name of the container.
            user: Optional user ID who requested the deletion.
            
        Returns:
            List of responses from the Slack API.
        """
        container_name_text = f" ({container_name})" if container_name else ""
        
        text = f"Container {container_id}{container_name_text} has been deleted"
        
        if user:
            text += f" (originally requested by <@{user}>)"
        
        blocks = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Container Deleted*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"Container *{container_id}*{container_name_text} has been successfully deleted"
                }
            }
        ]
        
        if user:
            blocks.append({
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": f"Originally requested by <@{user}>"
                    }
                ]
            })
        
        return await self.send_notification(text=text, user=user, blocks=blocks)