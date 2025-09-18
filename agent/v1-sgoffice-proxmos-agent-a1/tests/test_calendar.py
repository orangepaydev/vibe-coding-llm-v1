import unittest
from unittest.mock import MagicMock, patch
from agent.integrations.calendar.google_calendar import GoogleCalendarClient

class TestGoogleCalendarClient(unittest.TestCase):
    @patch('agent.integrations.calendar.google_calendar.build')
    @patch('agent.integrations.calendar.google_calendar.service_account')
    def setUp(self, mock_service_account, mock_build):
        mock_creds = MagicMock()
        mock_service_account.Credentials.from_service_account_file.return_value = mock_creds
        self.mock_service = MagicMock()
        mock_build.return_value = self.mock_service
        self.client = GoogleCalendarClient('calendar_id', 'creds.json')

    def test_create_deletion_event(self):
        self.mock_service.events().insert().execute.return_value = {'id': 'event123'}
        event_id = self.client.create_deletion_event(101, '@user', '#proxmox', {'name': 'nginx'})
        self.assertEqual(event_id, 'event123')

    def test_list_deletion_events(self):
        self.mock_service.events().list().execute.return_value = {'items': [{'id': 'event1'}]}
        events = self.client.list_deletion_events()
        self.assertEqual(events, [{'id': 'event1'}])

    def test_delete_event(self):
        self.client.delete_event('event1')
        self.mock_service.events().delete.assert_called_with(calendarId='calendar_id', eventId='event1')

if __name__ == '__main__':
    unittest.main()
