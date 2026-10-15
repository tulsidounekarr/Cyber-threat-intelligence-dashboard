import { FormEvent, useState } from 'react'

type ScanResult = {
  ip: string; reputation: number; country: string; asn?: number; owner?: string;
  analysis_stats: { malicious: number; suspicious: number; undetected: number; harmless: number; timeout: number };
  last_analysis_date?: number; data_source: string;
}

function App() {
  const [ip, setIp] = useState('8.8.8.8')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function scanIp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true); setError(''); setResult(null)
    try {
      const response = await fetch(`/api/scan/ip?ip=${encodeURIComponent(ip.trim())}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`)
      setResult(data as ScanResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to the backend. Ensure Flask is running on port 5000.')
    } finally { setLoading(false) }
  }

  const stats = result?.analysis_stats
  const date = result?.last_analysis_date ? new Date(result.last_analysis_date * 1000).toLocaleString() : 'Not available'

  return <main className="page">
    <header className="topbar"><div className="brand-mark">CTI</div><div><strong>THREATLENS</strong><span>SECURITY OPERATIONS CENTER</span></div><div className="status"><i /> LOCAL DEMO</div></header>
    <section className="hero"><div className="eyebrow">CYBER THREAT INTELLIGENCE</div><h1>Public IP Reputation<br /><em>Investigation Dashboard</em></h1><p>Investigate public IP addresses using reputation and analysis data from VirusTotal.</p></section>
    <section className="search-card"><div className="section-head"><div><span className="mini-label">INVESTIGATION TOOL</span><h2>IP address lookup</h2></div><span className="api-tag">VIRUSTOTAL API v3</span></div>
      <form onSubmit={scanIp}><label htmlFor="ip">Public IP address</label><div className="search-row"><input id="ip" value={ip} onChange={e => setIp(e.target.value)} placeholder="e.g. 8.8.8.8" autoComplete="off" required /><button disabled={loading}>{loading ? 'Checking…' : '⌕  Check IP'}</button></div><p className="hint">Use a public IP address. This tool performs a lookup only; it does not scan or attack the host.</p></form>
      {error && <div className="error" role="alert"><strong>Lookup failed</strong><span>{error}</span></div>}
    </section>
    {result && stats && <section className="results" aria-live="polite"><div className="section-head"><div><span className="mini-label">LOOKUP RESULTS</span><h2>{result.ip}</h2></div><span className={stats.malicious > 0 ? 'risk high' : stats.suspicious > 0 ? 'risk medium' : 'risk low'}>{stats.malicious > 0 ? 'Potentially malicious' : stats.suspicious > 0 ? 'Needs review' : 'No malicious detections reported'}</span></div>
      <div className="metrics"><Metric label="Malicious" value={stats.malicious} tone="red" /><Metric label="Suspicious" value={stats.suspicious} tone="amber" /><Metric label="Harmless" value={stats.harmless} tone="green" /><Metric label="Undetected" value={stats.undetected} tone="blue" /></div>
      <div className="details"><div><span>Country</span><strong>{result.country || 'Unknown'}</strong></div><div><span>Reputation score</span><strong>{result.reputation}</strong></div><div><span>Network owner</span><strong>{result.owner || 'Unknown'}</strong></div><div><span>ASN</span><strong>{result.asn ?? 'Not available'}</strong></div><div><span>Last analysis</span><strong>{date}</strong></div><div><span>Data source</span><strong>{result.data_source}</strong></div></div>
      <p className="disclaimer">Interpret results in context. A reputation score or detection count alone does not prove that an IP is malicious.</p>
    </section>}
    <footer><span>THREATLENS · EDUCATIONAL PROJECT</span><span>Data provided by VirusTotal · Defensive use only</span></footer>
  </main>
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="metric"><span className={`metric-dot ${tone}`} /><span className="metric-label">{label}</span><strong>{value}</strong></div>
}

export default App
