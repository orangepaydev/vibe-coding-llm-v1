"""Configuration management for the Proxmox Agent."""

import os
from typing import Dict, Optional, Any
import yaml
from dotenv import load_dotenv

class Config:
    """Configuration manager for the Proxmox Agent."""
    
    def __init__(self, config_path: Optional[str] = None) -> None:
        """Initialize the configuration manager.
        
        Args:
            config_path: Optional path to the configuration file.
                Defaults to looking for config.yaml in the agent/config directory.
        """
        # Load environment variables from .env file
        load_dotenv()
        
        # Default config
        self._config: Dict[str, Any] = {
            "proxmox": {
                "api_url": os.getenv("PROXMOX_API_URL", ""),
                "username": os.getenv("PROXMOX_USERNAME", ""),
                "password": os.getenv("PROXMOX_PASSWORD", ""),
                "node": os.getenv("PROXMOX_NODE", "pve"),
                "token_name": os.getenv("PROXMOX_TOKEN_NAME", ""),
                "token_value": os.getenv("PROXMOX_TOKEN_VALUE", ""),
            },
            "slack": {
                "bot_token": os.getenv("SLACK_BOT_TOKEN", ""),
                "app_token": os.getenv("SLACK_APP_TOKEN", ""),
                "proxmox_channel": os.getenv("SLACK_PROXMOX_CHANNEL", "#proxmox"),
            },
            "google_calendar": {
                "credentials_file": os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json"),
                "token_file": os.getenv("GOOGLE_TOKEN_FILE", "token.json"),
                "calendar_id": os.getenv("GOOGLE_CALENDAR_ID", "primary"),
            },
            "llm": {
                "provider": os.getenv("LLM_PROVIDER", "openai"),
                "model": os.getenv("LLM_MODEL", "gpt-4-turbo"),
                "temperature": float(os.getenv("LLM_TEMPERATURE", "0.0")),
                "api_key": os.getenv("LLM_API_KEY", ""),
                "ollama_url": os.getenv("OLLAMA_URL", "http://localhost:11434"),
            },
            "scheduler": {
                "check_interval_minutes": int(os.getenv("CHECK_INTERVAL_MINUTES", "5")),
            }
        }
        
        # Load config from file if provided
        if config_path:
            self.load_from_file(config_path)
    
    def load_from_file(self, config_path: str) -> None:
        """Load configuration from a YAML file.
        
        Args:
            config_path: Path to the configuration file.
        
        Raises:
            FileNotFoundError: If the configuration file does not exist.
        """
        if not os.path.exists(config_path):
            raise FileNotFoundError(f"Configuration file not found: {config_path}")
        
        with open(config_path, "r") as f:
            file_config = yaml.safe_load(f)
            
        # Update the config with values from the file
        self._update_nested_dict(self._config, file_config)
    
    def _update_nested_dict(self, d: Dict[str, Any], u: Dict[str, Any]) -> Dict[str, Any]:
        """Update a nested dictionary with values from another dictionary.
        
        Args:
            d: Dictionary to update.
            u: Dictionary with new values.
            
        Returns:
            Updated dictionary.
        """
        for k, v in u.items():
            if isinstance(v, dict) and k in d and isinstance(d[k], dict):
                d[k] = self._update_nested_dict(d[k], v)
            else:
                d[k] = v
        return d
    
    def get(self, section: str, key: str, default: Any = None) -> Any:
        """Get a configuration value.
        
        Args:
            section: Configuration section.
            key: Configuration key.
            default: Default value if the key does not exist.
            
        Returns:
            Configuration value or default.
        """
        if section in self._config and key in self._config[section]:
            return self._config[section][key]
        return default
    
    def get_section(self, section: str) -> Dict[str, Any]:
        """Get a configuration section.
        
        Args:
            section: Configuration section.
            
        Returns:
            Configuration section or empty dict.
        """
        return self._config.get(section, {})


# Create a singleton instance
config = Config()