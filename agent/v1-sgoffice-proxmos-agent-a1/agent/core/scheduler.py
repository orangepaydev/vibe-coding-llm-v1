"""Scheduler for container deletions and reminders."""

import asyncio
import datetime
import logging
import time
from typing import Optional, Dict, Any, List

from agent.config import config
from agent.integrations.proxmox import ProxmoxClient
from agent.integrations.slack import SlackBot
from agent.integrations.google_calendar import GoogleCalendarClient

# Set up logger
logger = logging.getLogger(__name__)

class DeletionScheduler:
    """Scheduler for container deletions and reminders."""
    
    def __init__(self, proxmox: Optional[ProxmoxClient] = None, 
                slack: Optional[SlackBot] = None, 
                calendar: Optional[GoogleCalendarClient] = None) -> None:
        """Initialize the scheduler.
        
        Args:
            proxmox: Optional ProxmoxClient instance.
            slack: Optional SlackBot instance.
            calendar: Optional GoogleCalendarClient instance.
        """
        # Get scheduler configuration
        scheduler_config = config.get_section("scheduler")
        self.check_interval_minutes = scheduler_config.get("check_interval_minutes", 5)
        
        # Initialize clients
        self.proxmox = proxmox or ProxmoxClient()
        self.slack = slack or SlackBot()
        self.calendar = calendar or GoogleCalendarClient()
        
        # Scheduler state
        self.running = False
        self.task = None
        
        logger.info("Deletion scheduler initialized")
    
    async def start(self) -> None:
        """Start the scheduler."""
        if self.running:
            logger.warning("Scheduler is already running")
            return
            
        self.running = True
        self.task = asyncio.create_task(self._run_scheduler())
        logger.info("Deletion scheduler started")
    
    async def stop(self) -> None:
        """Stop the scheduler."""
        if not self.running:
            logger.warning("Scheduler is not running")
            return
            
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("Deletion scheduler stopped")
    
    async def _run_scheduler(self) -> None:
        """Run the scheduler loop."""
        while self.running:
            try:
                logger.debug("Running scheduler check")
                
                # Check for pending deletions
                await self._process_pending_deletions()
                
                # Check for reminder notifications
                await self._process_reminders()
                
                # Wait for the next check
                await asyncio.sleep(self.check_interval_minutes * 60)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in scheduler: {str(e)}")
                await asyncio.sleep(60)  # Wait a minute before retrying after error
    
    async def _process_pending_deletions(self) -> None:
        """Process any pending container deletions."""
        try:
            # Get pending deletions
            deletions = self.calendar.get_pending_deletions()
            logger.info(f"Found {len(deletions)} pending deletions")
            
            for deletion in deletions:
                container_id = deletion.get("container_id")
                container_name = deletion.get("container_name")
                event_id = deletion.get("event_id")
                user_id = deletion.get("user_id")
                
                if not container_id:
                    logger.warning(f"Deletion event {event_id} missing container_id")
                    continue
                
                try:
                    # Check if container exists
                    if not self.proxmox.check_container_exists(container_id):
                        logger.warning(f"Container {container_id} no longer exists, skipping deletion")
                        # Remove the calendar event
                        self.calendar.delete_event(event_id)
                        continue
                    
                    # Delete the container
                    logger.info(f"Deleting container {container_id}")
                    self.proxmox.delete_container(container_id)
                    
                    # Send confirmation notification
                    await self.slack.create_deletion_confirmation(
                        container_id=container_id,
                        container_name=container_name,
                        user=user_id
                    )
                    
                    # Remove the calendar event
                    self.calendar.delete_event(event_id)
                    
                except Exception as e:
                    logger.error(f"Error processing deletion for container {container_id}: {str(e)}")
        except Exception as e:
            logger.error(f"Error processing pending deletions: {str(e)}")
    
    async def _process_reminders(self) -> None:
        """Process reminders for upcoming deletions."""
        try:
            # Get deletions that need reminders
            reminders = self.calendar.get_reminder_deletions()
            logger.info(f"Found {len(reminders)} deletions needing reminders")
            
            for reminder in reminders:
                container_id = reminder.get("container_id")
                container_name = reminder.get("container_name")
                event_id = reminder.get("event_id")
                user_id = reminder.get("user_id")
                deletion_time = reminder.get("deletion_time")
                
                if not container_id or not event_id:
                    logger.warning("Reminder missing container_id or event_id")
                    continue
                
                try:
                    # Format deletion time
                    deletion_time_str = deletion_time
                    if deletion_time:
                        try:
                            dt = datetime.datetime.fromisoformat(deletion_time.replace("Z", "+00:00"))
                            deletion_time_str = dt.strftime("%Y-%m-%d %H:%M")
                        except:
                            pass
                    
                    # Send reminder notification
                    logger.info(f"Sending reminder for container {container_id} deletion")
                    await self.slack.create_deletion_reminder(
                        container_id=container_id,
                        container_name=container_name,
                        deletion_time=deletion_time_str,
                        user=user_id
                    )
                    
                    # Mark the reminder as sent
                    self.calendar.mark_reminder_sent(event_id)
                    
                except Exception as e:
                    logger.error(f"Error sending reminder for container {container_id}: {str(e)}")
        except Exception as e:
            logger.error(f"Error processing reminders: {str(e)}")