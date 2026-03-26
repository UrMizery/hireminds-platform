"use client";

const groups = [
  {
    title: "Communication Skills",
    skills: [
      "Verbal communication",
      "Written communication",
      "Active listening",
      "Professional email etiquette",
      "Public speaking",
      "Presentation skills",
      "Clear instruction giving",
      "Interpersonal communication",
      "Client communication",
      "Bilingual communication",
    ],
  },
  {
    title: "Work Ethic / Reliability",
    skills: [
      "Dependability",
      "Punctuality",
      "Accountability",
      "Consistency",
      "Follow-through",
      "Time management",
      "Self-motivation",
      "Responsibility",
      "Professionalism",
      "Goal focus",
    ],
  },
  {
    title: "Teamwork / Collaboration",
    skills: [
      "Team collaboration",
      "Cooperation",
      "Peer support",
      "Cross-functional teamwork",
      "Relationship building",
      "Conflict resolution",
      "Adaptability in teams",
      "Respectful communication",
      "Shared accountability",
      "Collaboration under pressure",
    ],
  },
  {
    title: "Problem Solving / Thinking Skills",
    skills: [
      "Problem solving",
      "Critical thinking",
      "Decision making",
      "Troubleshooting",
      "Judgment",
      "Initiative",
      "Resourcefulness",
      "Analytical thinking",
      "Prioritization",
      "Attention to detail",
    ],
  },
  {
    title: "Leadership / Growth",
    skills: [
      "Leadership",
      "Coaching",
      "Mentoring",
      "Training support",
      "Delegation",
      "Taking initiative",
      "Ownership",
      "Motivating others",
      "Adaptability",
      "Willingness to learn",
    ],
  },
  {
    title: "Customer-Facing Soft Skills",
    skills: [
      "Customer service",
      "Empathy",
      "Patience",
      "De-escalation",
      "Service recovery",
      "Positive attitude",
      "Professional presence",
      "Complaint resolution",
      "Relationship management",
      "Client satisfaction focus",
    ],
  },
];

export default function SoftSkillsPage() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.heroCard}>
          <p style={styles.kicker}>Career ToolKit</p>
          <h1 style={styles.title}>Soft Skills</h1>
          <p style={styles.subtitle}>
            Soft skills are personal and professional strengths that help you
            work well with others, communicate clearly, solve problems, and
            present yourself effectively to employers.
          </p>

          <div style={styles.heroButtons}>
            <a href="/career-toolkit" style={styles.linkButton}>
              Back to Career ToolKit
            </a>
          </div>
        </section>

        <section style={styles.jumpCard}>
          <p style={styles.sectionKicker}>Quick Guide</p>
          <div style={styles.jumpGrid}>
            {groups.map((group) => (
              <a
                key={group.title}
                href={`#${group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                style={styles.jumpLink}
              >
                {group.title}
              </a>
            ))}
          </div>
        </section>

        <section style={styles.sectionsWrap}>
          {groups.map((group) => (
            <article
              key={group.title}
              id={group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              style={styles.sectionCard}
            >
              <p style={styles.sectionKicker}>Category</p>
              <h2 style={styles.sectionTitle}>{group.title}</h2>

              <div style={styles.skillGrid}>
                {group.skills.map((skill) => (
                  <div key={skill} style={styles.skillPill}>
                    {skill}
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
    maxWidth: "1320px",
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
    margin: "0 0 16px",
    fontSize: "30px",
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
