import type { CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type PassportPageProps = {
  params: {
    slug: string;
  };
};

export default async function PassportPublicPage({ params }: PassportPageProps) {
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("passport_slug", params.slug)
    .maybeSingle();

  const { data: latestResume } = profile?.id
    ? await supabase
        .from("resumes")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const fullName = profile?.full_name || "Candidate Name";
  const headline = profile?.headline || "Professional Headline";
  const cityState =
    [profile?.city, profile?.state].filter(Boolean).join(", ") || "Location not provided";

  const bio =
    profile?.bio ||
    "This candidate has not added a public bio yet.";

  const photoUrl = profile?.photo_url || "";
  const introVideoUrl = profile?.intro_video_url || "";
  const resumeUrl = profile?.resume_url || "";
  const linkedinUrl = profile?.linkedin_url || "";

  const resumeSummary = latestResume?.summary_text || "";
  const resumeHeading = latestResume?.summary_heading || "Professional Summary";
  const resumeSkills = Array.isArray(latestResume?.skills) ? latestResume.skills : [];
  const resumeAccomplishments = latestResume?.accomplishments || "";

  const hasResumeContent = Boolean(
    resumeUrl || resumeSummary || resumeSkills.length || resumeAccomplishments
  );

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
                <a href={linkedinUrl} style={styles.ghostButton}>
                  LinkedIn
                </a>
              ) : null}

              {hasResumeContent ? (
                <a href="#resume-section" style={styles.primaryButton}>
                  View Resume
                </a>
              ) : (
                <span style={styles.disabledButton}>Resume Not Available</span>
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
              This public Career Passport is designed to give employers a clean snapshot of
              the candidate’s profile, skills, and resume information.
            </div>
          </div>
        </section>

        <div style={styles.layout}>
          <section style={styles.mainCol}>
            <div style={styles.card}>
              <p style={styles.sectionKicker}>About</p>
              <h2 style={styles.sectionTitle}>Profile Bio</h2>
              <p style={styles.bodyText}>{bio}</p>
            </div>

            {hasResumeContent ? (
              <div id="resume-section" style={styles.card}>
                <p style={styles.sectionKicker}>Resume</p>
                <h2 style={styles.sectionTitle}>Resume Snapshot</h2>

                {resumeSummary ? (
                  <>
                    <p style={styles.helperHeading}>{resumeHeading}</p>
                    <p style={styles.bodyText}>{resumeSummary}</p>
                  </>
                ) : null}

                {resumeSkills.length ? (
                  <>
                    <p style={styles.helperHeading}>Skills</p>
                    <div style={styles.skillWrap}>
                      {resumeSkills.map((skill: string, index: number) => (
                        <span key={`${skill}-${index}`} style={styles.skillPill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}

                {resumeAccomplishments ? (
                  <>
                    <p style={styles.helperHeading}>Accomplishments</p>
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
          </section>

          <aside style={styles.sideCol}>
            <div style={styles.sideCard}>
              <p style={styles.sectionKicker}>Employer Snapshot</p>
              <h2 style={styles.sectionTitle}>Quick View</h2>

              <div style={styles.sideItem}>
                <span style={styles.sideLabel}>Candidate</span>
                <span style={styles.sideValue}>{fullName}</span>
              </div>

              <div style={styles.sideItem}>
                <span style={styles.sideLabel}>Location</span>
                <span style={styles.sideValue}>{cityState}</span>
              </div>

              <div style={styles.sideItem}>
                <span style={styles.sideLabel}>Headline</span>
                <span style={styles.sideValue}>{headline}</span>
              </div>

              <div style={styles.sideItem}>
                <span style={styles.sideLabel}>Resume</span>
                <span style={styles.sideValue}>
                  {hasResumeContent ? "Available" : "Not available"}
                </span>
              </div>

              <div style={styles.sideItem}>
                <span style={styles.sideLabel}>Intro Video</span>
                <span style={styles.sideValue}>
                  {introVideoUrl ? "Available" : "Not available"}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
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
  gridTemplateColumns: "200px 1fr",
  gap: "28px",
  alignItems: "center",
  background:
    "linear-gradient(135deg, rgba(20,20,20,0.96) 0%, rgba(12,12,14,0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "32px",
  padding: "34px",
  boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
  marginBottom: "28px",
  backdropFilter: "blur(8px)",
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
    lineHeight: 1.4,
  },
  meta: {
    margin: "0 0 18px",
    color: "#a1a1aa",
    fontSize: "15px",
  },
  linkRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  primaryButton: {
    background: "linear-gradient(180deg, #f5f5f5 0%, #d4d4d8 100%)",
    color: "#09090b",
    border: "none",
    borderRadius: "16px",
    padding: "12px 16px",
    fontSize: "15px",
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostButton: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "16px",
    padding: "12px 16px",
    fontSize: "15px",
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    background: "linear-gradient(180deg, #0f244d 0%, #112b5f 100%)",
    color: "#fff",
    border: "1px solid rgba(148,163,184,0.28)",
    borderRadius: "16px",
    padding: "12px 16px",
    fontSize: "15px",
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    background: "rgba(255,255,255,0.04)",
    color: "#a1a1aa",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "12px 16px",
    fontSize: "15px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  notice: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "14px 16px",
    color: "#d4d4d8",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 360px",
    gap: "24px",
    alignItems: "start",
  },
  mainCol: {},
  sideCol: {},
  card: {
    background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
    border: "1px solid #232323",
    borderRadius: "28px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
    marginBottom: "20px",
  },
  sideCard: {
    background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
    border: "1px solid #232323",
    borderRadius: "28px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
    position: "sticky",
    top: "24px",
  },
  sectionKicker: {
    margin: "0 0 10px",
    color: "#a3a3a3",
    fontSize: "12px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: "0 0 12px",
    color: "#fafafa",
    fontSize: "28px",
    lineHeight: 1.1,
    fontWeight: 700,
  },
  helperHeading: {
    margin: "0 0 12px",
    color: "#d4d4d8",
    fontSize: "15px",
    fontWeight: 700,
  },
  bodyText: {
    margin: "0 0 16px",
    color: "#e5e7eb",
    fontSize: "16px",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  skillWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "18px",
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
  sideItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  sideLabel: {
    color: "#a1a1aa",
    fontSize: "14px",
  },
  sideValue: {
    color: "#fafafa",
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "right",
  },
};
