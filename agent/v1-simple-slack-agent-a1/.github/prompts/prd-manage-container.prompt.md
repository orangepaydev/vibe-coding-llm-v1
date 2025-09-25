# Product Requirements Document (PRD)
## Simple Slack Agent that 

---

## Executive Summary

This is a simple Slack Agent that can respond to user queries by querying the Proxmox VE API. The agent will be able to handle basic queries such as:
- Listing all VMs
- Getting the status of a specific VM
- Starting or stopping a VM
- Listing all containers
- Getting the status of a specific container
- Starting or stopping a container

---

## Project Scope

### In Scope
- Pythong agent that can interact with Slack and Proxmox VE API
- Basic error handling and logging
- Deployment scripts for setting up the agent on a server
- Documentation for setup and usage

### Out of Scope
- Advanced features such as VM/container creation or deletion
- Integration with other services or APIs
- User authentication and authorization
- UI/UX design for Slack interactions

---
## Functional Requirements

### FR-002: EC2 MariaDB Instance
**Description**: Deploy an EC2 instance with MariaDB running in Docker

**Requirements**: