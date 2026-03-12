export default function HomePage() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.kicker}>HIREMINDS</p>
        <h1 style={styles.title}>Build Your Career Passport</h1>
        <p style={styles.subtitle}>
          Get prepared, get verified, and get hired. HireMinds helps candidates
          showcase their readiness beyond a traditional resume.
        </p>

        <div style={styles.buttonRow}>
          <a href="/sign-up" style={styles.primaryButton}>
            Create Career Passport / Sign Up
          </a>
        </div>
      </section>

      <section style={styles.featureGrid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Who is HireMinds?</h2>
          <p style={styles.cardText}>
            HireMinds is a workforce platform built to help candidates showcase
            their skills, readiness, and professional identity in a stronger way.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>What We Do</h2>
          <p style={styles.cardText}>
            We combine Career Passports, resumes, verification options, mock
            interviews, and career support services into one platform.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>What Comes Next</h2>
          <p style={styles.cardText}>
            Create your Career Passport, complete your profile, build your resume,
            and unlock support services as needed.
          </p>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)",
    color: "#f5f5f5",
    padding: "56px 24px 72px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  hero: {
    maxWidth: "1100px",
    margin: "0 auto 40px",
    textAlign: "center",
    padding: "48px 24px",
    background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
    border: "1px solid #232323",
    borderRadius: "28px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },
  kicker: {
    margin: "0 0 14px",
    color: "#a3a3a3",
    fontSize: "12px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 16px",
    fontSize: "56px",
    lineHeight: 1.02,
    fontWeight: 500,
    letterSpacing: "-0.04em",
    color: "#f5f5f5",
  },
  subtitle: {
    maxWidth: "820px",
    margin: "0 auto",
    color: "#c4c4c4",
    fontSize: "18px",
    lineHeight: 1.8,
  },
  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "28px",
  },
  primaryButton: {
    display: "inline-block",
    padding: "15px 20px",
    borderRadius: "18px",
    textDecoration: "none",
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontWeight: 700,
  },
  featureGrid: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "18px",
  },
  card: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },
  cardTitle: {
    margin: "0 0 10px",
    color: "#f5f5f5",
    fontSize: "24px",
    fontWeight: 600,
  },
  cardText: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "15px",
    lineHeight: 1.8,
  },
};
