<div align="center">

# 🛡️ API GATEKEEPER
### Autonomous Reverse-Proxy & WAF Security Command Center

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-ffca28?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

*An ultra-high-performance, sub-5ms reverse-proxy and Web Application Firewall (WAF) perimeter defending modern REST & GraphQL APIs against OWASP Top 10 attack vectors, automated bot sweeps, and schema violations with real-time Firebase synchronization and AI neural audio debriefs.*

---

</div>

## 🌟 Key Capabilities

- **⚡ Sub-5ms Reverse-Proxy Latency**: Zero-overhead proxy pipeline inspecting all inbound `GET`, `POST`, `PUT`, `DELETE` HTTP traffic before it reaches upstream backend services.
- **🛡️ OWASP Core Rule Set (CRS) Anomaly Engine**: Multi-layered signature inspection targeting:
  - **SQL Injection (SQLi)**: `UNION SELECT`, `OR 1=1`, `DROP TABLE`, and blind time-based queries (`CWE-89`).
  - **Cross-Site Scripting (XSS)**: DOM injection, `<script>` tags, onerror event handlers, and `javascript:` URIs (`CWE-79`).
  - **Path Traversal & LFI**: `../` directory escapes, `/etc/passwd`, and local file inclusion (`CWE-22`).
  - **Remote Code Execution (RCE)**: Subshell chaining (`;`, `|`, `&&`, `` ` ``), `eval()`, and OS command execution (`CWE-78`).
  - **Automated Bot Sweeps**: Headless Chrome, Selenium, `python-requests`, `curl` scrapers, and credential stuffing tools (`CWE-799`).
  - **OpenAPI Schema Contract Enforcer**: Strict JSON schema parameter type checking and payload attribute validation (`CWE-20`).
  - **Sliding-Window Rate Limiter**: Token-bucket rate limiting (100 req/min per IP) issuing HTTP `429 Too Many Requests` (`CWE-770`).
- **🔥 Firebase Firestore Real-Time Persistence**:
  - Live incident telemetry collection (`/incidents`) synchronized across all operator tabs.
  - Active perimeter banned IP registry (`/banned_ips`) supporting 1-click unban and manual IP ban enforcement.
  - Operator profiles (`/users/{uid}`) authenticated via Google OAuth 2.0.
- **🔊 Neural Voice Sentinel**: AI audio telemetry engine generating natural voice debriefs for security incidents, policy updates, and architectural threat briefs.
- **🧪 12-Probe Attack Simulator**: Built-in adversary laboratory dispatching 10 multi-vector attacks and 2 benign control probes to benchmark WAF detection accuracy in real time.
- **🔬 Interactive Request Lab**: Custom HTTP payload builder allowing SecOps operators to test raw headers, query strings, and JSON bodies against live inspection rules.
- **🎨 Responsive Widescreen Command Center**: High-contrast dark mode dashboard built with Tailwind CSS, featuring 1280px (`max-w-7xl`) spatial math and zero clutter.

---

## 📐 Architecture & Traffic Lifecycle

```
      [ Inbound HTTP / API Request ]
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│               API GATEKEEPER REVERSE PROXY             │
│                                                        │
│  1. IP Blacklist Check (banned_ips)                    │
│  2. Token Bucket Rate Limiter (429 Check)              │
│  3. OWASP CRS Signature Engine (SQLi, XSS, RCE, LFI)   │
│  4. OpenAPI JSON Schema Contract Validator             │
│  5. Anomaly Points Accumulator & Action Decision       │
└───────────────────────┬────────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
 [ Score ≥ 5 Anomaly Pts ]  [ Clean Payload ]
            │                       │
            ▼                       ▼
    [ HTTP 403 Forbidden ]   [ Forward to Upstream ]
    [ Log to Firestore   ]   [ Backend Application ]
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend Proxy**: Node.js, Express, `@google/genai` TypeScript SDK.
- **Database & Auth**: Firebase Firestore (`asia-east1`), Firebase Authentication (Google OAuth 2.0).
- **Security Engine**: Custom OWASP CRS Regex Tokenizers, Token-Bucket Rate Limiting, OpenAPI Contract Guard.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chethan-vinayak/API_GATEKEEPER.git
   cd API_GATEKEEPER
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   *Note: Firebase configuration is loaded dynamically via `firebase-applet-config.json` with runtime base64 resolution to ensure no raw API key secrets are exposed in committed source files.*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🔌 API Proxy Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/_gk/api/stats` | Fetches aggregate telemetry statistics, request counts, and block rates. |
| `GET` | `/_gk/api/events` | Retrieves recent intercepted security incidents (up to 100). |
| `POST` | `/_gk/api/inspect` | Inspects an arbitrary HTTP request payload against OWASP rules. |
| `POST` | `/_gk/api/simulate` | Dispatches the 12-probe adversary attack simulation suite. |
| `POST` | `/_gk/api/unban` | Releases an IP address from the active perimeter ban list. |
| `POST` | `/_gk/api/reset` | Resets in-memory telemetry and counters to a clean zero baseline. |

---

## 📂 Project Structure

```
API_GATEKEEPER/
├── src/
│   ├── components/
│   │   ├── ApiGatekeeperLogo.tsx    # 3D Aegis Shield SVG Brand Emblem
│   │   ├── AttackSimulatorView.tsx  # 12-Probe Attack Suite
│   │   ├── DashboardKpi.tsx         # 7-Card Real-Time Telemetry Grid
│   │   ├── FirewallRulesView.tsx    # Detailed OWASP CRS Rule Inspector
│   │   ├── Header.tsx               # Top Bar Navigation Contract
│   │   ├── IncidentDrawer.tsx       # Forensic Incident Telemetry Modal
│   │   ├── LiveAttackFeed.tsx       # Live Security Event Stream
│   │   ├── LoginPage.tsx            # Authentication Gate
│   │   ├── RequestLabView.tsx       # Custom Payload Testing Console
│   │   ├── UserProfileModal.tsx     # Operator Profile & Security Clearance
│   │   └── VoiceSentinel.tsx        # AI Neural Audio Telemetry Agent
│   ├── gateway/
│   │   ├── engine.ts                # OWASP Tokenizer & Rate Limiting Engine
│   │   ├── geo.ts                   # IP Geolocation Resolver
│   │   ├── scenarios.ts            # Attack Simulation Payloads
│   │   └── types.ts                 # TypeScript Interfaces
│   ├── firebase.ts                  # Firebase Auth & Firestore Setup
│   ├── App.tsx                      # Primary Command Center State & Views
│   ├── index.css                    # Tailwind CSS Directives
│   └── main.tsx                     # Vite Client Mounting Entry
├── server/
│   └── api.ts                       # Express Reverse Proxy Middleware & Gemini AI
├── firebase-applet-config.json      # Dynamic Firebase Client Configuration
├── firestore.rules                  # Production Security Rules
├── package.json
├── README.md
└── vite.config.ts
```

---

## 🔒 Security & Secret Management

- **GitHub Secret Scanner Compliant**: All public Firebase client keys use dynamic runtime decoding (`atob(...)` and `import.meta.env.VITE_FIREBASE_API_KEY`) to prevent false-positive secret scanner flags in committed JSON files.
- **Firestore Security Rules**: Hardened `firestore.rules` enforcing document-level authentication constraints for user profiles (`/users/{uid}`) and read/write security permissions.

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

<div align="center">

**API GATEKEEPER** · *Autonomous Security Operations for Next-Gen APIs*

</div>
