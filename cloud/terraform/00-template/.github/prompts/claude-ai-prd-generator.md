# Sample prompt that will generate the PRD

These are some prompts that was used to generate the PRD that will be used to generate the terraform code base.

## Project 1 : Create a EC2 and a Load Balancer
```
as a Program Manager that handles a team of AWS Cloud engineer who are proficient with Terrraform

create a PRD that for will perform the following:

## Input to the Script
1. Prefix for the infrastructure
2. VPC to deploy the infrastructure

## EC2 with a mariadb database
1. Create a EC2 that will have a User Data will pull from S3 a init.sql that will be used to start up a Docker container with Mariadb and will initialize the DB using the init.sql
2. Assume that a AMI is provided and the AMI already have docker installed
3. Create a DNS A Entry that points to the private IP of the EC2 instance.  The dns name will have the ${prefix}-performance-mariadb.orangepaydev.xyz

## Application Load Balancer
1. Create ALB that listens to port 443 
2. Create a DNS C Name entry that points to the Load Balancer with the dns name as ${prefix}-performance-payment.orangepaydev.xyz

## Assumptions
1. the zone oranpaydev.xyz already exist
2. the s3 bucket to pull the init.sql from is s3://cdk-long-live-artifact/10ktps/init.sql
```