"use client";

const sections = [
  {
    id: "healthcare",
    title: "Healthcare / Medical",
    intro:
      "Core skills for direct care, clinical support, documentation, safety, patient interaction, and healthcare operations.",
    groups: [
      {
        role: "LPN / RN",
        skills: [
          "Patient care",
          "Medication administration",
          "Charting and documentation",
          "Care planning",
          "Wound care",
          "Vital signs",
          "Infection control",
          "Patient education",
          "IV therapy",
          "Teamwork with providers",
        ],
      },
      {
        role: "CNA / HHA",
        skills: [
          "Activities of daily living",
          "Bathing and grooming assistance",
          "Mobility and transfer support",
          "Feeding assistance",
          "Toileting support",
          "Vital signs",
          "Observation and reporting",
          "Companionship",
          "Infection prevention",
          "Resident dignity and safety",
        ],
      },
      {
        role: "Medical Assistant",
        skills: [
          "Patient intake",
          "Scheduling",
          "Vital signs",
          "EMR/EHR documentation",
          "Specimen collection",
          "Injections",
          "Exam room prep",
          "Insurance verification",
          "Front desk support",
          "Provider assistance",
        ],
      },
      {
        role: "Medical Coding and Billing",
        skills: [
          "ICD/CPT coding",
          "Claims processing",
          "Insurance follow-up",
          "Denial resolution",
          "Billing accuracy",
          "EMR/EHR systems",
          "Payment posting",
          "Prior authorizations",
          "Documentation review",
          "Compliance and confidentiality",
        ],
      },
      {
        role: "Phlebotomy",
        skills: [
          "Venipuncture",
          "Specimen labeling",
          "Sample handling",
          "Patient identification",
          "Infection control",
          "Bedside manner",
          "Documentation",
          "Safety procedures",
          "Lab coordination",
          "Attention to detail",
        ],
      },
      {
        role: "Pharmacy Tech",
        skills: [
          "Prescription processing",
          "Medication prep",
          "Inventory control",
          "Insurance processing",
          "Customer service",
          "Data entry",
          "Dosage support",
          "Confidentiality",
          "Labeling accuracy",
          "Retail or hospital pharmacy workflow",
        ],
      },
      {
        role: "Optometrist / Eye Care Support",
        skills: [
          "Patient exams",
          "Lens measurement",
          "Charting",
          "Diagnostic equipment use",
          "Patient education",
          "Scheduling",
          "Insurance verification",
          "Contact lens support",
          "Visual acuity testing",
          "Attention to detail",
        ],
      },
      {
        role: "Dental Hygienist / Dental Support",
        skills: [
          "Cleaning support",
          "Patient education",
          "Charting",
          "X-ray support",
          "Sterilization",
          "Periodontal assessment",
          "Infection control",
          "Instrument prep",
          "Scheduling support",
          "Bedside manner",
        ],
      },
      {
        role: "X-Ray Tech",
        skills: [
          "Imaging procedures",
          "Patient positioning",
          "Radiation safety",
          "Equipment operation",
          "Image documentation",
          "Provider collaboration",
          "Patient prep",
          "Anatomy knowledge",
          "Accuracy",
          "Compliance",
        ],
      },
      {
        role: "EMS / Paramedic",
        skills: [
          "Emergency response",
          "Patient assessment",
          "CPR/BLS/ALS",
          "Trauma response",
          "Transport coordination",
          "Documentation",
          "Communication under pressure",
          "Emergency protocol knowledge",
          "Teamwork",
          "Scene safety",
        ],
      },
      {
        role: "Rehab Tech",
        skills: [
          "Patient mobility support",
          "Exercise assistance",
          "Therapy room setup",
          "Observation and reporting",
          "Scheduling support",
          "Sanitizing equipment",
          "Patient encouragement",
          "Teamwork",
          "Safety awareness",
          "Documentation support",
        ],
      },
      {
        role: "Drug and Alcohol Counselor / Tech",
        skills: [
          "Client support",
          "Case notes",
          "Confidentiality",
          "Crisis support",
          "Treatment plan support",
          "Empathy",
          "Group facilitation",
          "Behavioral observation",
          "Community resources",
          "Documentation",
        ],
      },
      {
        role: "Nursing Home Staff",
        skills: [
          "Long-term care support",
          "Resident safety",
          "ADL assistance",
          "Charting",
          "Dementia awareness",
          "Infection control",
          "Family communication",
          "Teamwork",
          "Patience",
          "Compliance",
        ],
      },
      {
        role: "Group Home / Disability Support Staff",
        skills: [
          "Daily living support",
          "Behavior support",
          "Medication reminders",
          "Transportation support",
          "Community integration",
          "Documentation",
          "Crisis de-escalation",
          "Resident dignity",
          "Safety monitoring",
          "Communication",
        ],
      },
    ],
  },
  {
    id: "customer-service",
    title: "Customer Service",
    intro: "Core skills for client-facing, support, and service-focused roles.",
    groups: [
      {
        role: "Customer Service",
        skills: [
          "Conflict resolution",
          "Active listening",
          "De-escalation",
          "CRM systems",
          "Complaint handling",
          "Multitasking",
          "Phone etiquette",
          "Problem solving",
          "Account support",
          "Professionalism",
        ],
      },
    ],
  },
  {
    id: "drivers",
    title: "Drivers",
    intro: "Core skills for commercial, passenger, and delivery driving roles.",
    groups: [
      {
        role: "CDL A / CDL B",
        skills: [
          "DOT compliance",
          "Route planning",
          "Safety inspections",
          "Logbooks and ELD",
          "Cargo securement",
          "Time management",
          "Defensive driving",
          "Customer delivery service",
          "Vehicle checks",
          "On-time delivery",
        ],
      },
      {
        role: "Non-CDL / Delivery",
        skills: [
          "Local routing",
          "Safe driving",
          "Loading and unloading",
          "Customer interaction",
          "Proof of delivery",
          "Schedule adherence",
          "Navigation tools",
          "Vehicle care",
          "Reliability",
          "Time management",
        ],
      },
      {
        role: "Passenger / Limo / Livery / Taxi",
        skills: [
          "Passenger safety",
          "Customer service",
          "Punctuality",
          "Route knowledge",
          "Clean vehicle upkeep",
          "Professional appearance",
          "Defensive driving",
          "Cash and payment handling",
          "Trip documentation",
          "Communication",
        ],
      },
    ],
  },
  {
    id: "warehouse",
    title: "Warehouse",
    intro: "Core skills for shipping, receiving, inventory, and order fulfillment roles.",
    groups: [
      {
        role: "Warehouse",
        skills: [
          "Picking and packing",
          "Shipping and receiving",
          "Inventory control",
          "RF scanner use",
          "Palletizing",
          "Loading and unloading",
          "Order accuracy",
          "Safety compliance",
          "Labeling",
          "Teamwork",
        ],
      },
    ],
  },
  {
    id: "manufacturing",
    title: "Manufacturing",
    intro: "Core skills for production, assembly, inspection, and plant-floor work.",
    groups: [
      {
        role: "Manufacturing",
        skills: [
          "Machine operation",
          "Assembly",
          "Quality inspection",
          "Production line work",
          "Safety procedures",
          "Measuring tools",
          "Troubleshooting",
          "Packaging",
          "Documentation",
          "Efficiency",
        ],
      },
    ],
  },
  {
    id: "hospitality",
    title: "Hospitality",
    intro: "Core skills for guest-facing and service-based hospitality roles.",
    groups: [
      {
        role: "Hospitality",
        skills: [
          "Guest service",
          "Reservations",
          "Front desk support",
          "Housekeeping standards",
          "Event support",
          "Multitasking",
          "Communication",
          "Problem resolution",
          "Professionalism",
          "Teamwork",
        ],
      },
    ],
  },
  {
    id: "aerospace",
    title: "Aerospace",
    intro: "Core skills for precision, inspection, and regulated production work.",
    groups: [
      {
        role: "Aerospace",
        skills: [
          "Precision assembly",
          "Blueprint reading",
          "Quality standards",
          "Safety compliance",
          "Documentation",
          "Mechanical aptitude",
          "Inspection",
          "Tool usage",
          "Production support",
          "Attention to detail",
        ],
      },
    ],
  },
  {
    id: "admin-clerical",
    title: "Admin / Clerical",
    intro: "Core skills for office support, organization, communication, and records handling.",
    groups: [
      {
        role: "Admin / Clerical",
        skills: [
          "Scheduling",
          "Data entry",
          "Document preparation",
          "Calendar management",
          "Filing",
          "Phone support",
          "Email communication",
          "Microsoft Office",
          "Records management",
          "Organization",
        ],
      },
    ],
  },
  {
    id: "retail",
    title: "Retail",
    intro: "Core skills for store, sales floor, and customer-facing retail roles.",
    groups: [
      {
        role: "Retail",
        skills: [
          "POS systems",
          "Cash handling",
          "Customer service",
          "Merchandising",
          "Stocking",
          "Upselling",
          "Returns and exchanges",
          "Store presentation",
          "Teamwork",
          "Inventory support",
        ],
      },
    ],
  },
  {
    id: "food-service",
    title: "Food Service",
    intro: "Core skills for front-of-house, back-of-house, and food prep roles.",
    groups: [
      {
        role: "Food Service",
        skills: [
          "Food prep",
          "Sanitation",
          "Food safety",
          "Cashiering",
          "Order accuracy",
          "Customer service",
          "Kitchen support",
          "Stocking",
          "Teamwork",
          "Speed and efficiency",
        ],
      },
    ],
  },
  {
    id: "logistics",
    title: "Logistics",
    intro: "Core skills for dispatch, coordination, shipment tracking, and transportation support.",
    groups: [
      {
        role: "Logistics",
        skills: [
          "Dispatching",
          "Shipment tracking",
          "Route coordination",
          "Inventory movement",
          "Documentation",
          "Vendor communication",
          "Scheduling",
          "Compliance",
          "Problem solving",
          "Data entry",
        ],
      },
    ],
  },
  {
    id: "it-helpdesk",
    title: "IT / Help Desk",
    intro: "Core skills for troubleshooting, user support, and technical service roles.",
    groups: [
      {
        role: "IT / Help Desk",
        skills: [
          "Ticketing systems",
          "Troubleshooting",
          "Password resets",
          "Hardware and software support",
          "Customer support",
          "Documentation",
          "Remote assistance",
          "System setup",
          "Communication",
          "Problem solving",
        ],
      },
    ],
  },
  {
    id: "maintenance-janitorial",
    title: "Maintenance / Janitorial",
    intro: "Core skills for building upkeep, cleanliness, repair support, and facility safety.",
    groups: [
      {
        role: "Maintenance",
        skills: [
          "Preventive maintenance",
          "Repairs",
          "Troubleshooting",
          "Work orders",
          "Hand and power tools",
          "Safety compliance",
          "Inspections",
          "Building upkeep",
          "Time management",
          "Problem solving",
        ],
      },
      {
        role: "Janitorial",
        skills: [
          "Floor care",
          "Sanitation",
          "Trash removal",
          "Restroom cleaning",
          "Supply restocking",
          "Safety procedures",
          "Attention to detail",
          "Time management",
          "Reliability",
          "Building cleanliness",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    intro: "Core skills for safety, patrol, monitoring, and incident response roles.",
    groups: [
      {
        role: "Security",
        skills: [
          "Surveillance",
          "Incident reporting",
          "Access control",
          "Patrols",
          "De-escalation",
          "Emergency response",
          "Communication",
          "Observation",
          "Professionalism",
          "Policy enforcement",
        ],
      },
    ],
  },
  {
    id: "call-center",
    title: "Call Center",
    intro: "Core skills for high-volume phone-based support and account assistance roles.",
    groups: [
      {
        role: "Call Center",
        skills: [
          "Inbound and outbound calls",
          "CRM systems",
          "Data entry",
          "Script adherence",
          "De-escalation",
          "Active listening",
          "Issue resolution",
          "Multitasking",
          "Call documentation",
          "Customer service",
        ],
      },
    ],
  },
  {
    id: "forklift",
    title: "Forklift",
    intro: "Core skills for powered industrial equipment and warehouse movement roles.",
    groups: [
      {
        role: "Forklift",
        skills: [
          "Forklift operation",
          "Pallet movement",
          "Loading and unloading",
          "Warehouse safety",
          "Inventory movement",
          "Equipment checks",
          "Order staging",
          "Shipping support",
          "Accuracy",
          "Productivity",
        ],
      },
    ],
  },
  {
    id: "mechanic-detailer",
    title: "Mechanic / Auto Shop / Detailer",
    intro: "Core skills for diagnostics, repair, vehicle prep, and detail work.",
    groups: [
      {
        role: "Mechanic",
        skills: [
          "Diagnostics",
          "Preventive maintenance",
          "Brake and suspension repair",
          "Engine repair",
          "Tool usage",
          "Safety compliance",
          "Inspections",
          "Problem solving",
          "Documentation",
          "Customer communication",
        ],
      },
      {
        role: "Car Shop Detailer",
        skills: [
          "Interior detailing",
          "Exterior washing",
          "Buffing and polishing",
          "Vacuuming",
          "Stain removal",
          "Vehicle presentation",
          "Chemical safety",
          "Time management",
          "Attention to detail",
          "Teamwork",
        ],
      },
    ],
  },
];

export default function IndustryCoreSkillsPage() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.heroCard}>
          <p style={styles.kicker}>Career ToolKit</p>
          <h1 style={styles.title}>Industry Core Skills</h1>
          <p style={styles.subtitle}>
            Browse common core skills by industry and role. Use these lists to
            help build your resume, cover letter, interview talking points, and
            job application language.
          </p>

          <div style={styles.heroButtons}>
            <a href="/career-toolkit" style={styles.linkButton}>
              Back to Career ToolKit
            </a>
          </div>
        </section>

        <section style={styles.jumpCard}>
          <p style={styles.sectionKicker}>Jump To</p>
          <div style={styles.jumpGrid}>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} style={styles.jumpLink}>
                {section.title}
              </a>
            ))}
          </div>
        </section>

        <section style={styles.sectionsWrap}>
          {sections.map((section) => (
            <article key={section.id} id={section.id} style={styles.sectionCard}>
              <p style={styles.sectionKicker}>Industry</p>
              <h2 style={styles.sectionTitle}>{section.title}</h2>
              <p style={styles.sectionIntro}>{section.intro}</p>

              <div style={styles.groupWrap}>
                {section.groups.map((group) => (
                  <div key={group.role} style={styles.groupCard}>
                    <h3 style={styles.groupTitle}>{group.role}</h3>
                    <div style={styles.skillGrid}>
                      {group.skills.map((skill) => (
                        <div key={skill} style={styles.skillPill}>
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
    color: "#e7e7e7",
    padding: "32px 24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shell: {
    maxWidth: "1380px",
    margin: "0 auto",
    display: "grid",
    gap: "24px",
  },
  heroCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
  },
  jumpCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
  },
  sectionsWrap: {
    display: "grid",
    gap: "20px",
  },
  sectionCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
    scrollMarginTop: "100px",
  },
  kicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "40px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  subtitle: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "16px",
    lineHeight: 1.7,
    maxWidth: "900px",
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
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
  },
  sectionKicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  jumpGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px",
  },
  jumpLink: {
    textDecoration: "none",
    color: "#f5f5f5",
    background: "#101010",
    border: "1px solid #2f2f2f",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: 600,
  },
  sectionTitle: {
    margin: "0 0 10px",
    fontSize: "30px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  sectionIntro: {
    margin: "0 0 18px",
    color: "#c8c8c8",
    fontSize: "15px",
    lineHeight: 1.7,
  },
  groupWrap: {
    display: "grid",
    gap: "14px",
  },
  groupCard: {
    background: "#101010",
    border: "1px solid #2d2d2d",
    borderRadius: "18px",
    padding: "18px",
  },
  groupTitle: {
    margin: "0 0 14px",
    fontSize: "22px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  skillGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  skillPill: {
    padding: "10px 12px",
    borderRadius: "999px",
    background: "#111827",
    border: "1px solid #374151",
    color: "#f3f4f6",
    fontSize: "14px",
    lineHeight: 1.4,
  },
};
