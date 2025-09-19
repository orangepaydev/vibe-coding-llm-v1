# Troubleshooting

This guide provides solutions to common issues you might encounter with the Proxmox Container Management Agent.

## Connection Issues

### Proxmox Connection Errors

**Symptom:** `Error connecting to Proxmox API` in logs

**Solutions:**
1. Verify that the Proxmox API URL is correct in your `.env` file
2. Check if your Proxmox server is accessible from the machine running the agent
3. Verify credentials or API tokens are correct and have sufficient permissions
4. If using self-signed certificates, ensure you have set `verify_ssl=False` in the ProxmoxAPI initialization

### Slack Connection Errors

**Symptom:** `Error starting Slack bot` in logs

**Solutions:**
1. Verify that your Slack bot token and app token are correct
2. Ensure the bot has been added to the channels it needs to access
3. Check that all required scopes have been granted to the bot
4. Restart the Slack app in the Slack API dashboard

### Google Calendar API Errors

**Symptom:** `Error authenticating with Google Calendar` or credential-related errors

**Solutions:**
1. Ensure your credentials file is correctly formatted and accessible
2. Verify that the Calendar API is enabled in your Google Cloud project
3. Re-authenticate by deleting the token file and restarting the application
4. Check that the calendar ID exists and is accessible to the authenticated user

## Operational Issues

### Container Actions Not Working

**Symptom:** Container operations (start, stop, delete) fail

**Solutions:**
1. Verify that the user has sufficient permissions in Proxmox
2. Check if the container ID exists
3. For deletion issues, ensure the container is not locked or protected
4. Check the Proxmox logs for specific error messages

### Scheduled Deletions Not Working

**Symptom:** Containers not being deleted at scheduled time

**Solutions:**
1. Verify that the scheduler is running (`Deletion scheduler started` in logs)
2. Check if the Google Calendar events are being created correctly
3. Ensure the `CHECK_INTERVAL_MINUTES` setting isn't too long
4. Check for any errors during the scheduler run in the logs

### Slack Notifications Not Being Sent

**Symptom:** Missing notifications for scheduled deletions or reminders

**Solutions:**
1. Verify that the Slack channel specified in configuration exists
2. Check if the bot has permissions to post in the channel
3. Ensure the bot is active and connected
4. Look for any errors related to sending messages in the logs

## LLM-Related Issues

### LLM Not Responding

**Symptom:** Agent does not respond to messages or processes them incorrectly

**Solutions:**
1. Check if your OpenAI API key is valid and has sufficient quota
2. If using Ollama, verify the Ollama service is running and the model is downloaded
3. Try adjusting the temperature setting to get different responses
4. Check the logs for any errors related to LLM processing

### Intent Recognition Issues

**Symptom:** Agent misunderstands commands or fails to extract container IDs

**Solutions:**
1. Be more explicit in your requests, e.g., "list containers" or "start container 123"
2. Check if the LLM provider has any service disruptions
3. Try a different model if available
4. Review the system prompt in the LLMClient class to ensure it provides clear instructions

## Application Startup Issues

### Application Crashes on Startup

**Symptom:** Application exits immediately with errors

**Solutions:**
1. Ensure all required environment variables are set
2. Check that all dependencies are installed: `pip install -r requirements.txt`
3. Verify Python version (3.8+ required)
4. Check logs for specific error messages

### Missing Configuration

**Symptom:** `Configuration file not found` or similar errors

**Solutions:**
1. Ensure you've copied the example configuration files
2. Check file permissions
3. Verify paths are correct and accessible

## Logging and Debugging

To get more detailed logs:

1. Modify the logging level in `main.py`:
   ```python
   logging.basicConfig(
       level=logging.DEBUG,  # Change from INFO to DEBUG
       # ...
   )
   ```

2. Check both the console output and the log files:
   - `proxmox_agent.log` - Main application logs
   - `proxmox_agent_audit.log` - Audit logs for actions

## Getting Support

If you continue experiencing issues:

1. Check the GitHub repository issues page for similar problems and solutions
2. Submit a new issue with:
   - Detailed description of the problem
   - Relevant portions of logs
   - Your environment details (OS, Python version, etc.)
   - Steps to reproduce the issue