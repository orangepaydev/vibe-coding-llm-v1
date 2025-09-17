# AWS Copilot Instructions

## Project Setup
- Use AWS CLI v2 for command line operations
- Configure AWS credentials using IAM roles or access keys
- Use AWS SDK for the appropriate programming language
- Implement proper error handling and retry logic
- Use AWS CloudFormation or CDK for infrastructure as code
- Follow AWS Well-Architected Framework principles

## Coding Style Guidelines
- Use PascalCase for AWS resource names in CloudFormation
- Use kebab-case for resource tags and naming
- Implement consistent naming conventions across resources
- Use environment-specific prefixes (dev-, staging-, prod-)
- Add comprehensive tags for cost allocation and management
- Use AWS Config Rules for compliance checking
- Implement proper logging with CloudWatch

## Security Best Practices
- Use IAM roles instead of access keys when possible
- Implement least privilege access policies
- Enable AWS CloudTrail for audit logging
- Use AWS Secrets Manager for sensitive data
- Enable encryption at rest and in transit
- Use VPC security groups and NACLs properly
- Regular security assessments and penetration testing

## Code Organization
- cloudformation/ - CloudFormation templates
- lambda/ - Lambda function code
- scripts/ - Deployment and utility scripts
- policies/ - IAM policies and role definitions
- docs/ - Architecture diagrams and documentation

## Monitoring and Observability
- Implement CloudWatch metrics and alarms
- Use AWS X-Ray for distributed tracing
- Set up centralized logging
- Create operational dashboards
- Implement automated alerting