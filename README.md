# VisionGuard AI — SaaS Industrial Safety Monitoring Platform

### 🌐 Live Production Deployments
- **Live Frontend Console (Vercel):** [https://visionguard-ai.vercel.app](https://visionguard-ai.vercel.app)
- **Live Backend API (Railway):** [https://visionguard-backend.up.railway.app](https://visionguard-backend.up.railway.app)
- **GitHub Repository:** [https://github.com/DHARNISH123/VisionGuard-AI](https://github.com/DHARNISH123/VisionGuard-AI)

---

## 🚀 Version 2.0 Architectural Enhancements

VisionGuard AI has been upgraded to a production-ready enterprise safety suite. Key software engineering highlights include:

- **State Hysteresis Frame Filter:** Solves database duplication spam. Instead of logging separate violations for consecutive video frames, it updates active incidents in-place and triggers dynamic WebSocket events (`UPDATE_ALERT`, `ALERT_RESOLVED`) to synchronize frontend views.
- **Natural Language Command Router:** Bridges the floating AI Copilot with React routing. Intercepts speech/text queries to drive active screen transitions, toggle filtering status, highlight breaches, and compile safety PDF summaries.
- **Simulated CCTV Replay Pipeline:** Integrates inline video controllers (Play, Pause, Seek, Loop) with interactive neural network frame bounding box annotations.
- **Granular Safety Telemetry:** Displays real-time RTSP node details—Active Workers, Violation Counts, FPS (30), Latency (35ms), and Confidence Ratings (95%).

---

## 🛠 Technical Stack & Architecture

- **Frontend:** React 18, Vite, Vanilla CSS, React Router v6, Recharts (compliance visualizations), Lucide React (icons).
- **Backend:** FastAPI (Python 3.11), SQLAlchemy ORM, Uvicorn, WebSockets (real-time alerts), Pydantic v2, ReportLab (PDF compiler), Pandas (data structures).
- **Database:** SQLite (local dev ease) / PostgreSQL (production container & AWS RDS).
- **Vision Engine:** Ultralytics YOLOv8 for object detection + OpenCV for stream drawing. Falls back to a high-fidelity simulator when YOLO dependencies aren't local.
- **Deployment:** Docker, Docker Compose, Nginx (reverse proxy gateway), AWS (EC2, RDS, S3).

---

## Directory Layout
```
visionguard-ai/
├── docker-compose.yml          # Coordinates database, API, and Proxy Nginx
├── nginx.conf                  # Nginx proxy mapping routes
├── README.md                   # Platform documentation
├── backend/
│   ├── Dockerfile              # Headless OpenCV Linux runner
│   ├── requirements.txt        # python packages dependencies
│   ├── .env.example            # Environment template
│   └── app/
│       ├── main.py             # FastAPI entrypoint & database seeding
│       ├── core/               # config, database connect, security & RBAC
│       ├── models/             # SQLAlchemy models (User, Camera, Incident, Policy)
│       ├── schemas/            # Pydantic schemas validation
│       ├── api/                # REST endpoints
│       └── services/           # WebSocket, stream manager, report generator, YOLO detector
└── frontend/
    ├── Dockerfile              # Multi-stage production Nginx serve
    ├── package.json            # npm packages dependencies
    ├── vite.config.js          # Vite plugins and API proxy routes
    └── src/
        ├── index.css           # Tailwind + Custom alarm glow animations
        ├── main.jsx            # React DOM mounting
        ├── App.jsx             # React routing structure
        ├── components/         # Protected routes & AppShell dashboard wrapper
        ├── context/            # AuthContext (JWT) & ThemeContext (Dark/Light)
        ├── pages/              # Landing, Dashboard, Cameras, Incidents, Policies, Analytics, Settings
        └── services/           # REST API client & WebSocket client
```

---

## Local Quickstart Guide

### 1. Run the Backend API

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The database schema and initial demonstration seed data (Admin/Supervisor/Operator accounts) will be generated automatically on uvicorn startup.*

### 2. Run the React Frontend

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

---

## Running with Docker & Docker Compose

To spin up the entire production-like cluster (FastAPI, React served by Nginx, and PostgreSQL):

```bash
# Run compose build and start containers
docker-compose up --build -d

# Stop and remove containers
docker-compose down
```
Access the application on `http://localhost`.

---

## AWS Deployment Guide

### 1. Database (Amazon RDS PostgreSQL)
1. Create a PostgreSQL instance in Amazon RDS.
2. In the DB Security Group, allow inbound traffic on port `5432` from your EC2 Instance's IP or Security Group.
3. Obtain the connection string: `postgresql://<user>:<password>@<rds-endpoint>:5432/<dbname>`.

### 2. File Storage (Amazon S3 for Snapshots)
1. Create an S3 Bucket (e.g. `visionguard-snapshots`).
2. Create an IAM User with programmatic access (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) and attach policies allowing `s3:PutObject` and `s3:GetObject` on the bucket.
3. Configure the environment variables on the backend instance.

### 3. Compute (Amazon EC2 Instance)
1. Launch an Ubuntu Linux EC2 instance. Ensure port `80` (HTTP), `443` (HTTPS) and `22` (SSH) are open in the security group.
2. SSH into your instance, update packages, and install Git, Docker, and Docker Compose:
   ```bash
   sudo apt update
   sudo apt install -y git docker.io docker-compose
   sudo systemctl enable docker
   sudo systemctl start docker
   ```
3. Clone this repository onto the instance.
4. Create a production `.env` file referencing your Amazon RDS link and S3 details.
5. Launch the services:
   ```bash
   sudo docker-compose up -d
   ```

### 4. Reverse Proxy Setup (Nginx)
The included `nginx.conf` handles proxying:
- Frontend files are served from `/usr/share/nginx/html`.
- REST requests under `/api` redirect internally to `http://backend:8000`.
- WebSockets under `/ws` redirect to `ws://backend:8000/ws`.

---

## Project Demo Accounts (Pre-Seeded)

- **Administrator:** `admin@visionguard.com` / `Admin@123`
- **Safety Supervisor:** `supervisor@visionguard.com` / `Supervisor@123`
- **Control Room Operator:** `operator@visionguard.com` / `Operator@123`
