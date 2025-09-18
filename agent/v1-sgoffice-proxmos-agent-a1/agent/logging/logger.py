"""
Logging utilities for Proxmox Agent.
Logs all actions, errors, and confirmations for auditability and debugging.
"""
import logging
import os
from datetime import datetime

LOG_FILE = os.environ.get('PROXMOX_AGENT_LOG', 'proxmox_agent.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

class AgentLogger:
    @staticmethod
    def log_action(action: str, user: str = '', details: str = ''):
        logging.info(f"ACTION: {action} | User: {user} | Details: {details}")

    @staticmethod
    def log_error(error: str, user: str = '', details: str = ''):
        logging.error(f"ERROR: {error} | User: {user} | Details: {details}")

    @staticmethod
    def log_confirmation(action: str, user: str = '', details: str = ''):
        logging.info(f"CONFIRMATION: {action} | User: {user} | Details: {details}")

# Example usage:
# AgentLogger.log_action('Start container', user='@user', details='Container 102')
# AgentLogger.log_error('Failed to delete container', user='@user', details='Container 103')
# AgentLogger.log_confirmation('Confirmed deletion', user='@user', details='Container 103')
