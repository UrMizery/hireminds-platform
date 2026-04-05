import { supabase } from "./supabase";

export type UserAccessRole = "guest" | "candidate" | "partner" | "employer" | "admin";

export type PartnerAccessRow = {
id?: string | null;
organization_name?: string | null;
contact_name?: string | null;
contact_title?: string | null;
contact_email?: string | null;
referral_code?: string | null;
account_type?: string | null;
};

export type UserAccessResult = {
isLoggedIn: boolean;
email: string;
userId: string;
role: UserAccessRole;
isPartner: boolean;
isEmployer: boolean;
isAdmin: boolean;
isCandidate: boolean;
partnerRecord: PartnerAccessRow | null;
};

function normalizeRole(rawRole: unknown): UserAccessRole {
const normalizedRole = String(rawRole || "").toLowerCase().trim();

if (normalizedRole === "admin") return "admin";
if (normalizedRole === "partner") return "partner";
if (normalizedRole === "employer") return "employer";
if (
normalizedRole === "candidate" ||
normalizedRole === "career_passport" ||
normalizedRole === "career-passport"
) {
return "candidate";
}

return "guest";
}

export async function getUserAccess(): Promise<UserAccessResult> {
const { data, error } = await supabase.auth.getSession();
const sessionUser = data.session?.user ?? null;

if (error || !sessionUser) {
return {
isLoggedIn: false,
email: "",
userId: "",
role: "guest",
isPartner: false,
isEmployer: false,
isAdmin: false,
isCandidate: false,
partnerRecord: null,
};
}

const email = sessionUser.email || "";
const userId = sessionUser.id || "";

const rawRole =
sessionUser.app_metadata?.role ||
sessionUser.user_metadata?.role ||
sessionUser.user_metadata?.account_type ||
"";

const role = normalizeRole(rawRole);

let partnerRecord: PartnerAccessRow | null = null;
let isPartner = role === "partner";

if (email) {
const { data: partnerRow } = await supabase
.from("partners")
.select(
"id, organization_name, contact_name, contact_title, contact_email, referral_code, account_type"
)
.eq("contact_email", email)
.maybeSingle<PartnerAccessRow>();

if (partnerRow) {
partnerRecord = partnerRow;
isPartner = true;
}
}

return {
isLoggedIn: true,
email,
userId,
role,
isPartner,
isEmployer: role === "employer",
isAdmin: role === "admin",
isCandidate: role === "candidate",
partnerRecord,
};
}
