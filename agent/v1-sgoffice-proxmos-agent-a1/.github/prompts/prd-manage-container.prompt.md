# Product Requirement Document (PRD)
## Agentic AI Application for Proxmox Container Management via Slack

---

### 1. Overview

This document outlines the requirements for an Agentic AI application ("Proxmox Agent") that interacts with users via Slack to manage Proxmox containers. The Agent will process natural language requests, perform container operations on a Proxmox instance, maintain a deletion schedule in Google Calendar, and broadcast reminders to Slack channels and users.

---

### 2. Goals

- **Automate Proxmox container management** through conversational AI.
- **Integrate with Slack** for all user interactions and notifications.
- **Leverage Google Calendar** for tracking scheduled deletions.
- **Provide safe, auditable, and user-friendly workflows** for potentially destructive actions (like deletions).

---

### 3. User Stories

#### 3.1. List Containers
- **As a user**, I can ask the Agent to list all containers in Proxmox.
- **Acceptance Criteria:**
  - Agent responds with an enumerated list (ID, name, status, etc.) of all containers.

#### 3.2. Start a Stopped Container
- **As a user**, I can ask the Agent to start a specific stopped container.
- **Acceptance Criteria:**
  - Agent verifies the container is stopped, starts it, and confirms completion in Slack.

#### 3.3. Stop a Running Container
- **As a user**, I can ask the Agent to stop a specific running container.
- **Acceptance Criteria:**
  - Agent verifies the container is running, stops it, and confirms completion in Slack.

#### 3.4. Schedule Container Deletion
- **As a user**, I can instruct the Agent to schedule a container for deletion two days from now.
- **Acceptance Criteria:**
  - Agent logs the deletion event in Google Calendar for two days later.
  - Agent broadcasts a Slack notification to the requesting user and the `#proxmox` channel one day before deletion.
  - Agent deletes the container at the scheduled time and notifies the same parties.

#### 3.5. List Containers Scheduled for Deletion
- **As a user**, I can ask the Agent to list all containers currently scheduled for deletion.
- **Acceptance Criteria:**
  - Agent queries Google Calendar for relevant events and presents a summary (container IDs, scheduled deletion times, requesting users).

---

### 4. Technical Requirements

#### 4.1. Proxmox Integration
- Use Proxmox API to:
  - List containers (GET /nodes/{node}/lxc)
  - Start/stop containers (POST /nodes/{node}/lxc/{vmid}/status/start|stop)
  - Delete containers (DELETE /nodes/{node}/lxc/{vmid})
- Secure storage of Proxmox credentials/secrets.

#### 4.2. Slack Integration
- Slack bot must:
  - Receive direct messages and channel mentions.
  - Parse user requests and respond with rich, actionable messages.
  - Broadcast scheduled deletion reminders to users and `#proxmox` channel.

#### 4.3. Google Calendar Integration
- Each scheduled deletion creates a calendar event with:
  - Title: "Proxmox container {ID} scheduled for deletion"
  - Description: Requesting user, Slack channel, container metadata
  - Start date: Scheduled deletion time (2 days after request)
- Ability to query all upcoming deletion events.

#### 4.4. Scheduling & Reminders
- Automated scheduler to:
  - Trigger deletion at the appropriate time.
  - Send 1-day-before reminders to Slack.
  - Remove calendar event upon completion.

#### 4.5. Error Handling & Safety
- Robust error reporting to users in Slack.
- Confirmation dialogs for destructive actions.
- Logs of all actions and schedules.

---

### 5. Non-Functional Requirements

- **Security:** All credentials must be securely stored and never exposed in logs or Slack.
- **Reliability:** The Agent must gracefully handle API failures and network issues.
- **Auditability:** All actions, especially deletions, must be logged with user and timestamp.
- **Extensibility:** The system should be modular to allow future expansion (e.g., VM management, multi-cluster support).

---

### 6. User Interaction Examples

#### 6.1. List Containers
> User: "List all the containers in Proxmox"
>
> Agent: "Here are the current containers: 101 (nginx, running), 102 (db, stopped), ..."

#### 6.2. Start a Container
> User: "Start container 102"
>
> Agent: "Container 102 (db) is currently stopped. Starting now... ✅ Started."

#### 6.3. Schedule Deletion
> User: "Schedule container 103 for deletion"
>
> Agent: "Container 103 will be deleted in 2 days (YYYY-MM-DD HH:MM). You and #proxmox will be notified one day before."

#### 6.4. List Scheduled Deletions
> User: "List all containers scheduled for deletion"
>
> Agent: "The following containers are scheduled for deletion: 103 (deletes YYYY-MM-DD HH:MM, requested by @user), ..."

---

### 7. Success Metrics

- 95%+ of requests are completed without manual intervention.
- All scheduled deletions are appropriately tracked and notified.
- User feedback in Slack is positive (emoji reactions, direct surveys).

---

### 8. Out of Scope

- Managing VMs (only containers supported in v1).
- Advanced calendar permissions (single calendar integration assumed).
- User authentication beyond Slack workspace membership.

---