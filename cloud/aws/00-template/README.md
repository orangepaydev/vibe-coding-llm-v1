# AWS Projects

This directory contains AWS cloud projects including infrastructure automation, serverless applications, and cloud-native solutions.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI v2 installed and configured
- AWS CDK or SAM CLI (if using these frameworks)
- Git for version control
- Programming language runtime (Python, Node.js, Java, etc.)

## Setup Instructions

1. **Install AWS CLI**
   ```bash
   # macOS
   brew install awscli
   
   # Ubuntu/Debian
   sudo apt-get update && sudo apt-get install awscli
   
   # Windows (using MSI installer)
   # Download from: https://aws.amazon.com/cli/
   ```

2. **Configure AWS Credentials**
   ```bash
   aws configure
   # Enter: Access Key ID, Secret Access Key, Region, Output format
   
   # Or use environment variables
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_DEFAULT_REGION=us-east-1
   ```

3. **Verify Configuration**
   ```bash
   aws sts get-caller-identity
   aws ec2 describe-regions
   ```

4. **Install Additional Tools (Optional)**
   ```bash
   # AWS CDK
   npm install -g aws-cdk
   
   # AWS SAM CLI
   pip install aws-sam-cli
   ```

## Project Structure

```
aws-project/
├── cloudformation/     # CloudFormation templates
├── lambda/            # Lambda functions
├── policies/          # IAM policies
├── scripts/           # Deployment scripts
├── docs/              # Documentation
├── tests/             # Unit and integration tests
└── deploy.yml         # CI/CD configuration
```

## Best Practices

- Use IAM roles and policies following least privilege principle
- Implement proper tagging strategy for cost management
- Use CloudFormation or CDK for infrastructure as code
- Enable CloudTrail for audit logging
- Use AWS Config for compliance monitoring
- Implement multi-region deployment for disaster recovery
- Use AWS Secrets Manager for sensitive data
- Enable encryption for data at rest and in transit

## Common AWS Services

- **Compute**: EC2, Lambda, ECS, EKS, Fargate
- **Storage**: S3, EBS, EFS
- **Database**: RDS, DynamoDB, ElastiCache
- **Networking**: VPC, CloudFront, Route 53, API Gateway
- **Security**: IAM, Secrets Manager, Certificate Manager
- **Monitoring**: CloudWatch, X-Ray, Config
- **CI/CD**: CodePipeline, CodeBuild, CodeDeploy

## Useful Commands

```bash
# CloudFormation
aws cloudformation create-stack --stack-name my-stack --template-body file://template.yaml
aws cloudformation update-stack --stack-name my-stack --template-body file://template.yaml
aws cloudformation delete-stack --stack-name my-stack

# S3
aws s3 cp file.txt s3://my-bucket/
aws s3 sync ./local-folder s3://my-bucket/remote-folder

# Lambda
aws lambda invoke --function-name my-function response.json
aws lambda update-function-code --function-name my-function --zip-file fileb://function.zip

# EC2
aws ec2 describe-instances
aws ec2 start-instances --instance-ids i-1234567890abcdef0
aws ec2 stop-instances --instance-ids i-1234567890abcdef0
```

## Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Best Practices](https://aws.amazon.com/architecture/reference-architecture-diagrams/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/)