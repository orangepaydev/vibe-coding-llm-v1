"""LLM client for the Proxmox Agent."""

import logging
from typing import Dict, List, Optional, Any, Union

from langchain.prompts import PromptTemplate
from langchain.callbacks.base import BaseCallbackHandler
from langchain.chat_models import ChatOpenAI
from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage,
    BaseMessage,
)

from agent.config import config

# Set up logger
logger = logging.getLogger(__name__)

class LLMClient:
    """LLM client for the Proxmox Agent."""
    
    def __init__(self) -> None:
        """Initialize the LLM client using configuration."""
        llm_config = config.get_section("llm")
        self.provider = llm_config.get("provider", "openai")
        self.model = llm_config.get("model", "gpt-4-turbo")
        self.temperature = llm_config.get("temperature", 0.0)
        self.api_key = llm_config.get("api_key", "")
        self.ollama_url = llm_config.get("ollama_url", "http://localhost:11434")
        
        # Initialize the LLM based on the provider
        self._initialize_llm()
        
        logger.info(f"LLM client initialized with provider: {self.provider}, model: {self.model}")
    
    def _initialize_llm(self) -> None:
        """Initialize the LLM based on the provider."""
        if self.provider.lower() == "openai":
            self.llm = ChatOpenAI(
                model=self.model,
                temperature=self.temperature,
                api_key=self.api_key,
            )
        elif self.provider.lower() == "ollama":
            from langchain.llms import Ollama
            self.llm = Ollama(
                model=self.model,
                base_url=self.ollama_url,
                temperature=self.temperature,
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    def process_message(self, user_message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Process a user message using the LLM.
        
        Args:
            user_message: The user's message.
            context: Optional context to include in the prompt.
            
        Returns:
            The LLM's response.
            
        Raises:
            Exception: If there's an error processing the message.
        """
        try:
            # Create the system prompt
            system_prompt = self._create_system_prompt(context)
            
            # Create the messages
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ]
            
            # Generate a response
            response = self.llm.invoke(messages)
            
            # Return the text of the response
            return response.content
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            raise
    
    def _create_system_prompt(self, context: Optional[Dict[str, Any]] = None) -> str:
        """Create the system prompt for the LLM.
        
        Args:
            context: Optional context to include in the prompt.
            
        Returns:
            The system prompt.
        """
        base_prompt = """You are an AI assistant for managing Proxmox containers. 
You can help users list, start, stop, and schedule containers for deletion.
Respond to user requests in a helpful and professional manner.

When providing container information, format it clearly as a list with IDs and status.
Example: 101 (nginx, running), 102 (db, stopped)

You have access to the following capabilities:
1. List all containers in Proxmox
2. Start a stopped container
3. Stop a running container
4. Schedule a container for deletion (which will be deleted in 2 days)
5. List all containers scheduled for deletion

When scheduling a deletion:
- Containers are deleted 2 days after the request
- A reminder notification is sent 1 day before deletion
- The user and #proxmox channel will be notified
"""

        if context:
            # Add context information if provided
            container_info = context.get("containers", [])
            if container_info:
                container_list = []
                for container in container_info:
                    vmid = container.get("vmid", "unknown")
                    name = container.get("name", "unknown")
                    status = container.get("status", "unknown")
                    container_list.append(f"{vmid} ({name}, {status})")
                
                container_context = "Current containers:\n" + "\n".join(container_list)
                base_prompt += f"\n\n{container_context}"
            
            # Add scheduled deletions context if available
            scheduled_deletions = context.get("scheduled_deletions", [])
            if scheduled_deletions:
                deletions_list = []
                for deletion in scheduled_deletions:
                    vmid = deletion.get("container_id", "unknown")
                    name = deletion.get("container_name", "")
                    time = deletion.get("deletion_time", "unknown")
                    user = deletion.get("user_id", "unknown")
                    
                    name_text = f" ({name})" if name else ""
                    deletions_list.append(f"{vmid}{name_text} (deletes {time}, requested by {user})")
                
                deletions_context = "Scheduled deletions:\n" + "\n".join(deletions_list)
                base_prompt += f"\n\n{deletions_context}"
        
        return base_prompt