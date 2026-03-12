"use client";

import { useMemo, useState } from "react";

type ExperienceItem = {
  companyName: string;
  roleTitle: string;
  description: string;
  verifyEmployer: boolean;
  verifierName: string;
  verifierEmail: string;
};

type CertificateItem = {
  certificateName: string;
  organizationName: string;
  verifyTrainer: boolean;
  trainerName: string;
  trainerEmail: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isOfficialEmail(email: string) {
  const blockedDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
  ];

  const domain = email.split("@")[1]?.toLowerCase() || "";
  return domain.length > 0 && !blockedDomains.includes(domain);
}

export default function CreateCareerPassportPage() {
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [skills, setSkills] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [introVideoFileName, setIntroVideoFileName] = useState("");

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      companyName: "",
      roleTitle: "",
      description: "",
      verifyEmployer: false,
      verifierName: "",
      verifierEmail: "",
    },
  ]);

  const [certificates, setCertificates] = useState<CertificateItem[]>([
    {
      certificateName: "",
      organizationName: "",
      verifyTrainer: false,
      trainerName: "",
      trainerEmail: "",
    },
  ]);

  const [submitMessage, setSubmitMessage] = useState("");

  const passportSlug = useMemo(() => slugify(fullName || "your-name"), [fullName]);

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        companyName: "",
        roleTitle: "",
        description: "",
        verifyEmployer: false,
        verifierName: "",
        verifierEmail: "",
      },
    ]);
  };

  const updateExperience = (
    index: number,
    field: keyof ExperienceItem,
    value: string | boolean
  ) => {
    setExperiences((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addCertificate = () => {
    setCertificates((prev) => [
      ...prev,
      {
        certificateName: "",
        organizationName: "",
        verifyTrainer: false,
        trainerName: "",
        trainerEmail: "",
      },
    ]);
  };

  const updateCertificate = (
    index: number,
    field: keyof CertificateItem,
    value: string | boolean
  ) => {
    setCertificates((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeFileName(file ? file.name : "");
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setIntroVideoFileName(file ? file.name : "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    for (const exp of experiences) {
      if (exp.verifyEmployer && exp.verifierEmail && !isOfficialEmail(exp.verifierEmail)) {
        setSubmitMessage(
          "Employer verification emails must use an official company domain. Personal email addresses are not allowed."
        );
        return;
      }
    }

    for (const cert of certificates) {
      if (cert.verifyTrainer && cert.trainerEmail && !isOfficialEmail(cert.trainerEmail)) {
        setSubmitMessage(
          "Trainer verification emails must use an official organization or school domain. Personal email addresses are not allowed."
        );
        return;
      }
    }

    setSubmitMessage(
      `Career Passport draft created successfully. Future public link: /passport/${passportSlug}`
    );

    console.log("Career Passport payload", {
      profile: {
        fullName,
        headline,
        bio,
        email,
        city,
        state: stateName,
        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        passportSlug,
      },
      resumeFileName,
      introVideoFileName,
      experiences,
      certificates,
    });
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerBlock}>
          <p style={styles.eyebrow}>Create Your Career Passport</p>
          <h1 style={styles.title}>Build your professional profile</h1>
          <p style={styles.subtitle}>
            Add your profile, resume, work experience, certificates, optional
            intro video, and verification details to create your HireMinds
            Career Passport.
          </p>
        </div>

        <div style={styles.previewCard}>
          <p style={styles.previewLabel}>Your future Career Passport URL</p>
          <p style={styles.previewUrl}>
            hireminds.app/passport/{passportSlug}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Profile Information</h2>

            <div style={styles.grid}>
              <Input
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                placeholder="Ismary Szegedi"
              />
              <Input
                label="Professional Email"
                value={email}
                onChange={setEmail}
                placeholder="you@domain.com"
                type="email"
              />
            </div>

            <div style={styles.grid}>
              <Input
                label="Professional Headline"
                value={headline}
                onChange={setHeadline}
                placeholder="Career Coach | Recruiter | Workforce Development Leader"
              />
              <Input
                label="Skills (comma separated)"
                value={skills}
                onChange={setSkills}
                placeholder="Recruiting, Resume Writing, Interview Prep"
              />
            </div>

            <div style={styles.grid}>
              <Input
                label="City"
                value={city}
                onChange={setCity}
                placeholder="Bridgeport"
              />
              <Input
                label="State"
                value={stateName}
                onChange={setStateName}
                placeholder="Connecticut"
              />
            </div>

            <TextArea
              label="Professional Summary / Bio"
              value={bio}
              onChange={setBio}
              placeholder="Write a short introduction about your experience, strengths, and goals."
            />
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Upload Resume</h2>
            <label style={styles.fileLabel}>
              <span>Resume Upload</span>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
            </label>
            {resumeFileName ? (
              <p style={styles.fileText}>Selected file: {resumeFileName}</p>
            ) : null}
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>3. Work Experience</h2>

            {experiences.map((experience, index) => (
              <div key={index} style={styles.card}>
                <h3 style={styles.cardTitle}>Experience {index + 1}</h3>

                <div style={styles.grid}>
                  <Input
                    label="Company Name"
                    value={experience.companyName}
                    onChange={(value) =>
                      updateExperience(index, "companyName", value)
                    }
                    placeholder="ABC Telecom"
                  />
                  <Input
                    label="Role Title"
                    value={experience.roleTitle}
                    onChange={(value) =>
                      updateExperience(index, "roleTitle", value)
                    }
                    placeholder="Customer Service Representative"
                  />
                </div>

                <TextArea
                  label="Role Description"
                  value={experience.description}
                  onChange={(value) =>
                    updateExperience(index, "description", value)
                  }
                  placeholder="Summarize your work, responsibilities, and wins."
                />

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={experience.verifyEmployer}
                    onChange={(e) =>
                      updateExperience(index, "verifyEmployer", e.target.checked)
                    }
                  />
                  Request employer verification for this role
                </label>

                {experience.verifyEmployer ? (
                  <div style={styles.verifyBox}>
                    <p style={styles.verifyText}>
                      Employer verification must come from an official company
                      email domain.
                    </p>

                    <div style={styles.grid}>
                      <Input
                        label="Verifier Name"
                        value={experience.verifierName}
                        onChange={(value) =>
                          updateExperience(index, "verifierName", value)
                        }
                        placeholder="Jane Smith"
                      />
                      <Input
                        label="Verifier Email"
                        value={experience.verifierEmail}
                        onChange={(value) =>
                          updateExperience(index, "verifierEmail", value)
                        }
                        placeholder="manager@company.com"
                        type="email"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}

            <button type="button" onClick={addExperience} style={styles.secondaryButton}>
              + Add Another Experience
            </button>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>4. Certificates & Training</h2>

            {certificates.map((certificate, index) => (
              <div key={index} style={styles.card}>
                <h3 style={styles.cardTitle}>Certificate {index + 1}</h3>

                <div style={styles.grid}>
                  <Input
                    label="Certificate Name"
                    value={certificate.certificateName}
                    onChange={(value) =>
                      updateCertificate(index, "certificateName", value)
                    }
                    placeholder="Python Certificate"
                  />
                  <Input
                    label="Organization / Training Program"
                    value={certificate.organizationName}
                    onChange={(value) =>
                      updateCertificate(index, "organizationName", value)
                    }
                    placeholder="YWCA Tech Lab"
                  />
                </div>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={certificate.verifyTrainer}
                    onChange={(e) =>
                      updateCertificate(index, "verifyTrainer", e.target.checked)
                    }
                  />
                  Request trainer / certificate verification
                </label>

                {certificate.verifyTrainer ? (
                  <div style={styles.verifyBox}>
                    <p style={styles.verifyText}>
                      Trainer verification must come from an official
                      organization, nonprofit, or school email domain.
                    </p>

                    <div style={styles.grid}>
                      <Input
                        label="Trainer Name"
                        value={certificate.trainerName}
                        onChange={(value) =>
                          updateCertificate(index, "trainerName", value)
                        }
                        placeholder="Instructor Name"
                      />
                      <Input
                        label="Trainer Email"
                        value={certificate.trainerEmail}
                        onChange={(value) =>
                          updateCertificate(index, "trainerEmail", value)
                        }
                        placeholder="instructor@organization.org"
                        type="email"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}

            <button type="button" onClick={addCertificate} style={styles.secondaryButton}>
              + Add Another Certificate
            </button>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>5. Intro Video</h2>

            <label style={styles.fileLabel}>
              <span>Upload an optional self-introduction video</span>
              <input type="file" accept="video/*" onChange={handleVideoUpload} />
            </label>

            {introVideoFileName ? (
              <p style={styles.fileText}>Selected file: {introVideoFileName}</p>
            ) : (
              <p style={styles.helpText}>
                Candidates can add a short video introduction to their Career
                Passport profile.
              </p>
            )}
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>6. Generate Passport</h2>
            <p style={styles.helpText}>
              When submitted, this page will create the base data for the user’s
              HireMinds profile and generate their shareable Career Passport URL.
            </p>

            <button type="submit" style={styles.primaryButton}>
              Generate Career Passport
            </button>

            {submitMessage ? (
              <p style={styles.successMessage}>{submitMessage}</p>
            ) : null}
          </section>
        </form>
      </div>
    </main>
  );
}

function Input({
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
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
  );
}

function TextArea({
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
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.textarea}
      />
    </label>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#f8fafc",
    minHeight: "100vh",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "980px",
    margin: "0 auto",
  },
  headerBlock: {
    marginBottom: "24px",
  },
  eyebrow: {
    color: "#2563eb",
    fontWeight: 700,
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
  },
  title: {
    fontSize: "40px",
    margin: "0 0 12px",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: "16px",
    lineHeight: 1.6,
    color: "#475569",
    maxWidth: "760px",
  },
  previewCard: {
    background: "#0f172a",
    color: "#fff",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
  },
  previewLabel: {
    margin: "0 0 8px",
    fontSize: "13px",
    color: "#93c5fd",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  previewUrl: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#67e8f9",
    wordBreak: "break-word",
  },
  form: {
    display: "grid",
    gap: "22px",
  },
  section: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    margin: "0 0 18px",
    fontSize: "24px",
    color: "#0f172a",
  },
  card: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "16px",
  },
  cardTitle: {
    margin: "0 0 14px",
    color: "#0f172a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  field: {
    display: "grid",
    gap: "8px",
    marginBottom: "16px",
  },
  label: {
    fontWeight: 600,
    color: "#334155",
    fontSize: "14px",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    outline: "none",
  },
  textarea: {
    minHeight: "120px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    outline: "none",
    resize: "vertical",
  },
  checkboxLabel: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    color: "#0f172a",
    fontWeight: 500,
    marginBottom: "12px",
  },
  verifyBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "16px",
  },
  verifyText: {
    marginTop: 0,
    color: "#1d4ed8",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  fileLabel: {
    display: "grid",
    gap: "10px",
    color: "#334155",
    fontWeight: 600,
  },
  fileText: {
    color: "#0f172a",
    fontWeight: 500,
    marginTop: "10px",
  },
  helpText: {
    color: "#475569",
    lineHeight: 1.6,
  },
  primaryButton: {
    background: "#06b6d4",
    color: "#082f49",
    border: "none",
    borderRadius: "14px",
    padding: "14px 20px",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  successMessage: {
    marginTop: "14px",
    color: "#047857",
    fontWeight: 600,
    lineHeight: 1.6,
  },
};
