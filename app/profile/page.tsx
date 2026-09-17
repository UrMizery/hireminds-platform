"use client";

import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { supabase } from "../lib/supabase";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [userId, setUserId] = useState("");
  const [profileId, setProfileId] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [publicProfileUrl, setPublicProfileUrl] = useState("");

  const trackedRef = useRef(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setMessage("");

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      window.location.href = "/sign-in";
      return;
    }

    const user = authData.user;

    setUserId(user.id);
    setEmail(user.email || "");

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile load error:", profileError);
      setMessage(profileError.message);
    }

    if (profile) {
      setProfileId(profile.id || "");
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setEmail(profile.email || user.email || "");
      setCity(profile.city || "");
      setStateName(profile.state || "");
      setBio(profile.bio || "");
      setHeadline(profile.headline || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setPhotoUrl(profile.photo_url || "");
      setPublicProfileUrl(profile.public_profile_url || "");
      setReferralCode(profile.referral_code || "");

      if (!trackedRef.current) {
        trackedRef.current = true;

        await supabase
          .from("user_activity")
          .insert({
            user_id: user.id,
            full_name: profile.full_name || null,
            email: profile.email || user.email || null,
            referral_code: profile.referral_code || null,
            event_type: "profile_viewed",
            // Profile is the post-login landing page, not a career tool.
            tool_name: null,
            page_name: "/profile",
          });
      }
    } else {
      setFullName(user.user_metadata?.full_name || "");
      setReferralCode(user.user_metadata?.referral_code || "");
    }

    setLoading(false);
  }

  async function uploadFile(
    bucket: string,
    file: File,
    folder: string
  ) {
    const fileExt = file.name.split(".").pop() || "file";
    const filePath = `${folder}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSaveProfile() {
    setMessage("");

    if (!userId) {
      setMessage("You must be signed in.");
      return;
    }

    try {
      setSaving(true);

      let nextPhotoUrl = photoUrl;

      if (photoFile) {
        nextPhotoUrl = await uploadFile(
          "profile-photos",
          photoFile,
          `${userId}/photo`
        );
      }

      const slug = slugify(fullName || "career-passport");
      const publicUrl = `${window.location.origin}/passport/${slug}-${userId.slice(
        0,
        8
      )}`;

      const payload = {
        user_id: userId,
        full_name: fullName,
        phone,
        email,
        city,
        state: stateName,
        bio,
        headline,
        linkedin_url: linkedinUrl,
        photo_url: nextPhotoUrl || null,
        public_profile_url: publicUrl,
      };

      if (profileId) {
        const { error } = await supabase
          .from("candidate_profiles")
          .update(payload)
          .eq("id", profileId);

        if (error) {
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from("candidate_profiles")
          .insert(payload)
          .select("id")
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data?.id) {
          setProfileId(data.id);
        }
      }

      setPhotoUrl(nextPhotoUrl);
      setPublicProfileUrl(publicUrl);
      setPhotoFile(null);
      setMessage("✓ Profile saved successfully.");
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={st.loadingPage}>
        <div style={st.loadingMark}>HM</div>
        <div>
          <strong style={st.loadingTitle}>HireMinds</strong>
          <p style={st.loadingText}>Loading your Career Passport...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={st.page}>
      <div style={st.shell}>
        <section style={st.identityCard}>
          <div style={st.identityOrbOne} />
          <div style={st.identityOrbTwo} />

          <div style={st.photoColumn}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                style={st.profilePhoto}
              />
            ) : (
              <div style={st.profilePlaceholder}>
                {fullName
                  ? fullName.charAt(0).toUpperCase()
                  : "HM"}
              </div>
            )}

            <label style={st.updatePhoto}>
              Update Photo
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) =>
                  setPhotoFile(e.target.files?.[0] || null)
                }
              />
            </label>

            {photoFile ? (
              <span style={st.photoSelected}>{photoFile.name}</span>
            ) : null}
          </div>

          <div style={st.identityInfo}>
            <div style={st.identityHeader}>
              <div>
                <p style={st.eyebrow}>YOUR CAREER PASSPORT</p>
                <h1 style={st.profileName}>{fullName || "Your Name"}</h1>
                <p style={st.profileHeadline}>
                  {headline || "Add your professional headline"}
                </p>
              </div>

              <div style={st.identityActions}>
                <div style={st.profileStatus}>
                  <span style={st.statusDot} />
                  Profile Active
                </div>

                {publicProfileUrl ? (
                  <a
                    href={publicProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={st.identityPassportButton}
                  >
                    View Career Passport ↗
                  </a>
                ) : null}
              </div>
            </div>

            <div style={st.profileMeta}>
              <div style={st.metaChip}>
                {[city, stateName].filter(Boolean).join(", ") || "Add Location"}
              </div>

              <div style={st.metaChip}>{email || "Add Email"}</div>

              {linkedinUrl ? (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={st.linkedinChip}
                >
                  LinkedIn ↗
                </a>
              ) : null}

              {referralCode ? (
                <div style={st.programChip}>Program: {referralCode}</div>
              ) : null}
            </div>

            <div style={st.bioPreview}>
              <span style={st.bioLabel}>PROFESSIONAL BIO</span>
              <p style={st.bioText}>
                {bio ||
                  "Add a short professional bio below to introduce who you are, what you do, and where you are headed."}
              </p>
            </div>
          </div>
        </section>

        <section style={st.editor}>
          <div style={st.sectionTop}>
            <div>
              <p style={st.eyebrow}>PROFILE INFORMATION</p>
              <h2 style={st.sectionTitle}>Keep your Career Passport current.</h2>
              <p style={st.sectionIntro}>
                Update your contact information and professional details here. Your
                completed information can be used on your Career Passport.
              </p>
            </div>
          </div>

          <div style={st.formGrid}>
            <Field
              label="Full Name"
              value={fullName}
              onChange={setFullName}
              placeholder="Your full name"
            />

            <Field
              label="Phone"
              value={phone}
              onChange={setPhone}
              placeholder="Phone number"
            />

            <Field
              label="Professional Email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="Professional email"
            />

            <Field
              label="LinkedIn"
              value={linkedinUrl}
              onChange={setLinkedinUrl}
              placeholder="LinkedIn profile URL"
            />

            <Field
              label="City"
              value={city}
              onChange={setCity}
              placeholder="City"
            />

            <Field
              label="State"
              value={stateName}
              onChange={setStateName}
              placeholder="State"
            />
          </div>

          <div style={st.wideField}>
            <Field
              label="Professional Headline"
              value={headline}
              onChange={setHeadline}
              placeholder="Example: Administrative Professional | Customer Service | Operations"
            />
          </div>

          <div style={st.wideField}>
            <TextAreaField
              label="Short Professional Bio"
              value={bio}
              onChange={setBio}
              placeholder="Tell people who you are, what you do, your strengths, and where you're headed professionally."
            />
          </div>

          <div style={st.editorBottom}>
            <div style={st.visibilityNotice}>
              <div style={st.visibilityIcon}>◇</div>
              <div>
                <strong style={st.visibilityTitle}>Career Passport Visibility</strong>
                <p style={st.visibilityText}>
                  Your completed professional information may appear on your Career Passport.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              style={{
                ...st.saveButton,
                ...(saving ? st.disabledButton : {}),
              }}
            >
              {saving ? "Saving..." : "Save Profile →"}
            </button>
          </div>

          {message ? (
            <div
              style={
                message.startsWith("✓")
                  ? st.successMessage
                  : st.errorMessage
              }
            >
              {message}
            </div>
          ) : null}
        </section>

        <section style={st.connectSection}>
          <div style={st.connectGlowOne} />
          <div style={st.connectGlowTwo} />

          <div style={st.connectHeader}>
            <div>
              <p style={st.eyebrow}>CONNECT & EXPLORE</p>
              <h2 style={st.connectTitle}>Career <span style={st.connectTitleAccent}>& Connect</span></h2>
              <p style={st.connectIntro}>
                Your career support, weekly development, and job-search tracking — connected in one place.
              </p>
            </div>
          </div>

          <div style={st.toolGrid}>
            <ToolCard
              href="/open-room/live"
              symbol="◎"
              kicker="CAREER SUPPORT"
              title="Career Connect"
              description="Request career support, manage appointments, confirm or reschedule meetings, and check in for scheduled services."
              action="Enter Career Connect"
              featured
            />

            <ToolCard
              href="/career-development-generator"
              symbol="✦"
              kicker="WEEKLY DEVELOPMENT"
              title="Career Development Generator"
              description="Complete your weekly career-development activity, save your progress, and document your next step."
              action="Open Generator"
            />

            <ToolCard
              href="/job-log-generator"
              symbol="✓"
              kicker="JOB SEARCH"
              title="Weekly Job Log"
              description="Track job opportunities, applications, outcomes, and the positions you are most interested in."
              action="Open Job Log"
            />
          </div>
        </section>

        <footer style={st.footer}>
          <strong style={st.footerBrand}>HireMinds™</strong>
          <span style={st.footerTagline}>Prepare with Confidence. Build with Purpose.</span>
        </footer>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div style={st.field}>
      <label style={st.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={st.input}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={st.field}>
      <label style={st.label}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={st.textarea}
      />
    </div>
  );
}

function ToolCard({
  href,
  symbol,
  kicker,
  title,
  description,
  action,
  featured = false,
}: {
  href: string;
  symbol: string;
  kicker: string;
  title: string;
  description: string;
  action: string;
  featured?: boolean;
}) {
  return (
    <Link href={href} style={st.toolLink}>
      <article
        style={{
          ...st.toolCard,
          ...(featured ? st.toolCardFeatured : {}),
        }}
      >
        <div style={st.toolCardTop}>
          <span
            style={{
              ...st.toolKicker,
              ...(featured ? st.toolKickerFeatured : {}),
            }}
          >
            {kicker}
          </span>
          <span
            style={{
              ...st.toolArrow,
              ...(featured ? st.toolArrowFeatured : {}),
            }}
          >
            →
          </span>
        </div>

        <div
          style={{
            ...st.toolSymbol,
            ...(featured ? st.toolSymbolFeatured : {}),
          }}
        >
          {symbol}
        </div>

        {featured ? (
          <span style={st.featuredBadge}>CAREER SERVICES</span>
        ) : null}

        <h3
          style={{
            ...st.toolTitle,
            ...(featured ? st.toolTitleFeatured : {}),
          }}
        >
          {title}
        </h3>

        <p
          style={{
            ...st.toolDescription,
            ...(featured ? st.toolDescriptionFeatured : {}),
          }}
        >
          {description}
        </p>

        <span
          style={{
            ...st.toolAction,
            ...(featured ? st.toolActionFeatured : {}),
          }}
        >
          {action}
        </span>
      </article>
    </Link>
  );
}

const st: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "18px 18px 56px",
    boxSizing: "border-box",
    color: "#111820",
    background:
      "linear-gradient(180deg, #e8edf1 0%, #f7f9fb 28%, #ffffff 68%, #edf2f5 100%)",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  shell: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    background:
      "linear-gradient(180deg, #e9eef2 0%, #ffffff 100%)",
    color: "#111820",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  loadingMark: {
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "15px",
    backgroundColor: "#12344a",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 950,
  },

  loadingTitle: {
    display: "block",
    color: "#111820",
    fontSize: "15px",
  },

  loadingText: {
    margin: "4px 0 0",
    color: "#6a7680",
    fontSize: "12px",
  },

  header: {
    minHeight: "58px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    padding: "2px 4px",
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  brandMark: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    backgroundColor: "#12344a",
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: 950,
    boxShadow: "0 8px 20px rgba(18,52,74,.15)",
  },

  brandName: {
    display: "block",
    color: "#111820",
    fontSize: "13px",
    fontWeight: 950,
  },

  brandSub: {
    display: "block",
    marginTop: "2px",
    color: "#6b7882",
    fontSize: "9px",
  },

  headerActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  headerPassportButton: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid #b9c9d5",
    backgroundColor: "#ffffff",
    color: "#155f91",
    textDecoration: "none",
    fontSize: "10px",
    fontWeight: 900,
  },

  signOutButton: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid #bfc8cf",
    backgroundColor: "#f7f9fa",
    color: "#2d3942",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: 850,
  },

  identityCard: {
    position: "relative",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "190px minmax(0,1fr)",
    alignItems: "center",
    gap: "32px",
    padding: "42px 40px",
    borderRadius: "32px",
    background:
      "linear-gradient(125deg, #0c151d 0%, #12344a 50%, #176fae 100%)",
    border: "1px solid rgba(255,255,255,.08)",
    boxShadow: "0 26px 65px rgba(17,24,32,.22)",
  },

  identityOrbOne: {
    position: "absolute",
    width: "420px",
    height: "420px",
    right: "-170px",
    top: "-240px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(99,190,239,.36) 0%, rgba(99,190,239,0) 68%)",
    pointerEvents: "none",
  },

  identityOrbTwo: {
    position: "absolute",
    width: "280px",
    height: "280px",
    left: "-130px",
    bottom: "-170px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,255,255,.12) 0%, rgba(255,255,255,0) 70%)",
    pointerEvents: "none",
  },

  photoColumn: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },

  profilePhoto: {
    width: "152px",
    height: "152px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "4px solid rgba(255,255,255,.92)",
    boxShadow: "0 12px 32px rgba(0,0,0,.22)",
  },

  profilePlaceholder: {
    width: "152px",
    height: "152px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background:
      "linear-gradient(145deg, #f8fbfd 0%, #dbeaf3 100%)",
    border: "4px solid rgba(255,255,255,.92)",
    color: "#176fae",
    fontSize: "44px",
    fontWeight: 950,
    boxShadow: "0 12px 32px rgba(0,0,0,.18)",
  },

  updatePhoto: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,.25)",
    backgroundColor: "rgba(255,255,255,.08)",
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: 850,
    cursor: "pointer",
  },

  photoSelected: {
    maxWidth: "185px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#b9cedd",
    fontSize: "8px",
  },

  identityInfo: {
    position: "relative",
    zIndex: 2,
    minWidth: 0,
  },

  identityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
  },

  eyebrow: {
    margin: "0 0 7px",
    color: "#176fae",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: ".15em",
    textTransform: "uppercase",
  },

  profileName: {
    margin: 0,
    color: "#ffffff",
    fontSize: "clamp(2.4rem,5vw,4.3rem)",
    lineHeight: .96,
    letterSpacing: "-.05em",
    fontWeight: 950,
  },

  profileHeadline: {
    margin: "13px 0 0",
    color: "#d8e4eb",
    fontSize: "15px",
    lineHeight: 1.5,
  },

  identityActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8px",
    flexWrap: "wrap",
  },

  identityPassportButton: {
    padding: "9px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,.22)",
    backgroundColor: "rgba(255,255,255,.10)",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "9px",
    fontWeight: 900,
    backdropFilter: "blur(8px)",
  },

  profileStatus: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 11px",
    borderRadius: "999px",
    backgroundColor: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.16)",
    color: "#e8f6ee",
    fontSize: "9px",
    fontWeight: 850,
  },

  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#68d49d",
  },

  profileMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "21px",
  },

  metaChip: {
    padding: "8px 10px",
    borderRadius: "10px",
    backgroundColor: "rgba(255,255,255,.075)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "#dbe6ec",
    fontSize: "10px",
  },

  linkedinChip: {
    padding: "8px 10px",
    borderRadius: "10px",
    backgroundColor: "rgba(49,148,208,.16)",
    border: "1px solid rgba(123,196,239,.25)",
    color: "#d8f0ff",
    textDecoration: "none",
    fontSize: "10px",
  },

  programChip: {
    padding: "8px 10px",
    borderRadius: "10px",
    backgroundColor: "rgba(255,255,255,.075)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "#dbe6ec",
    fontSize: "10px",
  },

  bioPreview: {
    marginTop: "18px",
    paddingTop: "18px",
    borderTop: "1px solid rgba(255,255,255,.14)",
  },

  bioLabel: {
    color: "#7ec1e8",
    fontSize: "8px",
    fontWeight: 950,
    letterSpacing: ".13em",
  },

  bioText: {
    margin: "7px 0 0",
    maxWidth: "760px",
    color: "#c2d1da",
    fontSize: "11px",
    lineHeight: 1.7,
  },

  editor: {
    padding: "34px",
    borderRadius: "28px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd4db",
    boxShadow: "0 16px 42px rgba(20,34,47,.07)",
  },

  sectionTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
  },

  sectionTitle: {
    margin: 0,
    color: "#111820",
    fontSize: "clamp(28px,4vw,38px)",
    lineHeight: 1.05,
    fontWeight: 950,
    letterSpacing: "-.035em",
  },

  sectionIntro: {
    maxWidth: "700px",
    margin: "9px 0 0",
    color: "#68747e",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
    gap: "16px",
  },

  wideField: {
    marginTop: "16px",
  },

  field: {
    display: "grid",
    gap: "7px",
  },

  label: {
    color: "#34434e",
    fontSize: "10px",
    fontWeight: 850,
  },

  input: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid #b9c6cf",
    backgroundColor: "#f7f9fa",
    color: "#111820",
    outline: "none",
    fontSize: "13px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "125px",
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid #b9c6cf",
    backgroundColor: "#f7f9fa",
    color: "#111820",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.65,
    fontSize: "13px",
    boxSizing: "border-box",
  },

  editorBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginTop: "23px",
    paddingTop: "21px",
    borderTop: "1px solid #dce3e8",
  },

  visibilityNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    maxWidth: "700px",
  },

  visibilityIcon: {
    width: "36px",
    height: "36px",
    minWidth: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    backgroundColor: "#e8f3fa",
    border: "1px solid #c8deeb",
    color: "#176fae",
  },

  visibilityTitle: {
    color: "#1d2932",
    fontSize: "11px",
  },

  visibilityText: {
    margin: "4px 0 0",
    color: "#6c7882",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  saveButton: {
    minWidth: "160px",
    padding: "13px 18px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(90deg, #111820 0%, #176fae 72%, #2588c7 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 950,
    boxShadow: "0 10px 24px rgba(23,111,174,.20)",
  },

  disabledButton: {
    opacity: .48,
    cursor: "not-allowed",
  },

  successMessage: {
    marginTop: "15px",
    padding: "12px 14px",
    borderRadius: "11px",
    color: "#26734f",
    backgroundColor: "#edf8f2",
    border: "1px solid #bfe2cd",
    fontSize: "10px",
    fontWeight: 800,
  },

  errorMessage: {
    marginTop: "15px",
    padding: "12px 14px",
    borderRadius: "11px",
    color: "#8a2e2e",
    backgroundColor: "#fff0f0",
    border: "1px solid #dfb6b6",
    fontSize: "10px",
    fontWeight: 800,
  },

  connectSection: {
    position: "relative",
    overflow: "hidden",
    padding: "38px",
    borderRadius: "30px",
    background:
      "linear-gradient(145deg, #f9fbfc 0%, #eef5f9 52%, #e6f1f8 100%)",
    border: "1px solid #cbd9e2",
    boxShadow: "0 22px 58px rgba(18,52,74,.11)",
  },

  connectGlowOne: {
    position: "absolute",
    width: "440px",
    height: "440px",
    right: "-180px",
    top: "-260px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(47,150,211,.22) 0%, rgba(47,150,211,0) 68%)",
    pointerEvents: "none",
  },

  connectGlowTwo: {
    position: "absolute",
    width: "320px",
    height: "320px",
    left: "-150px",
    bottom: "-210px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(17,24,32,.08) 0%, rgba(17,24,32,0) 70%)",
    pointerEvents: "none",
  },

  connectHeader: {
    position: "relative",
    zIndex: 2,
    padding: "0 2px 4px",
    maxWidth: "820px",
  },

  connectTitle: {
    margin: 0,
    color: "#111820",
    fontSize: "clamp(38px,5.4vw,58px)",
    lineHeight: .96,
    fontWeight: 950,
    letterSpacing: "-.05em",
  },

  connectTitleAccent: {
    color: "#176fae",
  },

  connectIntro: {
    maxWidth: "700px",
    margin: "12px 0 0",
    color: "#566570",
    fontSize: "13px",
    lineHeight: 1.7,
  },

  toolGrid: {
    position: "relative",
    zIndex: 2,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
    gap: "16px",
    marginTop: "24px",
    alignItems: "stretch",
  },

  toolLink: {
    display: "flex",
    color: "inherit",
    textDecoration: "none",
    minWidth: 0,
  },

  toolCard: {
    position: "relative",
    width: "100%",
    minHeight: "292px",
    padding: "24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    borderRadius: "22px",
    background:
      "linear-gradient(160deg, #ffffff 0%, #f7fafc 68%, #edf5fa 100%)",
    border: "1px solid #c7d6df",
    borderTop: "4px solid #58afe0",
    boxShadow: "0 16px 34px rgba(18,52,74,.09)",
  },

  toolCardFeatured: {
    background:
      "linear-gradient(145deg, #0a1720 0%, #103b56 58%, #176fae 135%)",
    border: "1px solid rgba(77,164,214,.40)",
    borderTop: "4px solid #71c8f4",
    boxShadow: "0 20px 46px rgba(14,48,69,.24)",
  },

  toolCardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  toolKicker: {
    color: "#176fae",
    fontSize: "8px",
    fontWeight: 950,
    letterSpacing: ".14em",
  },

  toolKickerFeatured: {
    color: "#82c9ef",
  },

  toolArrow: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "#e8f3fa",
    color: "#176fae",
    fontSize: "17px",
    fontWeight: 800,
  },

  toolArrowFeatured: {
    backgroundColor: "rgba(255,255,255,.10)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,.14)",
  },

  toolSymbol: {
    width: "48px",
    height: "48px",
    marginTop: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "15px",
    backgroundColor: "#e8f3fa",
    border: "1px solid #c8dfec",
    color: "#176fae",
    fontSize: "21px",
    fontWeight: 950,
  },

  toolSymbolFeatured: {
    backgroundColor: "rgba(255,255,255,.09)",
    border: "1px solid rgba(255,255,255,.15)",
    color: "#ffffff",
  },

  featuredBadge: {
    alignSelf: "flex-start",
    marginTop: "14px",
    padding: "6px 9px",
    borderRadius: "999px",
    backgroundColor: "rgba(255,255,255,.09)",
    border: "1px solid rgba(255,255,255,.16)",
    color: "#dff4ff",
    fontSize: "7px",
    fontWeight: 950,
    letterSpacing: ".10em",
  },

  toolTitle: {
    margin: "17px 0 0",
    color: "#111820",
    fontSize: "24px",
    lineHeight: 1.05,
    fontWeight: 950,
    letterSpacing: "-.03em",
  },

  toolTitleFeatured: {
    color: "#ffffff",
  },

  toolDescription: {
    margin: "10px 0 0",
    color: "#61707a",
    fontSize: "11px",
    lineHeight: 1.68,
  },

  toolDescriptionFeatured: {
    color: "#cedde6",
  },

  toolAction: {
    alignSelf: "flex-start",
    marginTop: "auto",
    padding: "10px 13px",
    borderRadius: "10px",
    backgroundColor: "#e8f3fa",
    border: "1px solid #c7deeb",
    color: "#176fae",
    fontSize: "9px",
    fontWeight: 950,
  },

  toolActionFeatured: {
    backgroundColor: "#ffffff",
    border: "1px solid #ffffff",
    color: "#12344a",
  },

  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "9px",
    flexWrap: "wrap",
    padding: "21px 6px 2px",
    color: "#74808a",
    fontSize: "9px",
  },

  footerBrand: {
    color: "#111820",
    fontWeight: 950,
    letterSpacing: ".08em",
  },

  footerTagline: {
    color: "#74808a",
  },
};
