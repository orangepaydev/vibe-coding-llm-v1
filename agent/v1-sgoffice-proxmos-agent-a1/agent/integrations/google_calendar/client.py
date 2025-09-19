"""Google Calendar integration for scheduling container deletions."""

import datetime
import json
import logging
import os
from typing import Any, Dict, List, Optional, Tuple, Union

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from agent.config import config

# Set up logger
logger = logging.getLogger(__name__)

class GoogleCalendarClient:
    """Google Calendar client for scheduling container deletions."""
    
    # Define the scope needed for calendar access
    SCOPES = ["https://www.googleapis.com/auth/calendar"]
    
    def __init__(self) -> None:
        """Initialize the Google Calendar client using configuration."""
        calendar_config = config.get_section("google_calendar")
        self.credentials_file = calendar_config.get("credentials_file", "credentials.json")
        self.token_file = calendar_config.get("token_file", "token.json")
        self.calendar_id = calendar_config.get("calendar_id", "primary")
        
        # Ensure the credentials file exists
        if not os.path.exists(self.credentials_file):
            logger.error(f"Google Calendar credentials file not found: {self.credentials_file}")
            raise FileNotFoundError(f"Google Calendar credentials file not found: {self.credentials_file}")
            
        # Authenticate and build the service
        self.creds = self._get_credentials()
        self.service = build("calendar", "v3", credentials=self.creds)
        
        logger.info("Google Calendar client initialized")
    
    def _get_credentials(self) -> Credentials:
        """Get and refresh Google Calendar credentials.
        
        Returns:
            Credentials object.
            
        Raises:
            Exception: If unable to get valid credentials.
        """
        creds = None
        
        # Load the token file if it exists
        if os.path.exists(self.token_file):
            creds = Credentials.from_authorized_user_info(
                json.loads(open(self.token_file, "r").read()),
                self.SCOPES
            )
            
        # If credentials don't exist or are invalid, refresh or get new ones
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(self.credentials_file, self.SCOPES)
                creds = flow.run_local_server(port=0)
                
            # Save the credentials for future use
            with open(self.token_file, "w") as token:
                token.write(creds.to_json())
                
        return creds
    
    def schedule_deletion(self, container_id: Union[int, str], container_name: Optional[str], 
                         days_from_now: int = 2, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Schedule a container deletion in Google Calendar.
        
        Args:
            container_id: The ID of the container.
            container_name: Optional name of the container.
            days_from_now: Number of days from now to schedule the deletion.
            user_id: Optional ID of the user who requested the deletion.
            
        Returns:
            The created event.
            
        Raises:
            Exception: If there's an error creating the event.
        """
        container_id = str(container_id)
        container_desc = f"{container_id}"
        if container_name:
            container_desc += f" ({container_name})"
            
        # Calculate the deletion time (end of the day)
        now = datetime.datetime.now()
        deletion_date = now + datetime.timedelta(days=days_from_now)
        deletion_date = deletion_date.replace(hour=23, minute=59, second=59)
        
        # Format the dates for Google Calendar
        start_time = deletion_date.isoformat()
        end_time = (deletion_date + datetime.timedelta(minutes=1)).isoformat()
        
        # Create event description
        description = f"Scheduled deletion of Proxmox container {container_desc}."
        if user_id:
            description += f"\nRequested by <@{user_id}>"
            
        # Create the event
        event = {
            "summary": f"Proxmox container {container_id} scheduled for deletion",
            "description": description,
            "start": {
                "dateTime": start_time,
                "timeZone": "UTC",
            },
            "end": {
                "dateTime": end_time,
                "timeZone": "UTC",
            },
            "colorId": "11",  # Red color for deletion events
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "popup", "minutes": 1440},  # 24 hours before
                ],
            },
            # Store metadata in extended properties
            "extendedProperties": {
                "private": {
                    "type": "container_deletion",
                    "container_id": container_id,
                    "container_name": container_name or "",
                    "user_id": user_id or "",
                    "scheduled_by": "proxmox-agent"
                }
            }
        }
        
        try:
            created_event = self.service.events().insert(calendarId=self.calendar_id, body=event).execute()
            logger.info(f"Created deletion event for container {container_id}: {created_event.get('id')}")
            return created_event
        except Exception as e:
            logger.error(f"Error creating deletion event for container {container_id}: {str(e)}")
            raise
    
    def list_scheduled_deletions(self) -> List[Dict[str, Any]]:
        """List all scheduled container deletions.
        
        Returns:
            List of scheduled deletion events.
            
        Raises:
            Exception: If there's an error retrieving the events.
        """
        try:
            # Search for events with the container_deletion type
            now = datetime.datetime.utcnow().isoformat() + "Z"  # 'Z' indicates UTC time
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                timeMin=now,
                maxResults=100,
                singleEvents=True,
                orderBy="startTime",
                privateExtendedProperty="type=container_deletion"
            ).execute()
            
            events = events_result.get("items", [])
            logger.info(f"Retrieved {len(events)} scheduled deletions")
            
            # Parse the events to extract the container information
            deletions = []
            for event in events:
                props = event.get("extendedProperties", {}).get("private", {})
                container_id = props.get("container_id")
                
                if not container_id:
                    continue
                    
                deletion = {
                    "event_id": event.get("id"),
                    "container_id": container_id,
                    "container_name": props.get("container_name"),
                    "user_id": props.get("user_id"),
                    "deletion_time": event.get("start", {}).get("dateTime"),
                    "summary": event.get("summary"),
                }
                
                deletions.append(deletion)
            
            return deletions
        except Exception as e:
            logger.error(f"Error listing scheduled deletions: {str(e)}")
            raise
    
    def get_pending_deletions(self) -> List[Dict[str, Any]]:
        """Get pending container deletions that should be executed now.
        
        Returns:
            List of container deletions to process.
            
        Raises:
            Exception: If there's an error retrieving the events.
        """
        try:
            # Get the current time and time threshold
            now = datetime.datetime.utcnow()
            now_str = now.isoformat() + "Z"  # 'Z' indicates UTC time
            
            # Get events that have ended (deletion time has passed)
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                timeMax=now_str,
                maxResults=100,
                singleEvents=True,
                orderBy="startTime",
                privateExtendedProperty="type=container_deletion"
            ).execute()
            
            events = events_result.get("items", [])
            
            # Parse the events to extract the container information
            deletions = []
            for event in events:
                props = event.get("extendedProperties", {}).get("private", {})
                container_id = props.get("container_id")
                
                if not container_id:
                    continue
                    
                deletion = {
                    "event_id": event.get("id"),
                    "container_id": container_id,
                    "container_name": props.get("container_name"),
                    "user_id": props.get("user_id"),
                }
                
                deletions.append(deletion)
            
            return deletions
        except Exception as e:
            logger.error(f"Error getting pending deletions: {str(e)}")
            raise
    
    def get_reminder_deletions(self) -> List[Dict[str, Any]]:
        """Get container deletions that should have reminders sent (1 day before deletion).
        
        Returns:
            List of container deletions to send reminders for.
            
        Raises:
            Exception: If there's an error retrieving the events.
        """
        try:
            # Get the time range for reminders (between now and 24 hours from now)
            now = datetime.datetime.utcnow()
            tomorrow = now + datetime.timedelta(days=1)
            now_str = now.isoformat() + "Z"  # 'Z' indicates UTC time
            tomorrow_str = tomorrow.isoformat() + "Z"
            
            # Get events that will happen in the next 24 hours
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                timeMin=now_str,
                timeMax=tomorrow_str,
                maxResults=100,
                singleEvents=True,
                orderBy="startTime",
                privateExtendedProperty="type=container_deletion"
            ).execute()
            
            events = events_result.get("items", [])
            
            # Parse the events to extract the container information
            reminders = []
            for event in events:
                props = event.get("extendedProperties", {}).get("private", {})
                container_id = props.get("container_id")
                
                if not container_id:
                    continue
                
                # Check if we've already sent a reminder
                reminder_sent = props.get("reminder_sent", "false").lower() == "true"
                if reminder_sent:
                    continue
                    
                reminder = {
                    "event_id": event.get("id"),
                    "container_id": container_id,
                    "container_name": props.get("container_name"),
                    "user_id": props.get("user_id"),
                    "deletion_time": event.get("start", {}).get("dateTime"),
                }
                
                reminders.append(reminder)
            
            return reminders
        except Exception as e:
            logger.error(f"Error getting reminder deletions: {str(e)}")
            raise
    
    def mark_reminder_sent(self, event_id: str) -> Dict[str, Any]:
        """Mark a deletion event as having had its reminder sent.
        
        Args:
            event_id: The ID of the event.
            
        Returns:
            The updated event.
            
        Raises:
            Exception: If there's an error updating the event.
        """
        try:
            # Get the event
            event = self.service.events().get(
                calendarId=self.calendar_id,
                eventId=event_id
            ).execute()
            
            # Update the extended properties
            props = event.get("extendedProperties", {})
            private_props = props.get("private", {})
            private_props["reminder_sent"] = "true"
            
            # If extendedProperties doesn't exist, create it
            if "extendedProperties" not in event:
                event["extendedProperties"] = {}
                
            # Update the private properties
            event["extendedProperties"]["private"] = private_props
            
            # Update the event
            updated_event = self.service.events().update(
                calendarId=self.calendar_id,
                eventId=event_id,
                body=event
            ).execute()
            
            return updated_event
        except Exception as e:
            logger.error(f"Error marking reminder sent for event {event_id}: {str(e)}")
            raise
    
    def delete_event(self, event_id: str) -> None:
        """Delete a calendar event.
        
        Args:
            event_id: The ID of the event to delete.
            
        Raises:
            Exception: If there's an error deleting the event.
        """
        try:
            self.service.events().delete(
                calendarId=self.calendar_id,
                eventId=event_id
            ).execute()
            
            logger.info(f"Deleted event {event_id}")
        except Exception as e:
            logger.error(f"Error deleting event {event_id}: {str(e)}")
            raise