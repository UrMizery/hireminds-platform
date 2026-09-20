"use client";

import { FormEvent, useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type TransferableSkill = {
  skill: string;
  explanation: string;
};

type CareerResult = {
  occupationTitle: string;
  overview: string;
  coreSkills: string[];
  softSkills: string[];
  transferableSkills: TransferableSkill[];
  technologySkills: string[];
  technologyNote?: string;
  wageTrends: {
    medianHourly: string;
    medianAnnual: string;
    employmentLevel: string;
    projectedGrowth: string;
    projectedOpenings: string;
  };
  workAttire: string;
  interviewAttire: string;
};

type OccupationProfile = CareerResult & {
  aliases: string[];
};

/* -------------------------------------------------------------------------- */
/* OCCUPATION DATA                                                            */
/* -------------------------------------------------------------------------- */

/*
  IMPORTANT:
  This page does NOT connect to O*NET.

  HireMinds uses its own participant-friendly occupation profiles.

  Wage and employment information is intentionally labeled as general guidance.
  It should not be presented as live government data.
*/

const occupations: OccupationProfile[] = [
  {
    aliases: [
      "recruiter",
      "recruiting",
      "talent acquisition",
      "talent acquisition specialist",
      "talent acquisition coordinator",
      "staffing recruiter",
      "corporate recruiter",
    ],

    occupationTitle: "Recruiter",

    overview:
      "Recruiters help organizations identify, attract, screen, and connect qualified candidates with employment opportunities. The role often includes sourcing candidates, reviewing resumes, conducting interviews, coordinating hiring activities, and maintaining communication with candidates and hiring managers.",

    coreSkills: [
      "Candidate sourcing",
      "Resume screening",
      "Applicant interviewing",
      "Talent pipeline development",
      "Job posting management",
      "Candidate evaluation",
      "Hiring coordination",
      "Recruitment reporting",
      "Offer coordination",
    ],

    softSkills: [
      "Communication",
      "Active listening",
      "Relationship building",
      "Organization",
      "Time management",
      "Adaptability",
      "Professional judgment",
      "Problem solving",
      "Confidentiality",
    ],

    transferableSkills: [
      {
        skill: "Communication",
        explanation:
          "Strong verbal and written communication transfers to HR, sales, customer service, training, and management roles.",
      },
      {
        skill: "Relationship Building",
        explanation:
          "Building trust with candidates and employers transfers well to client services, account management, and business development.",
      },
      {
        skill: "Interviewing",
        explanation:
          "Interviewing experience supports careers involving assessment, intake, investigations, coaching, and employee relations.",
      },
      {
        skill: "Research",
        explanation:
          "Finding candidates and researching talent markets transfers to sourcing, sales prospecting, market research, and workforce development.",
      },
      {
        skill: "Organization",
        explanation:
          "Managing multiple candidates and openings transfers to administrative, project coordination, and operations roles.",
      },
      {
        skill: "Negotiation",
        explanation:
          "Discussing compensation and offers can transfer to sales, account management, purchasing, and business roles.",
      },
    ],

    technologySkills: [
      "Applicant Tracking Systems (ATS)",
      "LinkedIn",
      "Microsoft 365",
      "Google Workspace",
      "Job boards",
      "CRM platforms",
      "Video interviewing platforms",
      "Calendar and scheduling tools",
    ],

    wageTrends: {
      medianHourly: "Varies by employer and market",
      medianAnnual: "Varies by experience and employer",
      employmentLevel: "Common across multiple industries",
      projectedGrowth: "Demand varies by industry and hiring activity",
      projectedOpenings: "Openings vary with employer hiring needs",
    },

    workAttire:
      "Business casual is common in corporate, staffing, and workforce environments. Recruiters attending career fairs, employer meetings, or executive interviews may dress more professionally.",

    interviewAttire:
      "Business professional or polished business casual is generally appropriate. Choose a clean, professional outfit that reflects the type of organization you are interviewing with.",
  },

  {
    aliases: [
      "medical assistant",
      "certified medical assistant",
      "cma",
      "clinical medical assistant",
    ],

    occupationTitle: "Medical Assistant",

    overview:
      "Medical assistants support healthcare providers by helping with clinical and administrative responsibilities. Depending on the workplace, duties may include patient intake, vital signs, documentation, exam room preparation, scheduling, specimen collection, and assisting providers during patient care.",

    coreSkills: [
      "Patient intake",
      "Vital signs",
      "Medical terminology",
      "Clinical documentation",
      "Exam room preparation",
      "Specimen collection",
      "Appointment scheduling",
      "Infection prevention",
      "Provider assistance",
    ],

    softSkills: [
      "Communication",
      "Empathy",
      "Attention to detail",
      "Organization",
      "Professionalism",
      "Confidentiality",
      "Time management",
      "Teamwork",
      "Adaptability",
    ],

    transferableSkills: [
      {
        skill: "Patient Communication",
        explanation:
          "Experience communicating with patients transfers to customer service, patient access, care coordination, and human services.",
      },
      {
        skill: "Documentation",
        explanation:
          "Accurate documentation transfers to administrative, insurance, records, compliance, and healthcare support roles.",
      },
      {
        skill: "Scheduling",
        explanation:
          "Managing appointments transfers to administrative coordination, front desk, office support, and scheduling positions.",
      },
      {
        skill: "Attention to Detail",
        explanation:
          "Accuracy in clinical environments transfers to quality, billing, records, laboratory, and administrative work.",
      },
      {
        skill: "Teamwork",
        explanation:
          "Working with providers and healthcare teams transfers to most collaborative workplace environments.",
      },
      {
        skill: "Confidentiality",
        explanation:
          "Handling sensitive patient information transfers to HR, legal, insurance, finance, and administrative roles.",
      },
    ],

    technologySkills: [
      "Electronic Health Records (EHR)",
      "Electronic Medical Records (EMR)",
      "Appointment scheduling systems",
      "Microsoft Office",
      "Patient portal systems",
      "Basic clinical equipment",
    ],

    wageTrends: {
      medianHourly: "Varies by location and healthcare setting",
      medianAnnual: "Varies by experience and employer",
      employmentLevel: "Widely employed across healthcare settings",
      projectedGrowth: "Healthcare support demand remains significant",
      projectedOpenings: "Openings vary by region and healthcare demand",
    },

    workAttire:
      "Scrubs or employer-approved clinical attire are common. Closed-toe shoes and additional protective equipment may be required depending on the clinical environment.",

    interviewAttire:
      "Business casual is generally appropriate for the interview. Unless the employer specifically requests scrubs, interview in professional clothing rather than clinical workwear.",
  },

  {
    aliases: [
      "forklift operator",
      "forklift driver",
      "forklift",
      "warehouse forklift operator",
    ],

    occupationTitle: "Forklift Operator",

    overview:
      "Forklift operators move, load, unload, stage, and organize materials in warehouses, distribution centers, manufacturing facilities, and other industrial environments. The role requires safe equipment operation, awareness of surroundings, accurate material handling, and compliance with workplace safety procedures.",

    coreSkills: [
      "Forklift operation",
      "Material handling",
      "Loading and unloading",
      "Pallet movement",
      "Inventory movement",
      "Order staging",
      "Equipment inspections",
      "Warehouse safety",
      "RF scanner operation",
    ],

    softSkills: [
      "Attention to detail",
      "Safety awareness",
      "Reliability",
      "Time management",
      "Teamwork",
      "Communication",
      "Organization",
      "Situational awareness",
      "Accountability",
    ],

    transferableSkills: [
      {
        skill: "Material Handling",
        explanation:
          "Material handling experience transfers to warehouse, shipping, receiving, manufacturing, and logistics positions.",
      },
      {
        skill: "Safety Awareness",
        explanation:
          "Following safety procedures transfers to construction, manufacturing, transportation, and industrial work.",
      },
      {
        skill: "Inventory Support",
        explanation:
          "Experience moving and tracking products transfers to inventory control, receiving, fulfillment, and logistics.",
      },
      {
        skill: "Equipment Operation",
        explanation:
          "Experience operating powered equipment can support advancement into other warehouse or industrial equipment roles.",
      },
      {
        skill: "Time Management",
        explanation:
          "Meeting production and shipping deadlines transfers to logistics, manufacturing, delivery, and operations positions.",
      },
    ],

    technologySkills: [
      "Forklift equipment",
      "RF scanners",
      "Barcode scanners",
      "Warehouse Management Systems (WMS)",
      "Inventory tracking systems",
      "Pallet jacks",
    ],

    wageTrends: {
      medianHourly: "Varies by region, shift, and certification",
      medianAnnual: "Varies by hours, employer, and experience",
      employmentLevel: "Common in warehouse and distribution operations",
      projectedGrowth: "Demand follows logistics and distribution activity",
      projectedOpenings: "Openings vary by regional warehouse demand",
    },

    workAttire:
      "Work pants, durable shirts, and safety footwear are common. Employers may require steel-toe shoes, high-visibility clothing, hard hats, gloves, or other PPE.",

    interviewAttire:
      "Clean business casual or neat work-appropriate clothing is generally suitable. Closed-toe shoes are recommended, especially if the interview includes a warehouse tour.",
  },

  {
    aliases: [
      "paralegal",
      "legal assistant",
      "paralegal assistant",
      "legal support",
    ],

    occupationTitle: "Paralegal",

    overview:
      "Paralegals support attorneys and legal teams with research, documentation, case preparation, records, client communication, scheduling, and administrative legal work. Responsibilities vary depending on the type of law practiced and the size of the organization.",

    coreSkills: [
      "Legal research",
      "Legal document preparation",
      "Case file management",
      "Document review",
      "Legal correspondence",
      "Court filing support",
      "Client intake",
      "Records management",
      "Calendar and deadline management",
    ],

    softSkills: [
      "Attention to detail",
      "Written communication",
      "Organization",
      "Confidentiality",
      "Time management",
      "Critical thinking",
      "Professionalism",
      "Research ability",
      "Prioritization",
    ],

    transferableSkills: [
      {
        skill: "Research",
        explanation:
          "Legal research transfers to compliance, policy, investigations, business research, and administrative roles.",
      },
      {
        skill: "Document Preparation",
        explanation:
          "Preparing legal documents transfers to contracts, compliance, administration, government, and corporate support.",
      },
      {
        skill: "Case Management",
        explanation:
          "Managing case information transfers to insurance, healthcare, social services, HR, and project coordination.",
      },
      {
        skill: "Confidentiality",
        explanation:
          "Handling sensitive information transfers to HR, healthcare, finance, government, and executive support.",
      },
      {
        skill: "Deadline Management",
        explanation:
          "Working with legal deadlines transfers to project management, operations, administration, and compliance.",
      },
    ],

    technologySkills: [
      "Microsoft Word",
      "Microsoft Excel",
      "Microsoft Outlook",
      "Adobe Acrobat",
      "Legal research databases",
      "Case management software",
      "Document management systems",
      "Electronic filing systems",
    ],

    wageTrends: {
      medianHourly: "Varies by legal specialty and location",
      medianAnnual: "Varies by experience, employer, and market",
      employmentLevel: "Employed across law firms and legal departments",
      projectedGrowth: "Demand varies by legal market and specialty",
      projectedOpenings: "Openings vary by region and legal sector",
    },

    workAttire:
      "Business casual to professional attire is common in law firms, courts, corporate legal departments, and government legal offices.",

    interviewAttire:
      "Business professional attire is generally the safest choice for a paralegal interview, particularly for law firms and corporate legal departments.",
  },

  {
    aliases: [
      "customer service",
      "customer service representative",
      "csr",
      "customer support",
      "customer support representative",
    ],

    occupationTitle: "Customer Service Representative",

    overview:
      "Customer service representatives assist customers with questions, accounts, products, services, orders, complaints, and problem resolution. They may communicate by phone, email, chat, in person, or through customer service platforms.",

    coreSkills: [
      "Customer issue resolution",
      "Call handling",
      "Account support",
      "Complaint resolution",
      "Order processing",
      "Service recovery",
      "CRM documentation",
      "Payment processing",
      "Escalation management",
    ],

    softSkills: [
      "Active listening",
      "Communication",
      "Patience",
      "Empathy",
      "Problem solving",
      "De-escalation",
      "Adaptability",
      "Professionalism",
      "Multitasking",
    ],

    transferableSkills: [
      {
        skill: "Communication",
        explanation:
          "Customer communication transfers to sales, recruiting, administration, healthcare, hospitality, and management.",
      },
      {
        skill: "Problem Solving",
        explanation:
          "Resolving customer concerns transfers to operations, support, management, and service-based careers.",
      },
      {
        skill: "De-escalation",
        explanation:
          "Managing difficult interactions transfers to healthcare, human services, hospitality, security, and leadership roles.",
      },
      {
        skill: "Documentation",
        explanation:
          "Recording customer interactions transfers to administrative, insurance, healthcare, and office positions.",
      },
      {
        skill: "Relationship Building",
        explanation:
          "Building customer trust transfers to sales, account management, recruiting, and client services.",
      },
    ],

    technologySkills: [
      "CRM systems",
      "Microsoft 365",
      "Google Workspace",
      "Email platforms",
      "Call center software",
      "Ticketing systems",
      "Chat support platforms",
    ],

    wageTrends: {
      medianHourly: "Varies by industry and employer",
      medianAnnual: "Varies by schedule, experience, and employer",
      employmentLevel: "Common across many industries",
      projectedGrowth: "Demand varies as service channels and technology change",
      projectedOpenings: "Openings remain available across multiple industries",
    },

    workAttire:
      "Attire varies by workplace. Office-based roles commonly use business casual clothing, while retail or in-person service roles may require an employer uniform.",

    interviewAttire:
      "Clean business casual attire is generally appropriate. For corporate or higher-level customer relations positions, choose a more polished professional look.",
  },

  {
    aliases: [
      "administrative assistant",
      "admin assistant",
      "office assistant",
      "administrative coordinator",
      "administrative",
    ],

    occupationTitle: "Administrative Assistant",

    overview:
      "Administrative assistants help keep offices and organizations organized by supporting scheduling, communication, records, documents, meetings, data entry, and day-to-day office operations. Responsibilities vary depending on the department and organization.",

    coreSkills: [
      "Calendar management",
      "Appointment scheduling",
      "Document preparation",
      "Data entry",
      "Records management",
      "Email correspondence",
      "Meeting coordination",
      "File organization",
      "Office support",
    ],

    softSkills: [
      "Organization",
      "Communication",
      "Time management",
      "Attention to detail",
      "Professionalism",
      "Prioritization",
      "Adaptability",
      "Problem solving",
      "Confidentiality",
    ],

    transferableSkills: [
      {
        skill: "Organization",
        explanation:
          "Office organization transfers to operations, project coordination, HR, healthcare administration, and management.",
      },
      {
        skill: "Scheduling",
        explanation:
          "Calendar and scheduling experience transfers to recruiting, healthcare, executive support, and coordination roles.",
      },
      {
        skill: "Document Preparation",
        explanation:
          "Preparing professional documents transfers to legal, HR, finance, government, and business support.",
      },
      {
        skill: "Communication",
        explanation:
          "Professional communication transfers across customer service, HR, recruiting, sales, and management.",
      },
      {
        skill: "Records Management",
        explanation:
          "Managing records transfers to healthcare, legal, government, compliance, and HR environments.",
      },
    ],

    technologySkills: [
      "Microsoft Word",
      "Microsoft Excel",
      "Microsoft Outlook",
      "Microsoft Teams",
      "Google Workspace",
      "Calendar systems",
      "Document management systems",
      "Video meeting platforms",
    ],

    wageTrends: {
      medianHourly: "Varies by industry and location",
      medianAnnual: "Varies by employer and experience",
      employmentLevel: "Common across nearly every industry",
      projectedGrowth: "Demand varies by industry and level of responsibility",
      projectedOpenings: "Openings occur across many business sectors",
    },

    workAttire:
      "Business casual is common in most office environments. More formal organizations may expect professional attire.",

    interviewAttire:
      "Polished business casual or business professional attire is appropriate depending on the organization.",
  },
];

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s/-]/g, "")
    .replace(/\s+/g, " ");
}

function findOccupation(title: string) {
  const search = normalize(title);

  if (!search) return null;

  const exactMatch = occupations.find((occupation) =>
    occupation.aliases.some((alias) => normalize(alias) === search)
  );

  if (exactMatch) return exactMatch;

  const partialMatch = occupations.find((occupation) =>
    occupation.aliases.some((alias) => {
      const normalizedAlias = normalize(alias);

      return (
        normalizedAlias.includes(search) ||
        search.includes(normalizedAlias)
      );
    })
  );

  return partialMatch || null;
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function IndustryCoreSkillsPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [result, setResult] = useState<CareerResult | null>(null);
  const [error, setError] = useState("");

  const suggestedTitles = useMemo(
    () => [
      "Recruiter",
      "Medical Assistant",
      "Forklift Operator",
      "Paralegal",
      "Customer Service Representative",
      "Administrative Assistant",
    ],
    []
  );

  function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = jobTitle.trim();

    if (!title) {
      setResult(null);
      setError("Enter a job title to continue.");
      return;
    }

    const match = findOccupation(title);

    if (!match) {
      setResult(null);
      setError(
        `We don't have "${title}" in the HireMinds career library yet. Try another job title.`
      );
      return;
    }

    setError("");

    const {
      aliases: _aliases,
      ...careerResult
    } = match;

    setResult(careerResult);

    window.setTimeout(() => {
      document
        .getElementById("career-results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  function selectSuggestion(title: string) {
    setJobTitle(title);
    setError("");
  }

  return (
    <main style={styles.page}>
      <div style={styles.glowTop} />
      <div style={styles.glowSide} />

      <div style={styles.shell}>
        {/* HEADER */}

        <header style={styles.header}>
          <a
            href="/career-toolkit"
            style={styles.backLink}
          >
            ← Career ToolKit
          </a>

          <div style={styles.topLine} />

          <p style={styles.kicker}>
            HIREMINDS CAREER TOOLKIT
          </p>

          <h1 style={styles.title}>
            Industry Core Skills
          </h1>

          <p style={styles.subtitle}>
            Enter a job title to explore the skills,
            technology, career trends, and workplace
            expectations connected to that occupation.
          </p>
        </header>

        {/* SEARCH */}

        <section style={styles.searchSection}>
          <form
            onSubmit={handleGenerate}
            style={styles.form}
          >
            <div style={styles.inputArea}>
              <label
                htmlFor="jobTitle"
                style={styles.label}
              >
                Job Title
              </label>

              <input
                id="jobTitle"
                value={jobTitle}
                onChange={(event) => {
                  setJobTitle(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Example: Recruiter"
                autoComplete="off"
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              style={styles.generateButton}
            >
              Generate
            </button>
          </form>

          <p style={styles.searchHint}>
            Enter one occupation or job title for the
            most relevant results.
          </p>

          <div style={styles.suggestions}>
            {suggestedTitles.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => selectSuggestion(title)}
                style={styles.suggestionButton}
              >
                {title}
              </button>
            ))}
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}
        </section>

        {/* EMPTY STATE */}

        {!result && (
          <section style={styles.emptyState}>
            <div style={styles.emptyLine} />

            <div>
              <p style={styles.emptyEyebrow}>
                CAREER SNAPSHOT
              </p>

              <h2 style={styles.emptyTitle}>
                Start with the job you want to explore.
              </h2>

              <p style={styles.emptyText}>
                HireMinds organizes occupation information
                into practical career guidance you can use
                for your resume, interview preparation,
                career planning, and job search.
              </p>
            </div>
          </section>
        )}

        {/* RESULTS */}

        {result && (
          <section
            id="career-results"
            style={styles.results}
          >
            {/* OCCUPATION OVERVIEW */}

            <div style={styles.resultHero}>
              <p style={styles.resultEyebrow}>
                CAREER SNAPSHOT
              </p>

              <h2 style={styles.occupationTitle}>
                {result.occupationTitle}
              </h2>

              <div style={styles.overviewBlock}>
                <p style={styles.overviewLabel}>
                  OCCUPATION OVERVIEW
                </p>

                <p style={styles.overview}>
                  {result.overview}
                </p>
              </div>
            </div>

            {/* CORE SKILLS */}

            <ResultSection
              title="Core Skills"
              description="Job-specific hard and technical skills commonly associated with this occupation."
            >
              <SkillList skills={result.coreSkills} />
            </ResultSection>

            {/* SOFT SKILLS */}

            <ResultSection
              title="Soft Skills"
              description="People and workplace skills that support success in this occupation."
            >
              <SkillList skills={result.softSkills} />
            </ResultSection>

            {/* TRANSFERABLE SKILLS */}

            <ResultSection
              title="Transferable Skills"
              description="Skills that can carry into other occupations and industries."
            >
              <div style={styles.transferGrid}>
                {result.transferableSkills.map(
                  (item) => (
                    <div
                      key={item.skill}
                      style={styles.transferItem}
                    >
                      <h3
                        style={styles.transferTitle}
                      >
                        {item.skill}
                      </h3>

                      <p
                        style={styles.transferText}
                      >
                        {item.explanation}
                      </p>
                    </div>
                  )
                )}
              </div>
            </ResultSection>

            {/* SOFTWARE & TECHNOLOGY */}

            <ResultSection
              title="Software & Technology Skills"
              description="Relevant systems, platforms, equipment, software, or technology commonly used in this occupation."
            >
              {result.technologySkills.length >
              0 ? (
                <SkillList
                  skills={
                    result.technologySkills
                  }
                />
              ) : (
                <p style={styles.standardText}>
                  {result.technologyNote ||
                    "This occupation does not typically require specialized software or technology."}
                </p>
              )}
            </ResultSection>

            {/* WAGE & EMPLOYMENT */}

            <ResultSection
              title="Wage & Employment Trends"
              description="General U.S. career guidance. Actual wages and employment conditions vary by location, employer, experience, schedule, and industry."
            >
              <div style={styles.statsGrid}>
                <Stat
                  label="Median Hourly Wage"
                  value={
                    result.wageTrends
                      .medianHourly
                  }
                />

                <Stat
                  label="Median Annual Wage"
                  value={
                    result.wageTrends
                      .medianAnnual
                  }
                />

                <Stat
                  label="Employment Level"
                  value={
                    result.wageTrends
                      .employmentLevel
                  }
                />

                <Stat
                  label="Projected Growth / Decline"
                  value={
                    result.wageTrends
                      .projectedGrowth
                  }
                />

                <Stat
                  label="Projected Job Openings"
                  value={
                    result.wageTrends
                      .projectedOpenings
                  }
                />
              </div>

              <p style={styles.dataNote}>
                Career information shown here is general
                guidance and is not live labor-market data.
              </p>
            </ResultSection>

            {/* ATTIRE */}

            <ResultSection
              title="Work Attire & Interview Dress"
              description="Typical workplace clothing expectations and a separate recommendation for interviewing."
            >
              <div style={styles.attireGrid}>
                <div style={styles.attireItem}>
                  <p style={styles.smallLabel}>
                    TYPICAL WORK ATTIRE
                  </p>

                  <p style={styles.attireText}>
                    {result.workAttire}
                  </p>
                </div>

                <div style={styles.attireItem}>
                  <p style={styles.smallLabel}>
                    INTERVIEW ATTIRE
                  </p>

                  <p style={styles.attireText}>
                    {result.interviewAttire}
                  </p>
                </div>
              </div>
            </ResultSection>

            {/* FOOTER NOTE */}

            <div style={styles.footerNote}>
              <span style={styles.footerMark}>
                HM
              </span>

              <p style={styles.footerText}>
                Use this career snapshot as a guide.
                Job requirements, wages, technology,
                attire, and workplace expectations can
                vary by employer and location.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* RESULT SECTION                                                             */
/* -------------------------------------------------------------------------- */

function ResultSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.resultSection}>
      <div style={styles.sectionHeading}>
        <h2 style={styles.sectionTitle}>
          {title}
        </h2>

        <p style={styles.sectionDescription}>
          {description}
        </p>
      </div>

      <div style={styles.sectionContent}>
        {children}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* SKILLS                                                                     */
/* -------------------------------------------------------------------------- */

function SkillList({
  skills,
}: {
  skills: string[];
}) {
  return (
    <div style={styles.skillList}>
      {skills.map((skill) => (
        <span
          key={skill}
          style={styles.skillTag}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STAT                                                                       */
/* -------------------------------------------------------------------------- */

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.stat}>
      <p style={styles.statLabel}>
        {label}
      </p>

      <p style={styles.statValue}>
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    background:
      "linear-gradient(145deg, #05080d 0%, #08111d 48%, #0b1420 100%)",
    color: "#f8fafc",
    padding: "28px 22px 72px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  glowTop: {
    position: "absolute",
    width: "700px",
    height: "700px",
    top: "-360px",
    right: "-180px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(37,99,235,.18) 0%, rgba(37,99,235,0) 70%)",
    pointerEvents: "none",
  },

  glowSide: {
    position: "absolute",
    width: "520px",
    height: "520px",
    top: "650px",
    left: "-300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(71,85,105,.13) 0%, rgba(71,85,105,0) 72%)",
    pointerEvents: "none",
  },

  shell: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
  },

  /* HEADER */

  header: {
    padding: "8px 0 28px",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "20px",
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  },

  topLine: {
    height: "1px",
    marginBottom: "36px",
    background:
      "linear-gradient(90deg, #2563eb 0%, rgba(71,85,105,.65) 35%, rgba(71,85,105,0) 100%)",
  },

  kicker: {
    margin: "0 0 12px",
    color: "#60a5fa",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: ".18em",
  },

  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "clamp(38px, 6vw, 64px)",
    lineHeight: 1.02,
    letterSpacing: "-0.045em",
    fontWeight: 700,
  },

  subtitle: {
    maxWidth: "760px",
    margin: "18px 0 0",
    color: "#aeb9c7",
    fontSize: "17px",
    lineHeight: 1.7,
  },

  /* SEARCH */

  searchSection: {
    padding: "28px 0 42px",
    borderBottom:
      "1px solid rgba(148,163,184,.18)",
  },

  form: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },

  inputArea: {
    flex: "1 1 520px",
  },

  label: {
    display: "block",
    marginBottom: "9px",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px 16px",
    background: "rgba(15,23,42,.62)",
    border: "1px solid #334155",
    borderRadius: "10px",
    outline: "none",
    color: "#ffffff",
    fontSize: "16px",
    boxShadow:
      "0 12px 40px rgba(0,0,0,.12)",
  },

  generateButton: {
    minHeight: "51px",
    padding: "0 30px",
    border: "1px solid #3b82f6",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow:
      "0 12px 30px rgba(37,99,235,.18)",
  },

  searchHint: {
    margin: "10px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "18px",
  },

  suggestionButton: {
    padding: "7px 10px",
    background: "transparent",
    border: "1px solid #273449",
    borderRadius: "6px",
    color: "#8291a6",
    fontSize: "11px",
    cursor: "pointer",
  },

  error: {
    marginTop: "20px",
    padding: "12px 14px",
    borderLeft: "3px solid #ef4444",
    background: "rgba(127,29,29,.14)",
    color: "#fecaca",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  /* EMPTY */

  emptyState: {
    display: "grid",
    gridTemplateColumns:
      "4px minmax(0, 680px)",
    gap: "22px",
    marginTop: "52px",
    padding: "8px 0",
  },

  emptyLine: {
    width: "4px",
    borderRadius: "10px",
    background:
      "linear-gradient(180deg, #3b82f6, #1e3a8a)",
  },

  emptyEyebrow: {
    margin: "0 0 10px",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: ".16em",
  },

  emptyTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "26px",
    fontWeight: 650,
    letterSpacing: "-.02em",
  },

  emptyText: {
    margin: "12px 0 0",
    color: "#94a3b8",
    fontSize: "15px",
    lineHeight: 1.7,
  },

  /* RESULTS */

  results: {
    paddingTop: "48px",
    scrollMarginTop: "30px",
  },

  resultHero: {
    maxWidth: "900px",
    paddingBottom: "40px",
  },

  resultEyebrow: {
    margin: "0 0 10px",
    color: "#60a5fa",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: ".16em",
  },

  occupationTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "clamp(32px, 5vw, 48px)",
    lineHeight: 1.08,
    letterSpacing: "-.035em",
    fontWeight: 700,
  },

  overviewBlock: {
    marginTop: "28px",
    paddingLeft: "17px",
    borderLeft: "2px solid #2563eb",
  },

  overviewLabel: {
    margin: "0 0 8px",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: ".12em",
  },

  overview: {
    margin: 0,
    color: "#b8c2cf",
    fontSize: "16px",
    lineHeight: 1.75,
  },

  /* SECTIONS */

  resultSection: {
    display: "grid",
    gridTemplateColumns:
      "minmax(220px, 300px) minmax(0, 1fr)",
    gap: "50px",
    padding: "34px 0",
    borderTop:
      "1px solid rgba(148,163,184,.18)",
  },

  sectionHeading: {
    alignSelf: "start",
  },

  sectionTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "21px",
    lineHeight: 1.25,
    fontWeight: 650,
  },

  sectionDescription: {
    margin: "9px 0 0",
    color: "#718096",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  sectionContent: {
    minWidth: 0,
  },

  /* SKILLS */

  skillList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
  },

  skillTag: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "34px",
    padding: "6px 12px",
    border: "1px solid #334155",
    borderRadius: "7px",
    background:
      "rgba(30,41,59,.38)",
    color: "#dbeafe",
    fontSize: "13px",
    lineHeight: 1.35,
  },

  /* TRANSFERABLE */

  transferGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "4px 30px",
  },

  transferItem: {
    padding: "0 0 20px",
  },

  transferTitle: {
    margin: "0 0 6px",
    color: "#dbeafe",
    fontSize: "15px",
    fontWeight: 700,
  },

  transferText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  standardText: {
    margin: 0,
    color: "#aeb9c7",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  /* WAGE */

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(165px, 1fr))",
    gap: "1px",
    overflow: "hidden",
    border: "1px solid #273449",
    borderRadius: "10px",
    background: "#273449",
  },

  stat: {
    minHeight: "96px",
    padding: "17px",
    background: "#0d1623",
  },

  statLabel: {
    margin: "0 0 10px",
    color: "#718096",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    lineHeight: 1.4,
  },

  statValue: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "16px",
    fontWeight: 650,
    lineHeight: 1.4,
  },

  dataNote: {
    margin: "12px 0 0",
    color: "#64748b",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  /* ATTIRE */

  attireGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "30px",
  },

  attireItem: {
    paddingLeft: "16px",
    borderLeft: "2px solid #2563eb",
  },

  smallLabel: {
    margin: "0 0 8px",
    color: "#60a5fa",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: ".12em",
  },

  attireText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  /* FOOTER */

  footerNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginTop: "20px",
    paddingTop: "24px",
    borderTop:
      "1px solid rgba(148,163,184,.18)",
  },

  footerMark: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto",
    width: "32px",
    height: "32px",
    border: "1px solid #334155",
    borderRadius: "7px",
    color: "#60a5fa",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".04em",
  },

  footerText: {
    maxWidth: "760px",
    margin: 0,
    color: "#64748b",
    fontSize: "11px",
    lineHeight: 1.65,
  },
};
