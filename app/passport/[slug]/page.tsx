import { supabase } from "../../lib/supabase";

type PassportPageProps = {
  params: {
    slug: string;
  };
};

type VerificationStatus = "pending" | "verified" | "declined" | "expired";

function getStatusStyles(status: VerificationStatus) {
  switch (status) {
    case "verified":
      return {
        background: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(34,197,94,0.35)",
        color: "#86efac",
        label: "Verified",
      };
    case "pending":
      return {
        background: "rgba(250,204,21,0.12)",
        border: "1px solid rgba(250,204,21,0.35)",
        color: "#fde68a",
        label: "Pending",
      };
    case "declined":
      return {
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.35)",
        color: "#fca5a5",
        label: "Declined",
      };
    case "expired":
    default:
      return {
        background: "rgba(148,163,184,0.12)",
        border: "1px solid rgba(148,163,184,0.35)",
        color: "#cbd5e1",
        label: "Expired",
      };
  }
}

function scoreTone(score: number) {
  if (score >= 85) return "#86efac";
  if (score >= 70) return "#fde68a";
  return "#fca5a5";
}

export default async function PassportPublicPage({ params }: PassportPageProps) {
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("passport_slug", params.slug)
    .maybeSingle();

  const fullName = profile?.full_name || "Candidate Name";
  const headline = profile?.headline || "Professional Headline";
  const cityState =
    [profile?.city, profile?.state].filter(Boolean).join(", ") || "Location not provided";
  const bio =
    profile?.bio ||
    "This candidate has not added a public bio yet. Their Career Passport will display profile information, readiness indicators, verification, and resume details for employers.";
  const photoUrl = profile?.photo_url || "";
  const introVideoUrl = profile?.intro_video_url || "";
  const { data: latestResume } = profile?.id
  ? await supabase
      .from("resumes")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  : { data: null };

const resumeUrl = profile?.resume_url || "";
const hasResume = Boolean(resumeUrl || latestResume);
const resumeSummary = latestResume?.summary_text || "";
const resumeHeading = latestResume?.summary_heading || "Resume Summary";
const resumeSkills = Array.isArray(latestResume?.skills) ? latestResume.skills : [];
const resumeAccomplishments = latestResume?.accomplishments || "";
  const linkedinUrl = profile?.linkedin_url || "";

  // Placeholder / starter values until verification + scorecard tables are wired
  const verificationItems: Array<{
    company: string;
    role: string;
    dates: string;
    status: VerificationStatus;
  }> = [
    {
      company: "Most recent employer",
      role: "Pending verification",
      dates: "Dates to be confirmed",
      status: "pending",
    },
    {
      company: "Previous employer",
      role: "Awaiting response",
      dates: "Dates to be confirmed",
      status: "pending",
    },
  ];

  const scorecards = [
    { label: "Profile Completion", score: 84 },
    { label: "Resume Readiness", score: 81 },
    { label: "Interview Readiness", score: 76 },
    { label: "Verification Progress", score: 52 },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            {photoUrl ? (
              <img src={photoUrl} alt={fullName} style={styles.photo} />
            ) : (
              <div style={styles.photoPlaceholder}>No Photo</div>
            )}
          </div>

          <div style={styles.heroRight}>
            <p style={styles.kicker}>Career Passport</p>
            <h1 style={styles.name}>{fullName}</h1>
            <p style={styles.headline}>{headline}</p>
            <p style={styles.meta}>{cityState}</p>

            <div style={styles.linkRow}>
              {linkedinUrl ? (
                <a href={linkedinUrl} style={styles.primaryGhost}>
                  LinkedIn
                </a>
              ) : null}

           {hasResume ? (
  <a href="#saved-resume" style={styles.primaryButton}>
    View Resume
  </a>
) : (
  <span style={styles.disabledButton}>Resume Not Uploaded</span>
)}

              {introVideoUrl ? (
                <a href={introVideoUrl} style={styles.secondaryButton}>
                  Watch Intro Video
                </a>
              ) : (
                <span style={styles.disabledButton}>No Intro Video</span>
              )}
            </div>

            <div style={styles.notice}>
              This public Career Passport is designed for employers and partners to
              review candidate readiness, profile details, and verification status.
            </div>
          </div>
        </section>

        <div style={styles.card}>
<div style={styles.card}>
  <p style={styles.sectionKicker}>About</p>
  <h2 style={styles.sectionTitle}>Professional Summary</h2>
  <p style={styles.bodyText}>{bio}</p>
</div>
            {hasResume ? (
  <div id="saved-resume" style={styles.card}>
    <p style={styles.sectionKicker}>Resume</p>
    <h2 style={styles.sectionTitle}>Saved Resume Snapshot</h2>

    {resumeSummary ? (
      <>
        <p style={styles.helperText}>{resumeHeading}</p>
        <p style={styles.bodyText}>{resumeSummary}</p>
      </>
    ) : null}

    {resumeSkills.length ? (
      <>
        <p style={styles.helperText}>Skills</p>
        <div style={styles.list}>
          {resumeSkills.map((skill: string, index: number) => (
            <li key={index}>{skill}</li>
          ))}
        </div>
      </>
    ) : null}

    {resumeAccomplishments ? (
      <>
        <p style={styles.helperText}>Accomplishments</p>
        <p style={styles.bodyText}>{resumeAccomplishments}</p>
      </>
    ) : null}

    {resumeUrl ? (
      <a href={resumeUrl} style={styles.primaryButton}>
        Open Uploaded Resume
      </a>
    ) : null}
  </div>
) : null}

            <div style={styles.card}>
              <p style={styles.sectionKicker}>Verification</p>
              <h2 style={styles.sectionTitle}>Employment Verification</h2>
              <p style={styles.helperText}>
                Verified experience should eventually display here with employer-confirmed
                title, dates, and verification badges.
              </p>

              <div style={styles.verificationList}>
                {verificationItems.map((item, index) => {
                  const badge = getStatusStyles(item.status);
                  return (
                    <div key={index} style={styles.verificationCard}>
                      <div style={styles.verificationTop}>
                        <div>
                          <p style={styles.verificationCompany}>{item.company}</p>
                          <p style={styles.verificationRole}>{item.role}</p>
                          <p style={styles.verificationDates}>{item.dates}</p>
                        </div>

                        <span
                          style={{
                            ...styles.statusBadge,
                            background: badge.background,
                            border: badge.border,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.card}>
              <p style={styles.sectionKicker}>Scorecards</p>
              <h2 style={styles.sectionTitle}>Candidate Readiness Scores</h2>
              <p style={styles.helperText}>
                These are placeholder scorecards for now. Later they should be powered
                by real profile completion, resume quality, interview data, and
                verification results.
              </p>

              <div style={styles.scoreGrid}>
                {scorecards.map((item) => (
                  <div key={item.label} style={styles.scoreCard}>
                    <p style={styles.scoreLabel}>{item.label}</p>
                    <p
                      style={{
                        ...styles.scoreValue,
                        color: scoreTone(item.score),
                      }}
                    >
                      {item.score}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside style={styles.sideCol}>
            <div style={styles.sideCard}>
              <p style={styles.sectionKicker}>Snapshot</p>
              <h2 style={styles.sectionTitle}>Employer View</h2>

              <div style={styles.sideItem}>
                <span style={styles.sideLabel}>Candidate</span>
                <span style={styles.sideValue}>{fullName}</span>
              </div>

              <div style={styles.sideItem}>
                <span style={styles.sideLabel}>Location</span>
                <span style={styles.sideValue}>{cityState}</span>
              </div>

              <div style={styles.sideItem}>
                <span style={styles.sideLabel}>Resume</span>
                <span style={styles.sideValue}>{hasResume ? "Available" : "Not uploaded"}</span>
              </div>

              <div style={styles.sideItem}>
                <span style={styles.sideLabel}>Intro Video</span>
                <span style={styles.sideValue}>{introVideoUrl ? "Available" : "Not available"}</span>
              </div>

              <div style={styles.sideItem}>
                <span style={styles.sideLabel}>Verification</span>
                <span style={styles.sideValue}>In progress</span>
              </div>
            </div>

            <div style={styles.sideCard}>
              <p style={styles.sectionKicker}>Trust Signals</p>
              <h2 style={styles.sectionTitle}>What Employers Should See</h2>
              <ul style={styles.list}>
                <li>Verified work history badges</li>
                <li>Readiness scorecards</li>
                <li>Resume access</li>
                <li>Intro video</li>
                <li>Professional summary</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)",
    color: "#f5f5f5",
    padding: "32px 24px 56px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  wrapper: {
    maxWidth: "1440px",
    margin: "0 auto",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "24px",
    alignItems: "center",
    background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
    border: "1px solid #232323",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
    marginBottom: "24px",
  },
  heroLeft: {},
  heroRight: {},
  photo: {
    width: "220px",
    height: "220px",
    borderRadius: "22px",
    objectFit: "cover",
    border: "1px solid #2e2e2e",
  },
  photoPlaceholder: {
    width: "220px",
    height: "220px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111827",
    color: "#cbd5e1",
    border: "1px solid #2e2e2e",
  },
  kicker: {
    margin: "0 0 10px",
    color: "#a3a3a3",
    fontSize: "12px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  },
  name: {
    margin: "0 0 10px",
    fontSize: "48px",
    lineHeight: 1.02,
    fontWeight: 500,
    letterSpacing: "-0.04em",
    color: "#f5f5f5",
  },
  headline: {
    margin: "0 0 10px",
    color: "#e5e7eb",
    fontSize: "20px",
    lineHeight: 1.5,
  },
  meta: {
    margin: "0 0 18px",
    color: "#c4c4c4",
    fontSize: "15px",
  },
  linkRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  primaryButton: {
    display: "inline-block",
    padding: "14px 18px",
    borderRadius: "16px",
    textDecoration: "none",
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontWeight: 700,
  },
  secondaryButton: {
    display: "inline-block",
    padding: "14px 18px",
    borderRadius: "16px",
    textDecoration: "none",
    background: "#111827",
    border: "1px solid #374151",
    color: "#f3f4f6",
    fontWeight: 700,
  },
  primaryGhost: {
    display: "inline-block",
    padding: "14px 18px",
    borderRadius: "16px",
    textDecoration: "none",
    background: "#151515",
    border: "1px solid #2f2f2f",
    color: "#f3f4f6",
    fontWeight: 700,
  },
  disabledButton: {
    display: "inline-block",
    padding: "14px 18px",
    borderRadius: "16px",
    background: "#171717",
    border: "1px solid #2b2b2b",
    color: "#7c7c85",
    fontWeight: 700,
  },
  notice: {
    padding: "14px 16px",
    borderRadius: "16px",
    background: "#101010",
    border: "1px solid #2a2a2a",
    color: "#cbd5e1",
    lineHeight: 1.7,
    fontSize: "14px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "24px",
    alignItems: "start",
  },
  mainCol: {
    display: "grid",
    gap: "20px",
  },
  sideCol: {
    display: "grid",
    gap: "20px",
    position: "sticky",
    top: "100px",
  },
  card: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },
  sideCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },
  sectionKicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: "0 0 14px",
    color: "#f5f5f5",
    fontSize: "28px",
    fontWeight: 500,
    letterSpacing: "-0.03em",
  },
  bodyText: {
    margin: 0,
    color: "#d1d5db",
    lineHeight: 1.8,
    fontSize: "15px",
  },
  helperText: {
    margin: "0 0 16px",
    color: "#9ca3af",
    lineHeight: 1.7,
    fontSize: "14px",
  },
  verificationList: {
    display: "grid",
    gap: "14px",
  },
  verificationCard: {
    background: "#0f172a",
    border: "1px solid #273244",
    borderRadius: "20px",
    padding: "18px",
  },
  verificationTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
  },
  verificationCompany: {
    margin: "0 0 6px",
    color: "#f3f4f6",
    fontWeight: 700,
    fontSize: "16px",
  },
  verificationRole: {
    margin: "0 0 6px",
    color: "#dbeafe",
    fontSize: "14px",
  },
  verificationDates: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "14px",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "92px",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
  },
  scoreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  scoreCard: {
    background: "#101010",
    border: "1px solid #2a2a2a",
    borderRadius: "20px",
    padding: "18px",
  },
  scoreLabel: {
    margin: "0 0 10px",
    color: "#cbd5e1",
    fontSize: "14px",
  },
  scoreValue: {
    margin: 0,
    fontSize: "36px",
    fontWeight: 700,
  },
  sideItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px solid #232323",
  },
  sideLabel: {
    color: "#9ca3af",
    fontSize: "14px",
  },
  sideValue: {
    color: "#f5f5f5",
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "right",
  },
  list: {
    margin: 0,
    paddingLeft: "18px",
    color: "#d1d5db",
    lineHeight: 1.9,
  },
};
