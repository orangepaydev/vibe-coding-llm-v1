# Terraform Projects

This directory contains Terraform infrastructure-as-code projects for cloud resource provisioning and management.

## Prerequisites

- Terraform 1.5+ installed
- Cloud provider CLI tools (AWS CLI, Azure CLI, gcloud)
- Appropriate cloud provider credentials configured
- Git for version control

## Setup Instructions

1. **Install Terraform**
   ```bash
   # macOS
   brew install terraform
   
   # Ubuntu/Debian
   sudo apt-get update && sudo apt-get install terraform
   
   # Windows (using Chocolatey)
   choco install terraform
   ```

2. **Verify Installation**
   ```bash
   terraform --version
   ```

3. **Configure Cloud Provider Credentials**
   ```bash
   # AWS
   aws configure
   
   # Azure
   az login
   
   # GCP
   gcloud auth application-default login
   ```

4. **Initialize Project**
   ```bash
   cd your-terraform-project
   terraform init
   ```

5. **Plan and Apply**
   ```bash
   terraform plan
   terraform apply
   ```

## Project Structure

```
terraform-project/
├── main.tf              # Primary resources
├── variables.tf         # Input variables
├── outputs.tf          # Output values
├── versions.tf         # Version constraints
├── terraform.tfvars.example # Example variables
├── modules/            # Reusable modules
└── environments/       # Environment-specific configs
```

## Best Practices

- Always run `terraform plan` before `apply`
- Use remote state backends for team collaboration
- Implement proper resource tagging
- Use modules for reusable components
- Keep sensitive data in secure vaults
- Document all variables and outputs
- Use consistent naming conventions

## Common Commands

```bash
terraform init          # Initialize working directory
terraform plan          # Show execution plan
terraform apply         # Apply changes
terraform destroy       # Destroy infrastructure
terraform fmt           # Format code
terraform validate      # Validate configuration
terraform state list    # List resources in state
```

## Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
- [Provider Documentation](https://registry.terraform.io/browse/providers)