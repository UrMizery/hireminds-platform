"use client";

import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import { supabase } from "../lib/supabase";

/* =========================================================
   HELPERS
========================================================= */

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* =========================================================
   PAGE
========================================================= */

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

  const [photoFile, setPhotoFile] =
    useState<File | null>(null);

  const [photoUrl, setPhotoUrl] = useState("");

  const [
    publicProfileUrl,
    setPublicProfileUrl,
  ] = useState("");

  const trackedRef = useRef(false);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

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

    if (
      authError ||
      !authData.user
    ) {
      window.location.href =
        "/sign-in";

      return;
    }

    const user =
      authData.user;

    setUserId(user.id);

    setEmail(
      user.email ||
        ""
    );

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from(
        "candidate_profiles"
      )
      .select("*")
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();

    if (
      profileError
    ) {
      console.error(
        "Profile load error:",
        profileError
      );

      setMessage(
        profileError.message
      );
    }

    if (
      profile
    ) {
      setProfileId(
        profile.id ||
          ""
      );

      setFullName(
        profile.full_name ||
          ""
      );

      setPhone(
        profile.phone ||
          ""
      );

      setEmail(
        profile.email ||
          user.email ||
          ""
      );

      setCity(
        profile.city ||
          ""
      );

      setStateName(
        profile.state ||
          ""
      );

      setBio(
        profile.bio ||
          ""
      );

      setHeadline(
        profile.headline ||
          ""
      );

      setLinkedinUrl(
        profile.linkedin_url ||
          ""
      );

      setPhotoUrl(
        profile.photo_url ||
          ""
      );

      setPublicProfileUrl(
        profile.public_profile_url ||
          ""
      );

      setReferralCode(
        profile.referral_code ||
          ""
      );

      if (
        !trackedRef.current
      ) {
        trackedRef.current =
          true;

        await supabase
          .from(
            "user_activity"
          )
          .insert({
            user_id:
              user.id,

            full_name:
              profile.full_name ||
              null,

            email:
              profile.email ||
              user.email ||
              null,

            referral_code:
              profile.referral_code ||
              null,

            event_type:
              "profile_viewed",

            tool_name:
              "profile",

            page_name:
              "/profile",
          });
      }
    } else {
      setFullName(
        user.user_metadata
          ?.full_name ||
          ""
      );

      setReferralCode(
        user.user_metadata
          ?.referral_code ||
          ""
      );
    }

    setLoading(false);
  }

  /* =======================================================
     UPLOAD PHOTO
  ======================================================= */

  async function uploadFile(
    bucket: string,
    file: File,
    folder: string
  ) {
    const fileExt =
      file.name
        .split(".")
        .pop() ||
      "file";

    const filePath =
      `${folder}/${Date.now()}.${fileExt}`;

    const {
      error,
    } = await supabase.storage
      .from(bucket)
      .upload(
        filePath,
        file,
        {
          upsert: true,
        }
      );

    if (
      error
    ) {
      throw error;
    }

    const {
      data,
    } = supabase.storage
      .from(bucket)
      .getPublicUrl(
        filePath
      );

    return data.publicUrl;
  }

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  async function handleSaveProfile() {
    setMessage("");

    if (
      !userId
    ) {
      setMessage(
        "You must be signed in."
      );

      return;
    }

    try {
      setSaving(true);

      let nextPhotoUrl =
        photoUrl;

      if (
        photoFile
      ) {
        nextPhotoUrl =
          await uploadFile(
            "profile-photos",
            photoFile,
            `${userId}/photo`
          );
      }

      const slug =
        slugify(
          fullName ||
            "career-passport"
        );

      const publicUrl =
        `${window.location.origin}/passport/${slug}-${userId.slice(
          0,
          8
        )}`;

      const payload = {
        user_id:
          userId,

        full_name:
          fullName,

        phone,

        email,

        city,

        state:
          stateName,

        bio,

        headline,

        linkedin_url:
          linkedinUrl,

        photo_url:
          nextPhotoUrl ||
          null,

        public_profile_url:
          publicUrl,
      };

      if (
        profileId
      ) {
        const {
          error,
        } = await supabase
          .from(
            "candidate_profiles"
          )
          .update(
            payload
          )
          .eq(
            "id",
            profileId
          );

        if (
          error
        ) {
          throw error;
        }
      } else {
        const {
          data,
          error,
        } = await supabase
          .from(
            "candidate_profiles"
          )
          .insert(
            payload
          )
          .select(
            "id"
          )
          .maybeSingle();

        if (
          error
        ) {
          throw error;
        }

        if (
          data?.id
        ) {
          setProfileId(
            data.id
          );
        }
      }

      setPhotoUrl(
        nextPhotoUrl
      );

      setPublicProfileUrl(
        publicUrl
      );

      setPhotoFile(
        null
      );

      setMessage(
        "✓ Profile saved successfully."
      );
    } catch (
      error: any
    ) {
      console.error(
        error
      );

      setMessage(
        error?.message ||
          "Unable to save profile."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     SIGN OUT
  ======================================================= */

  async function handleSignOut() {
    await supabase.auth.signOut();

    window.location.href =
      "/sign-in";
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {
    return (
      <main
        style={
          st.loadingPage
        }
      >
        <div
          style={
            st.loadingRing
          }
        >
          HM
        </div>

        <p
          style={
            st.loadingText
          }
        >
          Loading your profile...
        </p>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main
      style={
        st.page
      }
    >
      <div
        style={
          st.backgroundGlowOne
        }
      />

      <div
        style={
          st.backgroundGlowTwo
        }
      />

      <div
        style={
          st.backgroundGrid
        }
      />

      <div
        style={
          st.shell
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          style={
            st.header
          }
        >
          <div
            style={
              st.brandArea
            }
          >
            <div
              style={
                st.brandMark
              }
            >
              HM
            </div>

            <div>
              <strong
                style={
                  st.brandName
                }
              >
                HireMinds™
              </strong>

              <span
                style={
                  st.brandSub
                }
              >
                Career Passport
              </span>
            </div>
          </div>

          <div
            style={
              st.headerActions
            }
          >
            {publicProfileUrl ? (
              <a
                href={
                  publicProfileUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                style={
                  st.headerPassportButton
                }
              >
                View Public Profile ↗
              </a>
            ) : null}

            <button
              type="button"
              onClick={
                handleSignOut
              }
              style={
                st.signOutButton
              }
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* =================================================
            1. PROFILE IDENTITY FIRST
        ================================================= */}

        <section
          style={
            st.identityCard
          }
        >
          <div
            style={
              st.identityAccent
            }
          />

          <div
            style={
              st.photoColumn
            }
          >
            <div
              style={
                st.photoGlow
              }
            />

            {photoUrl ? (
              <img
                src={
                  photoUrl
                }
                alt="Profile"
                style={
                  st.profilePhoto
                }
              />
            ) : (
              <div
                style={
                  st.profilePlaceholder
                }
              >
                {fullName
                  ? fullName
                      .charAt(0)
                      .toUpperCase()
                  : "HM"}
              </div>
            )}

            <label
              style={
                st.updatePhoto
              }
            >
              + Update Photo

              <input
                type="file"
                accept="image/*"
                style={{
                  display:
                    "none",
                }}
                onChange={(
                  e
                ) =>
                  setPhotoFile(
                    e.target.files?.[
                      0
                    ] ||
                      null
                  )
                }
              />
            </label>

            {photoFile ? (
              <span
                style={
                  st.photoSelected
                }
              >
                {photoFile.name}
              </span>
            ) : null}
          </div>

          <div
            style={
              st.identityInfo
            }
          >
            <div
              style={
                st.identityHeader
              }
            >
              <div>
                <p
                  style={
                    st.eyebrow
                  }
                >
                  CAREER PASSPORT
                </p>

                <h1
                  style={
                    st.profileName
                  }
                >
                  {fullName ||
                    "Your Name"}
                </h1>

                <p
                  style={
                    st.profileHeadline
                  }
                >
                  {headline ||
                    "Add your professional headline"}
                </p>
              </div>

              <div
                style={
                  st.profileStatus
                }
              >
                <span
                  style={
                    st.statusDot
                  }
                />

                Profile Active
              </div>
            </div>

            <div
              style={
                st.profileMeta
              }
            >
              <div
                style={
                  st.metaChip
                }
              >
                ◉{" "}
                {[city, stateName]
                  .filter(Boolean)
                  .join(", ") ||
                  "Add Location"}
              </div>

              <div
                style={
                  st.metaChip
                }
              >
                ✉{" "}
                {email ||
                  "Add Email"}
              </div>

              {linkedinUrl ? (
                <a
                  href={
                    linkedinUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={
                    st.linkedinChip
                  }
                >
                  in LinkedIn ↗
                </a>
              ) : null}

              {referralCode ? (
                <div
                  style={
                    st.programChip
                  }
                >
                  Program:{" "}
                  {referralCode}
                </div>
              ) : null}
            </div>

            <div
              style={
                st.bioPreview
              }
            >
              <span
                style={
                  st.bioLabel
                }
              >
                PROFESSIONAL BIO
              </span>

              <p
                style={
                  st.bioText
                }
              >
                {bio ||
                  "Add a short professional bio below to introduce who you are, what you do, and where you are headed."}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            2. PROFILE EDITOR
        ================================================= */}

        <section
          style={
            st.editor
          }
        >
          <div
            style={
              st.sectionTop
            }
          >
            <div>
              <p
                style={
                  st.eyebrow
                }
              >
                YOUR PROFESSIONAL PROFILE
              </p>

              <h2
                style={
                  st.sectionTitle
                }
              >
                Build Your Professional Profile
              </h2>

              <p
                style={
                  st.sectionIntro
                }
              >
                Keep your contact information and professional identity current.
                This information helps build your Career Passport.
              </p>
            </div>

            <div
              style={
                st.smallHM
              }
            >
              HM
            </div>
          </div>

          <div
            style={
              st.formGrid
            }
          >
            <Field
              label="Full Name"
              value={
                fullName
              }
              onChange={
                setFullName
              }
              placeholder="Your full name"
            />

            <Field
              label="Phone"
              value={
                phone
              }
              onChange={
                setPhone
              }
              placeholder="Phone number"
            />

            <Field
              label="Professional Email"
              value={
                email
              }
              onChange={
                setEmail
              }
              type="email"
              placeholder="Professional email"
            />

            <Field
              label="LinkedIn"
              value={
                linkedinUrl
              }
              onChange={
                setLinkedinUrl
              }
              placeholder="LinkedIn profile URL"
            />

            <Field
              label="City"
              value={
                city
              }
              onChange={
                setCity
              }
              placeholder="City"
            />

            <Field
              label="State"
              value={
                stateName
              }
              onChange={
                setStateName
              }
              placeholder="State"
            />
          </div>

          <div
            style={
              st.wideField
            }
          >
            <Field
              label="Professional Headline"
              value={
                headline
              }
              onChange={
                setHeadline
              }
              placeholder="Example: Administrative Professional | Customer Service | Operations"
            />
          </div>

          <div
            style={
              st.wideField
            }
          >
            <TextAreaField
              label="Short Professional Bio"
              value={
                bio
              }
              onChange={
                setBio
              }
              placeholder="Tell people who you are, what you do, your strengths, and where you're headed professionally."
            />
          </div>

          <div
            style={
              st.editorBottom
            }
          >
            <div
              style={
                st.visibilityNotice
              }
            >
              <div
                style={
                  st.visibilityIcon
                }
              >
                ◇
              </div>

              <div>
                <strong
                  style={
                    st.visibilityTitle
                  }
                >
                  Career Passport Visibility
                </strong>

                <p
                  style={
                    st.visibilityText
                  }
                >
                  Your completed professional information may appear on your
                  Career Passport.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleSaveProfile
              }
              disabled={
                saving
              }
              style={{
                ...st.saveButton,

                ...(saving
                  ? st.disabledButton
                  : {}),
              }}
            >
              {saving
                ? "Saving..."
                : "Save Profile →"}
            </button>
          </div>

          {message ? (
            <div
              style={
                message.startsWith(
                  "✓"
                )
                  ? st.successMessage
                  : st.errorMessage
              }
            >
              {message}
            </div>
          ) : null}
        </section>

        {/* =================================================
            3. CONNECT & EXPLORE
        ================================================= */}

        <section
          style={
            st.connectSection
          }
        >
          <div
            style={
              st.connectHeader
            }
          >
            <div>
              <p
                style={
                  st.eyebrow
                }
              >
                HIREMINDS™
              </p>

              <h2
                style={
                  st.sectionTitle
                }
              >
                Connect & Explore
              </h2>

              <p
                style={
                  st.sectionIntro
                }
              >
                Access your career-development tools, live support,
                community spaces, and professional resources.
              </p>
            </div>
          </div>

          <div
            style={
              st.toolGrid
            }
          >
            {/* CAREER DEVELOPMENT */}

            <ToolCard
              href="/career-development-generator"
              icon="↗"
              kicker="WEEKLY DEVELOPMENT"
              title="Career Development Generator"
              description="Complete your weekly career-development activity, save your progress, and document your next step."
              action="Open Generator"
              accent="cyan"
            />

            {/* JOB LOG */}

            <ToolCard
              href="/job-log-generator"
              icon="✓"
              kicker="JOB SEARCH"
              title="Weekly Job Log"
              description="Track up to five job opportunities, applications, outcomes, and the positions you are most interested in."
              action="Open Job Log"
              accent="blue"
            />

            {/* CAREER CONNECT */}

            <ToolCard
              href="/open-room/live"
              icon="◉"
              kicker="CAREER SUPPORT"
              title="Career Connect"
              description="Request career support, manage appointments, confirm meetings, reschedule, cancel, and check in for scheduled services."
              action="Enter Career Connect"
              accent="cyan"
              badge="CAREER SERVICES"
            />

            {/* OPEN ROOM */}

            <ToolCard
              href="/open-room"
              icon="◇"
              kicker="COMMUNITY"
              title="Open Room"
              description="Step into the HireMinds community space for live conversations, connections, opportunities, updates, and resources."
              action="View Open Room"
              accent="gold"
              badge="MONTHLY"
            />

            {/* LIVE BOARD */}

            <ToolCard
              href="/live-board"
              icon="⌁"
              kicker="WHAT'S HAPPENING"
              title="Live Bulletin Board"
              description="View current opportunities, announcements, events, resources, and other updates shared through HireMinds."
              action="View Live Board"
              accent="blue"
            />
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          style={
            st.footer
          }
        >
          <div>
            <strong
              style={
                st.footerBrand
              }
            >
              HireMinds™
            </strong>

            <span
              style={
                st.footerTagline
              }
            >
              Prepare with Confidence. Build with Purpose.
            </span>
          </div>

          <span>
            Career Passport
          </span>
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div
      style={
        st.field
      }
    >
      <label
        style={
          st.label
        }
      >
        {label}
      </label>

      <input
        type={
          type
        }
        value={
          value
        }
        onChange={(
          e
        ) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        style={
          st.input
        }
      />
    </div>
  );
}

/* =========================================================
   TEXT AREA
========================================================= */

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}) {
  return (
    <div
      style={
        st.field
      }
    >
      <label
        style={
          st.label
        }
      >
        {label}
      </label>

      <textarea
        value={
          value
        }
        onChange={(
          e
        ) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        style={
          st.textarea
        }
      />
    </div>
  );
}

/* =========================================================
   TOOL CARD
========================================================= */

function ToolCard({
  href,
  icon,
  kicker,
  title,
  description,
  action,
  accent,
  badge,
}: {
  href: string;
  icon: string;
  kicker: string;
  title: string;
  description: string;
  action: string;
  accent:
    | "cyan"
    | "blue"
    | "gold";
  badge?: string;
}) {
  const iconStyle =
    accent ===
    "gold"
      ? st.goldIcon
      : accent ===
          "blue"
        ? st.blueIcon
        : st.cyanIcon;

  return (
    <Link
      href={
        href
      }
      style={
        st.toolLink
      }
    >
      <div
        style={
          st.toolCard
        }
      >
        <div
          style={
            st.toolTop
          }
        >
          <div
            style={{
              ...st.toolIcon,
              ...iconStyle,
            }}
          >
            {icon}
          </div>

          {badge ? (
            <span
              style={
                accent ===
                "gold"
                  ? st.goldBadge
                  : st.smallBadge
              }
            >
              {badge}
            </span>
          ) : (
            <span
              style={
                st.cardArrow
              }
            >
              →
            </span>
          )}
        </div>

        <div>
          <span
            style={
              st.toolKicker
            }
          >
            {kicker}
          </span>

          <h3
            style={
              st.toolTitle
            }
          >
            {title}
          </h3>

          <p
            style={
              st.toolDescription
            }
          >
            {description}
          </p>
        </div>

        <div
          style={
            st.toolFooter
          }
        >
          <span>
            {action}
          </span>

          <span>
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   STYLES
========================================================= */

const st:
  Record<
    string,
    CSSProperties
  > = {
  /* PAGE */

  page: {
    position:
      "relative",

    minHeight:
      "100vh",

    overflow:
      "hidden",

    padding:
      "24px 24px 50px",

    background:
      `
      radial-gradient(
        circle at 10% 4%,
        rgba(11, 115, 135, .13),
        transparent 25%
      ),
      radial-gradient(
        circle at 92% 12%,
        rgba(27, 82, 122, .12),
        transparent 27%
      ),
      radial-gradient(
        circle at 70% 90%,
        rgba(202, 170, 70, .035),
        transparent 30%
      ),
      linear-gradient(
        145deg,
        #050a10 0%,
        #08121c 44%,
        #09111a 70%,
        #05080d 100%
      )
      `,

    color:
      "#f6f9fc",

    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  backgroundGlowOne: {
    position:
      "fixed",

    width:
      "460px",

    height:
      "460px",

    top:
      "-220px",

    left:
      "-130px",

    borderRadius:
      "50%",

    background:
      "rgba(21, 180, 203, .055)",

    filter:
      "blur(120px)",

    pointerEvents:
      "none",
  },

  backgroundGlowTwo: {
    position:
      "fixed",

    width:
      "500px",

    height:
      "500px",

    right:
      "-220px",

    top:
      "20%",

    borderRadius:
      "50%",

    background:
      "rgba(50, 112, 162, .05)",

    filter:
      "blur(130px)",

    pointerEvents:
      "none",
  },

  backgroundGrid: {
    position:
      "fixed",

    inset:
      0,

    pointerEvents:
      "none",

    opacity:
      .035,

    backgroundImage:
      `
      linear-gradient(
        rgba(255,255,255,.05) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(255,255,255,.05) 1px,
        transparent 1px
      )
      `,

    backgroundSize:
      "72px 72px",
  },

  shell: {
    position:
      "relative",

    zIndex:
      2,

    width:
      "100%",

    maxWidth:
      "1320px",

    margin:
      "0 auto",

    display:
      "grid",

    gap:
      "20px",
  },

  /* LOADING */

  loadingPage: {
    minHeight:
      "100vh",

    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      "15px",

    background:
      "#07101a",

    color:
      "white",
  },

  loadingRing: {
    width:
      "62px",

    height:
      "62px",

    borderRadius:
      "50%",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    border:
      "1px solid rgba(34,211,238,.32)",

    background:
      "rgba(34,211,238,.06)",

    color:
      "#77e8f2",

    fontSize:
      "13px",

    fontWeight:
      950,

    boxShadow:
      "0 0 30px rgba(34,211,238,.08)",
  },

  loadingText: {
    color:
      "#8da0b0",

    fontSize:
      "11px",
  },

  /* HEADER */

  header: {
    minHeight:
      "62px",

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      "20px",

    padding:
      "2px 4px",
  },

  brandArea: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      "11px",
  },

  brandMark: {
    width:
      "39px",

    height:
      "39px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "12px",

    background:
      "rgba(23, 167, 189, .09)",

    border:
      "1px solid rgba(55, 201, 219, .23)",

    color:
      "#71dbe7",

    fontSize:
      "10px",

    fontWeight:
      950,
  },

  brandName: {
    display:
      "block",

    color:
      "#f5f8fb",

    fontSize:
      "12px",
  },

  brandSub: {
    display:
      "block",

    marginTop:
      "2px",

    color:
      "#637485",

    fontSize:
      "8px",
  },

  headerActions: {
    display:
      "flex",

    gap:
      "8px",

    flexWrap:
      "wrap",
  },

  headerPassportButton: {
    padding:
      "9px 13px",

    borderRadius:
      "999px",

    border:
      "1px solid rgba(75, 190, 205, .17)",

    background:
      "rgba(43, 158, 177, .045)",

    color:
      "#bfeaf0",

    textDecoration:
      "none",

    fontSize:
      "9px",

    fontWeight:
      800,
  },

  signOutButton: {
    padding:
      "9px 13px",

    borderRadius:
      "999px",

    border:
      "1px solid rgba(255,255,255,.09)",

    background:
      "rgba(255,255,255,.025)",

    color:
      "#c5ced6",

    cursor:
      "pointer",

    fontSize:
      "9px",

    fontWeight:
      800,
  },

  /* IDENTITY */

  identityCard: {
    position:
      "relative",

    overflow:
      "hidden",

    minHeight:
      "300px",

    display:
      "grid",

    gridTemplateColumns:
      "225px minmax(0,1fr)",

    alignItems:
      "center",

    gap:
      "32px",

    padding:
      "32px",

    borderRadius:
      "27px",

    background:
      "linear-gradient(135deg, rgba(15,29,40,.93), rgba(11,20,30,.93))",

    border:
      "1px solid rgba(139, 187, 200, .13)",

    boxShadow:
      "0 25px 70px rgba(0,0,0,.20)",
  },

  identityAccent: {
    position:
      "absolute",

    width:
      "340px",

    height:
      "340px",

    left:
      "-160px",

    top:
      "-140px",

    borderRadius:
      "50%",

    background:
      "rgba(39, 184, 203, .07)",

    filter:
      "blur(60px)",

    pointerEvents:
      "none",
  },

  photoColumn: {
    position:
      "relative",

    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    gap:
      "11px",
  },

  photoGlow: {
    position:
      "absolute",

    width:
      "180px",

    height:
      "180px",

    top:
      "10px",

    borderRadius:
      "50%",

    background:
      "rgba(29, 191, 208, .07)",

    filter:
      "blur(35px)",

    pointerEvents:
      "none",
  },

  profilePhoto: {
    position:
      "relative",

    width:
      "170px",

    height:
      "170px",

    objectFit:
      "cover",

    borderRadius:
      "50%",

    border:
      "1px solid rgba(75, 204, 219, .34)",

    padding:
      "4px",

    background:
      "#0b151f",
  },

  profilePlaceholder: {
    position:
      "relative",

    width:
      "170px",

    height:
      "170px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "50%",

    background:
      "linear-gradient(145deg, #102735, #0d1823)",

    border:
      "1px solid rgba(65, 200, 217, .34)",

    color:
      "#56dbe9",

    fontSize:
      "45px",

    fontWeight:
      950,
  },

  updatePhoto: {
    padding:
      "8px 12px",

    borderRadius:
      "999px",

    border:
      "1px solid rgba(69,196,211,.17)",

    background:
      "rgba(49,165,180,.045)",

    color:
      "#afe3e9",

    fontSize:
      "8px",

    fontWeight:
      850,

    cursor:
      "pointer",
  },

  photoSelected: {
    maxWidth:
      "190px",

    overflow:
      "hidden",

    textOverflow:
      "ellipsis",

    whiteSpace:
      "nowrap",

    color:
      "#718291",

    fontSize:
      "8px",
  },

  identityInfo: {
    minWidth:
      0,
  },

  identityHeader: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap:
      "20px",

    flexWrap:
      "wrap",
  },

  eyebrow: {
    margin:
      "0 0 6px",

    color:
      "#59c9d6",

    fontSize:
      "8px",

    fontWeight:
      950,

    letterSpacing:
      ".15em",

    textTransform:
      "uppercase",
  },

  profileName: {
    margin:
      0,

    color:
      "#f7fafc",

    fontSize:
      "clamp(2.4rem,5vw,4.6rem)",

    lineHeight:
      .95,

    letterSpacing:
      "-.05em",

    fontWeight:
      900,
  },

  profileHeadline: {
    margin:
      "13px 0 0",

    color:
      "#a9b9c6",

    fontSize:
      "14px",

    lineHeight:
      1.5,
  },

  profileStatus: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      "7px",

    padding:
      "7px 10px",

    borderRadius:
      "999px",

    background:
      "rgba(65, 183, 133, .045)",

    border:
      "1px solid rgba(81, 191, 146, .13)",

    color:
      "#8dd6b3",

    fontSize:
      "8px",

    fontWeight:
      800,
  },

  statusDot: {
    width:
      "6px",

    height:
      "6px",

    borderRadius:
      "50%",

    background:
      "#6acb9d",
  },

  profileMeta: {
    display:
      "flex",

    flexWrap:
      "wrap",

    gap:
      "8px",

    marginTop:
      "20px",
  },

  metaChip: {
    padding:
      "8px 10px",

    borderRadius:
      "10px",

    background:
      "rgba(255,255,255,.025)",

    border:
      "1px solid rgba(255,255,255,.055)",

    color:
      "#a3b0bc",

    fontSize:
      "9px",
  },

  linkedinChip: {
    padding:
      "8px 10px",

    borderRadius:
      "10px",

    background:
      "rgba(63, 130, 171, .045)",

    border:
      "1px solid rgba(79, 143, 181, .11)",

    color:
      "#a7cadf",

    textDecoration:
      "none",

    fontSize:
      "9px",
  },

  programChip: {
    padding:
      "8px 10px",

    borderRadius:
      "10px",

    background:
      "rgba(187, 157, 72, .04)",

    border:
      "1px solid rgba(187, 157, 72, .10)",

    color:
      "#c7b77e",

    fontSize:
      "9px",
  },

  bioPreview: {
    marginTop:
      "17px",

    padding:
      "15px",

    borderRadius:
      "13px",

    background:
      "rgba(1,7,12,.22)",

    border:
      "1px solid rgba(255,255,255,.045)",
  },

  bioLabel: {
    color:
      "#657887",

    fontSize:
      "7px",

    fontWeight:
      900,

    letterSpacing:
      ".13em",
  },

  bioText: {
    margin:
      "6px 0 0",

    color:
      "#91a0ad",

    fontSize:
      "10px",

    lineHeight:
      1.65,
  },

  /* EDITOR */

  editor: {
    padding:
      "29px",

    borderRadius:
      "25px",

    background:
      "linear-gradient(135deg, rgba(18,28,38,.82), rgba(11,18,26,.84))",

    border:
      "1px solid rgba(143,171,190,.11)",

    boxShadow:
      "0 22px 65px rgba(0,0,0,.17)",
  },

  sectionTop: {
    display:
      "flex",

    alignItems:
      "flex-start",

    justifyContent:
      "space-between",

    gap:
      "20px",

    marginBottom:
      "23px",
  },

  sectionTitle: {
    margin:
      0,

    color:
      "#f5f8fa",

    fontSize:
      "28px",

    lineHeight:
      1.1,

    fontWeight:
      900,

    letterSpacing:
      "-.03em",
  },

  sectionIntro: {
    maxWidth:
      "690px",

    margin:
      "8px 0 0",

    color:
      "#7f909f",

    fontSize:
      "10px",

    lineHeight:
      1.6,
  },

  smallHM: {
    width:
      "50px",

    height:
      "50px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "15px",

    border:
      "1px solid rgba(66, 194, 208, .16)",

    background:
      "rgba(40, 160, 177, .045)",

    color:
      "#69cfda",

    fontSize:
      "10px",

    fontWeight:
      950,
  },

  formGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px,1fr))",

    gap:
      "13px",
  },

  wideField: {
    marginTop:
      "14px",
  },

  field: {
    display:
      "grid",

    gap:
      "7px",
  },

  label: {
    color:
      "#b7c3cc",

    fontSize:
      "9px",

    fontWeight:
      800,
  },

  input: {
    width:
      "100%",

    padding:
      "13px 14px",

    borderRadius:
      "12px",

    border:
      "1px solid rgba(174,195,209,.11)",

    background:
      "rgba(255,255,255,.035)",

    color:
      "#f5f8fb",

    outline:
      "none",

    fontSize:
      "11px",

    boxSizing:
      "border-box",
  },

  textarea: {
    width:
      "100%",

    minHeight:
      "125px",

    padding:
      "13px 14px",

    borderRadius:
      "12px",

    border:
      "1px solid rgba(174,195,209,.11)",

    background:
      "rgba(255,255,255,.035)",

    color:
      "#f5f8fb",

    outline:
      "none",

    resize:
      "vertical",

    lineHeight:
      1.6,

    fontSize:
      "11px",

    boxSizing:
      "border-box",
  },

  editorBottom: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      "20px",

    flexWrap:
      "wrap",

    marginTop:
      "22px",

    paddingTop:
      "20px",

    borderTop:
      "1px solid rgba(255,255,255,.055)",
  },

  visibilityNotice: {
    display:
      "flex",

    alignItems:
      "flex-start",

    gap:
      "11px",

    maxWidth:
      "700px",
  },

  visibilityIcon: {
    width:
      "35px",

    height:
      "35px",

    minWidth:
      "35px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "11px",

    background:
      "rgba(46, 160, 177, .04)",

    border:
      "1px solid rgba(65,181,198,.12)",

    color:
      "#65c6d1",
  },

  visibilityTitle: {
    color:
      "#cbd5dc",

    fontSize:
      "10px",
  },

  visibilityText: {
    margin:
      "4px 0 0",

    color:
      "#748391",

    fontSize:
      "8px",

    lineHeight:
      1.5,
  },

  saveButton: {
    minWidth:
      "160px",

    padding:
      "12px 18px",

    border:
      "none",

    borderRadius:
      "999px",

    background:
      "linear-gradient(135deg, #5ed2dc, #83cbd2 62%, #c9b56a)",

    color:
      "#061016",

    cursor:
      "pointer",

    fontSize:
      "10px",

    fontWeight:
      950,

    boxShadow:
      "0 9px 26px rgba(55, 174, 189, .08)",
  },

  disabledButton: {
    opacity:
      .45,

    cursor:
      "not-allowed",
  },

  successMessage: {
    marginTop:
      "14px",

    padding:
      "11px 13px",

    borderRadius:
      "11px",

    color:
      "#91d6b1",

    background:
      "rgba(70,171,121,.045)",

    border:
      "1px solid rgba(70,171,121,.12)",

    fontSize:
      "9px",
  },

  errorMessage: {
    marginTop:
      "14px",

    padding:
      "11px 13px",

    borderRadius:
      "11px",

    color:
      "#dcb98b",

    background:
      "rgba(185,136,69,.04)",

    border:
      "1px solid rgba(185,136,69,.12)",

    fontSize:
      "9px",
  },

  /* CONNECT */

  connectSection: {
    padding:
      "10px 2px 0",
  },

  connectHeader: {
    padding:
      "7px 3px 4px",
  },

  toolGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(290px,1fr))",

    gap:
      "12px",

    marginTop:
      "15px",
  },

  toolLink: {
    color:
      "inherit",

    textDecoration:
      "none",
  },

  toolCard: {
    minHeight:
      "215px",

    padding:
      "20px",

    display:
      "flex",

    flexDirection:
      "column",

    justifyContent:
      "space-between",

    borderRadius:
      "19px",

    background:
      "linear-gradient(145deg, rgba(15,27,37,.84), rgba(9,16,23,.88))",

    border:
      "1px solid rgba(145,176,194,.10)",

    boxShadow:
      "0 16px 45px rgba(0,0,0,.16)",
  },

  toolTop: {
    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap:
      "15px",
  },

  toolIcon: {
    width:
      "42px",

    height:
      "42px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "13px",

    fontSize:
      "17px",

    fontWeight:
      900,
  },

  cyanIcon: {
    background:
      "rgba(49,178,194,.065)",

    border:
      "1px solid rgba(61,191,206,.16)",

    color:
      "#68cfdb",
  },

  blueIcon: {
    background:
      "rgba(55,111,153,.065)",

    border:
      "1px solid rgba(69,128,169,.15)",

    color:
      "#8bb8d5",
  },

  goldIcon: {
    background:
      "rgba(185,155,69,.06)",

    border:
      "1px solid rgba(189,159,78,.14)",

    color:
      "#c8b676",
  },

  cardArrow: {
    color:
      "#647686",

    fontSize:
      "14px",
  },

  smallBadge: {
    padding:
      "5px 7px",

    borderRadius:
      "999px",

    color:
      "#76cbd4",

    background:
      "rgba(63,167,180,.04)",

    border:
      "1px solid rgba(63,167,180,.11)",

    fontSize:
      "7px",

    fontWeight:
      900,
  },

  goldBadge: {
    padding:
      "5px 7px",

    borderRadius:
      "999px",

    color:
      "#c5b476",

    background:
      "rgba(184,154,72,.04)",

    border:
      "1px solid rgba(184,154,72,.11)",

    fontSize:
      "7px",

    fontWeight:
      900,
  },

  toolKicker: {
    display:
      "block",

    marginTop:
      "18px",

    color:
      "#617584",

    fontSize:
      "7px",

    fontWeight:
      950,

    letterSpacing:
      ".13em",
  },

  toolTitle: {
    margin:
      "6px 0 0",

    color:
      "#f4f7f9",

    fontSize:
      "18px",

    lineHeight:
      1.2,

    fontWeight:
      900,
  },

  toolDescription: {
    margin:
      "9px 0 0",

    color:
      "#81909e",

    fontSize:
      "9px",

    lineHeight:
      1.6,
  },

  toolFooter: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      "12px",

    marginTop:
      "18px",

    paddingTop:
      "12px",

    borderTop:
      "1px solid rgba(255,255,255,.045)",

    color:
      "#b6c3cc",

    fontSize:
      "8px",

    fontWeight:
      800,
  },

  /* FOOTER */

  footer: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      "20px",

    padding:
      "24px 5px 3px",

    color:
      "#586a78",

    fontSize:
      "8px",
  },

  footerBrand: {
    color:
      "#8798a4",
  },

  footerTagline: {
    marginLeft:
      "10px",

    color:
      "#536572",
  },
};
