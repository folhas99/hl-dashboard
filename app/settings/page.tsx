"use client";

import { useEffect, useState } from "react";

type TradingAccount = { id: string; label: string; address: string };

export default function SettingsPage() {
  const [account, setAccount] = useState<TradingAccount | null>(null);
  const [label, setLabel] = useState("Main");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/account");
      const data = await res.json();
      if (data?.account) {
        setAccount(data.account);
        setLabel(data.account.label ?? "Main");
        setAddress(data.account.address ?? "");
      }
    })();
  }, []);

  async function save() {
    setStatus(null);
    setBusy(true);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, address })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Falha ao guardar");
      setAccount(data.account);
      setStatus("Guardado ✅");
    } catch (e: any) {
      setStatus(e?.message ?? "Erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1>Settings</h1>
      <p className="muted">Associa o teu Hyperliquid public address (wallet / sub-account address).</p>

      <div className="form">
        <label>
          Label
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Main" />
        </label>
        <label>
          Hyperliquid address
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." />
        </label>

        {status ? <div className="alert">{status}</div> : null}

        <button className="btn" disabled={busy} onClick={save}>
          {busy ? "A guardar..." : "Guardar"}
        </button>

        <details>
          <summary>Notas</summary>
          <ul>
            <li>O projecto só usa dados públicos (não pede nem guarda private keys).</li>            <li>Para sub-accounts, tens de usar o address real desse sub-account (n�o o agent wallet), sen�o a API pode devolver vazio.</li>
          </ul>
        </details>
      </div>
    </div>
  );
}
