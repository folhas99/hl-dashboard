"use client";

import { useEffect, useMemo, useState } from "react";

type Fill = {
  coin: string;
  side: "A"|"B";
  px: string;
  sz: string;
  time: number;
  dir?: string;
  closedPnl?: string;
  fee?: string;
  hash?: string;
};

function toNum(v:any){ const n = typeof v=="string" ? parseFloat(v) : typeof v=="number" ? v : 0; return Number.isFinite(n)?n:0; }

export default function TradesPage() {
  const [range, setRange] = useState<7|30|90|365>(90);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [fills, setFills] = useState<Fill[]>([]);
  const [coin, setCoin] = useState<string>("ALL");
  const [side, setSide] = useState<string>("ALL");

  async function load(){
    setLoading(true);
    setError(null);
    const endTime = Date.now();
    const startTime = endTime - range*24*3600*1000;
    try{
      const res = await fetch(`/api/hl/fills?startTime=${startTime}&endTime=${endTime}`);
      const json = await res.json();
      if(!res.ok) throw new Error(json?.error ?? "Erro ao buscar" );
      setFills(json?.fills ?? []);
    }catch(e:any){
      setError(e?.message ?? "Erro");
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); },[range]);

  const coins = useMemo(()=>{
    const set = new Set(fills.map(f=>f.coin));
    return ["ALL", ...Array.from(set).sort()];
  },[fills]);

  const filtered = useMemo(()=>{
    return fills
      .filter(f=> coin==="ALL" ? true : f.coin===coin)
      .filter(f=> side==="ALL" ? true : f.side===side)
      .slice()
      .sort((a,b)=> (b.time??0) - (a.time??0));
  },[fills, coin, side]);

  const totals = useMemo(()=>{
    const pnl = filtered.reduce((a,f)=>a+toNum(f.closedPnl),0);
    const fees = filtered.reduce((a,f)=>a+toNum(f.fee),0);
    const vol = filtered.reduce((a,f)=>a+Math.abs(toNum(f.px)*toNum(f.sz)),0);
    return { pnl, fees, vol, count: filtered.length };
  },[filtered]);

  return (
    <div className="panel">
      <div className="row" style={{ justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h1>Trades / Fills</h1>
          <p className="muted">Filtros por período, coin e side.</p>
        </div>
        <div className="row">
          <button className={`btn ${range===7?"":"btn-secondary"}`} onClick={()=>setRange(7)}>7d</button>
          <button className={`btn ${range===30?"":"btn-secondary"}`} onClick={()=>setRange(30)}>30d</button>
          <button className={`btn ${range===90?"":"btn-secondary"}`} onClick={()=>setRange(90)}>90d</button>
          <button className={`btn ${range===365?"":"btn-secondary"}`} onClick={()=>setRange(365)}>365d</button>
          <button className="btn" onClick={load} disabled={loading}>{loading?"A carregar...":"Refresh"}</button>
        </div>
      </div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="row" style={{ flexWrap:"wrap" }}>
        <div className="pill">Fills: <b>{totals.count}</b></div>
        <div className="pill">PnL: <b className={totals.pnl>=0?"good":"bad"}>{totals.pnl.toFixed(2)}</b></div>
        <div className="pill">Fees: <b>{totals.fees.toFixed(2)}</b></div>
        <div className="pill">Volume(est): <b>{totals.vol.toFixed(0)}</b></div>
      </div>

      <div className="row" style={{ alignItems:"center", flexWrap:"wrap" }}>
        <label className="inline">
          Coin
          <select value={coin} onChange={(e)=>setCoin(e.target.value)}>
            {coins.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="inline">
          Side
          <select value={side} onChange={(e)=>setSide(e.target.value)}>
            <option value="ALL">ALL</option>
            <option value="B">B (Buy)</option>
            <option value="A">A (Sell)</option>
          </select>
        </label>
      </div>

      <div className="spacer" />

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Coin</th>
              <th>Side</th>
              <th>Px</th>
              <th>Sz</th>
              <th>Closed PnL</th>
              <th>Fee</th>
              <th>Dir</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, idx)=>{
              const pnl = toNum(f.closedPnl);
              return (
                <tr key={`${f.time}-${idx}`}>
                  <td className="mono">{new Date(f.time).toLocaleString()}</td>
                  <td>{f.coin}</td>
                  <td className={f.side==="B"?"good":"bad"}>{f.side}</td>
                  <td className="mono">{toNum(f.px).toFixed(6)}</td>
                  <td className="mono">{toNum(f.sz).toFixed(4)}</td>
                  <td className={pnl>=0?"good":"bad"}>{pnl.toFixed(2)}</td>
                  <td className="mono">{toNum(f.fee).toFixed(4)}</td>
                  <td className="muted">{f.dir ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loading ? <div className="muted">A carregar...</div> : null}
    </div>
  );
}
