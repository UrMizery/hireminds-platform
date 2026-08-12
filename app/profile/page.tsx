"use client";

import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import { supabase } from "../lib/supabase";

import ConnectExplore from "../components/ConnectExplore";


/* =========================================================
   HELPERS
========================================================= */

function slugify(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );
}


/* =========================================================
   PAGE
========================================================= */

export default function ProfilePage() {
  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");


  const [
    userId,
    setUserId,
  ] =
    useState("");

  const [
    profileId,
    setProfileId,
  ] =
    useState("");


  const [
    fullName,
    setFullName,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    city,
    setCity,
  ] =
    useState("");

  const [
    stateName,
    setStateName,
  ] =
    useState("");

  const [
    bio,
    setBio,
  ] =
    useState("");

  const [
    headline,
    setHeadline,
  ] =
    useState("");

  const [
    linkedinUrl,
    setLinkedinUrl,
  ] =
    useState("");


  const [
    photoFile,
    setPhotoFile,
  ] =
    useState<File | null>(
      null
    );

  const [
    photoUrl,
    setPhotoUrl,
  ] =
    useState("");


  const [
    publicProfileUrl,
    setPublicProfileUrl,
  ] =
    useState("");


  const trackedRef =
    useRef(false);


  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(
    () => {
      async function loadProfile() {
        const {
          data:
            authData,

          error:
            authError,
        } =
          await supabase.auth.getUser();


        if (
          authError ||
          !authData.user
        ) {
          window.location.href =
            "/sign-in";

          return;
        }


        const {
          data:
            profile,

          error:
            profileError,
        } =
          await supabase
            .from(
              "candidate_profiles"
            )
            .select("*")
            .eq(
              "user_id",
              authData.user.id
            )
            .single();


        if (
          profileError ||
          !profile
        ) {
          setMessage(
            profileError?.message ||
              "Profile not found."
          );

          setLoading(false);

          return;
        }


        setUserId(
          authData.user.id ||
            ""
        );

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
            authData.user.email ||
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
                authData.user.id,

              full_name:
                profile.full_name ||
                null,

              email:
                profile.email ||
                authData.user.email ||
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


        setLoading(false);
      }


      loadProfile();
    },
    []
  );


  /* =======================================================
     FILE UPLOAD
  ======================================================= */

  async function uploadFile(
    bucket:
      string,

    file:
      File,

    folder:
      string
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
    } =
      await supabase.storage
        .from(
          bucket
        )
        .upload(
          filePath,
          file,
          {
            upsert:
              true,
          }
        );


    if (
      error
    ) {
      throw error;
    }


    const {
      data,
    } =
      supabase.storage
        .from(
          bucket
        )
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
        } =
          await supabase
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
        } =
          await supabase
            .from(
              "candidate_profiles"
            )
            .insert(
              payload
            )
            .select()
            .single();


        if (
          error
        ) {
          throw error;
        }


        setProfileId(
          data.id
        );
      }


      setPhotoUrl(
        nextPhotoUrl
      );

      setPublicProfileUrl(
        publicUrl
      );


      setMessage(
        "✓ Profile saved successfully."
      );
    } catch (
      err:
        any
    ) {
      setMessage(
        err.message ||
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
          st.page
        }
      >
        <div
          style={
            st.loadingWrap
          }
        >
          <div
            style={
              st.loadingOrb
            }
          />

          <p
            style={
              st.loadingText
            }
          >
            Loading your Career Passport...
          </p>
        </div>
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
      {/* BACKGROUND EFFECTS */}

      <div
        style={
          st.orbOne
        }
      />

      <div
        style={
          st.orbTwo
        }
      />

      <div
        style={
          st.gridOverlay
        }
      />


      <div
        style={
          st.shell
        }
      >
        {/* =================================================
            TOP NAV
        ================================================= */}

        <nav
          style={
            st.topNav
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
              <p
                style={
                  st.brandName
                }
              >
                HireMinds™
              </p>

              <p
                style={
                  st.brandSub
                }
              >
                Career Passport
              </p>
            </div>
          </div>


          <div
            style={
              st.navActions
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
                  st.navProfileButton
                }
              >
                View Passport ↗
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
        </nav>


        {/* =================================================
            HERO
        ================================================= */}

        <section
          style={
            st.hero
          }
        >
          <div
            style={
              st.heroGlow
            }
          />


          <div
            style={
              st.heroContent
            }
          >
            <div
              style={
                st.heroBadge
              }
            >
              <span
                style={
                  st.heroBadgeDot
                }
              />

              CAREER PASSPORT
            </div>


            <h1
              style={
                st.title
              }
            >
              Your professional
              <br />

              <span
                style={
                  st.titleGradient
                }
              >
                command center.
              </span>
            </h1>


            <p
              style={
                st.subtitle
              }
            >
              Build your professional identity, manage your
              Career Passport, access career tools, and stay
              connected to your next move.
            </p>


            <div
              style={
                st.heroStats
              }
            >
              <div
                style={
                  st.heroStat
                }
              >
                <span
                  style={
                    st.heroStatLabel
                  }
                >
                  PROFILE
                </span>

                <strong
                  style={
                    st.heroStatValue
                  }
                >
                  Active
                </strong>
              </div>


              <div
                style={
                  st.heroStat
                }
              >
                <span
                  style={
                    st.heroStatLabel
                  }
                >
                  LOCATION
                </span>

                <strong
                  style={
                    st.heroStatValue
                  }
                >
                  {[city, stateName]
                    .filter(
                      Boolean
                    )
                    .join(
                      ", "
                    ) ||
                    "Add Location"}
                </strong>
              </div>


              <div
                style={
                  st.heroStat
                }
              >
                <span
                  style={
                    st.heroStatLabel
                  }
                >
                  PASSPORT
                </span>

                <strong
                  style={
                    st.heroStatValue
                  }
                >
                  {publicProfileUrl
                    ? "Live"
                    : "Build"}
                </strong>
              </div>
            </div>
          </div>
        </section>


        {/* =================================================
            PROFILE IDENTITY
        ================================================= */}

        <section
          style={
            st.identitySection
          }
        >
          <div
            style={
              st.profileVisual
            }
          >
            <div
              style={
                st.avatarGlow
              }
            />


            {photoUrl ? (
              <img
                src={
                  photoUrl
                }
                alt="Profile"
                style={
                  st.avatar
                }
              />
            ) : (
              <div
                style={
                  st.avatarPlaceholder
                }
              >
                <span
                  style={
                    st.avatarInitial
                  }
                >
                  {fullName
                    ? fullName
                        .charAt(
                          0
                        )
                        .toUpperCase()
                    : "HM"}
                </span>
              </div>
            )}


            <label
              style={
                st.photoUploadButton
              }
            >
              + Update Photo

              <input
                type="file"
                accept="image/*"
                onChange={
                  (
                    e
                  ) =>
                    setPhotoFile(
                      e.target.files?.[
                        0
                      ] ||
                        null
                    )
                }
                style={{
                  display:
                    "none",
                }}
              />
            </label>
          </div>


          <div
            style={
              st.identityContent
            }
          >
            <div
              style={
                st.identityTop
              }
            >
              <div>
                <p
                  style={
                    st.identityLabel
                  }
                >
                  PROFESSIONAL IDENTITY
                </p>


                <h2
                  style={
                    st.namePreview
                  }
                >
                  {fullName ||
                    "Your Name"}
                </h2>


                <p
                  style={
                    st.headlinePreview
                  }
                >
                  {headline ||
                    "Add your professional headline"}
                </p>
              </div>


              <div
                style={
                  st.passportChip
                }
              >
                <span
                  style={
                    st.passportChipDot
                  }
                />

                Career Passport
              </div>
            </div>


            <div
              style={
                st.identityMeta
              }
            >
              <div
                style={
                  st.metaItem
                }
              >
                <span>
                  ◉
                </span>

                {[city, stateName]
                  .filter(
                    Boolean
                  )
                  .join(
                    ", "
                  ) ||
                  "Add location"}
              </div>


              <div
                style={
                  st.metaItem
                }
              >
                <span>
                  ✉
                </span>

                {email ||
                  "Add email"}
              </div>


              {linkedinUrl ? (
                <a
                  href={
                    linkedinUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={
                    st.metaLink
                  }
                >
                  <span>
                    in
                  </span>

                  LinkedIn Profile ↗
                </a>
              ) : null}
            </div>


            <div
              style={
                st.identityBio
              }
            >
              {bio ||
                "Your professional bio will appear here once added below."}
            </div>
          </div>
        </section>


        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section>
          <div
            style={
              st.sectionHeader
            }
          >
            <div>
              <p
                style={
                  st.sectionEyebrow
                }
              >
                YOUR WORKSPACE
              </p>

              <h2
                style={
                  st.sectionTitle
                }
              >
                Keep building your edge.
              </h2>
            </div>


            <p
              style={
                st.sectionDescription
              }
            >
              Jump into the tools and spaces designed to keep
              your career development moving.
            </p>
          </div>


          <div
            style={
              st.quickGrid
            }
          >
            {/* CAREER DEVELOPMENT */}

            <Link
              href="/career-development-generator"
              style={
                st.quickCardLink
              }
            >
              <div
                style={{
                  ...st.quickCard,

                  ...st.quickCardCareer,
                }}
              >
                <div
                  style={
                    st.quickCardTop
                  }
                >
                  <div
                    style={{
                      ...st.quickIcon,

                      ...st.quickIconCareer,
                    }}
                  >
                    ↗
                  </div>


                  <span
                    style={
                      st.quickArrow
                    }
                  >
                    →
                  </span>
                </div>


                <div>
                  <p
                    style={
                      st.quickKicker
                    }
                  >
                    WEEKLY DEVELOPMENT
                  </p>

                  <h3
                    style={
                      st.quickTitle
                    }
                  >
                    Career Development Generator
                  </h3>

                  <p
                    style={
                      st.quickText
                    }
                  >
                    Complete your weekly career development
                    activity, save drafts, document progress,
                    and track your next step.
                  </p>
                </div>


                <div
                  style={
                    st.quickFooter
                  }
                >
                  <span>
                    Open Generator
                  </span>

                  <span>
                    →
                  </span>
                </div>
              </div>
            </Link>


            {/* CAREER CONNECT */}

            <Link
              href="/open-room/live"
              style={
                st.quickCardLink
              }
            >
              <div
                style={{
                  ...st.quickCard,

                  ...st.quickCardConnect,
                }}
              >
                <div
                  style={
                    st.quickCardTop
                  }
                >
                  <div
                    style={{
                      ...st.quickIcon,

                      ...st.quickIconConnect,
                    }}
                  >
                    ◉
                  </div>


                  <span
                    style={
                      st.liveIndicator
                    }
                  >
                    ● LIVE
                  </span>
                </div>


                <div>
                  <p
                    style={
                      st.quickKicker
                    }
                  >
                    CAREER SUPPORT
                  </p>

                  <h3
                    style={
                      st.quickTitle
                    }
                  >
                    Career Connect
                  </h3>

                  <p
                    style={
                      st.quickText
                    }
                  >
                    Manage appointments, request career support,
                    check in for sessions, and connect live.
                  </p>
                </div>


                <div
                  style={
                    st.quickFooter
                  }
                >
                  <span>
                    Enter Career Connect
                  </span>

                  <span>
                    →
                  </span>
                </div>
              </div>
            </Link>


            {/* PUBLIC PASSPORT */}

            {publicProfileUrl ? (
              <a
                href={
                  publicProfileUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                style={
                  st.quickCardLink
                }
              >
                <div
                  style={{
                    ...st.quickCard,

                    ...st.quickCardPassport,
                  }}
                >
                  <div
                    style={
                      st.quickCardTop
                    }
                  >
                    <div
                      style={{
                        ...st.quickIcon,

                        ...st.quickIconPassport,
                      }}
                    >
                      ◇
                    </div>

                    <span
                      style={
                        st.quickArrow
                      }
                    >
                      ↗
                    </span>
                  </div>


                  <div>
                    <p
                      style={
                        st.quickKicker
                      }
                    >
                      PUBLIC PROFILE
                    </p>

                    <h3
                      style={
                        st.quickTitle
                      }
                    >
                      Career Passport
                    </h3>

                    <p
                      style={
                        st.quickText
                      }
                    >
                      Preview the professional profile employers
                      and approved viewers can see.
                    </p>
                  </div>


                  <div
                    style={
                      st.quickFooter
                    }
                  >
                    <span>
                      View Passport
                    </span>

                    <span>
                      ↗
                    </span>
                  </div>
                </div>
              </a>
            ) : (
              <div
                style={{
                  ...st.quickCard,

                  ...st.quickCardPassport,
                }}
              >
                <div
                  style={
                    st.quickCardTop
                  }
                >
                  <div
                    style={{
                      ...st.quickIcon,

                      ...st.quickIconPassport,
                    }}
                  >
                    ◇
                  </div>
                </div>


                <div>
                  <p
                    style={
                      st.quickKicker
                    }
                  >
                    PUBLIC PROFILE
                  </p>

                  <h3
                    style={
                      st.quickTitle
                    }
                  >
                    Career Passport
                  </h3>

                  <p
                    style={
                      st.quickText
                    }
                  >
                    Save your profile to generate and activate
                    your public Career Passport.
                  </p>
                </div>


                <div
                  style={
                    st.quickFooter
                  }
                >
                  <span>
                    Complete Profile
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>


        {/* =================================================
            PROFILE EDITOR
        ================================================= */}

        <section
          style={
            st.editorSection
          }
        >
          <div
            style={
              st.editorHeader
            }
          >
            <div>
              <p
                style={
                  st.sectionEyebrow
                }
              >
                PROFILE EDITOR
              </p>

              <h2
                style={
                  st.editorTitle
                }
              >
                Shape how you show up.
              </h2>

              <p
                style={
                  st.editorSubtitle
                }
              >
                Keep your professional identity current. The
                information below powers your Career Passport.
              </p>
            </div>


            <div
              style={
                st.editorAccent
              }
            >
              <span>
                HM
              </span>
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
              label="Email"
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
              st.largeField
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
              placeholder="Example: Recruiter | Workforce Development | Employer Relations"
            />
          </div>


          <div
            style={
              st.largeField
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
              placeholder="Write a short professional bio that tells people who you are, what you do, and where you're headed."
            />
          </div>


          <div
            style={
              st.editorFooter
            }
          >
            <div
              style={
                st.publicNote
              }
            >
              <div
                style={
                  st.publicNoteIcon
                }
              >
                ◇
              </div>

              <div>
                <strong
                  style={
                    st.publicNoteTitle
                  }
                >
                  Career Passport Visibility
                </strong>

                <p
                  style={
                    st.publicNoteText
                  }
                >
                  Your photo, headline, location, LinkedIn,
                  and other completed profile information may
                  appear on your Career Passport.
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
                ...st.primaryButton,

                ...(saving
                  ? st.primaryButtonDisabled
                  : {}),
              }}
            >
              {saving
                ? "Saving Profile..."
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
            CONNECT / EXPLORE
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
            <p
              style={
                st.sectionEyebrow
              }
            >
              DISCOVER MORE
            </p>

            <h2
              style={
                st.sectionTitle
              }
            >
              Explore HireMinds.
            </h2>
          </div>


          <ConnectExplore />
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
            <strong>
              HireMinds™
            </strong>

            <span>
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
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;

  placeholder?:
    string;

  type?:
    string;
}) {
  return (
    <div
      style={
        st.fieldWrap
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
        onChange={
          (
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
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;

  placeholder?:
    string;
}) {
  return (
    <div
      style={
        st.fieldWrap
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
        onChange={
          (
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
   GLASS
========================================================= */

const glass:
  CSSProperties =
{
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))",

  border:
    "1px solid rgba(255,255,255,0.09)",

  boxShadow:
    "0 25px 80px rgba(0,0,0,0.28)",

  backdropFilter:
    "blur(22px)",
};


/* =========================================================
   STYLES
========================================================= */

const st:
  Record<
    string,
    CSSProperties
  > =
{
  page: {
    position:
      "relative",

    minHeight:
      "100vh",

    overflow:
      "hidden",

    background:
      `
      radial-gradient(
        circle at 15% 10%,
        rgba(0,229,255,.12),
        transparent 25%
      ),
      radial-gradient(
        circle at 88% 18%,
        rgba(100,80,255,.13),
        transparent 24%
      ),
      radial-gradient(
        circle at 70% 85%,
        rgba(255,210,73,.06),
        transparent 28%
      ),
      linear-gradient(
        145deg,
        #03050a 0%,
        #07101b 42%,
        #070912 70%,
        #030408 100%
      )
      `,

    color:
      "#f8fafc",

    padding:
      "24px 24px 60px",

    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },


  orbOne: {
    position:
      "fixed",

    width:
      "420px",

    height:
      "420px",

    top:
      "-180px",

    right:
      "-100px",

    borderRadius:
      "50%",

    background:
      "rgba(0,229,255,.08)",

    filter:
      "blur(110px)",

    pointerEvents:
      "none",
  },


  orbTwo: {
    position:
      "fixed",

    width:
      "500px",

    height:
      "500px",

    bottom:
      "-250px",

    left:
      "-200px",

    borderRadius:
      "50%",

    background:
      "rgba(120,80,255,.07)",

    filter:
      "blur(120px)",

    pointerEvents:
      "none",
  },


  gridOverlay: {
    position:
      "fixed",

    inset:
      0,

    opacity:
      .09,

    pointerEvents:
      "none",

    backgroundImage:
      `
      linear-gradient(
        rgba(255,255,255,.045) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(255,255,255,.045) 1px,
        transparent 1px
      )
      `,

    backgroundSize:
      "70px 70px",

    maskImage:
      "linear-gradient(to bottom, black, transparent 80%)",
  },


  loadingWrap: {
    minHeight:
      "80vh",

    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      "18px",
  },


  loadingOrb: {
    width:
      "58px",

    height:
      "58px",

    borderRadius:
      "50%",

    border:
      "2px solid rgba(16,243,255,.16)",

    boxShadow:
      "0 0 35px rgba(16,243,255,.25)",

    background:
      "radial-gradient(circle, #10f3ff 0%, rgba(16,243,255,.1) 40%, transparent 72%)",
  },


  loadingText: {
    color:
      "#a9b8c7",

    fontSize:
      "13px",

    letterSpacing:
      ".05em",
  },


  shell: {
    position:
      "relative",

    zIndex:
      2,

    maxWidth:
      "1380px",

    margin:
      "0 auto",

    display:
      "grid",

    gap:
      "24px",
  },


  /* =======================================================
     NAV
  ======================================================= */

  topNav: {
    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap:
      "18px",

    padding:
      "10px 4px",
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

    background:
      "linear-gradient(135deg, rgba(16,243,255,.18), rgba(85,80,255,.15))",

    border:
      "1px solid rgba(16,243,255,.25)",

    color:
      "#10f3ff",

    fontSize:
      "12px",

    fontWeight:
      950,

    letterSpacing:
      ".04em",

    boxShadow:
      "0 0 25px rgba(16,243,255,.08)",
  },


  brandName: {
    margin:
      0,

    color:
      "white",

    fontSize:
      "13px",

    fontWeight:
      900,
  },


  brandSub: {
    margin:
      "2px 0 0",

    color:
      "#748293",

    fontSize:
      "9px",
  },


  navActions: {
    display:
      "flex",

    gap:
      "9px",

    flexWrap:
      "wrap",
  },


  navProfileButton: {
    padding:
      "10px 14px",

    borderRadius:
      "999px",

    border:
      "1px solid rgba(16,243,255,.18)",

    background:
      "rgba(16,243,255,.055)",

    color:
      "#c5fbff",

    textDecoration:
      "none",

    fontSize:
      "10px",

    fontWeight:
      850,
  },


  signOutButton: {
    padding:
      "10px 14px",

    borderRadius:
      "999px",

    border:
      "1px solid rgba(255,255,255,.1)",

    background:
      "rgba(255,255,255,.035)",

    color:
      "#d9e1ea",

    fontSize:
      "10px",

    fontWeight:
      800,

    cursor:
      "pointer",
  },


  /* =======================================================
     HERO
  ======================================================= */

  hero: {
    ...glass,

    position:
      "relative",

    overflow:
      "hidden",

    minHeight:
      "410px",

    display:
      "flex",

    alignItems:
      "center",

    padding:
      "50px",

    borderRadius:
      "36px",
  },


  heroGlow: {
    position:
      "absolute",

    width:
      "520px",

    height:
      "520px",

    top:
      "-190px",

    right:
      "-100px",

    borderRadius:
      "50%",

    background:
      "radial-gradient(circle, rgba(16,243,255,.15), rgba(73,80,255,.06), transparent 68%)",

    pointerEvents:
      "none",
  },


  heroContent: {
    position:
      "relative",

    zIndex:
      1,

    maxWidth:
      "950px",
  },


  heroBadge: {
    width:
      "fit-content",

    display:
      "flex",

    alignItems:
      "center",

    gap:
      "8px",

    marginBottom:
      "18px",

    padding:
      "8px 12px",

    borderRadius:
      "999px",

    background:
      "rgba(16,243,255,.055)",

    border:
      "1px solid rgba(16,243,255,.15)",

    color:
      "#9efaff",

    fontSize:
      "9px",

    fontWeight:
      900,

    letterSpacing:
      ".14em",
  },


  heroBadgeDot: {
    width:
      "7px",

    height:
      "7px",

    borderRadius:
      "50%",

    background:
      "#10f3ff",

    boxShadow:
      "0 0 10px #10f3ff",
  },


  title: {
    margin:
      0,

    color:
      "white",

    fontSize:
      "clamp(3rem, 6vw, 6rem)",

    lineHeight:
      ".94",

    letterSpacing:
      "-.055em",

    fontWeight:
      900,
  },


  titleGradient: {
    background:
      "linear-gradient(90deg, #10f3ff 0%, #8feaff 43%, #ffd249 100%)",

    WebkitBackgroundClip:
      "text",

    WebkitTextFillColor:
      "transparent",
  },


  subtitle: {
    maxWidth:
      "760px",

    margin:
      "24px 0 0",

    color:
      "#aebbc9",

    fontSize:
      "15px",

    lineHeight:
      1.75,
  },


  heroStats: {
    display:
      "flex",

    gap:
      "11px",

    flexWrap:
      "wrap",

    marginTop:
      "32px",
  },


  heroStat: {
    minWidth:
      "150px",

    padding:
      "13px 15px",

    borderRadius:
      "14px",

    background:
      "rgba(0,0,0,.18)",

    border:
      "1px solid rgba(255,255,255,.065)",

    display:
      "grid",

    gap:
      "4px",
  },


  heroStatLabel: {
    color:
      "#6f7f90",

    fontSize:
      "7px",

    fontWeight:
      900,

    letterSpacing:
      ".14em",
  },


  heroStatValue: {
    color:
      "#eaf7ff",

    fontSize:
      "11px",
  },


  /* =======================================================
     IDENTITY
  ======================================================= */

  identitySection: {
    ...glass,

    display:
      "grid",

    gridTemplateColumns:
      "245px 1fr",

    gap:
      "34px",

    padding:
      "30px",

    borderRadius:
      "30px",

    alignItems:
      "center",
  },


  profileVisual: {
    position:
      "relative",

    minHeight:
      "230px",

    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      "13px",
  },


  avatarGlow: {
    position:
      "absolute",

    width:
      "190px",

    height:
      "190px",

    borderRadius:
      "50%",

    background:
      "rgba(16,243,255,.11)",

    filter:
      "blur(38px)",

    pointerEvents:
      "none",
  },


  avatar: {
    position:
      "relative",

    zIndex:
      1,

    width:
      "185px",

    height:
      "185px",

    objectFit:
      "cover",

    borderRadius:
      "50%",

    border:
      "2px solid rgba(16,243,255,.35)",

    padding:
      "4px",

    background:
      "#08101a",

    boxShadow:
      "0 0 35px rgba(16,243,255,.1)",
  },


  avatarPlaceholder: {
    position:
      "relative",

    zIndex:
      1,

    width:
      "185px",

    height:
      "185px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "50%",

    background:
      "linear-gradient(135deg, rgba(16,243,255,.11), rgba(87,70,255,.08))",

    border:
      "2px solid rgba(16,243,255,.25)",

    boxShadow:
      "0 0 35px rgba(16,243,255,.08)",
  },


  avatarInitial: {
    fontSize:
      "52px",

    fontWeight:
      950,

    color:
      "#10f3ff",
  },


  photoUploadButton: {
    position:
      "relative",

    zIndex:
      2,

    padding:
      "9px 13px",

    borderRadius:
      "999px",

    background:
      "rgba(16,243,255,.06)",

    border:
      "1px solid rgba(16,243,255,.16)",

    color:
      "#c7fbff",

    fontSize:
      "9px",

    fontWeight:
      850,

    cursor:
      "pointer",
  },


  identityContent: {
    minWidth:
      0,
  },


  identityTop: {
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


  identityLabel: {
    margin:
      "0 0 7px",

    color:
      "#10f3ff",

    fontSize:
      "8px",

    fontWeight:
      900,

    letterSpacing:
      ".14em",
  },


  namePreview: {
    margin:
      0,

    color:
      "white",

    fontSize:
      "clamp(2rem, 4vw, 3.5rem)",

    fontWeight:
      900,

    lineHeight:
      1,

    letterSpacing:
      "-.04em",
  },


  headlinePreview: {
    margin:
      "12px 0 0",

    color:
      "#bfccd9",

    fontSize:
      "15px",

    lineHeight:
      1.5,
  },


  passportChip: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      "7px",

    padding:
      "8px 11px",

    borderRadius:
      "999px",

    background:
      "rgba(34,197,94,.05)",

    border:
      "1px solid rgba(34,197,94,.13)",

    color:
      "#91efaf",

    fontSize:
      "9px",

    fontWeight:
      850,
  },


  passportChipDot: {
    width:
      "6px",

    height:
      "6px",

    borderRadius:
      "50%",

    background:
      "#39e87b",

    boxShadow:
      "0 0 9px #39e87b",
  },


  identityMeta: {
    display:
      "flex",

    gap:
      "9px",

    flexWrap:
      "wrap",

    marginTop:
      "22px",
  },


  metaItem: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      "7px",

    padding:
      "9px 11px",

    borderRadius:
      "11px",

    background:
      "rgba(255,255,255,.03)",

    border:
      "1px solid rgba(255,255,255,.06)",

    color:
      "#aeb9c7",

    fontSize:
      "10px",
  },


  metaLink: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      "7px",

    padding:
      "9px 11px",

    borderRadius:
      "11px",

    background:
      "rgba(80,120,255,.055)",

    border:
      "1px solid rgba(80,120,255,.13)",

    color:
      "#aebfff",

    textDecoration:
      "none",

    fontSize:
      "10px",
  },


  identityBio: {
    marginTop:
      "18px",

    padding:
      "16px 17px",

    borderRadius:
      "15px",

    background:
      "rgba(0,0,0,.16)",

    border:
      "1px solid rgba(255,255,255,.055)",

    color:
      "#99a7b5",

    fontSize:
      "11px",

    lineHeight:
      1.65,
  },


  /* =======================================================
     SECTION HEADER
  ======================================================= */

  sectionHeader: {
    display:
      "flex",

    alignItems:
      "flex-end",

    justifyContent:
      "space-between",

    gap:
      "20px",

    flexWrap:
      "wrap",

    padding:
      "12px 5px 3px",
  },


  sectionEyebrow: {
    margin:
      "0 0 6px",

    color:
      "#10f3ff",

    fontSize:
      "8px",

    fontWeight:
      900,

    letterSpacing:
      ".16em",
  },


  sectionTitle: {
    margin:
      0,

    color:
      "white",

    fontSize:
      "30px",

    fontWeight:
      900,

    letterSpacing:
      "-.025em",
  },


  sectionDescription: {
    maxWidth:
      "470px",

    margin:
      0,

    color:
      "#7f8d9c",

    fontSize:
      "10px",

    lineHeight:
      1.6,
  },


  /* =======================================================
     QUICK CARDS
  ======================================================= */

  quickGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",

    gap:
      "14px",

    marginTop:
      "15px",
  },


  quickCardLink: {
    color:
      "inherit",

    textDecoration:
      "none",
  },


  quickCard: {
    position:
      "relative",

    minHeight:
      "270px",

    padding:
      "23px",

    display:
      "flex",

    flexDirection:
      "column",

    justifyContent:
      "space-between",

    borderRadius:
      "24px",

    overflow:
      "hidden",

    boxShadow:
      "0 20px 60px rgba(0,0,0,.22)",
  },


  quickCardCareer: {
    background:
      "linear-gradient(145deg, rgba(16,243,255,.12), rgba(7,14,24,.88) 55%, rgba(255,210,73,.045))",

    border:
      "1px solid rgba(16,243,255,.20)",
  },


  quickCardConnect: {
    background:
      "linear-gradient(145deg, rgba(94,70,255,.14), rgba(7,12,23,.88) 55%, rgba(16,243,255,.055))",

    border:
      "1px solid rgba(114,100,255,.22)",
  },


  quickCardPassport: {
    background:
      "linear-gradient(145deg, rgba(255,210,73,.09), rgba(9,12,19,.90) 55%, rgba(16,243,255,.04))",

    border:
      "1px solid rgba(255,210,73,.16)",
  },


  quickCardTop: {
    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",
  },


  quickIcon: {
    width:
      "48px",

    height:
      "48px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "15px",

    fontSize:
      "21px",

    fontWeight:
      900,
  },


  quickIconCareer: {
    background:
      "rgba(16,243,255,.09)",

    border:
      "1px solid rgba(16,243,255,.2)",

    color:
      "#10f3ff",
  },


  quickIconConnect: {
    background:
      "rgba(115,100,255,.1)",

    border:
      "1px solid rgba(115,100,255,.2)",

    color:
      "#b4adff",
  },


  quickIconPassport: {
    background:
      "rgba(255,210,73,.08)",

    border:
      "1px solid rgba(255,210,73,.18)",

    color:
      "#ffd249",
  },


  quickArrow: {
    color:
      "#8190a0",

    fontSize:
      "18px",
  },


  liveIndicator: {
    color:
      "#69ef96",

    fontSize:
      "8px",

    fontWeight:
      900,

    letterSpacing:
      ".08em",
  },


  quickKicker: {
    margin:
      "0 0 8px",

    color:
      "#8491a0",

    fontSize:
      "7px",

    fontWeight:
      900,

    letterSpacing:
      ".14em",
  },


  quickTitle: {
    margin:
      0,

    color:
      "white",

    fontSize:
      "21px",

    fontWeight:
      900,

    lineHeight:
      1.15,
  },


  quickText: {
    margin:
      "11px 0 0",

    color:
      "#8f9ca9",

    fontSize:
      "10px",

    lineHeight:
      1.65,
  },


  quickFooter: {
    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap:
      "12px",

    marginTop:
      "20px",

    paddingTop:
      "14px",

    borderTop:
      "1px solid rgba(255,255,255,.06)",

    color:
      "#dce6ef",

    fontSize:
      "9px",

    fontWeight:
      800,
  },


  /* =======================================================
     EDITOR
  ======================================================= */

  editorSection: {
    ...glass,

    padding:
      "32px",

    borderRadius:
      "30px",
  },


  editorHeader: {
    display:
      "flex",

    alignItems:
      "flex-start",

    justifyContent:
      "space-between",

    gap:
      "24px",

    marginBottom:
      "25px",
  },


  editorTitle: {
    margin:
      0,

    color:
      "white",

    fontSize:
      "32px",

    fontWeight:
      900,

    letterSpacing:
      "-.03em",
  },


  editorSubtitle: {
    maxWidth:
      "650px",

    margin:
      "9px 0 0",

    color:
      "#8391a0",

    fontSize:
      "11px",

    lineHeight:
      1.6,
  },


  editorAccent: {
    width:
      "60px",

    height:
      "60px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "18px",

    background:
      "linear-gradient(135deg, rgba(16,243,255,.12), rgba(255,210,73,.06))",

    border:
      "1px solid rgba(16,243,255,.14)",

    color:
      "#10f3ff",

    fontSize:
      "13px",

    fontWeight:
      950,
  },


  formGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",

    gap:
      "14px",
  },


  largeField: {
    marginTop:
      "15px",
  },


  fieldWrap: {
    display:
      "grid",

    gap:
      "7px",
  },


  label: {
    color:
      "#c7d1dc",

    fontSize:
      "10px",

    fontWeight:
      800,

    paddingLeft:
      "2px",
  },


  input: {
    width:
      "100%",

    padding:
      "14px 15px",

    borderRadius:
      "14px",

    border:
      "1px solid rgba(255,255,255,.08)",

    background:
      "linear-gradient(135deg, rgba(0,0,0,.22), rgba(255,255,255,.025))",

    color:
      "#f7fafc",

    fontSize:
      "13px",

    boxSizing:
      "border-box",

    outline:
      "none",

    backdropFilter:
      "blur(10px)",

    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,.02)",
  },


  textarea: {
    width:
      "100%",

    minHeight:
      "140px",

    padding:
      "14px 15px",

    borderRadius:
      "16px",

    border:
      "1px solid rgba(255,255,255,.08)",

    background:
      "linear-gradient(135deg, rgba(0,0,0,.22), rgba(255,255,255,.025))",

    color:
      "#f7fafc",

    fontSize:
      "13px",

    lineHeight:
      1.6,

    resize:
      "vertical",

    boxSizing:
      "border-box",

    outline:
      "none",

    backdropFilter:
      "blur(10px)",
  },


  editorFooter: {
    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap:
      "22px",

    flexWrap:
      "wrap",

    marginTop:
      "24px",

    paddingTop:
      "22px",

    borderTop:
      "1px solid rgba(255,255,255,.065)",
  },


  publicNote: {
    maxWidth:
      "720px",

    display:
      "flex",

    alignItems:
      "flex-start",

    gap:
      "12px",
  },


  publicNoteIcon: {
    width:
      "38px",

    height:
      "38px",

    minWidth:
      "38px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "12px",

    background:
      "rgba(16,243,255,.055)",

    border:
      "1px solid rgba(16,243,255,.13)",

    color:
      "#10f3ff",
  },


  publicNoteTitle: {
    color:
      "#dce7ef",

    fontSize:
      "11px",
  },


  publicNoteText: {
    margin:
      "4px 0 0",

    color:
      "#768595",

    fontSize:
      "9px",

    lineHeight:
      1.55,
  },


  primaryButton: {
    minWidth:
      "180px",

    padding:
      "14px 20px",

    borderRadius:
      "999px",

    border:
      "none",

    background:
      "linear-gradient(135deg, #10f3ff 0%, #8ce9d5 52%, #ffd249 100%)",

    color:
      "#041019",

    fontSize:
      "11px",

    fontWeight:
      950,

    cursor:
      "pointer",

    boxShadow:
      "0 10px 32px rgba(16,243,255,.12)",
  },


  primaryButtonDisabled: {
    opacity:
      .5,

    cursor:
      "not-allowed",
  },


  successMessage: {
    marginTop:
      "16px",

    padding:
      "12px 14px",

    borderRadius:
      "12px",

    color:
      "#98f2b6",

    background:
      "rgba(34,197,94,.055)",

    border:
      "1px solid rgba(34,197,94,.14)",

    fontSize:
      "10px",
  },


  errorMessage: {
    marginTop:
      "16px",

    padding:
      "12px 14px",

    borderRadius:
      "12px",

    color:
      "#ffd59a",

    background:
      "rgba(250,170,40,.055)",

    border:
      "1px solid rgba(250,170,40,.14)",

    fontSize:
      "10px",
  },


  /* =======================================================
     CONNECT
  ======================================================= */

  connectSection: {
    paddingTop:
      "5px",
  },


  connectHeader: {
    marginBottom:
      "14px",

    padding:
      "0 5px",
  },


  /* =======================================================
     FOOTER
  ======================================================= */

  footer: {
    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap:
      "20px",

    padding:
      "26px 6px 4px",

    color:
      "#617081",

    fontSize:
      "9px",
  },


  footer: {
    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap:
      "20px",

    padding:
      "26px 6px 4px",

    color:
      "#617081",

    fontSize:
      "9px",
  },
};
