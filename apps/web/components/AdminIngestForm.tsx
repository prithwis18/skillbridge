'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { INGESTOR_URL } from '@/lib/config';
import { fadeUp, SPRING } from '@/lib/motion';
import { btnGhost, btnPrimary, card, h2, input, label, lede } from '@/lib/ui';

const TEMPLATE = `{
  "kind": "course",
  "externalId": "internal-001",
  "title": "Internal Bootcamp: Distributed Systems",
  "url": "https://internal.example.edu/courses/distributed-systems",
  "provider": "Campus Training Cell",
  "level": "intermediate",
  "durationMins": 600,
  "skills": [
    { "slug": "system-design", "weight": 1 },
    { "slug": "message-queues", "weight": 0.6 }
  ]
}`;

export function AdminIngestForm() {
  const [token, setToken] = useState('dev-admin-token');
  const [body, setBody] = useState(TEMPLATE);
  const [result, setResult] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setResult(null);
    try {
      // Parsed here so malformed JSON is caught before a pointless round trip.
      const parsed = JSON.parse(body);
      const res = await fetch(`${INGESTOR_URL}/admin/resources`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(parsed),
      });
      const json = await res.json();
      setFailed(!res.ok);
      setResult(`${res.status} — ${JSON.stringify(json)}`);
    } catch (e) {
      setFailed(true);
      setResult(e instanceof Error ? e.message : 'request failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      className={`${card} mx-auto max-w-[600px] p-8 pb-6`}
      layout
      transition={SPRING}
      {...fadeUp}
    >
      <h2 className={h2}>Push resources</h2>
      <p className={lede}>
        Queued onto <code className="rounded bg-fill px-1.5 py-0.5 font-mono text-[12.5px]">
          stream:ingest.resources
        </code>
        ; the hub validates and writes it. Accepts one resource or an array.
      </p>

      <div className="mb-[22px]">
        <div className={label}>Admin token</div>
        <input className={input} value={token} onChange={(e) => setToken(e.target.value)} />
      </div>

      <div className="mb-[22px]">
        <div className={label}>Resource JSON</div>
        <textarea
          className={`${input} font-mono text-[13px] leading-relaxed`}
          rows={16}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      {result && (
        <p className={`text-[13.5px] ${failed ? 'text-red-600' : 'text-ink-faint'}`}>{result}</p>
      )}

      <div className="mt-7 flex justify-end gap-3">
        <button className={btnGhost} onClick={() => setBody(TEMPLATE)}>
          Reset
        </button>
        <button className={btnPrimary} onClick={submit} disabled={busy}>
          {busy ? 'Sending…' : 'Push'}
        </button>
      </div>
    </motion.div>
  );
}
