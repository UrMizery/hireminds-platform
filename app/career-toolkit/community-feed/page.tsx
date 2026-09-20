"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { supabase } from "../../lib/supabase";

type VideoCard = {
  title: string;
  category: string;
  description: string;
  youtubeUrl?: string;
  locked?: boolean;
  buttonLabel: string;
};

/* -------------------------------------------------------------------------- */
/* VIDEO LIBRARY                                                              */
/* -------------------------------------------------------------------------- */

const youtubeVideoCards: VideoCard[] = [
  {
    title: "How to Read and Understand Job Posting",
    category: "Job Search",
    description:
      "Learn how to break down a job posting, understand what employers are asking for, and spot the details that matter before applying.",
    youtubeUrl:
      "https://youtu.be/IfTr8CsTnuo?si=Hgz_1n2Ra-mDIK9L",
    buttonLabel: "Watch on YouTube",
  },

  {
    title: "Job Search on Indeed & Applying",
    category: "Job Search",
    description:
      "Walk through using Indeed more effectively and understand how to move from searching to applying with more confidence.",
    youtubeUrl:
      "https://youtu.be/F6eAQvj_5qA?si=w62uKMLsQ5rfLVMY",
    buttonLabel: "Watch on YouTube",
  },

  {
    title: "Apply on Company Site via Indeed",
    category: "Applications",
    description:
      "See how to move from a job board listing to the company site and understand when direct application may be the better route.",
    youtubeUrl:
      "https://youtu.be/i-dsitWNL9k?si=HXZDTU5M1S81xPlc",
    buttonLabel: "Watch on YouTube",
  },

  {
    title: "Job Hunting with No Experience - The Catch 22",
    category: "Job Search",
    description:
      "Explore practical perspective on job searching when you have little to no experience and how to keep moving forward.",
    youtubeUrl:
      "https://youtu.be/xS9mHUvi9xA?si=PV7CszF9d0b8oOc0",
    buttonLabel: "Watch on YouTube",
  },

  {
    title: "Applying for a Job with a Criminal Record",
    category: "Reentry",
    description:
      "Helpful guidance for navigating applications, confidence, and next steps when applying with a criminal record.",
    youtubeUrl:
      "https://youtu.be/NgmqTsBi92A?si=DmxOkRwZpGXK2Xzy",
    buttonLabel: "Watch on YouTube",
  },

  {
    title:
      'How to Answer the "Weakness and Strength" Question in Interviews',
    category: "Interview",
    description:
      "Learn how to answer one of the most common interview questions with more confidence, honesty, and professionalism.",
    youtubeUrl:
      "https://youtu.be/NQrUJBOcgJc?si=CN6LGNqxZPUI_TYv",
    buttonLabel: "Watch on YouTube",
  },

  {
    title: "Choosing the Right Resume Format",
    category: "Resume",
    description:
      "Understand how to choose a resume format that fits your background, strengths, and the kind of opportunity you want next.",
    youtubeUrl:
      "https://youtu.be/_qWi6vp_0t4?si=tyV-XL6tIjAJiNMw",
    buttonLabel: "Watch on YouTube",
  },

  {
    title: "How to Dress for Any Kind of Job Interview",
    category: "Interview",
    description:
      "Get practical interview outfit guidance that helps you look prepared, polished, and appropriate for different work settings.",
    youtubeUrl:
      "https://youtu.be/UbcLJjxIpyU?si=prft2ECQV7VCdQzT",
    buttonLabel: "Watch on YouTube",
  },

  {
    title: "How to Use LinkedIn",
    category: "Career Tools",
    description:
      "Learn how LinkedIn can support visibility, networking, and job search efforts as part of your professional presence.",
    youtubeUrl:
      "https://youtu.be/UCkgBTmAb9E?si=lgOyPysh8mh6Wmo7",
    buttonLabel: "Watch on YouTube",
  },

  {
    title: "O*NET",
    category: "Career Exploration",
    description:
      "Explore how O*NET can help you research careers, job duties, skills, and pathways when planning your next move.",
    youtubeUrl:
      "https://youtu.be/7Jk94AQ8c3o?si=3UAtMG0qrGcRlLtP",
    buttonLabel: "Watch on YouTube",
  },

  {
    title: "Never Say These 5 Things in Any Interview",
    category: "Interview",
    description:
      "Avoid common interview mistakes by learning what not to say and how to present yourself more effectively.",
    youtubeUrl:
      "https://youtu.be/wIjK-6Do6lg?si=ZR8gSmfuoa98PIx1",
    buttonLabel: "Watch on YouTube",
  },

  {
    title: "Intro to HireMinds — A Product of RicanNECT 🔒",
    category: "Coming Soon",
    description:
      "A guided introduction to HireMinds, RicanNECT, and the workforce infrastructure behind the platform. This feature is coming soon.",
    locked: true,
    buttonLabel: "Coming Soon 🔒",
  },
];

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function CommunityFeedPage() {
  const [userId, setUserId] = useState("");

  const [fullName, setFullName] =
    useState<string | null>(null);

  const [email, setEmail] =
    useState<string | null>(null);

  const [referralCode, setReferralCode] =
    useState<string | null>(null);

  const openTrackedRef = useRef(false);

  /* ------------------------------------------------------------------------ */
  /* USER + ACTIVITY TRACKING                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    async function loadUserAndTrack() {
      const { data, error } =
        await supabase.auth.getUser();

      if (
        error ||
        !data.user ||
        openTrackedRef.current
      ) {
        return;
      }

      openTrackedRef.current = true;

      setUserId(data.user.id);

      const { data: profile } =
        await supabase
          .from("candidate_profiles")
          .select(
            "full_name, email, referral_code"
          )
          .eq("user_id", data.user.id)
          .maybeSingle();

      setFullName(
        profile?.full_name || null
      );

      setEmail(
        profile?.email ||
          data.user.email ||
          null
      );

      setReferralCode(
        profile?.referral_code || null
      );

      const { error: activityError } =
        await supabase
          .from("user_activity")
          .insert({
            user_id: data.user.id,

            full_name:
              profile?.full_name || null,

            email:
              profile?.email ||
              data.user.email ||
              null,

            referral_code:
              profile?.referral_code ||
              null,

            event_type:
              "tool_opened",

            tool_name:
              "video_library",

            page_name:
              "/career-toolkit/community-feed",
          });

      if (activityError) {
        console.error(
          "Video library tracking error:",
          activityError
        );
      }
    }

    loadUserAndTrack();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* VIDEO CLICK TRACKING                                                     */
  /* ------------------------------------------------------------------------ */

  async function handleVideoClick(
    video: VideoCard
  ) {
    try {
      if (userId && !video.locked) {
        const { error: activityError } =
          await supabase
            .from("user_activity")
            .insert({
              user_id: userId,

              full_name: fullName,

              email,

              referral_code:
                referralCode,

              event_type:
                "tool_completed",

              tool_name:
                "video_library",

              page_name:
                "/career-toolkit/community-feed",

              action_label:
                `video_opened:${video.title}`,
            });

        if (activityError) {
          console.error(
            "Video click tracking error:",
            activityError
          );
        }
      }
    } catch (error) {
      console.error(
        "Video click tracking failed:",
        error
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main style={styles.page}>
      {/* ABSTRACT BACKGROUND */}

      <div style={styles.blueGlow} />

      <div style={styles.grayGlow} />

      <div style={styles.dotPattern} />

      <div style={styles.shell}>
        {/* HERO */}

        <header style={styles.hero}>
          <div style={styles.heroContent}>
            <p style={styles.kicker}>
              CAREER TOOLKIT
            </p>

            <h1 style={styles.title}>
              Video Library
            </h1>

            <p style={styles.subtitle}>
              Explore practical video
              support around job
              searching, applying, resume
              formats, interview
              preparation, LinkedIn,
              O*NET, and career readiness
              topics that help you move
              forward with more
              confidence.
            </p>

            <a
              href="/career-toolkit"
              style={styles.backLink}
            >
              <span
                style={
                  styles.backArrow
                }
              >
                ←
              </span>

              Career ToolKit
            </a>
          </div>
        </header>

        {/* LIBRARY INTRO */}

        <section
          style={styles.libraryHeader}
        >
          <div>
            <p
              style={
                styles.sectionKicker
              }
            >
              CAREER RESOURCES
            </p>

            <h2
              style={
                styles.sectionTitle
              }
            >
              Learn at your own pace.
            </h2>
          </div>

          <p
            style={
              styles.sectionDescription
            }
          >
            Choose a topic below to open
            the video directly on
            YouTube.
          </p>
        </section>

        {/* VIDEO GRID */}

        <section style={styles.grid}>
          {youtubeVideoCards.map(
            (video, index) => (
              <article
                key={`${video.title}-${video.youtubeUrl ?? "locked"}`}
                style={{
                  ...styles.card,

                  ...(video.locked
                    ? styles.lockedCard
                    : {}),
                }}
              >
                {/* NUMBER / ACCENT */}

                <div
                  style={
                    styles.cardTop
                  }
                >
                  <span
                    style={{
                      ...styles.videoNumber,

                      ...(video.locked
                        ? styles.lockedVideoNumber
                        : {}),
                    }}
                  >
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <span
                    style={{
                      ...styles.categoryLabel,

                      ...(video.locked
                        ? styles.lockedCategoryLabel
                        : {}),
                    }}
                  >
                    {video.category}
                  </span>
                </div>

                {/* CONTENT */}

                <div
                  style={
                    styles.cardBody
                  }
                >
                  <h2
                    style={
                      styles.cardTitle
                    }
                  >
                    {video.title}
                  </h2>

                  <p
                    style={
                      styles.cardDescription
                    }
                  >
                    {
                      video.description
                    }
                  </p>
                </div>

                {/* ACTION */}

                <div
                  style={
                    styles.cardFooter
                  }
                >
                  {video.locked ? (
                    <span
                      style={
                        styles.lockedButton
                      }
                    >
                      {
                        video.buttonLabel
                      }
                    </span>
                  ) : (
                    <a
                      href={
                        video.youtubeUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      style={
                        styles.button
                      }
                      onClick={() =>
                        handleVideoClick(
                          video
                        )
                      }
                    >
                      <span>
                        {
                          video.buttonLabel
                        }
                      </span>

                      <span
                        style={
                          styles.buttonArrow
                        }
                      >
                        ↗
                      </span>
                    </a>
                  )}
                </div>
              </article>
            )
          )}
        </section>

        {/* BOTTOM NOTE */}

        <section
          style={styles.bottomNote}
        >
          <div style={styles.hmMark}>
            HM
          </div>

          <div>
            <p
              style={
                styles.bottomNoteTitle
              }
            >
              Keep building your career
              toolkit.
            </p>

            <p
              style={
                styles.bottomNoteText
              }
            >
              Use these videos alongside
              the other HireMinds career
              tools to strengthen your
              job search, resume,
              interview preparation, and
              career planning.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles: Record<
  string,
  CSSProperties
> = {
  /* ------------------------------------------------------------------------ */
  /* PAGE                                                                     */
  /* ------------------------------------------------------------------------ */

  page: {
    position: "relative",

    minHeight: "100vh",

    overflow: "hidden",

    background:
      "linear-gradient(180deg, #F7F9FC 0%, #FFFFFF 44%, #F6F8FB 100%)",

    color: "#0F172A",

    padding:
      "0 32px 80px",

    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  /* ------------------------------------------------------------------------ */
  /* ABSTRACT BACKGROUND                                                      */
  /* ------------------------------------------------------------------------ */

  blueGlow: {
    position: "absolute",

    width: "680px",
    height: "680px",

    top: "-410px",
    right: "-140px",

    borderRadius: "50%",

    background:
      "radial-gradient(circle, rgba(37,99,235,.13) 0%, rgba(37,99,235,.04) 45%, rgba(37,99,235,0) 72%)",

    pointerEvents: "none",
  },

  grayGlow: {
    position: "absolute",

    width: "560px",
    height: "560px",

    top: "700px",
    left: "-310px",

    borderRadius: "50%",

    background:
      "radial-gradient(circle, rgba(100,116,139,.09) 0%, rgba(100,116,139,0) 72%)",

    pointerEvents: "none",
  },

  dotPattern: {
    position: "absolute",

    top: "34px",
    right: "8%",

    width: "200px",
    height: "200px",

    opacity: 0.2,

    backgroundImage:
      "radial-gradient(#2563EB 1.5px, transparent 1.5px)",

    backgroundSize:
      "27px 27px",

    pointerEvents: "none",
  },

  shell: {
    position: "relative",

    zIndex: 1,

    width: "100%",

    maxWidth: "1320px",

    margin: "0 auto",
  },

  /* ------------------------------------------------------------------------ */
  /* HERO                                                                     */
  /* ------------------------------------------------------------------------ */

  hero: {
    padding:
      "14px 0 52px",
  },

  heroContent: {
    maxWidth: "880px",
  },

  kicker: {
    margin: "0 0 20px",

    color: "#2563EB",

    fontSize: "13px",

    fontWeight: 800,

    letterSpacing: ".18em",

    textTransform: "uppercase",
  },

  title: {
    margin: 0,

    color: "#0F172A",

    fontSize:
      "clamp(44px, 6vw, 68px)",

    lineHeight: 1,

    fontWeight: 750,

    letterSpacing:
      "-0.05em",
  },

  subtitle: {
    maxWidth: "820px",

    margin: "26px 0 0",

    color: "#64748B",

    fontSize: "18px",

    lineHeight: 1.75,
  },

  backLink: {
    display: "inline-flex",

    alignItems: "center",

    gap: "8px",

    marginTop: "24px",

    color: "#2563EB",

    fontSize: "13px",

    fontWeight: 750,

    textDecoration: "none",
  },

  backArrow: {
    fontSize: "17px",

    lineHeight: 1,
  },

  /* ------------------------------------------------------------------------ */
  /* LIBRARY HEADER                                                           */
  /* ------------------------------------------------------------------------ */

  libraryHeader: {
    display: "flex",

    alignItems: "flex-end",

    justifyContent:
      "space-between",

    gap: "40px",

    padding:
      "34px 0 26px",

    borderTop:
      "1px solid #E2E8F0",
  },

  sectionKicker: {
    margin: "0 0 8px",

    color: "#2563EB",

    fontSize: "10px",

    fontWeight: 800,

    letterSpacing: ".16em",
  },

  sectionTitle: {
    margin: 0,

    color: "#0F172A",

    fontSize: "27px",

    lineHeight: 1.2,

    fontWeight: 750,

    letterSpacing:
      "-0.025em",
  },

  sectionDescription: {
    maxWidth: "400px",

    margin: 0,

    color: "#94A3B8",

    fontSize: "13px",

    lineHeight: 1.65,

    textAlign: "right",
  },

  /* ------------------------------------------------------------------------ */
  /* VIDEO GRID                                                               */
  /* ------------------------------------------------------------------------ */

  grid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(275px, 1fr))",

    gap: "0 30px",

    alignItems: "stretch",

    borderTop:
      "1px solid #E2E8F0",
  },

  /* ------------------------------------------------------------------------ */
  /* VIDEO ITEM                                                               */
  /* ------------------------------------------------------------------------ */

  card: {
    display: "flex",

    flexDirection: "column",

    minHeight: "300px",

    padding:
      "28px 4px 30px",

    borderRadius: 0,

    background:
      "transparent",

    border: "none",

    borderBottom:
      "1px solid #E2E8F0",

    boxShadow: "none",

    boxSizing: "border-box",

    overflow: "hidden",
  },

  lockedCard: {
    background:
      "transparent",

    opacity: 0.68,
  },

  cardTop: {
    display: "flex",

    alignItems: "center",

    justifyContent:
      "space-between",

    gap: "14px",

    marginBottom: "24px",
  },

  videoNumber: {
    display: "inline-flex",

    alignItems: "center",

    justifyContent:
      "center",

    width: "36px",
    height: "36px",

    borderRadius: "50%",

    background: "#EFF6FF",

    color: "#2563EB",

    fontSize: "10px",

    fontWeight: 850,

    letterSpacing: ".05em",
  },

  lockedVideoNumber: {
    background: "#F1F5F9",

    color: "#94A3B8",
  },

  categoryLabel: {
    margin: 0,

    color: "#2563EB",

    fontSize: "10px",

    fontWeight: 800,

    letterSpacing: ".12em",

    textTransform: "uppercase",

    textAlign: "right",
  },

  lockedCategoryLabel: {
    color: "#94A3B8",
  },

  cardBody: {
    display: "grid",

    gap: "12px",

    marginBottom: "26px",
  },

  cardTitle: {
    margin: 0,

    color: "#0F172A",

    fontSize: "21px",

    fontWeight: 750,

    lineHeight: 1.25,

    letterSpacing:
      "-0.025em",
  },

  cardDescription: {
    margin: 0,

    color: "#64748B",

    fontSize: "14px",

    lineHeight: 1.7,
  },

  cardFooter: {
    display: "flex",

    alignItems: "center",

    marginTop: "auto",
  },

  /* ------------------------------------------------------------------------ */
  /* WATCH BUTTON                                                             */
  /* ------------------------------------------------------------------------ */

  button: {
    display: "inline-flex",

    alignItems: "center",

    justifyContent:
      "space-between",

    gap: "20px",

    minWidth: "180px",

    minHeight: "44px",

    padding: "10px 15px",

    borderRadius: "8px",

    border:
      "1px solid #2563EB",

    background: "#2563EB",

    color: "#FFFFFF",

    fontSize: "13px",

    fontWeight: 750,

    textDecoration: "none",

    textAlign: "center",

    boxSizing: "border-box",

    boxShadow:
      "0 8px 18px rgba(37,99,235,.14)",
  },

  buttonArrow: {
    display: "inline-flex",

    alignItems: "center",

    justifyContent:
      "center",

    fontSize: "16px",

    lineHeight: 1,
  },

  /* ------------------------------------------------------------------------ */
  /* LOCKED BUTTON                                                            */
  /* ------------------------------------------------------------------------ */

  lockedButton: {
    display: "inline-flex",

    alignItems: "center",

    justifyContent:
      "center",

    minWidth: "180px",

    minHeight: "44px",

    padding: "10px 15px",

    borderRadius: "8px",

    border:
      "1px solid #CBD5E1",

    background: "#F8FAFC",

    color: "#94A3B8",

    fontSize: "13px",

    fontWeight: 750,

    textAlign: "center",

    boxSizing: "border-box",
  },

  /* ------------------------------------------------------------------------ */
  /* BOTTOM NOTE                                                              */
  /* ------------------------------------------------------------------------ */

  bottomNote: {
    display: "flex",

    alignItems: "flex-start",

    gap: "15px",

    marginTop: "42px",

    padding:
      "26px 0 0",

    borderTop:
      "1px solid #E2E8F0",
  },

  hmMark: {
    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",

    flex: "0 0 auto",

    width: "38px",
    height: "38px",

    borderRadius: "9px",

    background: "#EFF6FF",

    color: "#2563EB",

    fontSize: "10px",

    fontWeight: 900,
  },

  bottomNoteTitle: {
    margin: "0 0 5px",

    color: "#334155",

    fontSize: "13px",

    fontWeight: 750,
  },

  bottomNoteText: {
    maxWidth: "720px",

    margin: 0,

    color: "#94A3B8",

    fontSize: "12px",

    lineHeight: 1.65,
  },
};
