"""
Proxmox API client for container management.
Handles authentication and provides methods to list, start, stop, and delete containers.
"""
import os
import requests
from typing import List, Dict, Optional

class ProxmoxAPIError(Exception):
    """Custom exception for Proxmox API errors."""
    pass

class ProxmoxClient:
    def __init__(self, base_url: str, api_token_id: str, api_token_secret: str, node: str):
        """
        Initialize the Proxmox API client.
        :param base_url: Proxmox API base URL (e.g., https://proxmox.example.com:8006/api2/json)
        :param api_token_id: API token ID (format: 'user@pam!tokenid')
        :param api_token_secret: API token secret
        :param node: Proxmox node name
        """
        self.base_url = base_url.rstrip('/')
        self.api_token_id = api_token_id
        self.api_token_secret = api_token_secret
        self.node = node
        self.session = requests.Session()
        self.session.verify = True  # Set to False to ignore SSL verification (not recommended)
        self.session.headers.update({
            'Authorization': f'PVEAPIToken={self.api_token_id}={self.api_token_secret}'
        })

    def list_containers(self) -> List[Dict]:
        """List all LXC containers on the node."""
        url = f"{self.base_url}/nodes/{self.node}/lxc"
        resp = self.session.get(url)
        if resp.status_code != 200:
            raise ProxmoxAPIError(f"Failed to list containers: {resp.text}")
        return resp.json().get('data', [])

    def start_container(self, vmid: int) -> None:
        """Start a stopped container."""
        url = f"{self.base_url}/nodes/{self.node}/lxc/{vmid}/status/start"
        resp = self.session.post(url)
        if resp.status_code != 200:
            raise ProxmoxAPIError(f"Failed to start container {vmid}: {resp.text}")

    def stop_container(self, vmid: int) -> None:
        """Stop a running container."""
        url = f"{self.base_url}/nodes/{self.node}/lxc/{vmid}/status/stop"
        resp = self.session.post(url)
        if resp.status_code != 200:
            raise ProxmoxAPIError(f"Failed to stop container {vmid}: {resp.text}")

    def delete_container(self, vmid: int) -> None:
        """Delete a container."""
        url = f"{self.base_url}/nodes/{self.node}/lxc/{vmid}"
        resp = self.session.delete(url)
        if resp.status_code != 200:
            raise ProxmoxAPIError(f"Failed to delete container {vmid}: {resp.text}")

# Example usage (credentials should be securely loaded from environment or config)
# client = ProxmoxClient(
#     base_url=os.environ['PROXMOX_API_URL'],
#     api_token_id=os.environ['PROXMOX_API_TOKEN_ID'],
#     api_token_secret=os.environ['PROXMOX_API_TOKEN_SECRET'],
#     node=os.environ['PROXMOX_NODE']
# )
# containers = client.list_containers()
