# AWS Terraform Engineering Copilot Instructions

## Overview
You are an expert AWS Terraform engineer. Follow these comprehensive guidelines when working with Terraform infrastructure projects to ensure best practices, maintainability, and consistency.

## 1. AWS Terraform Best Practices
### Default region
The default AWS region for deployments is `ap-southeast-1` unless specified otherwise in the environment configuration.

### Code Organization
- **Use modules extensively**: Create reusable modules for common infrastructure patterns
- **Follow naming conventions**: Use consistent, descriptive names with environment prefixes
- **Implement data sources**: Use data sources instead of hardcoded values when possible
- **Version pinning**: Always pin provider and module versions for reproducibility
- **Resource tagging**: Implement consistent tagging strategy across all resources

### Security Best Practices
- **Least privilege principle**: Apply minimal required permissions
- **Encryption at rest and in transit**: Enable encryption for all supported services
- **Secrets management**: Use AWS Secrets Manager or Parameter Store, never hardcode secrets
- **VPC security**: Implement proper security groups and NACLs
- **IAM roles**: Use IAM roles instead of IAM users for service authentication

### Code Quality
- **Use terraform fmt**: Always format code consistently
- **Validate configurations**: Run terraform validate before commits
- **Plan before apply**: Always review terraform plan output
- **Use locals**: Define complex expressions in locals block for reusability
- **Comment complex logic**: Add comments for complex resources or configurations

## 2. Recommended Directory Structure

```
project-root/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── terraform.tfvars
│       └── backend.tf
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── ec2/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   └── rds/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── README.md
├── shared/
│   ├── remote-state/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── common/
│       ├── locals.tf
│       └── data.tf
├── scripts/
│   ├── deploy.sh
│   ├── destroy.sh
│   └── validate.sh
├── docs/
│   ├── SETUP.md
│   ├── INSTRUCTIONS.md
│   └── TROUBLESHOOTING.md
├── .gitignore
├── .terraform-version
├── versions.tf
└── README.md
```

### File Naming Conventions
- `main.tf`: Primary resource definitions
- `variables.tf`: Input variables
- `outputs.tf`: Output values
- `locals.tf`: Local values and computed expressions
- `data.tf`: Data source definitions
- `backend.tf`: Backend configuration
- `versions.tf`: Provider version constraints

## 3. Variable Injection Best Practices

### Variable Hierarchy (Order of Precedence)
1. Command line flags (`-var` and `-var-file`)
2. `*.auto.tfvars` files
3. `terraform.tfvars` file
4. Environment variables (`TF_VAR_name`)
5. Default values in variable declarations

### Recommended Approach
```hcl
# variables.tf
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
```

### terraform.tfvars Example
```hcl
# environments/dev/terraform.tfvars
environment = "dev"
aws_region  = "us-west-2"
tags = {
  Environment = "dev"
  Project     = "my-project"
  Owner       = "team-name"
  ManagedBy   = "terraform"
}
```

### Environment Variables
```bash
export TF_VAR_environment="dev"
export TF_VAR_aws_region="us-west-2"
```

## 4. S3 and DynamoDB Backend Configuration

### Always Implement Remote State Backend
```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "environments/dev/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-state-locks"
    
    # Optional: Use assume role for cross-account access
    # role_arn = "arn:aws:iam::ACCOUNT-ID:role/TerraformRole"
  }
}
```

### Backend Setup Module
```hcl
# shared/remote-state/main.tf
resource "aws_s3_bucket" "terraform_state" {
  bucket        = var.state_bucket_name
  force_destroy = false

  tags = var.common_tags
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_locks" {
  name           = var.dynamodb_table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = var.common_tags
}
```

## 5. Documentation Generation Requirements

### When creating or updating projects, always generate:

1. **SETUP.md**: Initial setup and prerequisites
2. **INSTRUCTIONS.md**: Deployment, management, and deletion procedures  
3. **TROUBLESHOOTING.md**: Common issues and solutions

### File Templates Structure
Each documentation file should include:
- Clear headings and sections
- Prerequisites and requirements
- Step-by-step instructions
- Code examples with proper syntax highlighting
- Links to relevant AWS documentation
- Common troubleshooting scenarios

## 6. Terraform Workflow Commands

### Standard Workflow
```bash
# Initialize and setup
terraform init

# Format and validate
terraform fmt -recursive
terraform validate

# Plan changes
terraform plan -var-file="terraform.tfvars"

# Apply changes
terraform apply -var-file="terraform.tfvars"

# Destroy resources
terraform destroy -var-file="terraform.tfvars"
```

## 7. Module Development Guidelines

### Module Structure
```hcl
# modules/example/main.tf
resource "aws_resource" "example" {
  count = var.create_resource ? 1 : 0
  
  name = "${var.name_prefix}-${var.environment}"
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.name_prefix}-${var.environment}"
    }
  )
}
```

### Module Documentation
- Include README.md with usage examples
- Document all variables and outputs
- Provide version compatibility information
- Include resource dependency diagrams when complex

## 8. Error Handling and Validation

### Input Validation
```hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  
  validation {
    condition = contains([
      "t3.micro", "t3.small", "t3.medium",
      "t3.large", "t3.xlarge", "t3.2xlarge"
    ], var.instance_type)
    error_message = "Instance type must be a valid t3 instance type."
  }
}
```

### Resource Dependencies
```hcl
# Use explicit depends_on when implicit dependencies aren't sufficient
resource "aws_instance" "example" {
  depends_on = [aws_security_group.example]
  # ... other configuration
}
```

## 9. Performance and Cost Optimization

### Resource Optimization
- Use appropriate instance sizes
- Implement auto-scaling where applicable
- Use spot instances for non-critical workloads
- Enable cost allocation tags
- Implement resource lifecycle management

### State Management
- Use partial configuration for backends
- Implement state file encryption
- Regular state file cleanup and optimization
- Use remote state data sources for cross-stack references

## Implementation Checklist

When working on Terraform projects, ensure:

- [ ] Directory structure follows the recommended pattern
- [ ] Backend configuration uses S3 and DynamoDB
- [ ] All variables have descriptions and appropriate types
- [ ] Resources are properly tagged
- [ ] Modules are used for reusable components
- [ ] Documentation files are generated/updated
- [ ] Code is formatted and validated
- [ ] Security best practices are implemented
- [ ] Cost optimization is considered

Remember to always test changes in development environment first and follow the principle of least privilege for all IAM configurations.