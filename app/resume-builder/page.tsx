"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type ResumeFont = "Times New Roman" | "Arial" | "Calibri";
type ResumeLanguage = "English" | "Spanish" | "Hindi" | "Polish";

type Bullet = { text: string };

type ExperienceItem = {
  companyName: string;
  city: string;
  state: string;
  roleTitle: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
  bullets: Bullet[];
};

type EducationItem = {
  schoolName: string;
  city: string;
  state: string;
  degree: string;
  gpa: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
};

type CertificateItem = {
  organizationName: string;
  city: string;
  state: string;
  certificateName: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
};

type VolunteerItem = {
  organizationName: string;
  city: string;
  state: string;
  roleTitle: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
  bullets: Bullet[];
};

type ResumeSectionKey =
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "certifications"
  | "volunteer"
  | "accomplishments";

const BULLET_LIMIT = 5;
const SKILL_LIMIT = 9;

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TRANSLATIONS: Record<
  ResumeLanguage,
  {
    pageKicker: string;
    pageTitle: string;
    font: string;
    language: string;
    livePreview: string;
    previewHelp: string;
    header: string;
    summary: string;
    summaryAndSkills: string;
    experience: string;
    education: string;
    certifications: string;
    volunteer: string;
    accomplishments: string;
    saveResume: string;
    printResume: string;
    moveSections: string;
    currentlyWorkHere: string;
    currentlyAttendHere: string;
    currentlyCompletingCert: string;
    currentlyVolunteerHere: string;
    backToProfile: string;
    viewPublicProfile: string;
  }
> = {
  English: {
    pageKicker: "RESUME GENERATOR",
    pageTitle: "Create and save your resume.",
    font: "Resume Font",
    language: "Language",
    livePreview: "Resume Preview",
    previewHelp: "The preview stays visible while you build and expands as you type.",
    header: "Resume Header",
    summary: "Summary",
    summaryAndSkills: "Summary + Skills",
    experience: "Work Experience",
    education: "Education (optional)",
    certifications: "Certifications (optional)",
    volunteer: "Volunteer Work (optional)",
    accomplishments: "Accomplishments (optional)",
    saveResume: "Save Resume",
    printResume: "Print Resume",
    moveSections: "Move Resume Sections",
    currentlyWorkHere: "I currently work here",
    currentlyAttendHere: "I currently attend here",
    currentlyCompletingCert: "I am currently completing this certification",
    currentlyVolunteerHere: "I currently volunteer here",
    backToProfile: "Back to Profile",
    viewPublicProfile: "View Public Profile",
  },
  Spanish: {
    pageKicker: "GENERADOR DE CURRÍCULUM",
    pageTitle: "Crea y guarda tu currículum.",
    font: "Fuente del currículum",
    language: "Idioma",
    livePreview: "Vista previa del currículum",
    previewHelp: "La vista previa permanece visible mientras escribes y se expande a medida que agregas contenido.",
    header: "Encabezado del currículum",
    summary: "Resumen",
    summaryAndSkills: "Resumen + Habilidades",
    experience: "Experiencia laboral",
    education: "Educación (opcional)",
    certifications: "Certificaciones (opcional)",
    volunteer: "Trabajo voluntario (opcional)",
    accomplishments: "Logros (opcional)",
    saveResume: "Guardar currículum",
    printResume: "Imprimir currículum",
    moveSections: "Mover secciones del currículum",
    currentlyWorkHere: "Actualmente trabajo aquí",
    currentlyAttendHere: "Actualmente estudio aquí",
    currentlyCompletingCert: "Actualmente estoy completando esta certificación",
    currentlyVolunteerHere: "Actualmente hago voluntariado aquí",
    backToProfile: "Volver al perfil",
    viewPublicProfile: "Ver perfil público",
  },
  Hindi: {
    pageKicker: "रिज़्यूमे जनरेटर",
    pageTitle: "अपना रिज़्यूमे बनाएं और सेव करें।",
    font: "रिज़्यूमे फ़ॉन्ट",
    language: "भाषा",
    livePreview: "रिज़्यूमे पूर्वावलोकन",
    previewHelp: "जैसे-जैसे आप टाइप करते हैं, पूर्वावलोकन दिखाई देता रहता है और बढ़ता जाता है।",
    header: "रिज़्यूमे हेडर",
    summary: "सारांश",
    summaryAndSkills: "सारांश + कौशल",
    experience: "कार्य अनुभव",
    education: "शिक्षा (वैकल्पिक)",
    certifications: "प्रमाणपत्र (वैकल्पिक)",
    volunteer: "स्वयंसेवी कार्य (वैकल्पिक)",
    accomplishments: "उपलब्धियाँ (वैकल्पिक)",
    saveResume: "रिज़्यूमे सेव करें",
    printResume: "रिज़्यूमे प्रिंट करें",
    moveSections: "रिज़्यूमे सेक्शन बदलें",
    currentlyWorkHere: "मैं वर्तमान में यहाँ काम करता/करती हूँ",
    currentlyAttendHere: "मैं वर्तमान में यहाँ पढ़ रहा/रही हूँ",
    currentlyCompletingCert: "मैं वर्तमान में यह प्रमाणपत्र पूरा कर रहा/रही हूँ",
    currentlyVolunteerHere: "मैं वर्तमान में यहाँ स्वयंसेवा करता/करती हूँ",
    backToProfile: "प्रोफ़ाइल पर वापस जाएँ",
    viewPublicProfile: "सार्वजनिक प्रोफ़ाइल देखें",
  },
  Polish: {
    pageKicker: "GENERATOR CV",
    pageTitle: "Utwórz i zapisz swoje CV.",
    font: "Czcionka CV",
    language: "Język",
    livePreview: "Podgląd CV",
    previewHelp: "Podgląd pozostaje widoczny podczas tworzenia i rozszerza się wraz z treścią.",
    header: "Nagłówek CV",
    summary: "Podsumowanie",
    summaryAndSkills: "Podsumowanie + Umiejętności",
    experience: "Doświadczenie zawodowe",
    education: "Wykształcenie (opcjonalnie)",
    certifications: "Certyfikaty (opcjonalnie)",
    volunteer: "Wolontariat (opcjonalnie)",
    accomplishments: "Osiągnięcia (opcjonalnie)",
    saveResume: "Zapisz CV",
    printResume: "Drukuj CV",
    moveSections: "Przenieś sekcje CV",
    currentlyWorkHere: "Obecnie tu pracuję",
    currentlyAttendHere: "Obecnie tu uczęszczam",
    currentlyCompletingCert: "Obecnie kończę ten certyfikat",
    currentlyVolunteerHere: "Obecnie tu jestem wolontariuszem",
    backToProfile: "Powrót do profilu",
    viewPublicProfile: "Zobacz profil publiczny",
  },
};

function createEmptyExperience(): ExperienceItem {
  return {
    companyName: "",
    city: "",
    state: "",
    roleTitle: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    isPresent: false,
    bullets: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
  };
}

function createEmptyVolunteer(): VolunteerItem {
  return {
    organizationName: "",
    city: "",
    state: "",
    roleTitle: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    isPresent: false,
    bullets: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
  };
}

function createEmptyEducation(): EducationItem {
  return {
    schoolName: "",
    city: "",
    state: "",
    degree: "",
    gpa: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    isPresent: false,
  };
}

function createEmptyCertificate(): CertificateItem {
  return {
    organizationName: "",
    city: "",
    state: "",
    certificateName: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    isPresent: false,
  };
}

function moveItem<T>(items: T[], index: number, direction: "up" | "down") {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const clone = [...items];
  const current = clone[index];
  clone[index] = clone[targetIndex];
  clone[targetIndex] = current;
  return clone;
}

function splitSkillsIntoColumns(skills: string[]) {
  const safeSkills = skills.slice(0, SKILL_LIMIT);
  const columns = [[], [], []] as string[][];
  safeSkills.forEach((skill, index) => {
    columns[index % 3].push(skill);
  });
  return columns;
}

function hasExperienceContent(item: ExperienceItem) {
  return Boolean(
    item.companyName ||
      item.roleTitle ||
      item.city ||
      item.state ||
      item.startMonth ||
      item.startYear ||
      item.endMonth ||
      item.endYear ||
      item.isPresent ||
      item.bullets.some((b) => b.text.trim())
  );
}

function hasEducationContent(item: EducationItem) {
  return Boolean(
    item.schoolName ||
      item.degree ||
      item.city ||
      item.state ||
      item.gpa ||
      item.startMonth ||
      item.startYear ||
      item.endMonth ||
      item.endYear ||
      item.isPresent
  );
}

function hasCertificateContent(item: CertificateItem) {
  return Boolean(
    item.organizationName ||
      item.certificateName ||
      item.city ||
      item.state ||
      item.startMonth ||
      item.startYear ||
      item.endMonth ||
      item.endYear ||
      item.isPresent
  );
}

function hasVolunteerContent(item: VolunteerItem) {
  return Boolean(
    item.organizationName ||
      item.roleTitle ||
      item.city ||
      item.state ||
      item.startMonth ||
      item.startYear ||
      item.endMonth ||
      item.endYear ||
      item.isPresent ||
      item.bullets.some((b) => b.text.trim())
  );
}

function formatDateRange(
  startMonth: string,
  startYear: string,
  endMonth: string,
  endYear: string,
  isPresent: boolean
) {
  const from = [startMonth, startYear].filter(Boolean).join(" ");
  const to = isPresent ? "Present" : [endMonth, endYear].filter(Boolean).join(" ");
  if (!from && !to) return "";
  return `${from || "Start"} - ${to || "End"}`;
}

export default function ResumeBuilderPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [userId, setUserId] = useState("");
  const [passportSlug, setPassportSlug] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const resumePrintRef = useRef<HTMLDivElement>(null);

  const [fontFamily, setFontFamily] = useState<ResumeFont>("Times New Roman");
  const [language, setLanguage] = useState<ResumeLanguage>("English");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [summaryHeading, setSummaryHeading] = useState("Summary");
  const [summaryText, setSummaryText] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [accomplishments, setAccomplishments] = useState("");

  const [experiences, setExperiences] = useState<ExperienceItem[]>([createEmptyExperience()]);
  const [educationItems, setEducationItems] = useState<EducationItem[]>([createEmptyEducation()]);
  const [certificateItems, setCertificateItems] = useState<CertificateItem[]>([createEmptyCertificate()]);
  const [volunteerItems, setVolunteerItems] = useState<VolunteerItem[]>([createEmptyVolunteer()]);

  const [sectionOrder, setSectionOrder] = useState<ResumeSectionKey[]>([
    "summary",
    "skills",
    "experience",
    "education",
    "certifications",
    "volunteer",
    "accomplishments",
  ]);

  useEffect(() => {
    async function loadUserAndProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setLoadingUser(false);
        return;
      }

      const currentUserId = data.user.id;
      setUserId(currentUserId);

      const { data: profile } = await supabase
        .from("candidate_profiles")
        .select("full_name, phone, city, state, email, linkedin_url, passport_slug")
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (profile) {
        setPassportSlug(profile.passport_slug || "");
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
        setCity(profile.city || "");
        setStateName(profile.state || "");
        setEmail(profile.email || data.user.email || "");
        setLinkedinUrl(profile.linkedin_url || "");
      } else {
        setEmail(data.user.email || "");
      }

      setLoadingUser(false);
    }

    loadUserAndProfile();
  }, []);

  const ui = TRANSLATIONS[language];

  const skills = useMemo(() => {
    return skillsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, SKILL_LIMIT);
  }, [skillsInput]);

  const skillColumns = useMemo(() => splitSkillsIntoColumns(skills), [skills]);
  const activeExperiences = useMemo(() => experiences.filter((item) => hasExperienceContent(item)), [experiences]);
  const activeEducation = useMemo(() => educationItems.filter((item) => hasEducationContent(item)), [educationItems]);
  const activeCertificates = useMemo(
    () => certificateItems.filter((item) => hasCertificateContent(item)),
    [certificateItems]
  );
  const activeVolunteer = useMemo(() => volunteerItems.filter((item) => hasVolunteerContent(item)), [volunteerItems]);

  function addExperience() {
    setExperiences((prev) => [...prev, createEmptyExperience()]);
  }

  function updateExperience(index: number, field: keyof ExperienceItem, value: string | boolean) {
    setExperiences((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function updateExperienceBullet(index: number, bulletIndex: number, value: string) {
    setExperiences((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const bullets = item.bullets.map((bullet, j) => (j === bulletIndex ? { text: value } : bullet));
        return { ...item, bullets };
      })
    );
  }

  function addExperienceBullet(index: number) {
    setExperiences((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (item.bullets.length >= BULLET_LIMIT) return item;
        return { ...item, bullets: [...item.bullets, { text: "" }] };
      })
    );
  }

  function addEducation() {
    setEducationItems((prev) => [...prev, createEmptyEducation()]);
  }

  function updateEducation(index: number, field: keyof EducationItem, value: string | boolean) {
    setEducationItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function addCertificate() {
    setCertificateItems((prev) => [...prev, createEmptyCertificate()]);
  }

  function updateCertificate(index: number, field: keyof CertificateItem, value: string | boolean) {
    setCertificateItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function addVolunteer() {
    setVolunteerItems((prev) => [...prev, createEmptyVolunteer()]);
  }

  function updateVolunteer(index: number, field: keyof VolunteerItem, value: string | boolean) {
    setVolunteerItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function updateVolunteerBullet(index: number, bulletIndex: number, value: string) {
    setVolunteerItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const bullets = item.bullets.map((bullet, j) => (j === bulletIndex ? { text: value } : bullet));
        return { ...item, bullets };
      })
    );
  }

  function addVolunteerBullet(index: number) {
    setVolunteerItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (item.bullets.length >= BULLET_LIMIT) return item;
        return { ...item, bullets: [...item.bullets, { text: "" }] };
      })
    );
  }

  function moveSection(index: number, direction: "up" | "down") {
    setSectionOrder((prev) => moveItem(prev, index, direction));
  }

  async function handleSaveResume() {
    setMessage("");

    if (!userId) {
      setMessage("You must be signed in before saving.");
      return;
    }

    try {
      setSaving(true);

      const { data: profileData, error: profileError } = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;

      const profileId = profileData.id;

      const payload = {
        profile_id: profileId,
        title: "Primary Resume",
        page_limit: 2,
        summary_heading: summaryHeading || ui.summary,
        summary_text: summaryText,
        skills,
        education: activeEducation,
        accomplishments,
        volunteer_work: activeVolunteer,
        section_order: sectionOrder,
        full_name: fullName,
        email,
        phone,
        city,
        state: stateName,
        linkedin_url: linkedinUrl,
        font_family: fontFamily,
        language,
        work_experience: activeExperiences,
        certifications: activeCertificates,
        header_settings: {
          repeat_header_on_new_page: true,
          preview_before_print: true,
        },
      };

      const { data: existingResume } = await supabase
        .from("resumes")
        .select("id")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingResume?.id) {
        const { error: updateError } = await supabase.from("resumes").update(payload).eq("id", existingResume.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("resumes").insert(payload);
        if (insertError) throw insertError;
      }

      setMessage("Resume saved successfully to your HireMinds profile.");
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    setMessage("Review the preview, then use your browser print window to save as PDF or print.");
    window.print();
  }

  function renderResumeSection(section: ResumeSectionKey) {
    switch (section) {
      case "summary":
        if (!summaryText && !summaryHeading) return null;
        return (
          <section className="resumeSection" style={styles.resumeSectionBlock}>
            <h3 style={styles.resumeSectionTitle}>{summaryHeading || ui.summary}</h3>
            <p style={styles.resumeParagraph}>{summaryText || "Add your professional summary here."}</p>
          </section>
        );

      case "skills":
        if (!skills.length) return null;
        return (
          <section className="resumeSection" style={styles.resumeSectionBlock}>
            <h3 style={styles.resumeSectionTitle}>SKILLS</h3>
            <div style={styles.skillsGrid}>
              {skillColumns.map((column, index) => (
                <div key={index} style={styles.skillColumn}>
                  {column.map((skill, skillIndex) => (
                    <p key={`${skill}-${skillIndex}`} style={styles.skillItem}>
                      • {skill}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </section>
        );

      case "experience":
        if (!activeExperiences.length) return null;
        return (
          <section className="resumeSection" style={styles.resumeSectionBlock}>
            <h3 style={styles.resumeSectionTitle}>WORK EXPERIENCE</h3>
            {activeExperiences.map((item, index) => (
              <div key={index} style={styles.resumeEntry}>
                <div style={styles.resumeEntryTop}>
                  <div>
                    <p style={styles.resumeEntryHeading}>
                      {item.companyName || "Company"}{" "}
                      {item.city || item.state ? `— ${[item.city, item.state].filter(Boolean).join(", ")}` : ""}
                    </p>
                    <p style={styles.resumeEntrySubheading}>{item.roleTitle || "Role Title"}</p>
                  </div>
                  <p style={styles.resumeEntryDates}>
                    {formatDateRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.isPresent)}
                  </p>
                </div>
                {item.bullets.filter((b) => b.text.trim()).map((bullet, bulletIndex) => (
                  <p key={bulletIndex} style={styles.resumeBullet}>
                    • {bullet.text}
                  </p>
                ))}
              </div>
            ))}
          </section>
        );

      case "education":
        if (!activeEducation.length) return null;
        return (
          <section className="resumeSection" style={styles.resumeSectionBlock}>
            <h3 style={styles.resumeSectionTitle}>EDUCATION</h3>
            {activeEducation.map((item, index) => (
              <div key={index} style={styles.resumeEntry}>
                <div style={styles.resumeEntryTop}>
                  <div>
                    <p style={styles.resumeEntryHeading}>
                      {item.schoolName || "School"}{" "}
                      {item.city || item.state ? `— ${[item.city, item.state].filter(Boolean).join(", ")}` : ""}
                    </p>
                    <p style={styles.resumeEntrySubheading}>
                      {item.degree || "Degree"}
                      {item.gpa ? ` | GPA: ${item.gpa}` : ""}
                    </p>
                  </div>
                  <p style={styles.resumeEntryDates}>
                    {formatDateRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.isPresent)}
                  </p>
                </div>
              </div>
            ))}
          </section>
        );

      case "certifications":
        if (!activeCertificates.length) return null;
        return (
          <section className="resumeSection" style={styles.resumeSectionBlock}>
            <h3 style={styles.resumeSectionTitle}>CERTIFICATIONS</h3>
            {activeCertificates.map((item, index) => (
              <div key={index} style={styles.resumeEntry}>
                <div style={styles.resumeEntryTop}>
                  <div>
                    <p style={styles.resumeEntryHeading}>
                      {item.organizationName || "Organization"}{" "}
                      {item.city || item.state ? `— ${[item.city, item.state].filter(Boolean).join(", ")}` : ""}
                    </p>
                    <p style={styles.resumeEntrySubheading}>
                      {item.certificateName || "Certificate / Course Name"}
                    </p>
                  </div>
                  <p style={styles.resumeEntryDates}>
                    {formatDateRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.isPresent)}
                  </p>
                </div>
              </div>
            ))}
          </section>
        );

      case "volunteer":
        if (!activeVolunteer.length) return null;
        return (
          <section className="resumeSection" style={styles.resumeSectionBlock}>
            <h3 style={styles.resumeSectionTitle}>VOLUNTEER WORK</h3>
            {activeVolunteer.map((item, index) => (
              <div key={index} style={styles.resumeEntry}>
                <div style={styles.resumeEntryTop}>
                  <div>
                    <p style={styles.resumeEntryHeading}>
                      {item.organizationName || "Organization"}{" "}
                      {item.city || item.state ? `— ${[item.city, item.state].filter(Boolean).join(", ")}` : ""}
                    </p>
                    <p style={styles.resumeEntrySubheading}>{item.roleTitle || "Role Title"}</p>
                  </div>
                  <p style={styles.resumeEntryDates}>
                    {formatDateRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.isPresent)}
                  </p>
                </div>
                {item.bullets.filter((b) => b.text.trim()).map((bullet, bulletIndex) => (
                  <p key={bulletIndex} style={styles.resumeBullet}>
                    • {bullet.text}
                  </p>
                ))}
              </div>
            ))}
          </section>
        );

      case "accomplishments":
        if (!accomplishments.trim()) return null;
        return (
          <section className="resumeSection" style={styles.resumeSectionBlock}>
            <h3 style={styles.resumeSectionTitle}>ACCOMPLISHMENTS</h3>
            <p style={styles.resumeParagraph}>{accomplishments}</p>
          </section>
        );

      default:
        return null;
    }
  }

  if (loadingUser) {
    return (
      <main style={styles.page}>
        <div style={styles.centerWrap}>Loading...</div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main style={styles.page}>
        <div style={styles.centerWrap}>
          <div style={styles.lockedCard}>
            <p style={styles.kicker}>Resume Generator</p>
            <h1 style={styles.lockedTitle}>Sign in first to access this page.</h1>
            <p style={styles.previewText}>
              Create your Career Passport account first, then sign in and return here to build your resume.
            </p>
            <div style={styles.lockedButtons}>
              <a href="/sign-up" style={styles.signUpButton}>
                Sign Up
              </a>
              <a href="/sign-in" style={styles.signUpButton}>
                Sign In
              </a>
              <a href="/profile" style={styles.signUpButtonDark}>
                Profile
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{`
        @media print {
          body {
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .resumePrintWrap,
          .resumePrintWrap * {
            visibility: visible !important;
          }

          .resumePrintWrap {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .resumePaper {
            width: 100% !important;
            min-height: auto !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 42px 38px 42px !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .resumeSection {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .builderShell,
          .fontBar {
            display: none !important;
          }
        }
      `}</style>

      <div style={styles.fontBar}>
        <div style={styles.fontBarInner}>
          <div>
            <p style={styles.fontBarKicker}>{ui.pageKicker}</p>
            <h1 style={styles.fontBarTitle}>{ui.pageTitle}</h1>
            <p style={styles.previewText}>2-page generator • up to 9 skills • up to 5 bullets per experience entry.</p>
          </div>

          <div style={styles.fontControls}>
            <div style={styles.topSelectGroup}>
              <label style={styles.topSelectLabel}>{ui.language}</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as ResumeLanguage)}
                style={styles.select}
              >
                <option>English</option>
                <option>Spanish</option>
                <option>Hindi</option>
                <option>Polish</option>
              </select>
            </div>

            <div style={styles.topSelectGroup}>
              <label style={styles.topSelectLabel}>{ui.font}</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as ResumeFont)}
                style={styles.select}
              >
                <option>Times New Roman</option>
                <option>Arial</option>
                <option>Calibri</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="builderShell" style={styles.layout}>
        <div style={styles.leftCol}>
          <section style={styles.card}>
            <p style={styles.cardKicker}>RESUME GENERATOR</p>
            <h2 style={styles.cardTitle}>Create your resume</h2>
            <p style={styles.previewText}>
              HireMinds Resume Generator is currently open to all users. Build your resume, save it to your profile,
              and print or export it when ready.
            </p>
          </section>

          <section style={styles.card}>
            <p style={styles.cardKicker}>HEADER</p>
            <h2 style={styles.cardTitle}>{ui.header}</h2>

            <div style={styles.twoColForm}>
              <div>
                <label style={styles.inputLabel}>Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={styles.input} placeholder="Full Name" />
              </div>
              <div>
                <label style={styles.inputLabel}>Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input} placeholder="Phone Number" />
              </div>
              <div>
                <label style={styles.inputLabel}>City (optional)</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} style={styles.input} placeholder="City" />
              </div>
              <div>
                <label style={styles.inputLabel}>State (optional)</label>
                <input value={stateName} onChange={(e) => setStateName(e.target.value)} style={styles.input} placeholder="State" />
              </div>
              <div>
                <label style={styles.inputLabel}>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="Email" />
              </div>
              <div>
                <label style={styles.inputLabel}>LinkedIn (optional)</label>
                <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} style={styles.input} placeholder="LinkedIn URL" />
              </div>
            </div>
          </section>

          <section style={styles.card}>
            <p style={styles.cardKicker}>SUMMARY</p>
            <h2 style={styles.cardTitle}>{ui.summaryAndSkills}</h2>

            <div style={styles.fieldBlock}>
              <label style={styles.inputLabel}>Summary Heading</label>
              <input
                value={summaryHeading}
                onChange={(e) => setSummaryHeading(e.target.value)}
                style={styles.input}
                placeholder="Summary"
              />
            </div>

            <div style={styles.fieldBlock}>
              <label style={styles.inputLabel}>Professional Summary</label>
              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                style={styles.textarea}
                placeholder="Write a short professional summary."
              />
            </div>

            <div style={styles.fieldBlock}>
              <label style={styles.inputLabel}>Skills (comma separated, up to 9)</label>
              <textarea
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                style={styles.textareaSmall}
                placeholder="Communication, Teamwork, Customer Service"
              />
            </div>
          </section>

          <section style={styles.card}>
            <p style={styles.cardKicker}>EXPERIENCE</p>
            <h2 style={styles.cardTitle}>{ui.experience}</h2>

            {experiences.map((item, index) => (
              <div key={index} style={styles.entryCard}>
                <div style={styles.rowBetween}>
                  <h3 style={styles.entryTitle}>Experience {index + 1}</h3>
                  <button type="button" onClick={() => addExperience()} style={styles.smallButton}>
                    Add Experience
                  </button>
                </div>

                <div style={styles.twoColForm}>
                  <div>
                    <label style={styles.inputLabel}>Company</label>
                    <input
                      value={item.companyName}
                      onChange={(e) => updateExperience(index, "companyName", e.target.value)}
                      style={styles.input}
                      placeholder="Company"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Role Title</label>
                    <input
                      value={item.roleTitle}
                      onChange={(e) => updateExperience(index, "roleTitle", e.target.value)}
                      style={styles.input}
                      placeholder="Role Title"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>City</label>
                    <input
                      value={item.city}
                      onChange={(e) => updateExperience(index, "city", e.target.value)}
                      style={styles.input}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>State</label>
                    <input
                      value={item.state}
                      onChange={(e) => updateExperience(index, "state", e.target.value)}
                      style={styles.input}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Start Month</label>
                    <select
                      value={item.startMonth}
                      onChange={(e) => updateExperience(index, "startMonth", e.target.value)}
                      style={styles.select}
                    >
                      {MONTHS.map((month) => (
                        <option key={`start-${month}`} value={month}>
                          {month || "Month"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Start Year</label>
                    <input
                      value={item.startYear}
                      onChange={(e) => updateExperience(index, "startYear", e.target.value)}
                      style={styles.input}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>End Month</label>
                    <select
                      value={item.endMonth}
                      onChange={(e) => updateExperience(index, "endMonth", e.target.value)}
                      style={styles.select}
                      disabled={item.isPresent}
                    >
                      {MONTHS.map((month) => (
                        <option key={`end-${month}`} value={month}>
                          {month || "Month"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.inputLabel}>End Year</label>
                    <input
                      value={item.endYear}
                      onChange={(e) => updateExperience(index, "endYear", e.target.value)}
                      style={styles.input}
                      placeholder="2025"
                      disabled={item.isPresent}
                    />
                  </div>
                </div>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={item.isPresent}
                    onChange={(e) => updateExperience(index, "isPresent", e.target.checked)}
                  />
                  <span>{ui.currentlyWorkHere}</span>
                </label>

                <div style={styles.bulletWrap}>
                  {item.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex}>
                      <label style={styles.inputLabel}>Bullet {bulletIndex + 1}</label>
                      <textarea
                        value={bullet.text}
                        onChange={(e) => updateExperienceBullet(index, bulletIndex, e.target.value)}
                        style={styles.textareaSmall}
                        placeholder="Describe your work, impact, or responsibilities."
                      />
                    </div>
                  ))}
                  {item.bullets.length < BULLET_LIMIT ? (
                    <button type="button" onClick={() => addExperienceBullet(index)} style={styles.smallButton}>
                      Add Bullet
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </section>

          <section style={styles.card}>
            <p style={styles.cardKicker}>EDUCATION</p>
            <h2 style={styles.cardTitle}>{ui.education}</h2>

            {educationItems.map((item, index) => (
              <div key={index} style={styles.entryCard}>
                <div style={styles.rowBetween}>
                  <h3 style={styles.entryTitle}>Education {index + 1}</h3>
                  <button type="button" onClick={() => addEducation()} style={styles.smallButton}>
                    Add Education
                  </button>
                </div>

                <div style={styles.twoColForm}>
                  <div>
                    <label style={styles.inputLabel}>School</label>
                    <input
                      value={item.schoolName}
                      onChange={(e) => updateEducation(index, "schoolName", e.target.value)}
                      style={styles.input}
                      placeholder="School"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Degree</label>
                    <input
                      value={item.degree}
                      onChange={(e) => updateEducation(index, "degree", e.target.value)}
                      style={styles.input}
                      placeholder="Degree / Program"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>City</label>
                    <input
                      value={item.city}
                      onChange={(e) => updateEducation(index, "city", e.target.value)}
                      style={styles.input}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>State</label>
                    <input
                      value={item.state}
                      onChange={(e) => updateEducation(index, "state", e.target.value)}
                      style={styles.input}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>GPA (optional)</label>
                    <input
                      value={item.gpa}
                      onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                      style={styles.input}
                      placeholder="GPA"
                    />
                  </div>
                  <div />
                  <div>
                    <label style={styles.inputLabel}>Start Month</label>
                    <select
                      value={item.startMonth}
                      onChange={(e) => updateEducation(index, "startMonth", e.target.value)}
                      style={styles.select}
                    >
                      {MONTHS.map((month) => (
                        <option key={`edu-start-${month}`} value={month}>
                          {month || "Month"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Start Year</label>
                    <input
                      value={item.startYear}
                      onChange={(e) => updateEducation(index, "startYear", e.target.value)}
                      style={styles.input}
                      placeholder="2022"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>End Month</label>
                    <select
                      value={item.endMonth}
                      onChange={(e) => updateEducation(index, "endMonth", e.target.value)}
                      style={styles.select}
                      disabled={item.isPresent}
                    >
                      {MONTHS.map((month) => (
                        <option key={`edu-end-${month}`} value={month}>
                          {month || "Month"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.inputLabel}>End Year</label>
                    <input
                      value={item.endYear}
                      onChange={(e) => updateEducation(index, "endYear", e.target.value)}
                      style={styles.input}
                      placeholder="2026"
                      disabled={item.isPresent}
                    />
                  </div>
                </div>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={item.isPresent}
                    onChange={(e) => updateEducation(index, "isPresent", e.target.checked)}
                  />
                  <span>{ui.currentlyAttendHere}</span>
                </label>
              </div>
            ))}
          </section>

          <section style={styles.card}>
            <p style={styles.cardKicker}>CERTIFICATIONS</p>
            <h2 style={styles.cardTitle}>{ui.certifications}</h2>

            {certificateItems.map((item, index) => (
              <div key={index} style={styles.entryCard}>
                <div style={styles.rowBetween}>
                  <h3 style={styles.entryTitle}>Certification {index + 1}</h3>
                  <button type="button" onClick={() => addCertificate()} style={styles.smallButton}>
                    Add Certification
                  </button>
                </div>

                <div style={styles.twoColForm}>
                  <div>
                    <label style={styles.inputLabel}>Organization</label>
                    <input
                      value={item.organizationName}
                      onChange={(e) => updateCertificate(index, "organizationName", e.target.value)}
                      style={styles.input}
                      placeholder="Organization"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Certificate Name</label>
                    <input
                      value={item.certificateName}
                      onChange={(e) => updateCertificate(index, "certificateName", e.target.value)}
                      style={styles.input}
                      placeholder="Certificate / Course Name"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>City</label>
                    <input
                      value={item.city}
                      onChange={(e) => updateCertificate(index, "city", e.target.value)}
                      style={styles.input}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>State</label>
                    <input
                      value={item.state}
                      onChange={(e) => updateCertificate(index, "state", e.target.value)}
                      style={styles.input}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Start Month</label>
                    <select
                      value={item.startMonth}
                      onChange={(e) => updateCertificate(index, "startMonth", e.target.value)}
                      style={styles.select}
                    >
                      {MONTHS.map((month) => (
                        <option key={`cert-start-${month}`} value={month}>
                          {month || "Month"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Start Year</label>
                    <input
                      value={item.startYear}
                      onChange={(e) => updateCertificate(index, "startYear", e.target.value)}
                      style={styles.input}
                      placeholder="2025"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>End Month</label>
                    <select
                      value={item.endMonth}
                      onChange={(e) => updateCertificate(index, "endMonth", e.target.value)}
                      style={styles.select}
                      disabled={item.isPresent}
                    >
                      {MONTHS.map((month) => (
                        <option key={`cert-end-${month}`} value={month}>
                          {month || "Month"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.inputLabel}>End Year</label>
                    <input
                      value={item.endYear}
                      onChange={(e) => updateCertificate(index, "endYear", e.target.value)}
                      style={styles.input}
                      placeholder="2025"
                      disabled={item.isPresent}
                    />
                  </div>
                </div>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={item.isPresent}
                    onChange={(e) => updateCertificate(index, "isPresent", e.target.checked)}
                  />
                  <span>{ui.currentlyCompletingCert}</span>
                </label>
              </div>
            ))}
          </section>

          <section style={styles.card}>
            <p style={styles.cardKicker}>VOLUNTEER</p>
            <h2 style={styles.cardTitle}>{ui.volunteer}</h2>

            {volunteerItems.map((item, index) => (
              <div key={index} style={styles.entryCard}>
                <div style={styles.rowBetween}>
                  <h3 style={styles.entryTitle}>Volunteer {index + 1}</h3>
                  <button type="button" onClick={() => addVolunteer()} style={styles.smallButton}>
                    Add Volunteer
                  </button>
                </div>

                <div style={styles.twoColForm}>
                  <div>
                    <label style={styles.inputLabel}>Organization</label>
                    <input
                      value={item.organizationName}
                      onChange={(e) => updateVolunteer(index, "organizationName", e.target.value)}
                      style={styles.input}
                      placeholder="Organization"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Role Title</label>
                    <input
                      value={item.roleTitle}
                      onChange={(e) => updateVolunteer(index, "roleTitle", e.target.value)}
                      style={styles.input}
                      placeholder="Role Title"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>City</label>
                    <input
                      value={item.city}
                      onChange={(e) => updateVolunteer(index, "city", e.target.value)}
                      style={styles.input}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>State</label>
                    <input
                      value={item.state}
                      onChange={(e) => updateVolunteer(index, "state", e.target.value)}
                      style={styles.input}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Start Month</label>
                    <select
                      value={item.startMonth}
                      onChange={(e) => updateVolunteer(index, "startMonth", e.target.value)}
                      style={styles.select}
                    >
                      {MONTHS.map((month) => (
                        <option key={`vol-start-${month}`} value={month}>
                          {month || "Month"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Start Year</label>
                    <input
                      value={item.startYear}
                      onChange={(e) => updateVolunteer(index, "startYear", e.target.value)}
                      style={styles.input}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>End Month</label>
                    <select
                      value={item.endMonth}
                      onChange={(e) => updateVolunteer(index, "endMonth", e.target.value)}
                      style={styles.select}
                      disabled={item.isPresent}
                    >
                      {MONTHS.map((month) => (
                        <option key={`vol-end-${month}`} value={month}>
                          {month || "Month"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.inputLabel}>End Year</label>
                    <input
                      value={item.endYear}
                      onChange={(e) => updateVolunteer(index, "endYear", e.target.value)}
                      style={styles.input}
                      placeholder="2025"
                      disabled={item.isPresent}
                    />
                  </div>
                </div>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={item.isPresent}
                    onChange={(e) => updateVolunteer(index, "isPresent", e.target.checked)}
                  />
                  <span>{ui.currentlyVolunteerHere}</span>
                </label>

                <div style={styles.bulletWrap}>
                  {item.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex}>
                      <label style={styles.inputLabel}>Bullet {bulletIndex + 1}</label>
                      <textarea
                        value={bullet.text}
                        onChange={(e) => updateVolunteerBullet(index, bulletIndex, e.target.value)}
                        style={styles.textareaSmall}
                        placeholder="Describe your volunteer work or impact."
                      />
                    </div>
                  ))}
                  {item.bullets.length < BULLET_LIMIT ? (
                    <button type="button" onClick={() => addVolunteerBullet(index)} style={styles.smallButton}>
                      Add Bullet
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </section>

          <section style={styles.card}>
            <p style={styles.cardKicker}>ACCOMPLISHMENTS</p>
            <h2 style={styles.cardTitle}>{ui.accomplishments}</h2>
            <textarea
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              style={styles.textarea}
              placeholder="List awards, achievements, major results, or accomplishments."
            />
          </section>

          <section style={styles.card}>
            <p style={styles.cardKicker}>LAYOUT</p>
            <h2 style={styles.cardTitle}>{ui.moveSections}</h2>

            <div style={styles.sectionMoveWrap}>
              {sectionOrder.map((section, index) => (
                <div key={section} style={styles.sectionMoveRow}>
                  <span style={styles.sectionMoveLabel}>{section.toUpperCase()}</span>
                  <div style={styles.sectionMoveButtons}>
                    <button type="button" onClick={() => moveSection(index, "up")} style={styles.smallButton}>
                      Up
                    </button>
                    <button type="button" onClick={() => moveSection(index, "down")} style={styles.smallButton}>
                      Down
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.card}>
            <p style={styles.cardKicker}>ACTIONS</p>
            <h2 style={styles.cardTitle}>Save and Export</h2>

            <div style={styles.actionButtons}>
              <button onClick={handleSaveResume} disabled={saving} style={styles.primaryActionButton}>
                {saving ? "Saving..." : ui.saveResume}
              </button>

              <button onClick={handlePrint} style={styles.secondaryActionButton}>
                {ui.printResume}
              </button>
            </div>

            {message ? <p style={styles.messageBox}>{message}</p> : null}

            <div style={styles.actionLinks}>
              <a href="/profile" style={styles.backButton}>
                {ui.backToProfile}
              </a>
              {passportSlug ? (
                <a href={`/passport/${passportSlug}`} style={styles.backButton}>
                  {ui.viewPublicProfile}
                </a>
              ) : null}
            </div>
          </section>
        </div>

        <div style={styles.rightCol}>
          <div style={styles.previewCard}>
            <p style={styles.cardKicker}>{ui.livePreview}</p>
            <p style={styles.previewText}>{ui.previewHelp}</p>

            <div className="resumePrintWrap" ref={resumePrintRef}>
              <div className="resumePaper" style={{ ...styles.resumePaper, fontFamily }}>
                <div className="resumeHeader" style={styles.resumeHeader}>
                  <h1 style={styles.resumeName}>{fullName || "Your Name"}</h1>
                  <p style={styles.resumeContact}>
                    {[phone, email, [city, stateName].filter(Boolean).join(", ")].filter(Boolean).join(" • ") ||
                      "Phone • Email • City, State"}
                  </p>
                  {linkedinUrl ? <p style={styles.resumeLinkedin}>{linkedinUrl}</p> : null}
                </div>

                <div style={styles.resumePagesWrap}>
                  {sectionOrder.map((section) => (
                    <div key={section}>{renderResumeSection(section)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
    color: "#e7e7e7",
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  centerWrap: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "48px 24px",
  },
  lockedCard: {
    maxWidth: "760px",
    margin: "0 auto",
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "28px",
    padding: "32px",
    textAlign: "center",
  },
  lockedTitle: {
    margin: "0 0 14px",
    fontSize: "36px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  lockedButtons: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "18px",
  },
  signUpButton: {
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    border: "none",
    borderRadius: "16px",
    padding: "14px 18px",
    fontSize: "15px",
    fontWeight: 700,
    textDecoration: "none",
  },
  signUpButtonDark: {
    background: "#111111",
    color: "#f5f5f5",
    border: "1px solid #3a3a3a",
    borderRadius: "16px",
    padding: "14px 18px",
    fontSize: "15px",
    fontWeight: 700,
    textDecoration: "none",
  },
  fontBar: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(10px)",
    background: "rgba(6,6,7,0.92)",
    borderBottom: "1px solid #1f1f1f",
  },
  fontBarInner: {
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  fontBarKicker: {
    margin: "0 0 6px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  fontBarTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  fontControls: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },
  topSelectGroup: {
    display: "grid",
    gap: "8px",
  },
  topSelectLabel: {
    color: "#d4d4d8",
    fontSize: "13px",
    fontWeight: 600,
  },
  layout: {
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "24px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 640px",
    gap: "24px",
    alignItems: "start",
  },
  leftCol: {
    display: "grid",
    gap: "18px",
  },
  rightCol: {
    position: "sticky",
    top: "110px",
  },
  card: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
  },
  previewCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
  },
  cardKicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  cardTitle: {
    margin: "0 0 16px",
    fontSize: "26px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  previewText: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "15px",
    lineHeight: 1.7,
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  twoColForm: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  inputLabel: {
    display: "block",
    marginBottom: "8px",
    color: "#c9c9c9",
    fontSize: "13px",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "130px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  textareaSmall: {
    width: "100%",
    minHeight: "80px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  fieldBlock: {
    marginBottom: "12px",
  },
  entryCard: {
    background: "#101010",
    border: "1px solid #2d2d2d",
    borderRadius: "20px",
    padding: "18px",
    marginBottom: "14px",
  },
  entryTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#f5f5f5",
  },
  checkboxRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    color: "#e5e7eb",
    margin: "12px 0 0",
  },
  bulletWrap: {
    display: "grid",
    gap: "10px",
    marginTop: "14px",
  },
  smallButton: {
    background: "#111111",
    color: "#f5f5f5",
    border: "1px solid #3a3a3a",
    borderRadius: "14px",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  sectionMoveWrap: {
    display: "grid",
    gap: "10px",
  },
  sectionMoveRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    background: "#101010",
    border: "1px solid #2d2d2d",
    borderRadius: "18px",
    padding: "14px 16px",
  },
  sectionMoveLabel: {
    color: "#f5f5f5",
    fontWeight: 600,
    fontSize: "14px",
  },
  sectionMoveButtons: {
    display: "flex",
    gap: "8px",
  },
  actionButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  primaryActionButton: {
    width: "100%",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #d1d5db",
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryActionButton: {
    width: "100%",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  actionLinks: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  backButton: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(148,163,184,0.28)",
    borderRadius: "18px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: 700,
    textAlign: "center",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messageBox: {
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.28)",
    color: "#dbeafe",
    borderRadius: "18px",
    padding: "14px 16px",
    marginBottom: "16px",
    fontSize: "15px",
  },
  resumePagesWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  resumePaper: {
    width: "100%",
    minHeight: "1120px",
    height: "auto",
    overflow: "visible",
    background: "#fff",
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
    padding: "34px 32px 42px",
    color: "#111827",
    boxSizing: "border-box",
  },
  resumeHeader: {
    textAlign: "center",
    marginBottom: "20px",
    paddingBottom: "8px",
  },
  resumeName: {
    margin: "0 0 8px",
    fontSize: "28px",
    fontWeight: 700,
    color: "#111827",
  },
  resumeContact: {
    margin: "0 0 6px",
    fontSize: "14px",
    lineHeight: 1.5,
    color: "#374151",
    wordBreak: "break-word",
  },
  resumeLinkedin: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.5,
    color: "#1d4ed8",
    wordBreak: "break-word",
  },
  resumeSectionBlock: {
    marginBottom: "20px",
  },
  resumeSectionTitle: {
    margin: "0 0 10px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: 700,
    color: "#111827",
  },
  resumeParagraph: {
    margin: 0,
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#111827",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  skillsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px 24px",
  },
  skillColumn: {
    minWidth: 0,
  },
  skillItem: {
    margin: "0 0 8px",
    fontSize: "15px",
    lineHeight: 1.5,
    color: "#111827",
    wordBreak: "break-word",
  },
  resumeEntry: {
    marginBottom: "16px",
  },
  resumeEntryTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "6px",
  },
  resumeEntryHeading: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
  },
  resumeEntrySubheading: {
    margin: "4px 0 0",
    fontSize: "15px",
    fontWeight: 600,
    color: "#111827",
  },
  resumeEntryDates: {
    margin: 0,
    fontSize: "14px",
    color: "#374151",
    whiteSpace: "nowrap",
  },
  resumeBullet: {
    margin: "4px 0",
    fontSize: "15px",
    lineHeight: 1.65,
    color: "#111827",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
};
