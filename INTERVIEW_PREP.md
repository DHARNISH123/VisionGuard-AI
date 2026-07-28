# VisionGuard AI — Placement Interview Presentation Guide

This guide is structured to help you present the **VisionGuard AI - Version 2.0** suite in placement interviews. Use this 10-minute outline to pitch your engineering decisions, system data flows, and complex problem-solving.

---

## ⏱ 10-Minute Presentation Outline

### 1. Introduction & Core Problem Statement (2 Minutes)
- **The Pitch:** *"Industrial environments suffer from safety compliance gaps. Manual auditing is expensive, lags in response time, and is prone to human error. VisionGuard AI is a real-time safety automation suite that uses computer vision to detect PPE violations, trace safety life cycles, and leverage generative AI for immediate audit recommendations."*
- **Highlight V2.0 Upgrades:** Focus on how you transitioned the app from a simple dashboard to a fully connected enterprise SaaS platform with **interactive maps, smart global search, grouped notification matrices, and AI Copilot actions**.

### 2. Architecture & Data Flow (3 Minutes)
Draw the interviewer's attention to the unidirectional pipeline:
```
Camera Feed (RTSP) ──> YOLOv8 Detection ──> FastAPI Controller ──> SQLite DB
                                                                      │
React Control Room Dashboard <── WebSocket Event <── Gemini AI Copilot ┘
```
Explain each layer’s design choice:
- **Frontend (React, Vite):** Fast load times, responsive layout, Recharts for trend visualization, and reactive WebSockets.
- **Backend (FastAPI, Python):** Lightweight, asynchronous, high concurrency performance, and native WebSocket loop support.
- **Computer Vision (YOLOv8 nano):** Edge-optimizable model running frame-by-frame inference.
- **LLM Layer (Google Gemini API):** Translates raw database statistics into natural language recommendations and root-cause analysis.

### 3. Key Engineering Highlights & Hysteresis (3 Minutes)
This is where you demonstrate advanced problem-solving:
- **The Problem (Duplication Spam):** *"Raw YOLO detections checking frames every few seconds will create a new alert record for every single frame a breach is active, spamming the database and supervisor."*
- **The Solution (Frame Hysteresis Filter):**
  - Implement a **Stateful Tracking Filter** inside the `stream_manager.py` loop.
  - When a breach occurs, check for an existing `Pending` alert on that camera feed.
  - If found, **update the alert in place** (update timestamp, confidence, snapshot URL) and broadcast `UPDATE_ALERT` via WebSockets.
  - When compliance is restored, **auto-resolve the alert** (`status = "Resolved"`) and broadcast `ALERT_RESOLVED` to clean up the UI.

### 4. Safety Copilot & Interactive Actions (2 Minutes)
- Explain how you integrated natural language processing with UI routing:
  - Intercept queries on the frontend (`AppShell.jsx`) to scan for action triggers.
  - Set state variables in `localStorage` and dispatch custom `Window Events` (`copilot-filter`, `copilot-select-camera`, `copilot-worker-select`).
  - Listen to these events inside individual React views to apply filters, highlight rows, change camera selections, or compile text-reports for download.

---

## 💬 Frequently Asked Questions (Interview Prep)

#### Q1. Why did you use SQLite instead of a heavy database like PostgreSQL?
*SQLite is lightweight and zero-config, which makes it perfect for deployment in edge-compute hubs (like factory gates where cameras operate). However, the FastAPI database connection uses SQLAlchemy ORM, meaning we can swap SQLite for PostgreSQL by simply changing the environment connection string (`DATABASE_URL`).*

#### Q2. How does the WebSockets system work?
*FastAPI maintains an active client list. When the stream manager thread detects a violation change (new breach, updated frame, or resolution), it posts a JSON payload to the WebSocket Manager, which broadcasts it to all connected frontend clients. React intercepts the payload to refresh feeds, sound alerts, and update charts instantly.*

#### Q3. How do you prevent false positives?
*The YOLOv8 model calculates bounding box confidence scores (90-98%). By adding frame hysteresis validation thresholds, we require a breach to persist across multiple consecutive frames before triggering database alerts, filtering out temporary model anomalies or brief occlusions.*
