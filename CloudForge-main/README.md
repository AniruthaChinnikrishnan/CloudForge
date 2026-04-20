# CloudForge

A cloud-native CI/CD automation platform built with modern technologies.

## Features
- User authentication (JWT)
- Connect GitHub repositories
- Trigger CI/CD pipelines
- View deployment status
- Cloud-native deployment on AWS

## Tech Stack
- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + REST APIs + JWT
- **Database**: PostgreSQL (AWS RDS)
- **Cloud**: AWS (S3, CloudFront, EC2, RDS, API Gateway, IAM)
- **DevOps**: Docker, Terraform, GitHub Actions
- **Monitoring**: CloudWatch + Prometheus/Grafana

## Design Patterns
- **Factory Pattern**: Pipeline creation
- **Strategy Pattern**: Deployment strategies
- **MVC Pattern**: Backend architecture

## Project Structure
```
cloudforge/
├── frontend/          # React application
├── backend/           # Node.js API server
│   ├── models/        # Data models
│   ├── controllers/   # Request handlers
│   ├── routes/        # API routes
│   ├── middleware/    # Auth middleware
│   ├── config/        # Database config
│   └── utils/         # Utility functions
├── infrastructure/    # Terraform configs
├── docker/            # Dockerfiles
├── .github/workflows/ # CI/CD pipeline
└── docs/              # Documentation
```

## Deployment
See [deployment guide](docs/deployment.md) for detailed instructions.

## Local Development
1. Clone the repository
2. Set up PostgreSQL database
3. Configure environment variables
4. Run backend: `cd backend && npm install && npm run dev`
5. Run frontend: `cd frontend && npm install && npm start`

Note: This application is designed for cloud deployment and may require modifications for local development.