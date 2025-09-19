"""Core agent for Proxmox container management."""

import asyncio
import datetime
import logging
import re
from typing import Any, Dict, List, Optional, Tuple, Union

import langchain
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.state import StateDictMixin

from agent.core.llm import LLMClient
from agent.integrations.proxmox import ProxmoxClient
from agent.integrations.slack import SlackBot
from agent.integrations.google_calendar import GoogleCalendarClient

# Set up logger
logger = logging.getLogger(__name__)

class AgentState(StateDictMixin):
    """State for the Proxmox Agent."""
    
    user_message: str
    user_id: str
    channel: str
    thread_ts: Optional[str] = None
    intent: Optional[str] = None
    container_id: Optional[str] = None
    container_name: Optional[str] = None
    container_status: Optional[str] = None
    response: Optional[str] = None
    error: Optional[str] = None
    scheduled_deletions: Optional[List[Dict[str, Any]]] = None
    scheduled_deletion_event: Optional[Dict[str, Any]] = None


class ProxmoxAgent:
    """Core agent for Proxmox container management."""
    
    def __init__(self) -> None:
        """Initialize the Proxmox agent."""
        # Initialize clients
        self.proxmox = ProxmoxClient()
        self.slack = SlackBot(message_callback=self.handle_message)
        self.calendar = GoogleCalendarClient()
        self.llm = LLMClient()
        
        # Initialize the agent graph
        self._build_agent_graph()
        
        logger.info("Proxmox agent initialized")
    
    async def handle_message(self, message: Dict[str, Any]) -> str:
        """Handle a message from Slack.
        
        Args:
            message: Message data from Slack.
            
        Returns:
            Response to send back to Slack.
        """
        try:
            logger.info(f"Handling message: {message.get('text', '')}")
            
            # Initialize state
            state = AgentState(
                user_message=message.get("text", ""),
                user_id=message.get("user", ""),
                channel=message.get("channel", ""),
                thread_ts=message.get("thread_ts") or message.get("ts")
            )
            
            # Process the message through the agent graph
            result = self.agent_graph.invoke(state)
            
            # Return the response
            return result.response or "I'm sorry, I couldn't process that request."
        except Exception as e:
            logger.exception(f"Error handling message: {str(e)}")
            return f"I'm sorry, I encountered an error: {str(e)}"
    
    def _build_agent_graph(self) -> None:
        """Build the agent graph for processing messages."""
        # Define the graph
        graph = StateGraph(AgentState)
        
        # Add nodes
        graph.add_node("parse_intent", self._parse_intent)
        graph.add_node("list_containers", self._list_containers)
        graph.add_node("start_container", self._start_container)
        graph.add_node("stop_container", self._stop_container)
        graph.add_node("schedule_deletion", self._schedule_deletion)
        graph.add_node("list_scheduled_deletions", self._list_scheduled_deletions)
        
        # Define edges
        graph.add_edge("parse_intent", "list_containers", self._should_list_containers)
        graph.add_edge("parse_intent", "start_container", self._should_start_container)
        graph.add_edge("parse_intent", "stop_container", self._should_stop_container)
        graph.add_edge("parse_intent", "schedule_deletion", self._should_schedule_deletion)
        graph.add_edge("parse_intent", "list_scheduled_deletions", self._should_list_scheduled_deletions)
        
        # Define fallback
        graph.add_edge("parse_intent", END, lambda state: True)  # Default fallback
        
        # All task nodes go to END
        graph.add_edge("list_containers", END, lambda state: True)
        graph.add_edge("start_container", END, lambda state: True)
        graph.add_edge("stop_container", END, lambda state: True)
        graph.add_edge("schedule_deletion", END, lambda state: True)
        graph.add_edge("list_scheduled_deletions", END, lambda state: True)
        
        # Set the entry point
        graph.set_entry_point("parse_intent")
        
        # Compile the graph
        self.agent_graph = graph.compile()
    
    def _parse_intent(self, state: AgentState) -> AgentState:
        """Parse the user's intent from the message.
        
        Args:
            state: Current agent state.
            
        Returns:
            Updated agent state.
        """
        user_message = state.user_message
        
        # Remove bot mention if present
        user_message = re.sub(r'<@[A-Z0-9]+>', '', user_message).strip()
        
        # Get context for the LLM
        context = self._get_context()
        
        # Create a prompt to identify intent
        intent_prompt = f"""Identify the user's intent from the following message:
"{user_message}"

Respond with one of these intents:
- list_containers: If the user wants to list containers
- start_container: If the user wants to start a container
- stop_container: If the user wants to stop a container
- schedule_deletion: If the user wants to schedule a container for deletion
- list_scheduled_deletions: If the user wants to list scheduled deletions
- unknown: If the intent is not clear

For start_container, stop_container, and schedule_deletion, also extract the container ID.
Reply in JSON format:
{{
  "intent": "<intent>",
  "container_id": "<container_id or null>"
}}"""
        
        # Get the intent from the LLM
        intent_response = self.llm.process_message(intent_prompt, context)
        
        try:
            # Extract JSON from the response
            import json
            import re
            
            # Try to extract JSON if it's wrapped in markdown or text
            json_match = re.search(r'```json\n(.*?)\n```|```(.*?)```|({.*})', intent_response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1) or json_match.group(2) or json_match.group(3)
                intent_data = json.loads(json_str)
            else:
                intent_data = json.loads(intent_response)
            
            # Update state with intent and container_id
            state.intent = intent_data.get("intent", "unknown")
            state.container_id = intent_data.get("container_id")
            
            # If we have a container ID, try to get its info
            if state.container_id and state.intent != "list_scheduled_deletions":
                try:
                    container_info = self.proxmox.get_container(state.container_id)
                    state.container_name = container_info.get("name", "")
                    state.container_status = container_info.get("status", "unknown")
                except Exception as e:
                    logger.warning(f"Couldn't get container info for {state.container_id}: {str(e)}")
            
            logger.info(f"Parsed intent: {state.intent}, container_id: {state.container_id}")
            
        except Exception as e:
            logger.error(f"Error parsing intent: {str(e)}")
            state.intent = "unknown"
            state.error = f"I couldn't understand what you want to do. Error: {str(e)}"
        
        return state
    
    def _should_list_containers(self, state: AgentState) -> bool:
        """Check if the agent should list containers.
        
        Args:
            state: Current agent state.
            
        Returns:
            True if the agent should list containers, False otherwise.
        """
        return state.intent == "list_containers"
    
    def _should_start_container(self, state: AgentState) -> bool:
        """Check if the agent should start a container.
        
        Args:
            state: Current agent state.
            
        Returns:
            True if the agent should start a container, False otherwise.
        """
        return state.intent == "start_container" and state.container_id is not None
    
    def _should_stop_container(self, state: AgentState) -> bool:
        """Check if the agent should stop a container.
        
        Args:
            state: Current agent state.
            
        Returns:
            True if the agent should stop a container, False otherwise.
        """
        return state.intent == "stop_container" and state.container_id is not None
    
    def _should_schedule_deletion(self, state: AgentState) -> bool:
        """Check if the agent should schedule a container for deletion.
        
        Args:
            state: Current agent state.
            
        Returns:
            True if the agent should schedule a container for deletion, False otherwise.
        """
        return state.intent == "schedule_deletion" and state.container_id is not None
    
    def _should_list_scheduled_deletions(self, state: AgentState) -> bool:
        """Check if the agent should list scheduled deletions.
        
        Args:
            state: Current agent state.
            
        Returns:
            True if the agent should list scheduled deletions, False otherwise.
        """
        return state.intent == "list_scheduled_deletions"
    
    def _list_containers(self, state: AgentState) -> AgentState:
        """List all containers in Proxmox.
        
        Args:
            state: Current agent state.
            
        Returns:
            Updated agent state.
        """
        try:
            # Get all containers
            containers = self.proxmox.list_containers()
            
            # Format container list
            container_list = []
            for container in containers:
                vmid = container.get("vmid", "unknown")
                name = container.get("name", "unknown")
                status = container.get("status", "unknown")
                container_list.append(f"{vmid} ({name}, {status})")
            
            if container_list:
                state.response = f"Here are the current containers:\n{', '.join(container_list)}"
            else:
                state.response = "No containers found in Proxmox."
                
            logger.info(f"Listed {len(containers)} containers")
            
        except Exception as e:
            logger.error(f"Error listing containers: {str(e)}")
            state.error = f"Error listing containers: {str(e)}"
            state.response = f"I'm sorry, I couldn't list the containers. Error: {str(e)}"
        
        return state
    
    def _start_container(self, state: AgentState) -> AgentState:
        """Start a container in Proxmox.
        
        Args:
            state: Current agent state.
            
        Returns:
            Updated agent state.
        """
        try:
            # Check if container exists
            if not self.proxmox.check_container_exists(state.container_id):
                state.response = f"Container {state.container_id} does not exist."
                return state
            
            # Check if container is already running
            status = self.proxmox.check_container_status(state.container_id)
            if status == "running":
                container_name_text = f" ({state.container_name})" if state.container_name else ""
                state.response = f"Container {state.container_id}{container_name_text} is already running."
                return state
            
            # Start the container
            result = self.proxmox.start_container(state.container_id)
            
            # Format the response
            container_name_text = f" ({state.container_name})" if state.container_name else ""
            state.response = f"Container {state.container_id}{container_name_text} is being started."
            
            logger.info(f"Started container {state.container_id}")
            
        except Exception as e:
            logger.error(f"Error starting container {state.container_id}: {str(e)}")
            state.error = f"Error starting container {state.container_id}: {str(e)}"
            state.response = f"I'm sorry, I couldn't start container {state.container_id}. Error: {str(e)}"
        
        return state
    
    def _stop_container(self, state: AgentState) -> AgentState:
        """Stop a container in Proxmox.
        
        Args:
            state: Current agent state.
            
        Returns:
            Updated agent state.
        """
        try:
            # Check if container exists
            if not self.proxmox.check_container_exists(state.container_id):
                state.response = f"Container {state.container_id} does not exist."
                return state
            
            # Check if container is already stopped
            status = self.proxmox.check_container_status(state.container_id)
            if status == "stopped":
                container_name_text = f" ({state.container_name})" if state.container_name else ""
                state.response = f"Container {state.container_id}{container_name_text} is already stopped."
                return state
            
            # Stop the container
            result = self.proxmox.stop_container(state.container_id)
            
            # Format the response
            container_name_text = f" ({state.container_name})" if state.container_name else ""
            state.response = f"Container {state.container_id}{container_name_text} is being stopped."
            
            logger.info(f"Stopped container {state.container_id}")
            
        except Exception as e:
            logger.error(f"Error stopping container {state.container_id}: {str(e)}")
            state.error = f"Error stopping container {state.container_id}: {str(e)}"
            state.response = f"I'm sorry, I couldn't stop container {state.container_id}. Error: {str(e)}"
        
        return state
    
    def _schedule_deletion(self, state: AgentState) -> AgentState:
        """Schedule a container for deletion.
        
        Args:
            state: Current agent state.
            
        Returns:
            Updated agent state.
        """
        try:
            # Check if container exists
            if not self.proxmox.check_container_exists(state.container_id):
                state.response = f"Container {state.container_id} does not exist."
                return state
            
            # Schedule the deletion in Google Calendar
            event = self.calendar.schedule_deletion(
                container_id=state.container_id,
                container_name=state.container_name,
                days_from_now=2,
                user_id=state.user_id
            )
            
            state.scheduled_deletion_event = event
            
            # Calculate the deletion date
            now = datetime.datetime.now()
            deletion_date = now + datetime.timedelta(days=2)
            deletion_date_str = deletion_date.strftime("%Y-%m-%d %H:%M")
            
            # Send notification in Slack
            asyncio.create_task(self.slack.create_deletion_notification(
                container_id=state.container_id,
                container_name=state.container_name,
                deletion_time=deletion_date_str,
                user=state.user_id
            ))
            
            # Format the response
            container_name_text = f" ({state.container_name})" if state.container_name else ""
            state.response = (
                f"Container {state.container_id}{container_name_text} will be deleted in 2 days "
                f"({deletion_date_str}). You and #proxmox will be notified one day before."
            )
            
            logger.info(f"Scheduled container {state.container_id} for deletion on {deletion_date_str}")
            
        except Exception as e:
            logger.error(f"Error scheduling deletion for container {state.container_id}: {str(e)}")
            state.error = f"Error scheduling deletion for container {state.container_id}: {str(e)}"
            state.response = f"I'm sorry, I couldn't schedule container {state.container_id} for deletion. Error: {str(e)}"
        
        return state
    
    def _list_scheduled_deletions(self, state: AgentState) -> AgentState:
        """List all scheduled container deletions.
        
        Args:
            state: Current agent state.
            
        Returns:
            Updated agent state.
        """
        try:
            # Get scheduled deletions from Google Calendar
            deletions = self.calendar.list_scheduled_deletions()
            state.scheduled_deletions = deletions
            
            if deletions:
                # Format the response
                deletion_list = []
                for deletion in deletions:
                    container_id = deletion.get("container_id", "unknown")
                    container_name = deletion.get("container_name")
                    deletion_time = deletion.get("deletion_time")
                    user_id = deletion.get("user_id")
                    
                    container_name_text = f" ({container_name})" if container_name else ""
                    user_text = f", requested by <@{user_id}>" if user_id else ""
                    
                    # Convert ISO datetime to readable format
                    if deletion_time:
                        try:
                            dt = datetime.datetime.fromisoformat(deletion_time.replace("Z", "+00:00"))
                            deletion_time = dt.strftime("%Y-%m-%d %H:%M")
                        except:
                            pass
                    
                    deletion_list.append(
                        f"{container_id}{container_name_text} (deletes {deletion_time}{user_text})"
                    )
                
                state.response = (
                    f"The following containers are scheduled for deletion:\n" + 
                    "\n".join(deletion_list)
                )
            else:
                state.response = "No containers are currently scheduled for deletion."
            
            logger.info(f"Listed {len(deletions)} scheduled deletions")
            
        except Exception as e:
            logger.error(f"Error listing scheduled deletions: {str(e)}")
            state.error = f"Error listing scheduled deletions: {str(e)}"
            state.response = f"I'm sorry, I couldn't list scheduled deletions. Error: {str(e)}"
        
        return state
    
    def _get_context(self) -> Dict[str, Any]:
        """Get context information for the LLM.
        
        Returns:
            Context dictionary.
        """
        context = {}
        
        # Try to get container information
        try:
            containers = self.proxmox.list_containers()
            context["containers"] = containers
        except Exception as e:
            logger.warning(f"Error getting container information for context: {str(e)}")
        
        # Try to get scheduled deletions
        try:
            deletions = self.calendar.list_scheduled_deletions()
            context["scheduled_deletions"] = deletions
        except Exception as e:
            logger.warning(f"Error getting scheduled deletions for context: {str(e)}")
        
        return context
    
    def start(self) -> None:
        """Start the Proxmox agent."""
        # Start the Slack bot
        self.slack.start()
        logger.info("Proxmox agent started")
    
    def stop(self) -> None:
        """Stop the Proxmox agent."""
        # Stop the Slack bot
        self.slack.stop()
        logger.info("Proxmox agent stopped")