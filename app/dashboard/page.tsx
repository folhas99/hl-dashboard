"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

type Summary = {
  totalFills: number;
  realizedPnl: number;
  totalFees: number;
  winRate: number;
  wins: number;
  losses: number;
  profitFactor: number | null;
  volumeUsd: number;
};

export default function DashboardPage() {
  const [range, setRange] = useState<7|30|90|365>(90);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [data, setData] = useState<any>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const endTime = Date.now();
    const startTime = endTime - range * 24 * 3600 * 1000;
    try {
      const res = await fetch(`/api/hl/summary?startTime=${startTime}&endTime=${endTime}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Erro ao buscar dados");
      setData(json);
    } catch (e:any) {
      setError(e?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [range]);

  const summary: Summary | null = data?.summary ?? null;
  const equity = useMemo(() => {
    const s = data?.series ?? [];
    return s.map((p: any) => ({
      t: p.time,
      label: new Date(p.time).toLocaleDateString(),
      cumPnl: Number(p.cumPnl ?? 0)
    }));
  }, [data]);

  const daily = useMemo(() => {
    const d = data?.daily ?? [];
    return d.map((p: any) => ({
      day: p.day,
      pnl: Number(p.pnl ?? 0)
    }));
  }, [data]);

  return (
    <div className="panel">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Address: <span className="mono">{data?.address ?? "-"}</span></p>
        </div>
        <div className="row">
          <button className={`btn ${range===7?"":"btn-secondary"}`} onClick={() => setRange(7)}>7d</button>
          <button className={`btn ${range===30?"":"btn-secondary"}`} onClick={() => setRange(30)}>30d</button>
          <button className={`btn ${range===90?"":"btn-secondary"}`} onClick={() => setRange(90)}>90d</button>
          <button className={`btn ${range===365?"":"btn-secondary"}`} onClick={() => setRange(365)}>365d</button>
          <button className="btn" onClick={load} disabled={loading}>{loading?"A carregar...":"Refresh"}</button>
        </div>
      </div>

      {error ? (
        <div className="alert">
          {error}
          <div className="spacer" />
          <p className="muted">Se ainda não configuraste o address, vai a <a href="/settings">Settings</a>.</p>
        </div>
      ) : null}

      {summary ? (
        <div className="grid">
          <div className="card">
            <div className="kpi-label">Realized PnL</div>
            <div className={`kpi ${summary.realizedPnl>=0?"good":"bad"}`}>{summary.realizedPnl.toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="kpi-label">Fees</div>
            <div className="kpi">{summary.totalFees.toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="kpi-label">Win rate</div>
            <div className="kpi">{(summary.winRate*100).toFixed(1)}%</div>
            <div className="muted" style={{ fontSize: 12 }}>{summary.wins}W / {summary.losses}L</div>
          </div>
          <div className="card">
            <div className="kpi-label">Profit factor</div>
            <div className="kpi">{summary.profitFactor ? summary.profitFactor.toFixed(2) : "-"}</div>
          </div>
          <div className="card">
            <div className="kpi-label">Fills</div>
            <div className="kpi">{summary.totalFills}</div>
          </div>
          <div className="card">
            <div className="kpi-label">Volume (est.)</div>
            <div className="kpi">{summary.volumeUsd.toFixed(0)}</div>
          </div>
        </div>
      ) : null}

      <div className="spacer" />

      <div className="grid2">
        <div className="card" style={{ height: 320 }}>
          <div className="kpi-label">Cumulative realized PnL</div>
          <div style={{ width: "100%", height: 270 }}>
            <ResponsiveContainer>
              <LineChart data={equity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" hide={true} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cumPnl" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ height: 320 }}>
          <div className="kpi-label">Daily PnL</div>
          <div style={{ width: "100%", height: 270 }}>
            <ResponsiveContainer>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" hide={true} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pnl" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="spacer" />

      <details>
        <summary>Debug (raw)</summary>
        <pre className="pre">{JSON.stringify({ fees: data?.fees, clearinghouseState: data?.clearinghouseState }, null, 2)}</pre>
      </details>
    </div>
  );
}
