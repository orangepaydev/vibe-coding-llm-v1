import unittest
from unittest.mock import MagicMock
from agent.integrations.slack.bot import SlackBot

class TestSlackBot(unittest.TestCase):
    def setUp(self):
        self.bot = SlackBot('bot_token', 'app_token')
        self.bot.client = MagicMock()
        self.bot.rtm = MagicMock()

    def test_send_message(self):
        self.bot.send_message('C123', 'hello')
        self.bot.client.chat_postMessage.assert_called_with(channel='C123', text='hello')

    def test_broadcast_notification(self):
        self.bot.send_message = MagicMock()
        self.bot.broadcast_notification('notify')
        self.bot.send_message.assert_called_with('#proxmox', 'notify')

    def test_parse_message(self):
        self.assertEqual(self.bot.parse_message('  List Containers  '), 'list containers')

if __name__ == '__main__':
    unittest.main()
