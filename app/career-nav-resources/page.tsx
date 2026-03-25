"use client";

export default function CareerNavResourcesPage() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.card}>
          <p style={styles.kicker}>Career Nav Resources</p>
          <h1 style={styles.title}>Resources + Services</h1>
          <p style={styles.subtitle}>
            This space includes free career tools, guidance, and premium services that will be expanding over time.
          </p>
        </section>

        <section style={styles.grid}>
          <div style={styles.card}>
            <p style={styles.kicker}>Free Resources</p>
            <h2 style={styles.sectionTitle}>Available Now</h2>

            <div style={styles.item}>
              <h3 style={styles.itemTitle}>Resume Builder</h3>
              <p style={styles.itemText}>
                Build and save your HireMinds resume directly to your profile and public Career Passport.
              </p>
              <a href="/resume-builder" style={styles.linkButton}>
                Open Resume Builder
              </a>
            </div>

            <div style={styles.item}>
              <h3 style={styles.itemTitle}>Career Passport Profile</h3>
              <p style={styles.itemText}>
                Update your private profile, uploads, and public-facing Career Passport information.
              </p>
              <a href="/profile" style={styles.linkButton}>
                Go to My Profile
              </a>
            </div>
          </div>

          <div style={styles.card}>
            <p style={styles.kicker}>Premium Services</p>
            <h2 style={styles.sectionTitle}>Coming / Locked</h2>

            <div style={styles.item}>
              <h3 style={styles.itemTitle}>Schedule 1:1 🔒</h3>
              <p style={styles.itemText}>
                Career coaching, interview prep, live resume revision, and personalized support.
              </p>
            </div>

            <div style={styles.item}>
              <h3 style={styles.itemTitle}>Live Mock Interview 🔒</h3>
              <p style={styles.itemText}>
                Practice interview sessions with live guidance and feedback.
              </p>
            </div>

            <div style={styles.item}>
              <h3 style={styles.itemTitle}>Resume Revision 🔒</h3>
              <p style={styles.itemText}>
                Premium resume support and detailed revision assistance.
              </p>
            </div>
          </div>
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
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  card: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
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
    fontSize: "38px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  subtitle: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "16px",
    lineHeight: 1.7,
  },
  sectionTitle: {
    margin: "0 0 18px",
    fontSize: "28px",
    fontWeight: 500,
    color: "#f5f5f5",
  },
  item: {
    padding: "18px 0",
    borderBottom: "1px solid #2e2e2e",
  },
  itemTitle: {
    margin: "0 0 8px",
    fontSize: "20px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  itemText: {
    margin: "0 0 14px",
    color: "#c8c8c8",
    lineHeight: 1.7,
    fontSize: "15px",
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
};
