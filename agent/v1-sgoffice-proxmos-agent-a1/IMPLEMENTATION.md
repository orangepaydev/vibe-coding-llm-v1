# Implementation Details: Proxmox Agent for Slack

## Overview
The Proxmox Agent is an agentic AI application that automates Proxmox container management via Slack, with Google Calendar integration for scheduled deletions and reminders. It is designed for safe, auditable, and user-friendly workflows, with modular components for extensibility and reliability.

## Architecture
- **Proxmox Integration:** Handles all container operations (list, start, stop, delete) via the Proxmox API.
- **Slack Bot Integration:** Receives user requests, parses commands, sends confirmations, and broadcasts notifications.
- **Google Calendar Integration:** Schedules and tracks container deletions, and provides a source of truth for upcoming destructive actions.
- **Scheduler:** Main loop that polls Google Calendar for scheduled deletions and reminders, triggers container deletions, and sends notifications.
- **Confirmation Manager:** Ensures destructive actions (like deletions) are confirmed by the user before proceeding.
- **Logging:** All actions, errors, and confirmations are logged for auditability.

## Main Loop (Scheduler)
The scheduler is the heart of the application. It runs continuously, polling Google Calendar for upcoming deletion events and handling reminders and deletions as follows:

1. **Poll Calendar:**
   - Fetch all upcoming deletion events from Google Calendar.
2. **Check for Reminders:**
   - For each event, if the current time is 1 day before the scheduled deletion, send a reminder to the user and the #proxmox channel in Slack.
3. **Check for Deletions:**
   - If the current time matches the scheduled deletion time, trigger the deletion via the Proxmox API.
   - Upon successful deletion, notify the user and channel, and remove the event from Google Calendar.
   - If deletion fails, log the error and notify the user.
4. **Sleep:**
   - Wait for the configured polling interval (default: 60 seconds) and repeat.

## User Interaction Flow
1. **User Request:**
   - User sends a message to the Slack bot (e.g., "Schedule container 103 for deletion").
2. **Command Parsing:**
   - The Slack bot parses the message and routes it to the appropriate handler.
3. **Confirmation (if needed):**
   - For destructive actions, the bot sends a confirmation dialog to the user.
   - The action proceeds only if the user confirms.
4. **Action Execution:**
   - The agent performs the requested action (e.g., schedules a deletion, starts/stops a container).
   - For scheduled deletions, an event is created in Google Calendar.
5. **Notifications:**
   - The bot sends status updates and reminders to the user and relevant channels.

## Error Handling & Logging
- All errors are reported to users in Slack and logged for auditability.
- Confirmation dialogs prevent accidental destructive actions.
- All actions are logged with user and timestamp.

## Extensibility
- The system is modular: new integrations (e.g., for VMs or other platforms) can be added with minimal changes.
- All credentials are securely managed via environment variables or config files.

## Example: Main Scheduler Loop (Pseudocode)
```python
while True:
    events = calendar.list_deletion_events()
    for event in events:
        if now == event.deletion_time - 1 day:
            slack.send_reminder(event.user, event.container_id)
        if now == event.deletion_time:
            if confirmation_manager.is_confirmed(event.user, event.container_id):
                proxmox.delete_container(event.container_id)
                slack.notify_deletion(event.user, event.container_id)
                calendar.delete_event(event.id)
            else:
                slack.request_confirmation(event.user, event.container_id)
    sleep(poll_interval)
```

## Security & Auditability
- All credentials are never exposed in logs or Slack.
- All actions are logged for future audits.

---
For more details, see the code in the `agent/` directory and the setup instructions in `SETUP.md`.
