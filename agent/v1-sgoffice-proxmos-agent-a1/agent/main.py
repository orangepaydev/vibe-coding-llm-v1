"""Main entry point for the Proxmox Agent."""

import asyncio
import logging
import os
import sys
from typing import Optional

from agent.core import ProxmoxAgent, DeletionScheduler
from agent.utils.safety import AuditLogger, ActionConfirmation, ErrorHandler

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('proxmox_agent.log')
    ]
)

logger = logging.getLogger(__name__)

class ProxmoxAgentApp:
    """Main application class for the Proxmox Agent."""
    
    def __init__(self) -> None:
        """Initialize the Proxmox Agent application."""
        # Set up safety components
        self.audit_logger = AuditLogger("proxmox_agent_audit.log")
        self.action_confirmation = ActionConfirmation()
        
        # Set up core components
        self.agent = ProxmoxAgent()
        self.scheduler = DeletionScheduler(
            proxmox=self.agent.proxmox,
            slack=self.agent.slack,
            calendar=self.agent.calendar
        )
        
        logger.info("Proxmox Agent application initialized")
    
    async def start(self) -> None:
        """Start the Proxmox Agent application."""
        try:
            # Start the agent
            self.agent.start()
            
            # Start the scheduler
            await self.scheduler.start()
            
            logger.info("Proxmox Agent application started")
            
            # Keep the application running
            while True:
                await asyncio.sleep(60)
                
                # Clean up expired confirmations
                self.action_confirmation.cleanup_expired_confirmations()
                
        except KeyboardInterrupt:
            logger.info("Received keyboard interrupt, shutting down")
            await self.stop()
        except Exception as e:
            error_id = ErrorHandler.log_error(e)
            logger.critical(f"Unhandled exception (ID: {error_id}): {str(e)}")
            await self.stop()
            sys.exit(1)
    
    async def stop(self) -> None:
        """Stop the Proxmox Agent application."""
        try:
            # Stop the scheduler
            await self.scheduler.stop()
            
            # Stop the agent
            self.agent.stop()
            
            logger.info("Proxmox Agent application stopped")
        except Exception as e:
            error_id = ErrorHandler.log_error(e)
            logger.error(f"Error during shutdown (ID: {error_id}): {str(e)}")


async def main() -> None:
    """Main entry point."""
    app = ProxmoxAgentApp()
    await app.start()


if __name__ == "__main__":
    asyncio.run(main())