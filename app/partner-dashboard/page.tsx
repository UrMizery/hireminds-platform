"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type PeriodKey = "day" | "week" | "month" | "quarter" | "fiscal";
type RangeMode = "period" | "custom";
type SupportActionType = "task" | "nudge" | "reminder";
type DashboardTab = "overview" | "live" | "history" | "tools" | "support";

type PartnerRow = {
organization_name?: string | null;
contact_name?: string | null;
contact_title?: string | null;
account_holder?: string | null;
title?: string | null;
contact_email?: string | null;
referral_code?: string | null;
account_type?: string | null;
};

type ActivityRow = {
id?: string | null;
user_id?: string | null;
full_name?: string | null;
email?: string | null;
referral_code?: string | null;
event_type?: string | null;
tool_name?: string | null;
page_name?: string | null;
created_at?: string | null;
};

type ParticipantRow = {
id?: string | null;
user_id?: string | null;
full_name?: string | null;
email?: string | null;
phone?: string | null;
referral_code?: string | null;
created_at?: string | null;
};

export default function PartnerDashboardPage() {
const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");
const [partner, setPartner] = useState<PartnerRow | null>(null);
const [participants, setParticipants] = useState<ParticipantRow[]>([]);
const [activity, setActivity] = useState<ActivityRow[]>([]);
const [lastUpdated, setLastUpdated] = useState("");

const mountedRef = useRef(true);

useEffect(() => {
mountedRef.current = true;

loadDashboard();

const interval = setInterval(() => {
loadDashboard({ silent: true });
}, 15000);

return () => {
mountedRef.current = false;
clearInterval(interval);
};
}, []);

async function loadDashboard(options?: { silent?: boolean }) {
const silent = options?.silent ?? false;

if (!silent) {
setLoading(true);
setMessage("");
}

const { data: authData, error: authError } =
await supabase.auth.getUser();

if (authError || !authData.user?.email) {
window.location.href = "/employer-partner-login";
return;
}

const email = authData.user.email;

const { data: partnerRow, error: partnerError } =
await supabase
.from("partners")
.select("*")
.eq("contact_email", email)
.maybeSingle<PartnerRow>();

if (partnerError) {
if (mountedRef.current) {
setMessage(partnerError.message);
if (!silent) setLoading(false);
}
return;
}

if (!partnerRow) {
if (mountedRef.current) {
setMessage("This account does not have dashboard access.");
if (!silent) setLoading(false);
}
return;
}

const isSuperAdmin =
partnerRow?.account_type
?.trim()
?.toLowerCase() === "super_admin";

/* =========================
PARTICIPANTS
========================= */

let participantQuery = supabase
.from("candidate_profiles")
.select(`
id,
user_id,
full_name,
email,
phone,
referral_code,
created_at
`)
.order("created_at", { ascending: false });

if (!isSuperAdmin && partnerRow.referral_code) {
participantQuery = participantQuery.eq(
"referral_code",
partnerRow.referral_code
);
}

const {
data: participantRows,
error: participantError,
} = await participantQuery;

if (participantError) {
if (mountedRef.current) {
setMessage(participantError.message);
if (!silent) setLoading(false);
}
return;
}

/* =========================
ACTIVITY
========================= */

let activityQuery = supabase
.from("user_activity")
.select(`
id,
user_id,
full_name,
email,
referral_code,
event_type,
tool_name,
page_name,
created_at
`)
.order("created_at", { ascending: false })
.limit(5000);

if (!isSuperAdmin && partnerRow.referral_code) {
activityQuery = activityQuery.eq(
"referral_code",
partnerRow.referral_code
);
}

const {
data: activityRows,
error: activityError,
} = await activityQuery;

if (activityError) {
if (mountedRef.current) {
setMessage(activityError.message);
if (!silent) setLoading(false);
}
return;
}

if (!mountedRef.current) return;

setPartner(partnerRow);

setParticipants(
(participantRows as ParticipantRow[]) || []
);

setActivity(
(activityRows as ActivityRow[]) || []
);

setLastUpdated(
new Date().toLocaleTimeString()
);

if (!silent) {
setLoading(false);
}
}

if (loading) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>
Loading dashboard...
</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.container}>

<h1 style={styles.title}>
{partner?.organization_name || "Partner Dashboard"}
</h1>

<p style={styles.subtitle}>
Referral Code: {partner?.referral_code || "—"}
</p>

<p style={styles.subtitle}>
Account Type: {partner?.account_type || "—"}
</p>

<p style={styles.subtitle}>
Last Updated: {lastUpdated || "—"}
</p>

{message ? (
<div style={styles.notice}>
{message}
</div>
) : null}

<section style={styles.card}>
<h2 style={styles.sectionTitle}>
Participants ({participants.length})
</h2>

<div style={styles.tableWrap}>
<table style={styles.table}>
<thead>
<tr>
<th style={styles.th}>Name</th>
<th style={styles.th}>Email</th>
<th style={styles.th}>Phone</th>
<th style={styles.th}>Referral Code</th>
<th style={styles.th}>Created</th>
</tr>
</thead>

<tbody>
{participants.map((row, index) => (
<tr key={row.id || index}>
<td style={styles.td}>
{row.full_name || "—"}
</td>

<td style={styles.td}>
{row.email || "—"}
</td>

<td style={styles.td}>
{row.phone || "—"}
</td>

<td style={styles.td}>
{row.referral_code || "—"}
</td>

<td style={styles.td}>
{row.created_at || "—"}
</td>
</tr>
))}
</tbody>
</table>
</div>
</section>

<section style={styles.card}>
<h2 style={styles.sectionTitle}>
Activity Feed ({activity.length})
</h2>

<div style={styles.tableWrap}>
<table style={styles.table}>
<thead>
<tr>
<th style={styles.th}>Date</th>
<th style={styles.th}>Participant</th>
<th style={styles.th}>Email</th>
<th style={styles.th}>Referral Code</th>
<th style={styles.th}>Tool</th>
<th style={styles.th}>Event</th>
<th style={styles.th}>Page</th>
</tr>
</thead>

<tbody>
{activity.map((row, index) => (
<tr key={row.id || index}>
<td style={styles.td}>
{row.created_at || "—"}
</td>

<td style={styles.td}>
{row.full_name || "—"}
</td>

<td style={styles.td}>
{row.email || "—"}
</td>

<td style={styles.td}>
{row.referral_code || "—"}
</td>

<td style={styles.td}>
{row.tool_name || "—"}
</td>

<td style={styles.td}>
{row.event_type || "—"}
</td>

<td style={styles.td}>
{row.page_name || "—"}
</td>
</tr>
))}
</tbody>
</table>
</div>
</section>

</div>
</main>
);
}

const styles: Record<string, CSSProperties> = {
page: {
minHeight: "100vh",
background: "#0a0a0a",
padding: "32px",
color: "#ffffff",
fontFamily: "Inter, sans-serif",
},

centerWrap: {
display: "flex",
alignItems: "center",
justifyContent: "center",
minHeight: "100vh",
fontSize: "20px",
},

container: {
maxWidth: "1400px",
margin: "0 auto",
display: "grid",
gap: "24px",
},

title: {
fontSize: "42px",
fontWeight: 700,
margin: 0,
},

subtitle: {
margin: 0,
color: "#cbd5e1",
},

notice: {
padding: "14px",
borderRadius: "14px",
background: "#7f1d1d",
color: "#fecaca",
},

card: {
background: "#111111",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},

sectionTitle: {
margin: "0 0 18px",
fontSize: "26px",
fontWeight: 700,
},

tableWrap: {
overflowX: "auto",
borderRadius: "18px",
border: "1px solid #262626",
},

table: {
width: "100%",
borderCollapse: "collapse",
},

th: {
padding: "14px",
background: "#171717",
borderBottom: "1px solid #262626",
textAlign: "left",
fontSize: "14px",
},

td: {
padding: "14px",
borderBottom: "1px solid #262626",
fontSize: "14px",
},
};
