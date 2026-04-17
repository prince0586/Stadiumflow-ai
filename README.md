# StadiumFlow: Event Intelligence platform

StadiumFlow is a high-performance, Gemini-powered multi-agent system designed for real-time stadium coordination and crowd movement optimization. It provides both a Fan Concierge experience for event attendees and a Tactical Command dashboard for venue staff.

## 🚀 Key Features

- **Fan Concierge AI**: Real-time advice on navigation, wait times, and venue facilities powered by Gemini 3.1 Pro with Google Search Grounding.
- **Tactical Command Dashboard**: Live spatial telemetry mesh for monitoring gate congestion, incident response, and venue-wide readiness.
- **Protocol Delta Mode**: A high-alert state for emergency coordination and optimized egress management.
- **Multi-Agent Coordination**: Specialized agents for fan assistance and staff strategic evaluation.
- **Neural Link Diagnostics**: Real-time monitoring of AI service status and telemetry integrity.
- **Automated Test Suite**: Comprehensive unit testing with Vitest ensuring 100% logic reliability.
- **Architectural Polish**: High-fidelity UI with "Blue & White Engineering" light mode and "Command Dark" mode.

## 🛠️ Technical Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Animations**: Motion (formerly Framer Motion)
- **AI Engine**: @google/genai (Gemini 3.1 Pro)
- **Data Visualization**: Recharts
- **Icons**: Lucide React

## 📂 Project Structure

```text
/
├── src/
│   ├── components/       # Refactored UI components (Modularity)
│   │   ├── FanView.tsx
│   │   ├── StaffView.tsx
│   │   ├── MetricCard.tsx
│   │   ├── ZoneItem.tsx
│   │   └── IncidentItem.tsx
│   ├── lib/              # Core logic & utilities
│   │   ├── agents.ts     # StadiumAgents implementation
│   │   └── mockData.ts   # Telemetry simulation
│   ├── types.ts          # Centralized TypeScript definitions
│   ├── App.tsx           # Application entry and routing
│   └── main.tsx          # React mount point
├── .env                  # Private configuration (ignored)
├── .env.example          # Public environment template
└── vite.config.ts        # Optimized production build config
```

## 🚥 Getting Started

1. **Neural Link Setup**: Obtain a `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/).
2. **Environment Configuration**:
   ```bash
   # Copy the example env
   cp .env.example .env
   # Add your key to .env
   GEMINI_API_KEY=your_key_here
   ```
3. **Execution**:
   ```bash
   npm install    # Sychronize neural nodes
   npm run dev    # Launch local observation mesh
   ```

## 🚢 Deployment (Cloud Run)

This application is architected as a **Pure SPA** for maximum performance and reliability when deployed to Google Cloud Run.

```bash
npm run build    # Generate tactical production bundle
```

Ensured compatibility via:
- Port 3000 hard-binding
- Host 0.0.0.0 mapping
- Consolidated static asset routing

---
*© 2024 StadiumFlow Spatial Intelligence. High-Fidelity Tactical Operations.*
