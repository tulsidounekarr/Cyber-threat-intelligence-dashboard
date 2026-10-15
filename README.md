# Cyber Threat Intelligence Dashboard (ThreatLens)

A local educational full-stack project for defensive public-IP reputation lookups. React + TypeScript frontend, Flask backend, and VirusTotal API v3.

## Requirements
- Python 3.10 or newer
- Node.js 20.19+ or 22.12+ recommended for current Vite
- A VirusTotal API key (free account keys have usage limits)

## 1. Configure the API key
From the project root, copy `.env.example` to `.env` and replace the placeholder with your own key:

```env
VIRUSTOTAL_API_KEY=your_real_key_here
```

Do not commit or share `.env`. It is ignored by Git. Never put the key in frontend code.

## 2. Install and start the backend (Terminal 1)
Open PowerShell in the project root (`cybersecurityProject`):

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Backend health check: http://127.0.0.1:5000/api/health

## 3. Install and start the frontend (Terminal 2)
Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally http://localhost:5173. Keep both terminals running. The Vite development proxy forwards `/api` requests to Flask.

## Troubleshooting
- **Failed to fetch:** make sure Flask is running in Terminal 1 and Vite is running in Terminal 2. Restart Vite after changing `vite.config.ts`.
- **API key not configured:** ensure `.env` is in the project root next to `app.py`, not inside `frontend`, and that the key line is `VIRUSTOTAL_API_KEY=...`.
- **401:** check the API key.
- **429:** wait; VirusTotal applies API quotas.
- **404/no report:** the provider may not have a report for that IP.
- **Invalid/private IP:** use a public IP address. `8.8.8.8` is a public example, but results depend on provider availability.

## Project structure
```text
cybersecurityProject/
├── app.py
├── requirements.txt
├── .env.example
├── .gitignore
├── README.md
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── main.tsx
        └── styles.css
```

## Scope and safety
This project looks up publicly available reputation data; it does not port-scan, exploit, or attack IP addresses. Reputation results are indicators and should not be treated as proof of malicious activity. The Flask development server is intended for local use, not public production deployment.
