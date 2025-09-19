# Proxmox Container Management Agent

An LLM-powered agentic solution for managing Proxmox containers via Slack.

## Overview

This agent allows users to manage Proxmox containers through natural language requests in Slack. It can:

- List all containers in Proxmox
- Start stopped containers
- Stop running containers
- Schedule containers for deletion
- List containers scheduled for deletion

The agent integrates with Google Calendar to track scheduled deletions and sends notifications to Slack users and the #proxmox channel.

## Features

### Container Management
- List all containers with their IDs, names, and status
- Start and stop containers by ID
- Safe container deletion with a 2-day delay and notifications

### Scheduling
- Schedule container deletions for 2 days in the future
- Track scheduled deletions in Google Calendar
- Send reminder notifications 1 day before deletion
- Execute deletions automatically at the scheduled time

### Safety & Notifications
- Notification to the requesting user and #proxmox channel when a deletion is scheduled
- Reminder notification 1 day before deletion
- Confirmation notification when deletion is completed
- Audit logging of all actions
- Confirmation workflows for destructive operations

## Architecture

The agent uses the following technologies:

- **LangChain/LangGraph**: For building the agentic workflows with LLMs
- **Slack Bot API**: For Slack integration and user interactions
- **Proxmox API**: For container management operations
- **Google Calendar API**: For tracking scheduled deletions

## Getting Started

See [SETUP.md](SETUP.md) for installation and configuration instructions.

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

## Development

This project follows Python best practices with:
- Type hints
- Comprehensive docstrings
- Modular design
- Error handling
- Testing

## License

[MIT License](LICENSE)