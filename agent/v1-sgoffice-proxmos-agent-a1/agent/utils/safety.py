"""Error handling and safety measures for the Proxmox Agent."""

import logging
import traceback
from typing import Any, Dict, Optional, List, Callable, Tuple, Union

# Set up logger
logger = logging.getLogger(__name__)

class ActionConfirmation:
    """Handles confirmations for destructive actions."""
    
    def __init__(self) -> None:
        """Initialize the action confirmation handler."""
        # Store pending confirmations: {confirmation_id: {action, params}}
        self._pending_confirmations: Dict[str, Dict[str, Any]] = {}
    
    def create_confirmation(self, action: str, params: Dict[str, Any], user_id: str) -> str:
        """Create a confirmation request for a destructive action.
        
        Args:
            action: The type of action (e.g., "delete_container").
            params: Parameters for the action.
            user_id: The ID of the user requesting the action.
            
        Returns:
            Confirmation ID.
        """
        import hashlib
        import time
        import json
        
        # Create a unique confirmation ID
        timestamp = str(time.time())
        confirmation_id = hashlib.md5(f"{user_id}:{action}:{timestamp}".encode()).hexdigest()[:8]
        
        # Store the confirmation request
        self._pending_confirmations[confirmation_id] = {
            "action": action,
            "params": params,
            "user_id": user_id,
            "timestamp": timestamp
        }
        
        logger.info(f"Created confirmation request {confirmation_id} for {action}")
        return confirmation_id
    
    def get_confirmation(self, confirmation_id: str) -> Optional[Dict[str, Any]]:
        """Get a pending confirmation request.
        
        Args:
            confirmation_id: The ID of the confirmation request.
            
        Returns:
            Confirmation request data or None if not found.
        """
        return self._pending_confirmations.get(confirmation_id)
    
    def confirm_action(self, confirmation_id: str) -> Optional[Dict[str, Any]]:
        """Confirm a pending action.
        
        Args:
            confirmation_id: The ID of the confirmation request.
            
        Returns:
            Confirmed action data or None if not found.
            
        Note:
            This removes the confirmation from the pending list.
        """
        if confirmation_id not in self._pending_confirmations:
            logger.warning(f"Confirmation {confirmation_id} not found")
            return None
            
        confirmation = self._pending_confirmations.pop(confirmation_id)
        logger.info(f"Confirmed action {confirmation_id} ({confirmation['action']})")
        return confirmation
    
    def cancel_action(self, confirmation_id: str) -> bool:
        """Cancel a pending action.
        
        Args:
            confirmation_id: The ID of the confirmation request.
            
        Returns:
            True if canceled, False if not found.
        """
        if confirmation_id not in self._pending_confirmations:
            logger.warning(f"Confirmation {confirmation_id} not found")
            return False
            
        self._pending_confirmations.pop(confirmation_id)
        logger.info(f"Canceled action {confirmation_id}")
        return True
    
    def cleanup_expired_confirmations(self, max_age_seconds: int = 3600) -> int:
        """Clean up expired confirmation requests.
        
        Args:
            max_age_seconds: Maximum age in seconds for a confirmation request.
            
        Returns:
            Number of expired confirmations removed.
        """
        import time
        
        current_time = time.time()
        expired_ids = []
        
        for confirmation_id, data in self._pending_confirmations.items():
            timestamp = float(data["timestamp"])
            if current_time - timestamp > max_age_seconds:
                expired_ids.append(confirmation_id)
        
        # Remove expired confirmations
        for confirmation_id in expired_ids:
            self._pending_confirmations.pop(confirmation_id)
        
        if expired_ids:
            logger.info(f"Cleaned up {len(expired_ids)} expired confirmation requests")
            
        return len(expired_ids)


class ErrorHandler:
    """Handles and logs errors."""
    
    @staticmethod
    def log_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> str:
        """Log an error with context information.
        
        Args:
            error: The exception that occurred.
            context: Optional context information.
            
        Returns:
            Error ID for reference.
        """
        import hashlib
        import time
        import uuid
        
        # Generate a unique error ID
        error_id = str(uuid.uuid4())[:8]
        
        # Log the error with its ID
        logger.error(f"Error {error_id}: {str(error)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        if context:
            logger.error(f"Context for error {error_id}: {context}")
        
        return error_id
    
    @staticmethod
    def format_user_error_message(error: Exception, error_id: str) -> str:
        """Format an error message for users.
        
        Args:
            error: The exception that occurred.
            error_id: The error ID.
            
        Returns:
            User-friendly error message.
        """
        # Get the error message, remove any sensitive info
        error_msg = str(error)
        
        # Format a user-friendly message
        return (
            f"I'm sorry, I encountered an error (ID: {error_id}). "
            f"Error details: {error_msg}"
        )


class AuditLogger:
    """Logs audit events for important actions."""
    
    def __init__(self, log_file: Optional[str] = None) -> None:
        """Initialize the audit logger.
        
        Args:
            log_file: Optional path to the audit log file.
                If None, audit events are logged to the main logger.
        """
        self.log_file = log_file
        
        if log_file:
            # Set up a file handler for audit logs
            self._setup_file_handler()
    
    def _setup_file_handler(self) -> None:
        """Set up a file handler for audit logs."""
        import logging.handlers
        
        # Create a logger for audit events
        self.audit_logger = logging.getLogger("proxmox_agent.audit")
        self.audit_logger.setLevel(logging.INFO)
        
        # Create a file handler
        handler = logging.handlers.RotatingFileHandler(
            self.log_file,
            maxBytes=10485760,  # 10MB
            backupCount=5
        )
        
        # Create a formatter
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - AUDIT - %(message)s')
        handler.setFormatter(formatter)
        
        # Add the handler to the logger
        self.audit_logger.addHandler(handler)
    
    def log_action(self, action: str, user_id: str, details: Dict[str, Any]) -> None:
        """Log an audit event for an action.
        
        Args:
            action: The type of action (e.g., "delete_container").
            user_id: The ID of the user performing the action.
            details: Details about the action.
        """
        import json
        
        audit_msg = f"{action} by {user_id} - {json.dumps(details)}"
        
        if self.log_file:
            self.audit_logger.info(audit_msg)
        else:
            logger.info(f"AUDIT: {audit_msg}")
    
    def log_container_action(self, action: str, container_id: str, 
                           user_id: str, container_name: Optional[str] = None) -> None:
        """Log an audit event for a container action.
        
        Args:
            action: The type of action (e.g., "delete", "start", "stop").
            container_id: The ID of the container.
            user_id: The ID of the user performing the action.
            container_name: Optional name of the container.
        """
        details = {
            "container_id": container_id,
            "container_name": container_name
        }
        
        self.log_action(f"container_{action}", user_id, details)
    
    def log_schedule_action(self, action: str, container_id: str, 
                           user_id: str, deletion_time: str, 
                           container_name: Optional[str] = None) -> None:
        """Log an audit event for a schedule action.
        
        Args:
            action: The type of action (e.g., "schedule", "cancel").
            container_id: The ID of the container.
            user_id: The ID of the user performing the action.
            deletion_time: When the container will be deleted.
            container_name: Optional name of the container.
        """
        details = {
            "container_id": container_id,
            "container_name": container_name,
            "deletion_time": deletion_time
        }
        
        self.log_action(f"schedule_{action}", user_id, details)