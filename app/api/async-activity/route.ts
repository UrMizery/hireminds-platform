import { NextResponse } from "next/server";

export async function POST(req: Request) {
try {
const body = await req.json();

const supabaseUrl =
process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
return NextResponse.json(
{ error: "Missing Supabase environment variables." },
{ status: 500 }
);
}

const res = await fetch(`${supabaseUrl}/rest/v1/async_activity`, {
method: "POST",
headers: {
apikey: serviceKey,
Authorization: `Bearer ${serviceKey}`,
"Content-Type": "application/json",
Prefer: "return=minimal",
},
body: JSON.stringify({
user_id: body.userId || null,
full_name: body.fullName || null,
email: body.email || null,
referral_code: body.referralCode || null,
module: body.module,
activity_type: body.activityType,
seconds_spent: body.secondsSpent || 0,
}),
});

if (!res.ok) {
const errorText = await res.text();
return NextResponse.json(
{ error: "Supabase insert failed", detail: errorText },
{ status: 500 }
);
}

return NextResponse.json({ success: true });
} catch (error: any) {
return NextResponse.json(
{ error: error?.message || "Server error" },
{ status: 500 }
);
}
}
