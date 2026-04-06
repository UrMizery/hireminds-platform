"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function LogOutPage() {
useEffect(() => {
async function runLogout() {
try {
await supabase.auth.signOut();

try {
const keysToRemove: string[] = [];

for (let i = 0; i < window.localStorage.length; i += 1) {
const key = window.localStorage.key(i);
if (key && key.includes("auth-token")) {
keysToRemove.push(key);
}
}

keysToRemove.forEach((key) => window.localStorage.removeItem(key));
} catch (storageError) {
console.error("Local storage clear error:", storageError);
}

try {
window.sessionStorage.clear();
} catch (sessionError) {
console.error("Session storage clear error:", sessionError);
}
} catch (error) {
console.error("Logout error:", error);
} finally {
window.location.replace("/");
}
}

runLogout();
}, []);

return (
<main
style={{
minHeight: "100vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
background: "#000",
color: "#fff",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}}
>
Logging off...
</main>
);
}
