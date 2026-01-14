"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Nav() {
  const { data } = useSession();

  return (
    <div className="nav">
      <div className="nav-left">
        <Link href="/" className="brand">
          HL Dashboard
        </Link>
        {data?.user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/trades">Trades</Link>
            <Link href="/settings">Settings</Link>
          </>
        ) : null}
      </div>
      <div className="nav-right">
        {data?.user ? (
          <button className="btn" onClick={() => signOut({ callbackUrl: "/login" })}>
            Logout
          </button>
        ) : (
          <Link className="btn" href="/login">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
