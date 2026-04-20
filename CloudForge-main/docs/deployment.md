# CloudForge Deployment Guide

## Overview
CloudForge is a CI/CD automation platform deployed on AWS using Infrastructure as Code with Terraform.

## Architecture
- **Frontend**: React + TypeScript + TailwindCSS hosted on S3 + CloudFront
- **Backend**: Node.js + Express on EC2 instance
- **Database**: PostgreSQL on AWS RDS
- **API**: AWS API Gateway
- **Monitoring**: CloudWatch + Prometheus/Grafana (basic setup)

## Prerequisites
- AWS Account with appropriate permissions
- GitHub repository with secrets configured
- Docker Hub account

## AWS Setup Steps

### 1. Create IAM User and Policy
1. Go to AWS IAM Console
2. Create a new policy using the JSON from `iam-policy.json`
3. Create a new IAM user with programmatic access
4. Attach the policy to the user
5. Save the Access Key ID and Secret Access Key

### 2. Set up GitHub Secrets
Configure the following secrets in your GitHub repository (Settings > Secrets and variables > Actions):
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `DB_PASSWORD` - Strong password for PostgreSQL (min 8 chars)
- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub password

### 2. Push to Main Branch
Pushing to the main branch will trigger the CI/CD pipeline, which:
- Builds the frontend
- Builds and pushes the backend Docker image
- Deploys infrastructure with Terraform
- Deploys frontend to S3 and invalidates CloudFront

### 3. Database Setup
After deployment, connect to the RDS instance using the endpoint from Terraform outputs and run:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE pipelines (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  repo_url VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending'
);
```

### 4. Access the Application
- Frontend: Use the CloudFront URL from Terraform outputs
- API: Use the API Gateway URL from Terraform outputs

## Design Patterns Implementation

### Factory Pattern
Located in `backend/utils/PipelineFactory.js`
- Creates different types of CI/CD pipelines (build, deploy) based on input type
- Centralizes pipeline creation logic

### Strategy Pattern
Located in `backend/utils/DeploymentStrategy.js`
- Defines deployment strategies (AWS vs mock)
- Allows switching between deployment methods without changing client code

### MVC Pattern
Backend structure:
- **Models** (`backend/models/`): Data access and business logic (User, Pipeline)
- **Views**: Handled by frontend React components
- **Controllers** (`backend/controllers/`): Handle requests and responses (AuthController, PipelineController)
- **Routes** (`backend/routes/`): Define API endpoints

## Monitoring
- CloudWatch: Basic metrics and logs
- Prometheus/Grafana: For advanced monitoring (configure separately)

## URLs
- Frontend: https://[CloudFront distribution domain]
- API: https://[API Gateway URL]/prod