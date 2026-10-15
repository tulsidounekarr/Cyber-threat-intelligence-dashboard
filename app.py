import os
import ipaddress
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})
VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "").strip()
VT_BASE_URL = "https://www.virustotal.com/api/v3"

@app.get("/")
def home():
    return jsonify({"message": "Cyber Threat Intelligence Dashboard API", "status": "running", "version": "1.0"})

@app.get("/api/health")
def health():
    return jsonify({"status": "healthy", "api_key_configured": bool(VIRUSTOTAL_API_KEY)})

@app.get("/api/scan/ip")
def scan_ip():
    ip = request.args.get("ip", "").strip()
    if not ip:
        return jsonify({"error": "Please provide an IP address."}), 400
    try:
        parsed_ip = ipaddress.ip_address(ip)
    except ValueError:
        return jsonify({"error": "Invalid IP address. Enter a valid IPv4 or IPv6 address."}), 400
    if not parsed_ip.is_global:
        return jsonify({"error": "Please enter a public IP address. Private and reserved IPs cannot be checked here."}), 400
    if not VIRUSTOTAL_API_KEY:
        return jsonify({"error": "VirusTotal API key is not configured. Add VIRUSTOTAL_API_KEY to your .env file."}), 500

    try:
        response = requests.get(
            f"{VT_BASE_URL}/ip_addresses/{ip}",
            headers={"x-apikey": VIRUSTOTAL_API_KEY},
            timeout=15,
        )
        if response.status_code == 404:
            return jsonify({"error": "VirusTotal has no report for this IP address."}), 404
        if response.status_code == 401:
            return jsonify({"error": "VirusTotal rejected the API key. Check your .env value."}), 401
        if response.status_code == 429:
            return jsonify({"error": "VirusTotal API rate limit reached. Wait and try again."}), 429
        response.raise_for_status()
        attrs = response.json().get("data", {}).get("attributes", {})
        stats = attrs.get("last_analysis_stats", {})
        return jsonify({
            "ip": ip,
            "reputation": attrs.get("reputation", 0),
            "country": attrs.get("country", "Unknown"),
            "asn": attrs.get("asn"),
            "owner": attrs.get("as_owner", "Unknown"),
            "analysis_stats": {
                "malicious": stats.get("malicious", 0),
                "suspicious": stats.get("suspicious", 0),
                "undetected": stats.get("undetected", 0),
                "harmless": stats.get("harmless", 0),
                "timeout": stats.get("timeout", 0),
            },
            "last_analysis_date": attrs.get("last_analysis_date"),
            "data_source": "VirusTotal API v3",
        })
    except requests.Timeout:
        return jsonify({"error": "VirusTotal request timed out. Try again."}), 504
    except requests.RequestException:
        return jsonify({"error": "Could not contact VirusTotal. Check your internet connection and try again."}), 502
    except (ValueError, KeyError):
        return jsonify({"error": "VirusTotal returned an unexpected response."}), 502

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
