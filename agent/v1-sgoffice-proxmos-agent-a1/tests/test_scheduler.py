import unittest
from unittest.mock import MagicMock
from datetime import datetime, timedelta
from agent.scheduler.scheduler import DeletionScheduler

class TestDeletionScheduler(unittest.TestCase):
    def setUp(self):
        self.proxmox = MagicMock()
        self.slack = MagicMock()
        self.calendar = MagicMock()
        self.scheduler = DeletionScheduler(self.proxmox, self.slack, self.calendar, poll_interval=1)

    def test_extract_container_id(self):
        summary = 'Proxmox container 103 scheduled for deletion'
        self.assertEqual(self.scheduler._extract_container_id(summary), '103')

    def test_extract_user_channel(self):
        desc = 'Requested by: @user\nChannel: #proxmox\nMetadata: ...'
        user, channel = self.scheduler._extract_user_channel(desc)
        self.assertEqual(user, '@user')
        self.assertEqual(channel, '#proxmox')

    def test_is_time_between(self):
        now = datetime.utcnow()
        start = now - timedelta(minutes=1)
        end = now + timedelta(minutes=1)
        self.assertTrue(self.scheduler._is_time_between(now, start, end))
        self.assertFalse(self.scheduler._is_time_between(now, end, end + timedelta(minutes=1)))

if __name__ == '__main__':
    unittest.main()
