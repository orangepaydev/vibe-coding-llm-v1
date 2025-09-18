# Proxmox Agent for Slack

An Agentic AI application to manage Proxmox containers via Slack, with Google Calendar integration for scheduled deletions and reminders.

## Features
- List, start, stop, and delete Proxmox containers via Slack
- Schedule container deletions with Google Calendar
- Automated Slack reminders and notifications
- Confirmation dialogs for destructive actions
- Full audit logging and error handling

## Directory Structure
```
agent/
  core/              # Core logic and confirmation dialogs
  utils/             # Utility functions
  integrations/
    proxmox/         # Proxmox API integration
    slack/           # Slack bot integration
    calendar/        # Google Calendar integration
  scheduler/         # Scheduling and reminder logic
  logging/           # Logging utilities

tests/               # Unit and integration tests
```

## Usage
- Interact with the agent in Slack via direct message or #proxmox channel
- Schedule deletions: "Schedule container 103 for deletion"
- List containers: "List all the containers in Proxmox"
- List scheduled deletions: "List all containers scheduled for deletion"

## Configuration
- All credentials (Proxmox, Slack, Google) are loaded from environment variables or config files (see SETUP.md)

## Requirements
- Python 3.9+
- See SETUP.md for installation and setup

## License
MIT
