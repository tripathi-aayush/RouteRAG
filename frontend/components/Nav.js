import React from "react";
import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link> | <Link href="/upload">Upload</Link> | <Link href="/chat">Chat</Link> | <Link href="/analytics">Analytics</Link> | <Link href="/history">History</Link> | <Link href="/chart">Chart</Link> | <Link href="/feedback">Feedback</Link>
    </nav>
  );
}
