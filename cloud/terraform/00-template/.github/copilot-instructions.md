# Terraform Copilot Instructions

## Project Setup
- Use Terraform version 1.5+ for optimal compatibility
- Follow HashiCorp Configuration Language (HCL) best practices
- Organize code using modules for reusability
- Use terraform.tfvars for environment-specific configurations
- Implement proper state management with remote backends

## Coding Style Guidelines
- Use snake_case for resource names and variables
- Add meaningful descriptions to all variables and outputs
- Group related resources in logical files (e.g., network.tf, security.tf)
- Use consistent indentation (2 spaces)
- Add comments for complex logic or business requirements
- Use data sources instead of hardcoded values when possible
- Implement proper tagging strategy for resource management

## Security Best Practices
- Never commit sensitive data or credentials
- Use environment variables or secure vaults for secrets
- Implement least privilege access principles
- Use terraform plan before apply
- Enable detailed logging for audit trails

## Code Organization
- main.tf - Primary resource definitions
- variables.tf - Input variable declarations
- outputs.tf - Output value declarations
- versions.tf - Terraform and provider version constraints
- terraform.tfvars.example - Example configuration file