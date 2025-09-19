# Setup Instructions

This guide will help you set up the Proxmox Container Management Agent.

## Prerequisites

- Python 3.8 or higher
- Proxmox VE installation with API access
- Slack workspace with permissions to create apps
- Google Cloud project with Calendar API enabled

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd proxmox-agent
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

5. Create the config directory:
   ```bash
   mkdir -p agent/config
   cp agent/config/config.yaml.example agent/config/config.yaml
   ```

## Configuration

### Environment Variables

Edit the `.env` file with your credentials:

```
# Proxmox API Configuration
PROXMOX_API_URL=https://your-proxmox-server:8006/api2/json
PROXMOX_USERNAME=your-username@pam
PROXMOX_PASSWORD=your-password
PROXMOX_NODE=your-node-name
# Or use token-based authentication
PROXMOX_TOKEN_NAME=your-token-name
PROXMOX_TOKEN_VALUE=your-token-value

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_PROXMOX_CHANNEL=#proxmox

# Google Calendar Configuration
GOOGLE_CREDENTIALS_FILE=path/to/credentials.json
GOOGLE_TOKEN_FILE=path/to/token.json
GOOGLE_CALENDAR_ID=primary

# LLM Configuration
LLM_PROVIDER=openai  # or ollama for local deployment
LLM_MODEL=gpt-4-turbo  # or ollama model name
LLM_TEMPERATURE=0.0
LLM_API_KEY=your-openai-api-key
OLLAMA_URL=http://localhost:11434

# Scheduler Configuration
CHECK_INTERVAL_MINUTES=5
```

### Proxmox API

1. Create a user in Proxmox with appropriate permissions or use an existing admin user
2. For token-based authentication (recommended):
   - Create an API token for the user in the Proxmox web UI
   - Use the token name and value in your configuration

### Slack Integration

1. Create a new Slack app at https://api.slack.com/apps
2. Add the following bot token scopes:
   - `chat:write`
   - `chat:write.public`
   - `app_mentions:read`
   - `channels:history`
   - `channels:read`
   - `im:history`
   - `im:read`
   - `im:write`
3. Enable Socket Mode in your Slack app
4. Install the app to your workspace
5. Copy the Bot User OAuth Token (`xoxb-...`) and App-Level Token (`xapp-...`) to your `.env` file

### Google Calendar API

1. Create a new project in the Google Cloud Console
2. Enable the Google Calendar API
3. Create OAuth credentials (Desktop application type)
4. Download the credentials JSON file and save it to the path specified in your `.env` file
5. When you first run the application, it will prompt you to authorize it to access your Google Calendar

### LLM Configuration

Choose between:

#### OpenAI (Default)

1. Get an API key from https://platform.openai.com/
2. Set `LLM_PROVIDER=openai` and add your API key to `LLM_API_KEY`

#### Ollama (Local)

1. Install Ollama from https://ollama.ai/
2. Pull a model: `ollama pull llama3`
3. Set `LLM_PROVIDER=ollama` and `LLM_MODEL=llama3`

## Running the Agent

Start the agent:

```bash
python -m agent.main
```

On first run with Google Calendar, you'll need to authenticate through a browser.

## Running as a Service

### systemd (Linux)

1. Create a systemd service file:

```bash
sudo nano /etc/systemd/system/proxmox-agent.service
```

2. Add the following content:

```
[Unit]
Description=Proxmox Container Management Agent
After=network.target

[Service]
User=<your-user>
WorkingDirectory=/path/to/proxmox-agent
ExecStart=/path/to/proxmox-agent/venv/bin/python -m agent.main
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=proxmox-agent
Environment="PATH=/path/to/proxmox-agent/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable proxmox-agent
sudo systemctl start proxmox-agent
```

4. Check the status:

```bash
sudo systemctl status proxmox-agent
```