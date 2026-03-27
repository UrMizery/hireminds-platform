export default function ContactPage() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.heroCard}>
          <p style={styles.kicker}>HireMinds</p>
          <h1 style={styles.title}>Contact Us</h1>
          <p style={styles.subtitle}>
            HireMinds is a product of RicanNECT Direct Staffing.
          </p>

          <div style={styles.heroButtons}>
            <a href="/" style={styles.linkButton}>
              Back Home
            </a>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Contact Information</p>
          <h2 style={styles.sectionTitle}>Get in Touch</h2>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <p style={styles.infoLabel}>Company</p>
              <p style={styles.infoValue}>HireMinds</p>
            </div>

            <div style={styles.infoCard}>
              <p style={styles.infoLabel}>About</p>
              <p style={styles.infoValue}>A product of RicanNECT Direct Staffing</p>
            </div>

            <div style={styles.infoCard}>
              <p style={styles.infoLabel}>Contact Person</p>
              <p style={styles.infoValue}>Ismary Torres Szegedi</p>
            </div>

            <div style={styles.infoCard}>
              <p style={styles.infoLabel}>Phone</p>
              <p style={styles.infoValue}>Text only: 475-777-8835</p>
            </div>

            <div style={styles.infoCard}>
              <p style={styles.infoLabel}>Email</p>
              <a href="mailto:info@hireminds.app" style={styles.emailLink}>
                info@hireminds.app
              </a>
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
    maxWidth: "1100px",
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
  sectionKicker: {
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
  sectionTitle: {
    margin: "0 0 18px",
    fontSize: "30px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  subtitle: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "16px",
    lineHeight: 1.7,
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
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  infoCard: {
    background: "#101010",
    border: "1px solid #2d2d2d",
    borderRadius: "18px",
    padding: "18px",
  },
  infoLabel: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  infoValue: {
    margin: 0,
    color: "#f5f5f5",
    fontSize: "18px",
    lineHeight: 1.6,
    fontWeight: 500,
  },
  emailLink: {
    color: "#f5f5f5",
    fontSize: "18px",
    lineHeight: 1.6,
    fontWeight: 500,
    textDecoration: "underline",
  },
};
