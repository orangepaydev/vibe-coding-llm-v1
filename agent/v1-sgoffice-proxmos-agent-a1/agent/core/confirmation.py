"""
Confirmation dialog logic for destructive actions in Proxmox Agent.
Sends confirmation requests to users via Slack before proceeding with deletions.
"""
from agent.integrations.slack.bot import SlackBot
from typing import Callable

class ConfirmationManager:
    def __init__(self, slack: SlackBot):
        self.slack = slack
        self.pending_confirmations = {}  # key: (user, action_id), value: callback

    def request_confirmation(self, user: str, channel: str, action_id: str, message: str, on_confirm: Callable, on_cancel: Callable):
        """
        Send a confirmation message to the user and register callbacks.
        """
        self.pending_confirmations[(user, action_id)] = (on_confirm, on_cancel)
        confirm_text = f"{message}\nReply 'yes' to confirm or 'no' to cancel."
        self.slack.send_message(channel, confirm_text)

    def handle_response(self, user: str, action_id: str, response: str):
        key = (user, action_id)
        if key in self.pending_confirmations:
            on_confirm, on_cancel = self.pending_confirmations.pop(key)
            if response.strip().lower() == 'yes':
                on_confirm()
            else:
                on_cancel()

# Example usage:
# def on_confirm():
#     ... # proceed with deletion
# def on_cancel():
#     ... # abort deletion
# confirmation_manager = ConfirmationManager(slack)
# confirmation_manager.request_confirmation(user, channel, 'delete-103', 'Delete container 103?', on_confirm, on_cancel)
