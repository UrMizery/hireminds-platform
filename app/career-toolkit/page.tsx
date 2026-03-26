"use client";

export default function CareertoolKit() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.card}>
          <p style={styles.kicker}>Career ToolKit</p>
          <h1 style={styles.title}>Career ToolKit</h1>
          <p style={styles.subtitle}>
            This space includes free career tools, guidance, and premium services that will be expanding over time.
          </p>
        </section>

       <div style={styles.item}>
  <h3 style={styles.itemTitle}>HireMinds Community Feed</h3>
  <p style={styles.itemText}>
    A live community space for announcements, opportunities, questions, helpful advice, and positive support for job seekers.
  </p>
  <a href="/career-toolkit/community-feed" style={styles.linkButton}>
    Open Community Feed
  </a>
</div>

        <section style={styles.grid}>
          <div style={styles.card}>
            <p style={styles.kicker}>Free Resources</p>
            <h2 style={styles.sectionTitle}>Available Now</h2>

           <div style={styles.item}>
  <h3 style={styles.itemTitle}>Cover Letter Generator</h3>
  <p style={styles.itemText}>
    Create a short, professional cover letter using a guided template with suggestions, live preview, and print/save options.
  </p>
  <a href="/cover-letter-generator" style={styles.linkButton}>
    Open Cover Letter Generator
  </a>
</div>

 <div style={styles.item}>
  <h3 style={styles.itemTitle}>Soft Skills</h3>
  <p style={styles.itemText}>
    Review common soft skills employers look for, including communication, teamwork, adaptability, time management, and problem solving.
  </p>
  <a href="/career-toolkit/soft-skills" style={styles.linkButton}>
    Open Soft Skills
  </a>
</div>

<div style={styles.item}>
  <h3 style={styles.itemTitle}>Industry Core Skills</h3>
  <p style={styles.itemText}>
    Explore core skills by industry, including administrative, customer service, warehouse, manufacturing, healthcare support, recruiting, retail, and hospitality.
  </p>
  <a href="/career-toolkit/industry-core-skills" style={styles.linkButton}>
    Open Industry Core Skills
  </a>
</div>

<div style={styles.item}>
  <h3 style={styles.itemTitle}>Resume Type Helper</h3>
  <p style={styles.itemText}>
    Learn the difference between chronological, functional, combination, and hybrid resumes, and answer a few questions to help decide which format fits you best.
  </p>
  <a href="/career-toolkit/resume-type-helper" style={styles.linkButton}>
    Open Resume Type Helper
  </a>
</div>

<div style={styles.item}>
  <h3 style={styles.itemTitle}>Interview Questions</h3>
  <p style={styles.itemText}>
    Review common interview questions, learn how to answer them, and get tips on why researching the company helps you stand out.
  </p>
  <a href="/career-toolkit/interview-questions" style={styles.linkButton}>
    Open Interview Questions
  </a>
</div>

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
            <h2 style={styles.sectionTitle}>Coming Soon / Locked</h2>

            <div style={styles.item}>
              <h3 style={styles.itemTitle}>Schedule 1:1 🔒</h3>
              <p style={styles.itemText}>
                Career coaching, interview prep and personalized support.
              </p>
            </div>

            <div style={styles.item}>
  <h3 style={styles.itemTitle}>Employer Verification 🔒</h3>
  <p style={styles.itemText}>
    Employer-confirmed work history verification will be available here as a premium add-on.
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
