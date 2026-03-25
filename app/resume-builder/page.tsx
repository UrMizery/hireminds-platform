"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type ResumePlan = "free" | "access" | "premium" | "pro";
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

const FREE_BULLET_LIMIT = 4;
const PAID_BULLET_LIMIT = 6;
const SKILL_LIMIT = 9;

const MONTHS = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const PLAN_COPY: Record<
  ResumePlan,
  { label: string; description: string; pageLimit: number }
> = {
  free: {
    label: "Free",
    description:
      "2 page only. 4 bullets per role. 1 virtual mock interview session for 30 minutes. 1 free resume per month.",
    pageLimit: 2,
  },
  access: {
    label: "Resume Access",
    description:
      "$19.99/month. Ongoing resume access. 1 employer verification offered once when enrolled. Two 30 minute virtual mock interview sessions per month with a Career Coach.",
    pageLimit: 2,
  },
  premium: {
    label: "Premium",
    description:
      "$29.99/month. Includes everything in Resume Access plus premium support and 3 employer verifications once when enrolled.",
    pageLimit: 3,
  },
  pro: {
    label: "Premium Plus / Pro",
    description:
      "$45.99/month. Includes everything in Premium plus CV-level support and 5 employer verifications once when enrolled.",
    pageLimit: 4,
  },
};

const TRANSLATIONS: Record<
  ResumeLanguage,
  {
    pageKicker: string;
    pageTitle: string;
    plan: string;
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
    pageKicker: "RESUME BUILDER",
    pageTitle: "Choose your resume font before you begin.",
    plan: "Choose plan",
    font: "Resume Font",
    language: "Language",
    livePreview: "Resume Preview",
    previewHelp:
      "The preview stays visible while you build and expands as you type.",
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
    pageKicker: "CREADOR DE CURRÍCULUM",
    pageTitle: "Elige la fuente de tu currículum antes de comenzar.",
    plan: "Elegir plan",
    font: "Fuente del currículum",
    language: "Idioma",
    livePreview: "Vista previa del currículum",
    previewHelp:
      "La vista previa permanece visible mientras escribes y se expande a medida que agregas contenido.",
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
    currentlyCompletingCert:
      "Actualmente estoy completando esta certificación",
    currentlyVolunteerHere: "Actualmente hago voluntariado aquí",
    backToProfile: "Volver al perfil",
    viewPublicProfile: "Ver perfil público",
  },
  Hindi: {
    pageKicker: "रिज़्यूमे बिल्डर",
    pageTitle: "शुरू करने से पहले अपने रिज़्यूमे का फ़ॉन्ट चुनें।",
    plan: "प्लान चुनें",
    font: "रिज़्यूमे फ़ॉन्ट",
    language: "भाषा",
    livePreview: "रिज़्यूमे पूर्वावलोकन",
    previewHelp:
      "जब आप बनाते हैं तो पूर्वावलोकन दिखाई देता रहता है और टाइप करते समय बढ़ता जाता है।",
    header: "रिज़्यूमे हेडर",
    summary: "सारांश",
    summaryAndSkills: "सारांश + कौशल",
    experience: "कार्य अनुभव",
    education: "शिक्षा (वैकल्पिक)",
    certifications: "प्रमाणपत्र (वैकल्पिक)",
    volunteer: "स्वयंसेवी कार्य (वैकल्पिक)",
    accomplishments: "उपलब्धियाँ (वैकल्पिक)",
    saveResume: "रिज़्यूमे सहेजें",
    printResume: "रिज़्यूमे प्रिंट करें",
    moveSections: "रिज़्यूमे सेक्शन बदलें",
    currentlyWorkHere: "मैं वर्तमान में यहाँ काम करता/करती हूँ",
    currentlyAttendHere: "मैं वर्तमान में यहाँ पढ़ता/पढ़ती हूँ",
    currentlyCompletingCert:
      "मैं वर्तमान में यह प्रमाणपत्र पूरा कर रहा/रही हूँ",
    currentlyVolunteerHere: "मैं वर्तमान में यहाँ स्वयंसेवा करता/करती हूँ",
    backToProfile: "प्रोफ़ाइल पर वापस जाएँ",
    viewPublicProfile: "सार्वजनिक प्रोफ़ाइल देखें",
  },
  Polish: {
    pageKicker: "KREATOR CV",
    pageTitle: "Wybierz czcionkę CV przed rozpoczęciem.",
    plan: "Wybierz plan",
    font: "Czcionka CV",
    language: "Język",
    livePreview: "Podgląd CV",
    previewHelp:
      "Podgląd pozostaje widoczny podczas tworzenia i rozszerza się w miarę pisania.",
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
    currentlyAttendHere: "Obecnie tu się uczę",
    currentlyCompletingCert: "Obecnie kończę ten certyfikat",
    currentlyVolunteerHere: "Obecnie jestem tu wolontariuszem",
    backToProfile: "Wróć do profilu",
    viewPublicProfile: "Zobacz profil publiczny",
  },
};

function moveItem<T>(arr: T[], index: number, direction: "up" | "down") {
  const updated = [...arr];
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= arr.length) return arr;
  [updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];
  return updated;
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

export default function ResumeBuilderPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [userId, setUserId] = useState("");
  const [passportSlug, setPassportSlug] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const resumePrintRef = useRef<HTMLDivElement>(null);

  const [plan, setPlan] = useState<ResumePlan>("free");
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

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
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
    },
  ]);

  const [educationItems, setEducationItems] = useState<EducationItem[]>([
    {
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
    },
  ]);

  const [certificateItems, setCertificateItems] = useState<CertificateItem[]>([
    {
      organizationName: "",
      city: "",
      state: "",
      certificateName: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      isPresent: false,
    },
  ]);

  const [volunteerItems, setVolunteerItems] = useState<VolunteerItem[]>([
    {
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
    },
  ]);

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
        .select(
          "full_name, phone, city, state, email, linkedin_url, passport_slug"
        )
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
  const planInfo = PLAN_COPY[plan];
  const bulletLimit = plan === "free" ? FREE_BULLET_LIMIT : PAID_BULLET_LIMIT;

  const skills = useMemo(() => {
    return skillsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, SKILL_LIMIT);
  }, [skillsInput]);

  const skillColumns = useMemo(() => splitSkillsIntoColumns(skills), [skills]);

  const activeExperiences = useMemo(
    () => experiences.filter((item) => hasExperienceContent(item)),
    [experiences]
  );

  const activeEducation = useMemo(
    () => educationItems.filter((item) => hasEducationContent(item)),
    [educationItems]
  );

  const activeCertificates = useMemo(
    () => certificateItems.filter((item) => hasCertificateContent(item)),
    [certificateItems]
  );

  const activeVolunteer = useMemo(
    () => volunteerItems.filter((item) => hasVolunteerContent(item)),
    [volunteerItems]
  );

  function addExperience() {
    setExperiences((prev) => [
      ...prev,
      {
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
      },
    ]);
  }

  function updateExperience(
    index: number,
    field: keyof ExperienceItem,
    value: string | boolean
  ) {
    setExperiences((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function updateExperienceBullet(
    index: number,
    bulletIndex: number,
    value: string
  ) {
    setExperiences((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const bullets = item.bullets.map((bullet, j) =>
          j === bulletIndex ? { text: value } : bullet
        );
        return { ...item, bullets };
      })
    );
  }

  function addExperienceBullet(index: number) {
    setExperiences((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (item.bullets.length >= bulletLimit) return item;
        return { ...item, bullets: [...item.bullets, { text: "" }] };
      })
    );
  }

  function addEducation() {
    setEducationItems((prev) => [
      ...prev,
      {
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
      },
    ]);
  }

  function updateEducation(
    index: number,
    field: keyof EducationItem,
    value: string | boolean
  ) {
    setEducationItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addCertificate() {
    setCertificateItems((prev) => [
      ...prev,
      {
        organizationName: "",
        city: "",
        state: "",
        certificateName: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        isPresent: false,
      },
    ]);
  }

  function updateCertificate(
    index: number,
    field: keyof CertificateItem,
    value: string | boolean
  ) {
    setCertificateItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addVolunteer() {
    setVolunteerItems((prev) => [
      ...prev,
      {
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
      },
    ]);
  }

  function updateVolunteer(
    index: number,
    field: keyof VolunteerItem,
    value: string | boolean
  ) {
    setVolunteerItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function updateVolunteerBullet(
    index: number,
    bulletIndex: number,
    value: string
  ) {
    setVolunteerItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const bullets = item.bullets.map((bullet, j) =>
          j === bulletIndex ? { text: value } : bullet
        );
        return { ...item, bullets };
      })
    );
  }

  function addVolunteerBullet(index: number) {
    setVolunteerItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (item.bullets.length >= bulletLimit) return item;
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
        .select("id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData?.id) {
        throw new Error("No candidate profile found for this user.");
      }

      const profileId = profileData.id;

      await supabase
        .from("candidate_profiles")
        .update({
          full_name: fullName,
          phone,
          city,
          state: stateName,
          email,
          linkedin_url: linkedinUrl,
        })
        .eq("id", profileId);

      const payload = {
        profile_id: profileId,
        title: plan === "free" ? "Free Resume" : "Primary Resume",
        page_limit: planInfo.pageLimit,
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
        plan_type: plan,
        plan_description: planInfo.description,
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
        const { error: updateError } = await supabase
          .from("resumes")
          .update(payload)
          .eq("id", existingResume.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("resumes")
          .insert(payload);
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
  const resumeNode = resumePrintRef.current;

  if (!resumeNode) {
    setMessage("Resume preview is not ready to print yet.");
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=1200");

  if (!printWindow) {
    setMessage("Pop-up blocked. Please allow pop-ups and try again.");
    return;
  }

  const resumeHtml = resumeNode.innerHTML;

  printWindow.document.open();
  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Resume Preview</title>
        <style>
          @page {
            size: letter;
            margin: 0.5in;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: white;
            color: #111827;
            font-family: ${fontFamily}, serif;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-resume {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            color: #111827;
          }

          .resumeHeader {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 8px;
          }

          .resumeName {
            margin: 0 0 8px;
            font-size: 28px;
            font-weight: 700;
            color: #111827;
          }

          .resumeContact {
            margin: 0 0 6px;
            font-size: 14px;
            line-height: 1.5;
            color: #374151;
            word-break: break-word;
          }

          .resumeLinkedin {
            margin: 0;
            font-size: 14px;
            line-height: 1.5;
            color: #1d4ed8;
            word-break: break-word;
          }

          .resumeSection {
            margin-bottom: 20px;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .resumeSectionTitle {
            margin: 0 0 10px;
            text-align: center;
            font-size: 22px;
            font-weight: 700;
            color: #111827;
          }

          .resumeParagraph {
            margin: 0;
            font-size: 15px;
            line-height: 1.7;
            color: #111827;
            white-space: pre-wrap;
            word-break: break-word;
          }

          .skillsGrid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px 24px;
          }

          .skillColumn {
            min-width: 0;
          }

          .skillItem {
            margin: 0 0 8px;
            font-size: 15px;
            line-height: 1.5;
            color: #111827;
            word-break: break-word;
          }

          .resumeEntry {
            margin-bottom: 16px;
          }

          .resumeEntryTop {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 6px;
          }

          .resumeEntryHeading {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            color: #111827;
          }

          .resumeEntrySubheading {
            margin: 4px 0 0;
            font-size: 15px;
            font-weight: 600;
            color: #111827;
          }

          .resumeEntryDates {
            margin: 0;
            font-size: 14px;
            color: #374151;
            white-space: nowrap;
          }

          .resumeBullet {
            margin: 4px 0;
            font-size: 15px;
            line-height: 1.65;
            color: #111827;
            white-space: pre-wrap;
            word-break: break-word;
          }
        </style>
      </head>
      <body>
        <div class="print-resume">
          ${resumeHtml}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();

  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 300);
}

  function renderResumeSection(section: ResumeSectionKey) {
    switch (section) {
      case "summary":
        if (!summaryText && !summaryHeading) return null;
        return (
          <section className="resumeSection" style={styles.resumeSectionBlock}>
            <h3 style={styles.resumeSectionTitle}>
              {summaryHeading || ui.summary}
            </h3>
            <p style={styles.resumeParagraph}>
              {summaryText || "Add your professional summary here."}
            </p>
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
                      {item.city || item.state
                        ? `— ${[item.city, item.state]
                            .filter(Boolean)
                            .join(", ")}`
                        : ""}
                    </p>
                    <p style={styles.resumeEntrySubheading}>
                      {item.roleTitle || "Role Title"}
                    </p>
                  </div>
                  <p style={styles.resumeEntryDates}>
                    {formatDateRange(
                      item.startMonth,
                      item.startYear,
                      item.endMonth,
                      item.endYear,
                      item.isPresent
                    )}
                  </p>
                </div>
                {item.bullets
                  .filter((b) => b.text.trim())
                  .map((bullet, bulletIndex) => (
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
                      {item.city || item.state
                        ? `— ${[item.city, item.state]
                            .filter(Boolean)
                            .join(", ")}`
                        : ""}
                    </p>
                    <p style={styles.resumeEntrySubheading}>
                      {item.degree || "Degree"}
                      {item.gpa ? ` | GPA: ${item.gpa}` : ""}
                    </p>
                  </div>
                  <p style={styles.resumeEntryDates}>
                    {formatDateRange(
                      item.startMonth,
                      item.startYear,
                      item.endMonth,
                      item.endYear,
                      item.isPresent
                    )}
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
                      {item.city || item.state
                        ? `— ${[item.city, item.state]
                            .filter(Boolean)
                            .join(", ")}`
                        : ""}
                    </p>
                    <p style={styles.resumeEntrySubheading}>
                      {item.certificateName || "Certificate / Course Name"}
                    </p>
                  </div>
                  <p style={styles.resumeEntryDates}>
                    {formatDateRange(
                      item.startMonth,
                      item.startYear,
                      item.endMonth,
                      item.endYear,
                      item.isPresent
                    )}
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
                      {item.city || item.state
                        ? `— ${[item.city, item.state]
                            .filter(Boolean)
                            .join(", ")}`
                        : ""}
                    </p>
                    <p style={styles.resumeEntrySubheading}>
                      {item.roleTitle || "Role Title"}
                    </p>
                  </div>
                  <p style={styles.resumeEntryDates}>
                    {formatDateRange(
                      item.startMonth,
                      item.startYear,
                      item.endMonth,
                      item.endYear,
                      item.isPresent
                    )}
                  </p>
                </div>
                {item.bullets
                  .filter((b) => b.text.trim())
                  .map((bullet, bulletIndex) => (
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

  return (
    <main style={styles.page}>
   <style>{`
  @media print {
    @page {
      margin: 0.5in;
    }

    html,
    body {
      margin: 0 !important;
      padding: 0 !important;
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
  position: static !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  background: white !important;
}

.topBar {
  display: none !important;
}

.container {
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
main {
  min-height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
}

.layout {
  display: block !important;
}

.rightCol {
  position: static !important;
  top: 0 !important;
  align-self: auto !important;
  margin: 0 !important;
  padding: 0 !important;
}

.previewCard {
  display: none !important;
}
.builderShell {
  display: block !important;
}

.builderLeft {
  display: none !important;
}

.resumePrintWrap {
  display: block !important;
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  top: auto !important;
  align-self: auto !important;
}

.resumePaper {
  width: 100% !important;
  ...
}
    .resumePaper {
      width: 100% !important;
      max-width: none !important;
      min-height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background: white !important;
      overflow: visible !important;
    }

    .resumeHeader {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .resumeSection {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    .builderLeft,
    .builderTopRow,
    .siteButtons,
    .flashMessage {
      display: none !important;
    }
  }
`}</style>

      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <p style={styles.kicker}>{ui.pageKicker}</p>
            <h1 style={styles.pageTitle}>{ui.pageTitle}</h1>
          </div>

          <div style={styles.topSelectors}>
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

        <div className="builderShell" style={styles.layout}>
          <div className="builderLeft" style={styles.leftCol}>
            <section style={styles.card}>
              <p style={styles.cardKicker}>PLAN</p>
              <div style={styles.rowBetween}>
                <h2 style={styles.cardTitle}>{ui.plan}</h2>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as ResumePlan)}
                  style={styles.planSelect}
                >
                  <option value="free">Free</option>
                  <option value="access">Resume Access</option>
                  <option value="premium">Premium</option>
                  <option value="pro">Premium Plus / Pro</option>
                </select>
              </div>
              <div style={styles.planInfoBox}>
                <p style={styles.planName}>{planInfo.label}</p>
                <p style={styles.planDescription}>{planInfo.description}</p>
              </div>
            </section>

            <section style={styles.card}>
              <p style={styles.cardKicker}>HEADER</p>
              <h2 style={styles.cardTitle}>{ui.header}</h2>

              <div style={styles.twoColForm}>
                <div>
                  <label style={styles.inputLabel}>Full Name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={styles.input}
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={styles.input}
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>City (optional)</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={styles.input}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>State (optional)</label>
                  <input
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    style={styles.input}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>LinkedIn (optional)</label>
                  <input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    style={styles.input}
                    placeholder="LinkedIn URL"
                  />
                </div>
              </div>
            </section>

            <section style={styles.card}>
              <p style={styles.cardKicker}>SUMMARY</p>
              <h2 style={styles.cardTitle}>{ui.summaryAndSkills}</h2>

              <label style={styles.inputLabel}>
                Summary Heading (optional, can be blank or "Summary")
              </label>
              <input
                value={summaryHeading}
                onChange={(e) => setSummaryHeading(e.target.value)}
                style={styles.input}
                placeholder="Summary"
              />

              <label style={styles.inputLabel}>Summary</label>
              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                style={styles.textarea}
                placeholder="Example: Client-focused workforce development professional with experience in talent acquisition, resume writing, employer engagement, and job readiness coaching."
              />

              <label style={styles.inputLabel}>
                Skills (comma separated, up to 9)
              </label>
              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                style={styles.input}
                placeholder="Recruiting, ATS, Sourcing, Interviewing"
              />
            </section>

            <section style={styles.card}>
              <p style={styles.cardKicker}>EXPERIENCE</p>
              <h2 style={styles.cardTitle}>{ui.experience}</h2>

              {experiences.map((item, index) => (
                <div key={index} style={styles.sectionGroup}>
                  <div style={styles.twoColForm}>
                    <div>
                      <label style={styles.inputLabel}>Company</label>
                      <input
                        value={item.companyName}
                        onChange={(e) =>
                          updateExperience(index, "companyName", e.target.value)
                        }
                        style={styles.input}
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>Role</label>
                      <input
                        value={item.roleTitle}
                        onChange={(e) =>
                          updateExperience(index, "roleTitle", e.target.value)
                        }
                        style={styles.input}
                        placeholder="Role Title"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>City</label>
                      <input
                        value={item.city}
                        onChange={(e) =>
                          updateExperience(index, "city", e.target.value)
                        }
                        style={styles.input}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>State</label>
                      <input
                        value={item.state}
                        onChange={(e) =>
                          updateExperience(index, "state", e.target.value)
                        }
                        style={styles.input}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>From Month</label>
                      <select
                        value={item.startMonth}
                        onChange={(e) =>
                          updateExperience(index, "startMonth", e.target.value)
                        }
                        style={styles.input}
                      >
                        {MONTHS.map((month) => (
                          <option key={month} value={month}>
                            {month || "Select"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={styles.inputLabel}>From Year</label>
                      <input
                        value={item.startYear}
                        onChange={(e) =>
                          updateExperience(index, "startYear", e.target.value)
                        }
                        style={styles.input}
                        placeholder="2022"
                      />
                    </div>
                  </div>

                  <label style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={item.isPresent}
                      onChange={(e) =>
                        updateExperience(index, "isPresent", e.target.checked)
                      }
                    />
                    <span>{ui.currentlyWorkHere}</span>
                  </label>

                  {!item.isPresent && (
                    <div style={styles.twoColForm}>
                      <div>
                        <label style={styles.inputLabel}>To Month</label>
                        <select
                          value={item.endMonth}
                          onChange={(e) =>
                            updateExperience(index, "endMonth", e.target.value)
                          }
                          style={styles.input}
                        >
                          {MONTHS.map((month) => (
                            <option key={month} value={month}>
                              {month || "Select"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={styles.inputLabel}>To Year</label>
                        <input
                          value={item.endYear}
                          onChange={(e) =>
                            updateExperience(index, "endYear", e.target.value)
                          }
                          style={styles.input}
                          placeholder="2024"
                        />
                      </div>
                    </div>
                  )}

                  <p style={styles.helper}>
                    {plan === "free"
                      ? "Free plan allows up to 4 bullet points per role."
                      : "Paid plans allow up to 6 bullet points per role."}
                  </p>

                  {item.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex}>
                      <label style={styles.inputLabel}>
                        Bullet {bulletIndex + 1}
                      </label>
                      <input
                        value={bullet.text}
                        onChange={(e) =>
                          updateExperienceBullet(
                            index,
                            bulletIndex,
                            e.target.value
                          )
                        }
                        style={styles.input}
                        placeholder="Describe the work you did"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addExperienceBullet(index)}
                    style={styles.smallButton}
                  >
                    + Add Bullet
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addExperience}
                style={styles.smallButton}
              >
                + Add Work Experience
              </button>
            </section>

            <section style={styles.card}>
              <p style={styles.cardKicker}>EDUCATION</p>
              <h2 style={styles.cardTitle}>{ui.education}</h2>

              {educationItems.map((item, index) => (
                <div key={index} style={styles.sectionGroup}>
                  <div style={styles.twoColForm}>
                    <div>
                      <label style={styles.inputLabel}>School / College</label>
                      <input
                        value={item.schoolName}
                        onChange={(e) =>
                          updateEducation(index, "schoolName", e.target.value)
                        }
                        style={styles.input}
                        placeholder="School / College"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>
                        Degree / Course of Study
                      </label>
                      <input
                        value={item.degree}
                        onChange={(e) =>
                          updateEducation(index, "degree", e.target.value)
                        }
                        style={styles.input}
                        placeholder="Degree / Course of Study"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>City</label>
                      <input
                        value={item.city}
                        onChange={(e) =>
                          updateEducation(index, "city", e.target.value)
                        }
                        style={styles.input}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>State</label>
                      <input
                        value={item.state}
                        onChange={(e) =>
                          updateEducation(index, "state", e.target.value)
                        }
                        style={styles.input}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>From Month</label>
                      <select
                        value={item.startMonth}
                        onChange={(e) =>
                          updateEducation(index, "startMonth", e.target.value)
                        }
                        style={styles.input}
                      >
                        {MONTHS.map((month) => (
                          <option key={month} value={month}>
                            {month || "Select"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={styles.inputLabel}>From Year</label>
                      <input
                        value={item.startYear}
                        onChange={(e) =>
                          updateEducation(index, "startYear", e.target.value)
                        }
                        style={styles.input}
                        placeholder="2019"
                      />
                    </div>
                  </div>

                  <label style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={item.isPresent}
                      onChange={(e) =>
                        updateEducation(index, "isPresent", e.target.checked)
                      }
                    />
                    <span>{ui.currentlyAttendHere}</span>
                  </label>

                  {!item.isPresent && (
                    <div style={styles.twoColForm}>
                      <div>
                        <label style={styles.inputLabel}>To Month</label>
                        <select
                          value={item.endMonth}
                          onChange={(e) =>
                            updateEducation(index, "endMonth", e.target.value)
                          }
                          style={styles.input}
                        >
                          {MONTHS.map((month) => (
                            <option key={month} value={month}>
                              {month || "Select"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={styles.inputLabel}>To Year</label>
                        <input
                          value={item.endYear}
                          onChange={(e) =>
                            updateEducation(index, "endYear", e.target.value)
                          }
                          style={styles.input}
                          placeholder="2023"
                        />
                      </div>
                    </div>
                  )}

                  <label style={styles.inputLabel}>GPA (optional)</label>
                  <input
                    value={item.gpa}
                    onChange={(e) =>
                      updateEducation(index, "gpa", e.target.value)
                    }
                    style={styles.input}
                    placeholder="3.8"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addEducation}
                style={styles.smallButton}
              >
                + Add Education
              </button>
            </section>

            <section style={styles.card}>
              <p style={styles.cardKicker}>CERTIFICATES</p>
              <h2 style={styles.cardTitle}>{ui.certifications}</h2>

              {certificateItems.map((item, index) => (
                <div key={index} style={styles.sectionGroup}>
                  <div style={styles.twoColForm}>
                    <div>
                      <label style={styles.inputLabel}>
                        Organization / Program
                      </label>
                      <input
                        value={item.organizationName}
                        onChange={(e) =>
                          updateCertificate(
                            index,
                            "organizationName",
                            e.target.value
                          )
                        }
                        style={styles.input}
                        placeholder="Organization / Program"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>
                        Certificate / Course Name
                      </label>
                      <input
                        value={item.certificateName}
                        onChange={(e) =>
                          updateCertificate(
                            index,
                            "certificateName",
                            e.target.value
                          )
                        }
                        style={styles.input}
                        placeholder="Certificate / Course Name"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>City</label>
                      <input
                        value={item.city}
                        onChange={(e) =>
                          updateCertificate(index, "city", e.target.value)
                        }
                        style={styles.input}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>State</label>
                      <input
                        value={item.state}
                        onChange={(e) =>
                          updateCertificate(index, "state", e.target.value)
                        }
                        style={styles.input}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>From Month</label>
                      <select
                        value={item.startMonth}
                        onChange={(e) =>
                          updateCertificate(index, "startMonth", e.target.value)
                        }
                        style={styles.input}
                      >
                        {MONTHS.map((month) => (
                          <option key={month} value={month}>
                            {month || "Select"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={styles.inputLabel}>From Year</label>
                      <input
                        value={item.startYear}
                        onChange={(e) =>
                          updateCertificate(index, "startYear", e.target.value)
                        }
                        style={styles.input}
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <label style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={item.isPresent}
                      onChange={(e) =>
                        updateCertificate(index, "isPresent", e.target.checked)
                      }
                    />
                    <span>{ui.currentlyCompletingCert}</span>
                  </label>

                  {!item.isPresent && (
                    <div style={styles.twoColForm}>
                      <div>
                        <label style={styles.inputLabel}>To Month</label>
                        <select
                          value={item.endMonth}
                          onChange={(e) =>
                            updateCertificate(index, "endMonth", e.target.value)
                          }
                          style={styles.input}
                        >
                          {MONTHS.map((month) => (
                            <option key={month} value={month}>
                              {month || "Select"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={styles.inputLabel}>To Year</label>
                        <input
                          value={item.endYear}
                          onChange={(e) =>
                            updateCertificate(index, "endYear", e.target.value)
                          }
                          style={styles.input}
                          placeholder="2024"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addCertificate}
                style={styles.smallButton}
              >
                + Add Certification
              </button>
            </section>

            <section style={styles.card}>
              <p style={styles.cardKicker}>VOLUNTEER</p>
              <h2 style={styles.cardTitle}>{ui.volunteer}</h2>

              {volunteerItems.map((item, index) => (
                <div key={index} style={styles.sectionGroup}>
                  <div style={styles.twoColForm}>
                    <div>
                      <label style={styles.inputLabel}>Organization</label>
                      <input
                        value={item.organizationName}
                        onChange={(e) =>
                          updateVolunteer(
                            index,
                            "organizationName",
                            e.target.value
                          )
                        }
                        style={styles.input}
                        placeholder="Organization Name"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>Role</label>
                      <input
                        value={item.roleTitle}
                        onChange={(e) =>
                          updateVolunteer(index, "roleTitle", e.target.value)
                        }
                        style={styles.input}
                        placeholder="Role Title"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>City</label>
                      <input
                        value={item.city}
                        onChange={(e) =>
                          updateVolunteer(index, "city", e.target.value)
                        }
                        style={styles.input}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>State</label>
                      <input
                        value={item.state}
                        onChange={(e) =>
                          updateVolunteer(index, "state", e.target.value)
                        }
                        style={styles.input}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>From Month</label>
                      <select
                        value={item.startMonth}
                        onChange={(e) =>
                          updateVolunteer(index, "startMonth", e.target.value)
                        }
                        style={styles.input}
                      >
                        {MONTHS.map((month) => (
                          <option key={month} value={month}>
                            {month || "Select"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={styles.inputLabel}>From Year</label>
                      <input
                        value={item.startYear}
                        onChange={(e) =>
                          updateVolunteer(index, "startYear", e.target.value)
                        }
                        style={styles.input}
                        placeholder="2020"
                      />
                    </div>
                  </div>

                  <label style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={item.isPresent}
                      onChange={(e) =>
                        updateVolunteer(index, "isPresent", e.target.checked)
                      }
                    />
                    <span>{ui.currentlyVolunteerHere}</span>
                  </label>

                  {!item.isPresent && (
                    <div style={styles.twoColForm}>
                      <div>
                        <label style={styles.inputLabel}>To Month</label>
                        <select
                          value={item.endMonth}
                          onChange={(e) =>
                            updateVolunteer(index, "endMonth", e.target.value)
                          }
                          style={styles.input}
                        >
                          {MONTHS.map((month) => (
                            <option key={month} value={month}>
                              {month || "Select"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={styles.inputLabel}>To Year</label>
                        <input
                          value={item.endYear}
                          onChange={(e) =>
                            updateVolunteer(index, "endYear", e.target.value)
                          }
                          style={styles.input}
                          placeholder="2022"
                        />
                      </div>
                    </div>
                  )}

                  <p style={styles.helper}>
                    {plan === "free"
                      ? "Free plan allows up to 4 bullet points for volunteer work."
                      : "Paid plans allow up to 6 bullet points for volunteer work."}
                  </p>

                  {item.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex}>
                      <label style={styles.inputLabel}>
                        Bullet {bulletIndex + 1}
                      </label>
                      <input
                        value={bullet.text}
                        onChange={(e) =>
                          updateVolunteerBullet(
                            index,
                            bulletIndex,
                            e.target.value
                          )
                        }
                        style={styles.input}
                        placeholder="Describe your volunteer work"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addVolunteerBullet(index)}
                    style={styles.smallButton}
                  >
                    + Add Bullet
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addVolunteer}
                style={styles.smallButton}
              >
                + Add Volunteer Work
              </button>
            </section>

            <section style={styles.card}>
              <p style={styles.cardKicker}>ACCOMPLISHMENTS</p>
              <h2 style={styles.cardTitle}>{ui.accomplishments}</h2>
              <label style={styles.inputLabel}>Accomplishments</label>
              <textarea
                value={accomplishments}
                onChange={(e) => setAccomplishments(e.target.value)}
                style={styles.textarea}
                placeholder="Awards, recognitions, achievements, notable wins"
              />
            </section>

            <section style={styles.card}>
              <p style={styles.cardKicker}>ORDER</p>
              <h2 style={styles.cardTitle}>{ui.moveSections}</h2>

              {sectionOrder.map((section, index) => (
                <div key={section} style={styles.orderRow}>
                  <span style={styles.orderLabel}>
                    {section === "summary"
                      ? "Summary"
                      : section === "skills"
                      ? "Skills"
                      : section === "experience"
                      ? "Experience"
                      : section === "education"
                      ? "Education"
                      : section === "certifications"
                      ? "Certifications"
                      : section === "volunteer"
                      ? "Volunteer"
                      : "Accomplishments"}
                  </span>
                  <div style={styles.orderButtons}>
                    <button
                      type="button"
                      onClick={() => moveSection(index, "up")}
                      style={styles.orderButton}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, "down")}
                      style={styles.orderButton}
                    >
                      Down
                    </button>
                  </div>
                </div>
              ))}
            </section>

            {message ? (
              <div className="flashMessage" style={styles.messageBox}>
                {message}
              </div>
            ) : null}

            <div className="siteButtons" style={styles.footerButtons}>
              <button
                type="button"
                onClick={handleSaveResume}
                disabled={saving}
                style={styles.saveButton}
              >
                {saving ? "Saving..." : ui.saveResume}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                style={styles.printButton}
              >
                {ui.printResume}
              </button>
              <a href="/profile" style={styles.backButton}>
                {ui.backToProfile}
              </a>
              {passportSlug ? (
                <a
                  href={`/passport/${passportSlug}`}
                  style={styles.backButton}
                >
                  {ui.viewPublicProfile}
                </a>
              ) : null}
            </div>
          </div>

          <div className="resumePrintWrap" style={styles.rightCol}>
            <div className="builderTopRow" style={styles.previewCard}>
              <p style={styles.cardKicker}>LIVE PREVIEW</p>
              <h2 style={styles.cardTitle}>{ui.livePreview}</h2>
              <p style={styles.previewHelp}>{ui.previewHelp}</p>
            </div>

          <div
  ref={resumePrintRef}
  className="resumePaper"
  style={{
    ...styles.resumePaper,
    fontFamily,
  }}
>
              <div className="resumeHeader" style={styles.resumeHeader}>
                <h1 style={styles.resumeName}>{fullName || "Your Name"}</h1>
                <p style={styles.resumeContact}>
                  {[phone, email, [city, stateName].filter(Boolean).join(", ")]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
                {linkedinUrl ? (
                  <p style={styles.resumeLinkedin}>{linkedinUrl}</p>
                ) : null}
              </div>

              {sectionOrder.map((section) => (
                <div key={section}>{renderResumeSection(section)}</div>
              ))}
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
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)",
    color: "#f5f5f5",
    padding: "24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  container: {
    maxWidth: "1380px",
    margin: "0 auto",
  },
  centerWrap: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: "#e5e7eb",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  topSelectors: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  topSelectGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "180px",
  },
  topSelectLabel: {
    fontSize: "13px",
    color: "#d1d5db",
    fontWeight: 600,
  },
  kicker: {
    margin: "0 0 8px",
    color: "#c4b5fd",
    fontSize: "12px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  },
  pageTitle: {
    margin: 0,
    fontSize: "44px",
    lineHeight: 1.06,
    letterSpacing: "-0.04em",
    fontWeight: 700,
    color: "#fafafa",
    maxWidth: "760px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 520px",
    gap: "24px",
    alignItems: "start",
  },
  leftCol: {
    minWidth: 0,
  },
  rightCol: {
    position: "sticky",
    top: "20px",
    alignSelf: "start",
  },
  card: {
    background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
    border: "1px solid #262626",
    borderRadius: "28px",
    padding: "20px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
    marginBottom: "18px",
  },
  previewCard: {
    background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
    border: "1px solid #262626",
    borderRadius: "28px",
    padding: "20px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
    marginBottom: "18px",
  },
  cardKicker: {
    margin: "0 0 8px",
    color: "#d4d4d8",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  cardTitle: {
    margin: "0 0 10px",
    fontSize: "28px",
    lineHeight: 1.1,
    color: "#fafafa",
    fontWeight: 700,
  },
  previewHelp: {
    margin: 0,
    color: "#d4d4d8",
    fontSize: "15px",
    lineHeight: 1.5,
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  planSelect: {
    background: "#0b0f19",
    color: "#fff",
    border: "2px solid rgba(255,255,255,0.22)",
    borderRadius: "18px",
    padding: "12px 16px",
    minWidth: "240px",
    fontSize: "16px",
  },
  select: {
    background: "#0b0f19",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "16px",
    padding: "12px 14px",
    fontSize: "15px",
  },
  planInfoBox: {
    marginTop: "14px",
    background: "linear-gradient(180deg, #163163 0%, #102548 100%)",
    border: "1px solid rgba(148,163,184,0.3)",
    borderRadius: "18px",
    padding: "16px",
  },
  planName: {
    margin: "0 0 8px",
    fontSize: "24px",
    fontWeight: 700,
    color: "#f8fafc",
  },
  planDescription: {
    margin: 0,
    color: "#e2e8f0",
    fontSize: "16px",
    lineHeight: 1.55,
  },
  twoColForm: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px 16px",
  },
  inputLabel: {
    display: "block",
    margin: "0 0 6px",
    fontSize: "15px",
    color: "#f5f5f5",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    background: "#05070c",
    color: "#fff",
    border: "1px solid #2f3541",
    borderRadius: "18px",
    padding: "14px 16px",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    resize: "vertical",
    background: "#05070c",
    color: "#fff",
    border: "1px solid #2f3541",
    borderRadius: "18px",
    padding: "14px 16px",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "14px",
  },
  helper: {
    margin: "10px 0 12px",
    color: "#cbd5e1",
    fontSize: "14px",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "12px 0",
    color: "#f5f5f5",
    fontSize: "15px",
  },
  sectionGroup: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "22px",
    padding: "16px",
    marginBottom: "14px",
  },
  smallButton: {
    marginTop: "12px",
    background: "linear-gradient(180deg, #5b84c7 0%, #456aa8 100%)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "14px",
    padding: "10px 14px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  orderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  orderLabel: {
    fontSize: "18px",
    color: "#f8fafc",
    fontWeight: 600,
  },
  orderButtons: {
    display: "flex",
    gap: "8px",
  },
  orderButton: {
    background: "#0f244d",
    color: "#fff",
    border: "1px solid rgba(148,163,184,0.35)",
    borderRadius: "12px",
    padding: "8px 12px",
    fontSize: "14px",
    cursor: "pointer",
  },
  footerButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: "12px",
    marginTop: "12px",
    marginBottom: "32px",
  },
  saveButton: {
    background: "linear-gradient(180deg, #f5f5f5 0%, #d4d4d8 100%)",
    color: "#09090b",
    border: "none",
    borderRadius: "18px",
    padding: "16px",
    fontSize: "20px",
    fontWeight: 700,
    cursor: "pointer",
  },
  printButton: {
    background: "linear-gradient(180deg, #0f244d 0%, #112b5f 100%)",
    color: "#fff",
    border: "1px solid rgba(148,163,184,0.28)",
    borderRadius: "18px",
    padding: "16px",
    fontSize: "20px",
    fontWeight: 700,
    cursor: "pointer",
  },
  backButton: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(148,163,184,0.28)",
    borderRadius: "18px",
    padding: "16px",
    fontSize: "20px",
    fontWeight: 700,
    textAlign: "center",
    textDecoration: "none",
    display: "flex",
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
