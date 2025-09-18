# GCP Projects

This directory contains Google Cloud Platform projects including infrastructure automation, serverless applications, and cloud-native solutions.

## Prerequisites

- Google Cloud Project with billing enabled
- Google Cloud CLI (gcloud) installed and configured
- Appropriate IAM permissions for resource creation
- Git for version control
- Programming language runtime (Python, Node.js, Java, Go, etc.)

## Setup Instructions

1. **Install Google Cloud CLI**
   ```bash
   # macOS
   brew install --cask google-cloud-sdk
   
   # Ubuntu/Debian
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # Windows (using installer)
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Initialize and Authenticate**
   ```bash
   gcloud init
   gcloud auth login
   gcloud auth application-default login
   ```

3. **Set Project and Region**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   gcloud config set compute/region us-central1
   gcloud config set compute/zone us-central1-a
   ```

4. **Verify Configuration**
   ```bash
   gcloud config list
   gcloud projects describe YOUR_PROJECT_ID
   ```

5. **Enable Required APIs**
   ```bash
   gcloud services enable compute.googleapis.com
   gcloud services enable cloudfunctions.googleapis.com
   gcloud services enable storage.googleapis.com
   ```

## Project Structure

```
gcp-project/
├── deployment/        # Deployment Manager or Terraform
├── functions/         # Cloud Functions
├── appengine/         # App Engine applications
├── kubernetes/        # GKE configurations
├── iam/              # Service accounts and IAM
├── monitoring/       # Cloud Monitoring configs
├── scripts/          # Deployment scripts
├── docs/             # Documentation
└── tests/            # Unit and integration tests
```

## Best Practices

- Use service accounts with minimal required permissions
- Implement comprehensive labeling for cost management
- Use Cloud Deployment Manager or Terraform for IaC
- Enable Cloud Audit Logs for compliance
- Use Cloud KMS for encryption key management
- Implement VPC Service Controls for sensitive workloads
- Use Cloud Asset Inventory for resource tracking
- Enable Security Command Center for security monitoring

## Common GCP Services

- **Compute**: Compute Engine, Cloud Functions, App Engine, GKE, Cloud Run
- **Storage**: Cloud Storage, Persistent Disk, Filestore
- **Database**: Cloud SQL, Firestore, Bigtable, Spanner
- **Networking**: VPC, Cloud Load Balancing, Cloud CDN, Cloud DNS
- **Security**: Cloud IAM, Cloud KMS, Security Command Center
- **Monitoring**: Cloud Monitoring, Cloud Logging, Cloud Trace
- **CI/CD**: Cloud Build, Cloud Deploy, Binary Authorization

## Useful Commands

```bash
# Compute Engine
gcloud compute instances list
gcloud compute instances create my-instance --zone=us-central1-a
gcloud compute instances delete my-instance --zone=us-central1-a

# Cloud Storage
gsutil mb gs://my-bucket
gsutil cp file.txt gs://my-bucket/
gsutil rsync -r ./local-folder gs://my-bucket/remote-folder

# Cloud Functions
gcloud functions deploy my-function --runtime python39 --trigger-http
gcloud functions call my-function
gcloud functions logs read my-function

# GKE
gcloud container clusters create my-cluster --zone=us-central1-a
gcloud container clusters get-credentials my-cluster --zone=us-central1-a
kubectl apply -f deployment.yaml

# IAM
gcloud iam service-accounts create my-service-account
gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:my-service-account@PROJECT_ID.iam.gserviceaccount.com" --role="roles/viewer"
```

## Environment Variables

```bash
export GOOGLE_CLOUD_PROJECT=your-project-id
export GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
export CLOUDSDK_CORE_PROJECT=your-project-id
```

## Resources

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Google Cloud Architecture Center](https://cloud.google.com/architecture)
- [Google Cloud Best Practices](https://cloud.google.com/docs/enterprise/best-practices-for-enterprise-organizations)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)