# Sky Guardian Swarm (CHAKRAVYUH 1.0) 🚁

**Sky Guardian Swarm** is an advanced tactical drone swarm simulation dashboard, designed to visualize and manage autonomous drone operations. This project demonstrates decentralized swarm intelligence, self-healing mesh networking, and real-time tactical awareness in a browser-based environment.

## 🚀 Project Overview

The application simulates a fleet of autonomous drones operating in a contested environment. It showcases key concepts in modern drone warfare, including:

*   **Decentralized Intelligence**: Drones operate using the Boids algorithm (separation, alignment, cohesion) to move as a flock without central control.
*   **Self-Healing Mesh Network**: The swarm automatically elects a Master drone. If the Master is destroyed or disconnected, the remaining drones hold an election to appoint a new leader, ensuring mission continuity.
*   **GPS-Denied Navigation**: Drones simulate navigation in environments with jamming zones, using inertial guidance and peer referencing.
*   **Tactical Command**: A dashboard for operators to monitor fleet status, change formations, and assign missions.

## ✨ Key Features

### 🎮 Mission Control & Simulation
*   **Real-time Swarm logic**: 20 FPS simulation tick rate managing position, velocity, battery, and health.
*   **Formation Management**: Dynamically switch between formations (V-Formation, Echelon, Scattered, Circle).
*   **Threat Simulation**: "Jamming Zones" simulate electronic warfare. Drones entering these zones lose communication and take damage.
*   **Master Election**: Visual representation of the Raft-like consensus algorithm for electing a new Master drone when the current one fails.

### 🗺️ Tactical Map
*   **Interactive Visualization**: Real-time rendering of all drones, targets, and jamming zones.
*   **Mesh Network Visualization**: Visual lines showing P2P connections between Master and Slaves, and Slave-to-Slave mesh links.
*   **Status Indicators**: Color-coded markers for drone health, role (Master/Slave), and connectivity.

### 📱 Virtual Device Integration
*   **Phone Sensor Simulation**: Includes a "Connect Phone" feature that adds a virtual "proxy drone" to the swarm.
*   **Accelerometer Control**: In a full implementation, this would use the device's actual sensors. Currently, it simulates the integration of an external agent into the swarm mesh.

## 🛠️ Technology Stack

*   **Frontend Framework**: [React 18](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) based on [Radix UI](https://www.radix-ui.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **State Management**: React Hooks (`useSwarmSimulation`)

## 📂 Project Structure

```
guardian-swarm-unified/
├── src/
│   ├── components/
│   │   ├── swarm/               # Core swarm visualization components
│   │   │   ├── ControlPanel.tsx # Mission control buttons & status
│   │   │   ├── DroneList.tsx    # Scrollable list of active drones
│   │   │   ├── TacticalMap.tsx  # Main map visualization
│   │   │   ├── StatusPanel.tsx  # Global swarm stats
│   │   │   └── ...              # markers, lines, logs
│   │   ├── ui/                  # Reusable UI components (buttons, cards, etc.)
│   │   └── NavLink.tsx          # Navigation helper
│   ├── hooks/
│   │   ├── useSwarmSimulation.ts # MAIN LOGIC: Physics, AI, & State
│   │   └── ...
│   ├── pages/
│   │   ├── Index.tsx            # Main Dashboard Page
│   │   └── ...
│   ├── lib/
│   │   └── swarm-engine.ts      # (Implied) Helper math & logic functions
│   └── App.tsx                  # Routing & Layout
├── public/                      # Static assets
└── package.json                 # Dependencies
```

## 📦 Getting Started

Follow these steps to set up the project locally:

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
4.  **Open the dashboard**:
    Navigate to `http://localhost:8082` (or the port shown in your terminal).

## 🐛 Debugging & Status

*   **Heartbeat**: Monitors the communication frequency of the Master drone.
*   **Timeout**: The threshold before a drone is considered lost.
*   **FPS**: The simulation tick rate (default 20 updates/second).

---

*Verified for immediate execution on Windows/Node environments.*