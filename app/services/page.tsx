export default function ServicesPage() {
  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <section style={styles.hero}>
          <p style={styles.kicker}>HIREMINDS</p>
          <h1 style={styles.title}>Services & Pricing</h1>
          <p style={styles.subtitle}>
            Choose the level of support that fits your goals. Start with a free
            resume, upgrade for advanced tools, or purchase individual services
            as needed.
          </p>
        </section>

        <section style={styles.grid}>
          <div style={styles.card}>
            <p style={styles.planLabel}>Free Resume</p>
            <p style={styles.price}>$0</p>
            <ul style={styles.list}>
              <li>1 page resume</li>
              <li>Up to 4 bullets per role</li>
              <li>Save free version</li>
              <li>Print free version</li>
              <li>1 complimentary mock interview, 30 min</li>
              <li>Choose AI or live for the included mock interview</li>
            </ul>
          </div>

          <div style={styles.card}>
            <p style={styles.planLabel}>Premium Resume</p>
            <p style={styles.price}>Starting at $19.99</p>
            <ul style={styles.list}>
              <li>Everything in Free Resume</li>
              <li>2 page resume</li>
              <li>Up to 6 bullets per role</li>
              <li>2 employer verifications included</li>
              <li>1 mock interview included, 30 min</li>
              <li>Choose AI or live for the included mock interview</li>
            </ul>
          </div>

          <div style={styles.card}>
            <p style={styles.planLabel}>Premium Plus / Pro</p>
            <p style={styles.price}>Starting at $39.99</p>
            <ul style={styles.list}>
              <li>Everything in Premium Resume</li>
              <li>CV builder</li>
              <li>Up to 4 employer verifications included</li>
              <li>AI mock interview included</li>
              <li>AI CV revision included</li>
              <li>Premium workflow and advanced support</li>
            </ul>
          </div>
        </section>

        <section style={styles.servicesSection}>
          <div style={styles.servicesCard}>
            <p style={styles.sectionLabel}>Individual Services</p>
            <h2 style={styles.sectionTitle}>Additional Services</h2>

            <div style={styles.serviceGrid}>
              <div style={styles.serviceItem}>
                <p style={styles.serviceName}>1 Employer Verification</p>
                <p style={styles.servicePrice}>$9.99 each</p>
              </div>

              <div style={styles.serviceItem}>
                <p style={styles.serviceName}>AI Mock Interview</p>
                <p style={styles.servicePrice}>$12.99</p>
              </div>

              <div style={styles.serviceItem}>
                <p style={styles.serviceName}>Live Mock Interview</p>
                <p style={styles.servicePrice}>$29.99 / 45 min</p>
              </div>

              <div style={styles.serviceItem}>
                <p style={styles.serviceName}>AI Resume Revision</p>
                <p style={styles.servicePrice}>$14.99</p>
              </div>

              <div style={styles.serviceItem}>
                <p style={styles.serviceName}>Live Resume Revision</p>
                <p style={styles.servicePrice}>$29.99</p>
              </div>

              <div style={styles.serviceItem}>
                <p style={styles.serviceName}>AI CV Revision</p>
                <p style={styles.servicePrice}>$39.99</p>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.noticeWrap}>
          <div style={styles.noticeCard}>
            <p style={styles.noticeTitle}>Important</p>
            <p style={styles.noticeText}>
              Premium features can be explored before checkout, but premium
              downloads, premium saves, and premium-only tools require payment
              before access is granted.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.04), transparent 22%), linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
    color: "#e7e7e7",
    padding: "36px 24px 48px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  wrapper: {
    maxWidth: "1380px",
    margin: "0 auto",
  },
  hero: {
    marginBottom: "28px",
  },
  kicker: {
    margin: "0 0 10px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "48px",
    lineHeight: 1.02,
    fontWeight: 500,
    letterSpacing: "-0.04em",
    color: "#f5f5f5",
  },
  subtitle: {
    margin: 0,
    color: "#b3b3b3",
    fontSize: "16px",
    lineHeight: 1.8,
    maxWidth: "760px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  card: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },
  planLabel: {
    margin: "0 0 10px",
    color: "#f5f5f5",
    fontSize: "20px",
    fontWeight: 700,
  },
  price: {
    margin: "0 0 18px",
    color: "#cbd5e1",
    fontSize: "18px",
    fontWeight: 700,
  },
  list: {
    margin: 0,
    paddingLeft: "18px",
    color: "#d1d5db",
    lineHeight: 1.9,
  },
  servicesSection: {
    marginBottom: "24px",
  },
  servicesCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },
  sectionLabel: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: "0 0 18px",
    color: "#f5f5f5",
    fontSize: "30px",
    fontWeight: 500,
    letterSpacing: "-0.03em",
  },
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  serviceItem: {
    background: "#0f172a",
    border: "1px solid #273244",
    borderRadius: "18px",
    padding: "18px",
  },
  serviceName: {
    margin: "0 0 8px",
    color: "#f3f4f6",
    fontWeight: 700,
    fontSize: "16px",
  },
  servicePrice: {
    margin: 0,
    color: "#93c5fd",
    fontWeight: 700,
    fontSize: "15px",
  },
  noticeWrap: {
    marginTop: "8px",
  },
  noticeCard: {
    background: "#101010",
    border: "1px solid #2a2a2a",
    borderRadius: "20px",
    padding: "18px 20px",
  },
  noticeTitle: {
    margin: "0 0 8px",
    color: "#f3f4f6",
    fontWeight: 700,
    fontSize: "14px",
  },
  noticeText: {
    margin: 0,
    color: "#bdbdbd",
    lineHeight: 1.8,
    fontSize: "14px",
  },
};
