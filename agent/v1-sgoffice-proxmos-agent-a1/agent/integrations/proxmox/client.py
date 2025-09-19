"""Proxmox API client for container management."""

import logging
from typing import Dict, List, Optional, Any, Union

from proxmoxer import ProxmoxAPI
from proxmoxer.core import ResourceException

from agent.config import config

# Set up logger
logger = logging.getLogger(__name__)

class ProxmoxClient:
    """Client for interacting with Proxmox API for container management."""
    
    def __init__(self) -> None:
        """Initialize the Proxmox client using configuration."""
        proxmox_config = config.get_section("proxmox")
        
        # Check for token-based authentication first
        if proxmox_config.get("token_name") and proxmox_config.get("token_value"):
            self._client = ProxmoxAPI(
                proxmox_config["api_url"],
                user=proxmox_config["username"],
                token_name=proxmox_config["token_name"],
                token_value=proxmox_config["token_value"],
                verify_ssl=False  # Note: In production, should be True or path to CA
            )
        else:
            # Fall back to password-based authentication
            self._client = ProxmoxAPI(
                proxmox_config["api_url"],
                user=proxmox_config["username"],
                password=proxmox_config["password"],
                verify_ssl=False  # Note: In production, should be True or path to CA
            )
        
        self.node = proxmox_config.get("node", "pve")
        logger.info(f"Initialized Proxmox client for node: {self.node}")
    
    def list_containers(self) -> List[Dict[str, Any]]:
        """Get a list of all containers.
        
        Returns:
            List of container information dictionaries.
            
        Raises:
            ResourceException: If there's an error accessing the Proxmox API.
        """
        try:
            containers = self._client.nodes(self.node).lxc.get()
            logger.info(f"Retrieved {len(containers)} containers from Proxmox")
            return containers
        except ResourceException as e:
            logger.error(f"Error listing containers: {str(e)}")
            raise
    
    def get_container(self, vmid: Union[int, str]) -> Dict[str, Any]:
        """Get information about a specific container.
        
        Args:
            vmid: The ID of the container.
            
        Returns:
            Container information dictionary.
            
        Raises:
            ResourceException: If the container does not exist or there's an API error.
        """
        vmid = str(vmid)
        try:
            container = self._client.nodes(self.node).lxc(vmid).status.current.get()
            logger.info(f"Retrieved container {vmid} status: {container.get('status', 'unknown')}")
            return container
        except ResourceException as e:
            logger.error(f"Error getting container {vmid}: {str(e)}")
            raise
    
    def start_container(self, vmid: Union[int, str]) -> Dict[str, Any]:
        """Start a container.
        
        Args:
            vmid: The ID of the container to start.
            
        Returns:
            Task information dictionary.
            
        Raises:
            ResourceException: If the container does not exist or cannot be started.
        """
        vmid = str(vmid)
        try:
            result = self._client.nodes(self.node).lxc(vmid).status.start.post()
            logger.info(f"Started container {vmid}: {result}")
            return result
        except ResourceException as e:
            logger.error(f"Error starting container {vmid}: {str(e)}")
            raise
    
    def stop_container(self, vmid: Union[int, str]) -> Dict[str, Any]:
        """Stop a container.
        
        Args:
            vmid: The ID of the container to stop.
            
        Returns:
            Task information dictionary.
            
        Raises:
            ResourceException: If the container does not exist or cannot be stopped.
        """
        vmid = str(vmid)
        try:
            result = self._client.nodes(self.node).lxc(vmid).status.stop.post()
            logger.info(f"Stopped container {vmid}: {result}")
            return result
        except ResourceException as e:
            logger.error(f"Error stopping container {vmid}: {str(e)}")
            raise
    
    def delete_container(self, vmid: Union[int, str]) -> Dict[str, Any]:
        """Delete a container.
        
        Args:
            vmid: The ID of the container to delete.
            
        Returns:
            Task information dictionary.
            
        Raises:
            ResourceException: If the container does not exist or cannot be deleted.
        """
        vmid = str(vmid)
        try:
            result = self._client.nodes(self.node).lxc(vmid).delete()
            logger.info(f"Deleted container {vmid}: {result}")
            return result
        except ResourceException as e:
            logger.error(f"Error deleting container {vmid}: {str(e)}")
            raise

    def check_container_exists(self, vmid: Union[int, str]) -> bool:
        """Check if a container exists.
        
        Args:
            vmid: The ID of the container to check.
            
        Returns:
            True if the container exists, False otherwise.
        """
        vmid = str(vmid)
        try:
            self._client.nodes(self.node).lxc(vmid).status.current.get()
            return True
        except ResourceException:
            return False
    
    def check_container_status(self, vmid: Union[int, str]) -> str:
        """Check the status of a container.
        
        Args:
            vmid: The ID of the container to check.
            
        Returns:
            Status of the container ("running", "stopped", etc.).
            
        Raises:
            ResourceException: If the container does not exist or cannot be accessed.
        """
        container_info = self.get_container(vmid)
        return container_info.get("status", "unknown")