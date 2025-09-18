# Setup Instructions: Proxmox Agent for Slack

## 1. Prerequisites
- Python 3.9+
- Access to a Proxmox instance with API token
- Slack workspace admin rights to create a bot
- Google Cloud project with Calendar API enabled and service account credentials

## 2. Clone the Repository
```
git clone <repo-url>
cd agent/v1-sgoffice-proxmos-agent-a1
```

## 3. Install Dependencies
```
pip install -r requirements.txt
```

## 4. Environment Variables
Create a `.env` file or export the following variables:
```
# Proxmox
PROXMOX_API_URL=https://proxmox.example.com:8006/api2/json
PROXMOX_API_TOKEN_ID=user@pam!tokenid
PROXMOX_API_TOKEN_SECRET=your-secret
PROXMOX_NODE=proxmox-node

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...

# Google Calendar
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_CREDENTIALS_JSON=path/to/credentials.json

# Logging
PROXMOX_AGENT_LOG=proxmox_agent.log
```

## 5. Proxmox API Token Setup
- Create a user and API token in Proxmox (see Proxmox docs)
- Assign permissions to manage LXC containers

## 6. Slack Bot Setup
- Create a Slack app and bot at https://api.slack.com/apps
- Add OAuth scopes: `chat:write`, `channels:read`, `groups:read`, `im:read`, `mpim:read`
- Install the app to your workspace and copy the tokens

## 7. Google Calendar Setup
- Create a service account in Google Cloud Console
- Enable Calendar API and download credentials JSON
- Share your calendar with the service account email

## 8. Running the Agent
```
python -m agent.scheduler.scheduler
```

## 9. Testing
```
python -m unittest discover tests
```

## 10. Troubleshooting
See TROUBLESHOOTING.md for common issues.
