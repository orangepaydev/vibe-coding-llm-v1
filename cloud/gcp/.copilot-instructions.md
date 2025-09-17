# GCP Copilot Instructions

## Project Setup
- Use Google Cloud CLI (gcloud) for command line operations
- Configure authentication using service accounts or user credentials
- Use Google Cloud SDK for the appropriate programming language
- Implement proper error handling and retry logic with exponential backoff
- Use Cloud Deployment Manager or Terraform for infrastructure as code
- Follow Google Cloud Architecture Framework principles

## Coding Style Guidelines
- Use kebab-case for resource names and labels
- Use snake_case for configuration variables
- Implement consistent naming conventions with project/environment prefixes
- Add comprehensive labels for cost allocation and resource management
- Use Cloud Resource Manager for project organization
- Implement proper API versioning and deprecation handling
- Follow Google Cloud API design guidelines

## Security Best Practices
- Use service accounts with minimal required permissions
- Enable Cloud Audit Logs for all services
- Use Cloud KMS for encryption key management
- Implement VPC Service Controls for data protection
- Use Identity and Access Management (IAM) with principle of least privilege
- Enable Security Command Center for security insights
- Use Cloud Asset Inventory for resource tracking

## Code Organization
- deployment/ - Deployment Manager templates or Terraform configs
- functions/ - Cloud Functions source code
- scripts/ - Deployment and utility scripts
- iam/ - Service account and IAM role definitions
- monitoring/ - Cloud Monitoring configurations
- docs/ - Architecture diagrams and documentation

## Monitoring and Observability
- Use Cloud Monitoring for metrics and alerting
- Implement Cloud Trace for distributed tracing
- Use Cloud Logging for centralized log management
- Create custom dashboards in Cloud Monitoring
- Set up proper alerting policies and notification channels