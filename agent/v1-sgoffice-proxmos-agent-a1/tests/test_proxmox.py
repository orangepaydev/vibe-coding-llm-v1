import unittest
from unittest.mock import patch, MagicMock
from agent.integrations.proxmox.client import ProxmoxClient, ProxmoxAPIError

class TestProxmoxClient(unittest.TestCase):
    def setUp(self):
        self.client = ProxmoxClient('http://fake', 'id', 'secret', 'node')
        self.client.session = MagicMock()

    def test_list_containers_success(self):
        self.client.session.get.return_value.status_code = 200
        self.client.session.get.return_value.json.return_value = {'data': [{'vmid': 101}]}
        containers = self.client.list_containers()
        self.assertEqual(containers, [{'vmid': 101}])

    def test_list_containers_failure(self):
        self.client.session.get.return_value.status_code = 500
        self.client.session.get.return_value.text = 'error'
        with self.assertRaises(ProxmoxAPIError):
            self.client.list_containers()

    def test_start_container(self):
        self.client.session.post.return_value.status_code = 200
        self.client.start_container(101)
        self.client.session.post.assert_called()

    def test_stop_container(self):
        self.client.session.post.return_value.status_code = 200
        self.client.stop_container(101)
        self.client.session.post.assert_called()

    def test_delete_container(self):
        self.client.session.delete.return_value.status_code = 200
        self.client.delete_container(101)
        self.client.session.delete.assert_called()

if __name__ == '__main__':
    unittest.main()
