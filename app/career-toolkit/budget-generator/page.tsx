"use client";

import { useMemo, useState } from "react";

function toNumber(value: string) {
const parsed = parseFloat(value);
return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
return value.toLocaleString("en-US", {
style: "currency",
currency: "USD",
maximumFractionDigits: 2,
});
}

export default function BudgetGeneratorPage() {
const [monthlyIncome, setMonthlyIncome] = useState("");
const [rentHousing, setRentHousing] = useState("");
const [utilities, setUtilities] = useState("");
const [phoneInternet, setPhoneInternet] = useState("");
const [transportation, setTransportation] = useState("");
const [childcare, setChildcare] = useState("");
const [food, setFood] = useState("");
const [debtPayments, setDebtPayments] = useState("");
const [insurance, setInsurance] = useState("");
const [savings, setSavings] = useState("");
const [schoolTraining, setSchoolTraining] = useState("");
const [otherExpenses, setOtherExpenses] = useState("");
const [notes, setNotes] = useState("");

const incomeTotal = useMemo(() => toNumber(monthlyIncome), [monthlyIncome]);

const expenseItems = useMemo(
() => [
{ label: "Rent / Housing", value: toNumber(rentHousing) },
{ label: "Utilities", value: toNumber(utilities) },
{ label: "Phone / Internet", value: toNumber(phoneInternet) },
{ label: "Transportation", value: toNumber(transportation) },
{ label: "Childcare", value: toNumber(childcare) },
{ label: "Food", value: toNumber(food) },
{ label: "Debt Payments", value: toNumber(debtPayments) },
{ label: "Insurance", value: toNumber(insurance) },
{ label: "Savings", value: toNumber(savings) },
{ label: "School / Training", value: toNumber(schoolTraining) },
{ label: "Other Expenses", value: toNumber(otherExpenses) },
],
[
rentHousing,
utilities,
phoneInternet,
transportation,
childcare,
food,
debtPayments,
insurance,
savings,
schoolTraining,
otherExpenses,
]
);

const totalExpenses = useMemo(
() => expenseItems.reduce((sum, item) => sum + item.value, 0),
[expenseItems]
);

const leftover = useMemo(() => incomeTotal - totalExpenses, [incomeTotal, totalExpenses]);

const budgetHealthMessage = useMemo(() => {
if (incomeTotal <= 0) {
return "Add your monthly income to begin your budget.";
}
if (leftover > 250) {
return "Your budget currently shows extra room each month. That can help with savings, emergencies, or future planning.";
}
if (leftover >= 0 && leftover <= 250) {
return "Your budget is close. You may want to review smaller expenses and keep a close eye on variable spending.";
}
return "Your expenses are currently above your monthly income. Review categories to see where adjustments may be needed.";
}, [incomeTotal, leftover]);

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Budget Generator</h1>
<p style={styles.subtitle}>
Build a simple monthly budget to understand your income, expenses, and what may be left
over each month.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<div style={styles.layout}>
<section style={styles.formCard}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Budget Details</p>
<h2 style={styles.sectionTitle}>Enter your monthly amounts</h2>
</div>

<div style={styles.formGrid}>
<MoneyField
label="Monthly Income"
value={monthlyIncome}
onChange={setMonthlyIncome}
placeholder="0.00"
/>
<MoneyField
label="Rent / Housing"
value={rentHousing}
onChange={setRentHousing}
placeholder="0.00"
/>
<MoneyField
label="Utilities"
value={utilities}
onChange={setUtilities}
placeholder="0.00"
/>
<MoneyField
label="Phone / Internet"
value={phoneInternet}
onChange={setPhoneInternet}
placeholder="0.00"
/>
<MoneyField
label="Transportation"
value={transportation}
onChange={setTransportation}
placeholder="0.00"
/>
<MoneyField
label="Childcare"
value={childcare}
onChange={setChildcare}
placeholder="0.00"
/>
<MoneyField
label="Food"
value={food}
onChange={setFood}
placeholder="0.00"
/>
<MoneyField
label="Debt Payments"
value={debtPayments}
onChange={setDebtPayments}
placeholder="0.00"
/>
<MoneyField
label="Insurance"
value={insurance}
onChange={setInsurance}
placeholder="0.00"
/>
<MoneyField
label="Savings"
value={savings}
onChange={setSavings}
placeholder="0.00"
/>
<MoneyField
label="School / Training"
value={schoolTraining}
onChange={setSchoolTraining}
placeholder="0.00"
/>
<MoneyField
label="Other Expenses"
value={otherExpenses}
onChange={setOtherExpenses}
placeholder="0.00"
/>
</div>

<div style={styles.notesWrap}>
<label style={styles.label}>Notes (optional)</label>
<textarea
value={notes}
onChange={(e) => setNotes(e.target.value)}
placeholder="Add reminders, payment dates, ideas for cost cutting, or anything else you want to track."
style={styles.textarea}
/>
</div>
</section>

<section style={styles.previewCard}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Live Preview</p>
<h2 style={styles.sectionTitle}>Monthly Budget Summary</h2>
</div>

<div style={styles.summaryCard}>
<div style={styles.summaryRow}>
<span style={styles.summaryLabel}>Monthly Income</span>
<span style={styles.summaryValue}>{money(incomeTotal)}</span>
</div>
<div style={styles.summaryRow}>
<span style={styles.summaryLabel}>Total Expenses</span>
<span style={styles.summaryValue}>{money(totalExpenses)}</span>
</div>
<div style={styles.summaryRowStrong}>
<span style={styles.summaryLabelStrong}>Amount Left Over</span>
<span
style={{
...styles.summaryValueStrong,
...(leftover < 0 ? styles.negativeValue : styles.positiveValue),
}}
>
{money(leftover)}
</span>
</div>
</div>

<div style={styles.breakdownCard}>
<p style={styles.breakdownTitle}>Expense Breakdown</p>
<div style={styles.breakdownList}>
{expenseItems.map((item) => (
<div key={item.label} style={styles.breakdownRow}>
<span style={styles.breakdownLabel}>{item.label}</span>
<span style={styles.breakdownValue}>{money(item.value)}</span>
</div>
))}
</div>
</div>

<div style={styles.tipCard}>
<p style={styles.tipTitle}>Budget Note</p>
<p style={styles.tipText}>{budgetHealthMessage}</p>
{notes ? (
<>
<p style={styles.tipTitle}>Your Notes</p>
<p style={styles.tipText}>{notes}</p>
</>
) : null}
</div>
</section>
</div>
</div>
</main>
);
}

function MoneyField({
label,
value,
onChange,
placeholder,
}: {
label: string;
value: string;
onChange: (value: string) => void;
placeholder?: string;
}) {
return (
<div style={styles.fieldWrap}>
<label style={styles.label}>{label}</label>
<input
inputMode="decimal"
value={value}
onChange={(e) => onChange(e.target.value)}
placeholder={placeholder}
style={styles.input}
/>
</div>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top, rgba(59,130,246,0.12) 0%, rgba(5,5,5,1) 34%, rgba(13,13,15,1) 100%)",
color: "#e7e7e7",
padding: "32px 24px 56px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
shell: {
maxWidth: "1360px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "32px",
padding: "32px",
boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
},
kicker: {
margin: "0 0 8px",
color: "#a1a1aa",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
title: {
margin: "0 0 12px",
fontSize: "42px",
lineHeight: 1.08,
letterSpacing: "-0.04em",
fontWeight: 700,
color: "#f5f5f5",
},
subtitle: {
margin: 0,
color: "#d4d4d8",
fontSize: "16px",
lineHeight: 1.75,
maxWidth: "860px",
},
heroButtons: {
display: "flex",
gap: "12px",
marginTop: "18px",
flexWrap: "wrap",
},
linkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.14)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "14px",
},
layout: {
display: "grid",
gridTemplateColumns: "1.05fr 0.95fr",
gap: "20px",
alignItems: "start",
},
formCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
},
previewCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
position: "sticky",
top: "24px",
},
sectionHeader: {
display: "grid",
gap: "6px",
marginBottom: "18px",
},
sectionKicker: {
margin: 0,
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
sectionTitle: {
margin: 0,
fontSize: "30px",
lineHeight: 1.1,
fontWeight: 700,
color: "#f5f5f5",
},
formGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "14px",
},
fieldWrap: {
display: "grid",
gap: "8px",
},
label: {
color: "#d4d4d8",
fontSize: "13px",
fontWeight: 600,
},
input: {
width: "100%",
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
boxSizing: "border-box",
outline: "none",
},
notesWrap: {
marginTop: "18px",
display: "grid",
gap: "8px",
},
textarea: {
width: "100%",
minHeight: "120px",
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
resize: "vertical",
boxSizing: "border-box",
outline: "none",
},
summaryCard: {
background: "#101010",
border: "1px solid #2d2d2d",
borderRadius: "20px",
padding: "18px",
display: "grid",
gap: "12px",
marginBottom: "16px",
},
summaryRow: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "center",
},
summaryRowStrong: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "center",
paddingTop: "10px",
borderTop: "1px solid #2d2d2d",
},
summaryLabel: {
color: "#d4d4d8",
fontSize: "15px",
},
summaryValue: {
color: "#f5f5f5",
fontSize: "15px",
fontWeight: 700,
},
summaryLabelStrong: {
color: "#f5f5f5",
fontSize: "16px",
fontWeight: 700,
},
summaryValueStrong: {
fontSize: "18px",
fontWeight: 700,
},
positiveValue: {
color: "#e5e7eb",
},
negativeValue: {
color: "#fca5a5",
},
breakdownCard: {
background: "#101010",
border: "1px solid #2d2d2d",
borderRadius: "20px",
padding: "18px",
marginBottom: "16px",
},
breakdownTitle: {
margin: "0 0 12px",
color: "#f5f5f5",
fontSize: "18px",
fontWeight: 700,
},
breakdownList: {
display: "grid",
gap: "10px",
},
breakdownRow: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "center",
},
breakdownLabel: {
color: "#d4d4d8",
fontSize: "14px",
},
breakdownValue: {
color: "#f5f5f5",
fontSize: "14px",
fontWeight: 700,
},
tipCard: {
background: "#101010",
border: "1px solid #2d2d2d",
borderRadius: "20px",
padding: "18px",
display: "grid",
gap: "8px",
},
tipTitle: {
margin: 0,
color: "#f5f5f5",
fontSize: "16px",
fontWeight: 700,
},
tipText: {
margin: 0,
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.75,
whiteSpace: "pre-wrap",
},
};
