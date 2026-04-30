import { NextResponse } from "next/server";

function json(data: any, status = 200) {
return new NextResponse(JSON.stringify(data), {
status,
headers: { "Content-Type": "application/json" },
});
}

async function sb(path: string, init: RequestInit) {
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
return { ok: false, data: { error: "Missing Supabase env vars." } };
}

const res = await fetch(`${url}${path}`, {
...init,
headers: {
apikey: key,
Authorization: `Bearer ${key}`,
"Content-Type": "application/json",
...(init.headers || {}),
},
cache: "no-store",
});

const text = await res.text();
let data: any = null;

try {
data = text ? JSON.parse(text) : null;
} catch {
data = { raw: text };
}

return { ok: res.ok, data };
}

export async function POST(req: Request) {
try {
const body = await req.json();

const insert = await sb("/rest/v1/skillsquest_activity", {
method: "POST",
headers: { Prefer: "return=minimal" },
body: JSON.stringify({
full_name: body.fullName || null,
email: body.email || null,
referral_code: body.referralCode || null,
module: body.module || "medical_terminology",
event_type: body.eventType || "activity",
score: body.score ?? null,
percentage: body.percentage ?? null,
passed: body.passed ?? null,
study_seconds: body.studySeconds ?? null,
certificate_earned: body.certificateEarned ?? false,
details: body.details || {},
}),
});

if (!insert.ok) {
return json(
{ ok: false, error: "Supabase insert failed.", detail: insert.data },
500
);
}

return json({ ok: true });
} catch (e: any) {
return json({ ok: false, error: e?.message || "Server error." }, 500);
}
}
