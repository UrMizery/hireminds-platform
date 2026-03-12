export default function ServicesPage() {
  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <section style={styles.hero}>
          <div style={styles.heroBadge}>HIREMINDS SERVICES</div>
          <h1 style={styles.title}>Services, plans, and add-ons.</h1>
          <p style={styles.subtitle}>
            Build your resume, upgrade your Career Passport, and choose the level
            of interview, revision, and verification support that fits your goals.
          </p>
        </section>

        <section style={styles.planGrid}>
          <div style={styles.planCard}>
            <div style={styles.planTop}>
              <p style={styles.planLabel}>Free Resume</p>
              <p style={styles.planPrice}>$0</p>
            </div>

            <p style={styles.planSummary}>
              A strong starting point for candidates who want a polished one-page resume.
            </p>

            <ul style={styles.list}>
              <li>1 page resume</li>
              <li>Up to 4 bullets per role</li>
              <li>Save free version</li>
              <li>Print free version</li>
              <li>1 complimentary mock interview, 30 min</li>
              <li>Choose AI or live for the included mock interview</li>
            </ul>
          </div>

          <div style={styles.planCardFeatured}>
            <div style={styles.popularTag}>Most Popular</div>

            <div style={styles.planTop}>
              <p style={styles.planLabel}>Premium Resume</p>
              <p style={styles.planPrice}>Starting at $19.99</p>
            </div>

            <p style={styles.planSummary}>
              For candidates who want expanded resume support and included verification.
            </p>

            <ul style={styles.list}>
              <li>Everything in Free Resume</li>
              <li>2 page resume</li>
              <li>Up to 6 bullets per role</li>
              <li>2 employer verifications included</li>
              <li>1 mock interview included, 30 min</li>
              <li>Choose AI or live for the included mock interview</li>
            </ul>
          </div>

          <div style={styles.planCard}>
            <div style={styles.planTop}>
              <p style={styles.planLabel}>Premium Plus / Pro</p>
              <p style={styles.planPrice}>Starting at $39.99</p>
            </div>

            <p style={styles.planSummary}>
              Best for candidates who want stronger visibility, AI tools, and more included support.
            </p>

            <ul style={styles.list}>
              <li>Everything in Premium Resume</li>
              <li>CV builder</li>
              <li>Up to 4 employer verifications included</li>
              <li>AI mock interview included</li>
              <li>AI CV revision included</li>
              <li>Advanced workflow and support</li>
            </ul>
          </div>
        </section>

        <section style={styles.sectionWrap}>
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div>
                <p style={styles.sectionKicker}>Additional Services</p>
                <h2 style={styles.sectionTitle}>Interview + revision support</h2>
              </div>
              <p style={styles.sectionNote}>
                Purchase individually or pair with a plan.
              </p>
            </div>

            <div style={styles.serviceGrid}>
              <div style={styles.serviceCard}>
                <p style={styles.serviceName}>AI Mock Interview</p>
                <p style={styles.servicePrice}>$12.99</p>
                <p style={styles.serviceText}>
                  Practice interview questions with AI-guided feedback.
                </p>
              </div>

              <div style={styles.serviceCard}>
                <p style={styles.serviceName}>Live Mock Interview</p>
                <p style={styles.servicePrice}>$29.99 / 45 min</p>
                <p style={styles.serviceText}>
                  Real-time practice session with guided coaching and feedback.
                </p>
              </div>

              <div style={styles.serviceCard}>
                <p style={styles.serviceName}>AI Resume Revision</p>
                <p style={styles.servicePrice}>$14.99</p>
                <p style={styles.serviceText}>
                  Improve wording, clarity, structure, and bullet strength.
                </p>
              </div>

              <div style={styles.serviceCard}>
                <p style={styles.serviceName}>Live Resume Revision</p>
                <p style={styles.servicePrice}>$29.99</p>
                <p style={styles.serviceText}>
                  Work directly with a live reviewer to improve your resume.
                </p>
              </div>

              <div style={styles.serviceCard}>
                <p style={styles.serviceName}>AI CV Revision</p>
                <p style={styles.servicePrice}>$39.99</p>
                <p style={styles.serviceText}>
                  Expand and revise your CV with AI-assisted content refinement.
                </p>
              </div>

              <div style={styles.serviceCard}>
                <p style={styles.serviceName}>Live Career Strategy Session</p>
                <p style={styles.servicePrice}>$39.99 / 45 min</p>
                <p style={styles.serviceText}>
                  Discuss resume direction, job search strategy, and next steps.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.sectionWrap}>
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div>
                <p style={styles.sectionKicker}>Verification Services</p>
                <h2 style={styles.sectionTitle}>Employer verification options</h2>
              </div>
              <p style={styles.sectionNote}>
                Available individually or included with qualifying plans.
              </p>
            </div>

            <div style={styles.verificationGrid}>
              <div style={styles.verificationCard}>
                <p style={styles.serviceName}>1 Employer Verification</p>
                <p style={styles.servicePrice}>$9.99 each</p>
                <p style={styles.serviceText}>
                  Request one employer verification for your Career Passport.
                </p>
              </div>

              <div style={styles.verificationCardFeatured}>
                <p style={styles.bundleTag}>Best Value</p>
                <p style={styles.serviceName}>Employer Verification Package (3)</p>
                <p style={styles.servicePrice}>$24.99</p>
                <p style={styles.serviceText}>
                  Save more when purchasing a 3-verification bundle.
                </p>
              </div>

              <div style={styles.verificationCard}>
                <p style={styles.serviceName}>Priority Verification Review</p>
                <p style={styles.servicePrice}>$14.99</p>
                <p style={styles.serviceText}>
                  Prioritized review and follow-up for faster processing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.sectionWrap}>
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div>
                <p style={styles.sectionKicker}>Career Passport Enhancements</p>
                <h2 style={styles.sectionTitle}>Profile-focused upgrades</h2>
              </div>
              <p style={styles.sectionNote}>
                Strengthen your profile presentation and professional visibility.
              </p>
            </div>

            <div style={styles.serviceGrid}>
              <div style={styles.serviceCard}>
                <p style={styles.serviceName}>Career Passport Profile Refresh</p>
                <p style={styles.servicePrice}>$19.99</p>
                <p style={styles.serviceText}>
                  Improve your profile bio, layout, and overall presentation.
                </p>
              </div>

              <div style={styles.serviceCard}>
                <p style={styles.serviceName}>Intro Video Review</p>
                <p style={styles.servicePrice}>$14.99</p>
                <p style={styles.serviceText}>
                  Feedback on clarity, confidence, structure, and messaging.
                </p>
              </div>

              <div style={styles.serviceCard}>
                <p style={styles.serviceName}>LinkedIn Profile Guidance</p>
                <p style={styles.servicePrice}>$24.99</p>
                <p style={styles.serviceText}>
                  Align your LinkedIn presence with your resume and passport.
                </p>
              </div>

              <div style={styles.serviceCard}>
                <p style={styles.serviceName}>Job Search Strategy Mini Session</p>
                <p style={styles.servicePrice}>$19.99</p>
                <p style={styles.serviceText}>
                  Focused support on next moves, positioning, and job targeting.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.noticeWrap}>
          <div style={styles.noticeCard}>
            <p style={styles.noticeTitle}>Important</p>
            <p style={styles.noticeText}>
              Premium features can be explored before checkout, but premium saves,
              premium downloads, included verification quantities, and premium-only
              tools require payment before access is granted.
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
      "radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)",
    color: "#e7e7e7",
    padding: "40px 24px 56px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  wrapper: {
    maxWidth: "1420px",
    margin: "0 auto",
  },
  hero: {
    marginBottom: "30px",
  },
  heroBadge: {
    display: "inline-block",
    marginBottom: "14px",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid #2a2a2a",
    background: "rgba(255,255,255,0.03)",
    color: "#b9b9b9",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "52px",
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
    maxWidth: "820px",
  },
  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  planCard: {
    background: "linear-gradient(180deg, #141414 0%, #191919 100%)",
    border: "1px solid #262626",
    borderRadius: "26px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },
  planCardFeatured: {
    background: "linear-gradient(180deg, #111827 0%, #172033 100%)",
    border: "1px solid #2d3b57",
    borderRadius: "26px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
    position: "relative",
  },
  popularTag: {
    position: "absolute",
    top: "16px",
    right: "16px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(147,197,253,0.12)",
    border: "1px solid rgba(147,197,253,0.25)",
    color: "#bfdbfe",
    fontSize: "12px",
    fontWeight: 700,
  },
  planTop: {
    marginBottom: "14px",
  },
  planLabel: {
    margin: "0 0 8px",
    color: "#f5f5f5",
    fontSize: "21px",
    fontWeight: 700,
  },
  planPrice: {
    margin: 0,
    color: "#dbeafe",
    fontSize: "18px",
    fontWeight: 700,
  },
  planSummary: {
    margin: "0 0 16px",
    color: "#c8c8c8",
    lineHeight: 1.7,
    fontSize: "14px",
  },
  list: {
    margin: 0,
    paddingLeft: "18px",
    color: "#d1d5db",
    lineHeight: 1.9,
  },
  sectionWrap: {
    marginBottom: "24px",
  },
  sectionCard: {
    background: "linear-gradient(180deg, #131313 0%, #181818 100%)",
    border: "1px solid #252525",
    borderRadius: "26px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "end",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  sectionKicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: 0,
    color: "#f5f5f5",
    fontSize: "32px",
    fontWeight: 500,
    letterSpacing: "-0.03em",
  },
  sectionNote: {
    margin: 0,
    color: "#9ca3af",
    fontSize: "14px",
  },
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  serviceCard: {
    background: "#0f172a",
    border: "1px solid #273244",
    borderRadius: "20px",
    padding: "18px",
  },
  serviceName: {
    margin: "0 0 8px",
    color: "#f3f4f6",
    fontWeight: 700,
    fontSize: "16px",
  },
  servicePrice: {
    margin: "0 0 10px",
    color: "#93c5fd",
    fontWeight: 700,
    fontSize: "15px",
  },
  serviceText: {
    margin: 0,
    color: "#d1d5db",
    lineHeight: 1.7,
    fontSize: "14px",
  },
  verificationGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "14px",
  },
  verificationCard: {
    background: "#101820",
    border: "1px solid #293445",
    borderRadius: "20px",
    padding: "18px",
  },
  verificationCardFeatured: {
    background: "linear-gradient(180deg, #111827 0%, #1e293b 100%)",
    border: "1px solid #3b82f6",
    borderRadius: "20px",
    padding: "18px",
    position: "relative",
    boxShadow: "0 0 0 1px rgba(59,130,246,0.15) inset",
  },
  bundleTag: {
    display: "inline-block",
    marginBottom: "10px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.24)",
    color: "#bfdbfe",
    fontSize: "12px",
    fontWeight: 700,
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
