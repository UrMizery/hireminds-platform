"use client";

import { useMemo, useState } from "react";

type Choice =
| "helping_people"
| "working_with_computers"
| "organizing_information"
| "talking_to_people"
| "hands_on_work"
| "fast_paced"
| "structured_tasks"
| "detail_oriented"
| "customer_facing"
| "healthcare_interest"
| "office_environment"
| "warehouse_environment"
| "public_service_interest"
| "numbers_and_records"
| "driving"
| "community_outreach"
| "bilingual_languages"
| "hybrid_remote"
| "mechanical_aptitude"
| "cash_handling"
| "writing"
| "office_computers"
| "working_outside"
| "contract_1099"
| "independent_work"
| "team_environment"
| "sales_interest"
| "creative_problem_solving"
| "leadership_interest"
| "teaching_training";

type EducationPreference =
| "quick-start"
| "short-training"
| "certificate-ok"
| "degree-ok";

type SalaryPreference =
| "entry-level"
| "moderate"
| "higher";

type Career = {
id: string;
title: string;
medianPayLabel: string;
salaryRank: number;
educationLevel: EducationPreference;
summary: string;
fitTags: Choice[];
avoidTags?: Choice[];
whatYouNeed: string[];
whyItFits: string[];
};

const careerData: Career[] = [
{
id: "cna",
title: "Certified Nursing Assistant (CNA)",
medianPayLabel: "$39,530 median annual pay",
salaryRank: 1,
educationLevel: "short-training",
summary:
"CNAs support patients with daily care and work closely with healthcare teams.",
fitTags: [
"helping_people",
"hands_on_work",
"fast_paced",
"healthcare_interest",
"structured_tasks",
"team_environment",
],
whatYouNeed: [
"Complete a state-approved CNA training program",
"Pass any required exam or certification process in your state",
"Apply to hospitals, nursing homes, rehab centers, or home care employers",
],
whyItFits: [
"Good match for people who want meaningful hands-on work",
"Strong fit for users interested in healthcare and patient support",
],
},
{
id: "medical-assistant",
title: "Medical Assistant",
medianPayLabel: "$44,200 median annual pay",
salaryRank: 2,
educationLevel: "certificate-ok",
summary:
"Medical assistants support clinics with patient intake, documentation, scheduling, and basic clinical tasks.",
fitTags: [
"helping_people",
"talking_to_people",
"healthcare_interest",
"structured_tasks",
"detail_oriented",
"office_environment",
"office_computers",
],
whatYouNeed: [
"Look into a medical assistant certificate or diploma program",
"Build comfort with scheduling, documentation, and patient interaction",
"Check local employers for required certifications or preferred training",
],
whyItFits: [
"Strong option for people who want healthcare work without going straight into a long degree path",
"Fits users who like both people-facing and organized task-based work",
],
},
{
id: "admin-assistant",
title: "Administrative Assistant",
medianPayLabel: "$47,460 median annual pay",
salaryRank: 2,
educationLevel: "quick-start",
summary:
"Administrative assistants support office operations, scheduling, communication, and organization.",
fitTags: [
"organizing_information",
"talking_to_people",
"structured_tasks",
"detail_oriented",
"office_environment",
"office_computers",
"writing",
],
whatYouNeed: [
"Build strong scheduling, communication, and document handling skills",
"Get comfortable with email, calendars, spreadsheets, and office systems",
"Tailor your resume to support, coordination, and organization tasks",
],
whyItFits: [
"Great fit for people who like structure, order, and office-based work",
"Works well for users who want transferable experience across many industries",
],
},
{
id: "customer-service",
title: "Customer Service Representative",
medianPayLabel: "$20.59 median hourly pay",
salaryRank: 2,
educationLevel: "quick-start",
summary:
"Customer service reps solve problems, answer questions, and support customers across many industries.",
fitTags: [
"talking_to_people",
"customer_facing",
"fast_paced",
"structured_tasks",
"team_environment",
"office_computers",
],
whatYouNeed: [
"Build communication and problem-solving examples on your resume",
"Practice de-escalation and service language for interviews",
"Look for call center, retail support, healthcare support, or office service roles",
],
whyItFits: [
"Good fit for strong communicators who like helping people directly",
"A practical entry point for many users returning to work or changing fields",
],
},
{
id: "stocker-order-filler",
title: "Stocker / Order Filler",
medianPayLabel: "$37,090 median annual pay",
salaryRank: 1,
educationLevel: "quick-start",
summary:
"Stockers and order fillers help move, organize, and prepare inventory in fast-paced environments.",
fitTags: [
"hands_on_work",
"fast_paced",
"warehouse_environment",
"structured_tasks",
"team_environment",
"mechanical_aptitude",
],
whatYouNeed: [
"Highlight reliability, speed, accuracy, and physical work tolerance",
"Learn basic warehouse safety and inventory language",
"Apply to warehouse, retail, grocery, and distribution employers",
],
whyItFits: [
"Strong fit for users who prefer movement and task-based work over desk work",
"Good starting point for logistics and warehouse career growth",
],
},
{
id: "help-desk",
title: "Computer User Support Specialist / Help Desk",
medianPayLabel: "$60,340 median annual pay",
salaryRank: 3,
educationLevel: "certificate-ok",
summary:
"Help desk roles support users with troubleshooting, basic systems issues, and technical communication.",
fitTags: [
"working_with_computers",
"talking_to_people",
"detail_oriented",
"structured_tasks",
"office_environment",
"office_computers",
"hybrid_remote",
"creative_problem_solving",
],
whatYouNeed: [
"Build basic troubleshooting and customer support skills",
"Consider an entry-level IT certificate or support training path",
"Practice explaining technical issues in simple language",
],
whyItFits: [
"Good fit for people who like technology but also want to work with users",
"Strong pathway into broader IT careers over time",
],
},
{
id: "dispatcher",
title: "Public Safety Telecommunicator / Dispatcher",
medianPayLabel: "$50,730 median annual pay",
salaryRank: 3,
educationLevel: "quick-start",
summary:
"Dispatchers manage urgent communication, coordinate response, and stay calm under pressure.",
fitTags: [
"talking_to_people",
"fast_paced",
"structured_tasks",
"detail_oriented",
"public_service_interest",
"office_computers",
],
whatYouNeed: [
"Build strong communication, listening, and multi-tasking examples",
"Check local agency requirements, testing, or certifications",
"Practice staying calm and accurate in high-pressure situations",
],
whyItFits: [
"Great fit for people who can stay composed and organized under pressure",
"Strong option for users interested in public service and communication-heavy work",
],
},
{
id: "bookkeeping-clerk",
title: "Bookkeeping / Accounting Clerk",
medianPayLabel: "$49,210 median annual pay",
salaryRank: 2,
educationLevel: "certificate-ok",
summary:
"Bookkeeping and accounting clerks manage records, transactions, and financial organization.",
fitTags: [
"numbers_and_records",
"detail_oriented",
"structured_tasks",
"organizing_information",
"office_environment",
"office_computers",
"cash_handling",
],
whatYouNeed: [
"Build comfort with spreadsheets, accuracy, and recordkeeping",
"Consider bookkeeping or accounting support training",
"Highlight invoicing, data entry, reconciliation, or office finance experience",
],
whyItFits: [
"Strong fit for users who like accuracy, records, and organized desk work",
"A good path for people who prefer less customer-facing work",
],
},
{
id: "delivery-driver",
title: "Delivery Driver / Route Driver",
medianPayLabel: "$39,950 median annual pay",
salaryRank: 2,
educationLevel: "quick-start",
summary:
"Drivers manage routes, schedules, deliveries, and customer interaction while staying safe on the road.",
fitTags: [
"driving",
"independent_work",
"fast_paced",
"customer_facing",
"contract_1099",
],
whatYouNeed: [
"Keep a clean driving record where possible",
"Check license and insurance requirements for the employer or platform",
"Highlight punctuality, route familiarity, and customer service",
],
whyItFits: [
"Good fit for users who like being on the road more than sitting at a desk",
"Can fit both employee and contract-style work preferences",
],
},
{
id: "community-health-worker",
title: "Community Health Worker / Outreach Worker",
medianPayLabel: "$48,200 median annual pay",
salaryRank: 2,
educationLevel: "certificate-ok",
summary:
"Outreach workers connect communities to services, education, resources, and support.",
fitTags: [
"helping_people",
"community_outreach",
"talking_to_people",
"public_service_interest",
"bilingual_languages",
"writing",
],
whatYouNeed: [
"Build outreach, case support, advocacy, or community service experience",
"Look into local nonprofit, healthcare, or municipal roles",
"Highlight trust-building, communication, and resource coordination",
],
whyItFits: [
"Great fit for people who enjoy community-facing work and relationship building",
"Strong option for bilingual candidates and service-minded users",
],
},
{
id: "sales-rep",
title: "Sales Representative / Account Representative",
medianPayLabel: "$63,050 median annual pay",
salaryRank: 3,
educationLevel: "quick-start",
summary:
"Sales reps build relationships, explain products or services, and drive business growth.",
fitTags: [
"talking_to_people",
"customer_facing",
"sales_interest",
"leadership_interest",
"hybrid_remote",
"independent_work",
],
whatYouNeed: [
"Build confidence in communication, follow-up, and relationship management",
"Highlight client-facing, outreach, recruiting, or service experience",
"Learn how the employer measures goals, quotas, or account growth",
],
whyItFits: [
"Good fit for persuasive communicators who enjoy people and momentum",
"Often offers stronger earning potential than many entry-level roles",
],
},
{
id: "mechanic-helper",
title: "Mechanical Helper / Service Technician Trainee",
medianPayLabel: "$43,000 median annual pay",
salaryRank: 2,
educationLevel: "short-training",
summary:
"Mechanical support roles involve tools, troubleshooting, equipment, and physical problem-solving.",
fitTags: [
"hands_on_work",
"mechanical_aptitude",
"working_outside",
"structured_tasks",
"creative_problem_solving",
],
whatYouNeed: [
"Look into trade school, on-the-job training, or employer-sponsored training",
"Build comfort with tools, equipment safety, and maintenance basics",
"Highlight reliability, hands-on experience, and troubleshooting skills",
],
whyItFits: [
"Strong fit for people who like fixing, maintaining, and working with equipment",
"Good path for users who prefer practical work over desk work",
],
},
{
id: "remote-support-coordinator",
title: "Remote Support Coordinator / Virtual Operations Support",
medianPayLabel: "$48,000 median annual pay",
salaryRank: 2,
educationLevel: "quick-start",
summary:
"Remote support roles often involve scheduling, customer communication, follow-up, and digital coordination.",
fitTags: [
"hybrid_remote",
"office_computers",
"writing",
"organizing_information",
"structured_tasks",
"talking_to_people",
],
whatYouNeed: [
"Build email, scheduling, communication, and virtual office skills",
"Highlight remote tools, calendar support, documentation, and follow-up work",
"Search remote support, coordinator, admin, and client-success roles",
],
whyItFits: [
"Great fit for users who want office-style work with more flexibility",
"Good path for strong communicators who are comfortable online",
],
},
];

const choiceLabels: Record<Choice, string> = {
helping_people: "Helping people",
working_with_computers: "Working with computers",
organizing_information: "Organizing information",
talking_to_people: "Talking to people",
hands_on_work: "Hands-on work",
fast_paced: "Fast-paced environments",
structured_tasks: "Structured tasks",
detail_oriented: "Detail-oriented work",
customer_facing: "Customer-facing work",
healthcare_interest: "Healthcare settings",
office_environment: "Office environment",
warehouse_environment: "Warehouse / logistics",
public_service_interest: "Public service work",
numbers_and_records: "Numbers and records",
driving: "Driving",
community_outreach: "Community work / outreach",
bilingual_languages: "Bilingual / languages",
hybrid_remote: "Hybrid / remote",
mechanical_aptitude: "Mechanical aptitude",
cash_handling: "Cash handling",
writing: "Writing",
office_computers: "Office / computers",
working_outside: "Working outside",
contract_1099: "1099 / contract",
independent_work: "Independent work",
team_environment: "Team environment",
sales_interest: "Sales / persuasion",
creative_problem_solving: "Problem-solving",
leadership_interest: "Leadership interest",
teaching_training: "Teaching / training others",
};

function getEducationScore(
preference: EducationPreference,
careerEducation: EducationPreference
) {
const rank = {
"quick-start": 1,
"short-training": 2,
"certificate-ok": 3,
"degree-ok": 4,
};

return rank[careerEducation] <= rank[preference]
? 2
: rank[careerEducation] - rank[preference] === 1
? 1
: 0;
}

function getSalaryScore(preference: SalaryPreference, salaryRank: number) {
if (preference === "entry-level") return 1;
if (preference === "moderate") return salaryRank >= 2 ? 2 : 1;
if (preference === "higher") return salaryRank >= 3 ? 2 : 0;
return 0;
}

type DirectionStep = "explore" | "choose" | "goal" | "plan";

export default function CareerDirectionPage() {
  const [selectedChoices, setSelectedChoices] = useState<Choice[]>([]);
  const [educationPreference, setEducationPreference] =
    useState<EducationPreference>("short-training");
  const [salaryPreference, setSalaryPreference] =
    useState<SalaryPreference>("moderate");
  const [selectedCareerId, setSelectedCareerId] = useState("");
  const [activeStep, setActiveStep] = useState<DirectionStep>("explore");

  const [whyChosen, setWhyChosen] = useState("");
  const [researchDone, setResearchDone] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [barriers, setBarriers] = useState("");
  const [overcomeBarriers, setOvercomeBarriers] = useState("");
  const [supportSystem, setSupportSystem] = useState("");
  const [startTimeline, setStartTimeline] = useState("");

  function toggleChoice(choice: Choice) {
    setSelectedChoices((prev) =>
      prev.includes(choice)
        ? prev.filter((item) => item !== choice)
        : [...prev, choice]
    );
  }

  const matches = useMemo(() => {
    return careerData
      .map((career) => {
        let score = 0;

        career.fitTags.forEach((tag) => {
          if (selectedChoices.includes(tag)) score += 3;
        });

        career.avoidTags?.forEach((tag) => {
          if (selectedChoices.includes(tag)) score -= 1;
        });

        score += getEducationScore(
          educationPreference,
          career.educationLevel
        );
        score += getSalaryScore(
          salaryPreference,
          career.salaryRank
        );

        return { ...career, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [selectedChoices, educationPreference, salaryPreference]);

  const selectedCareer = useMemo(
    () => careerData.find((career) => career.id === selectedCareerId) || null,
    [selectedCareerId]
  );

  const careerGoalStatement = useMemo(() => {
    if (!selectedCareer) return "";

    const reason =
      whyChosen ||
      selectedCareer.whyItFits[0] ||
      "it aligns with my interests, strengths, and work preferences";

    const outcome =
      expectedOutcome ||
      "build experience, grow professionally, and move toward long-term career stability";

    return `My career goal is to pursue ${selectedCareer.title} because ${reason}. My next priority is to ${outcome}.`;
  }, [selectedCareer, whyChosen, expectedOutcome]);

  const actionPlan = useMemo(() => {
    if (!selectedCareer) return [];

    const items: string[] = [...selectedCareer.whatYouNeed];

    if (researchDone.trim()) {
      items.push(`Continue career research: ${researchDone.trim()}`);
    }

    if (overcomeBarriers.trim()) {
      items.push(`Barrier strategy: ${overcomeBarriers.trim()}`);
    }

    if (supportSystem.trim()) {
      items.push(`Use support/accountability from: ${supportSystem.trim()}`);
    }

    return items;
  }, [selectedCareer, researchDone, overcomeBarriers, supportSystem]);

  const completedGoalFields = [
    whyChosen,
    researchDone,
    expectedOutcome,
    barriers,
    overcomeBarriers,
    supportSystem,
    startTimeline,
  ].filter((value) => value.trim().length > 0).length;

  function chooseCareer(careerId: string) {
    setSelectedCareerId(careerId);
    setActiveStep("goal");

    window.setTimeout(() => {
      document
        .getElementById("career-goal")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function handlePrint() {
    if (!selectedCareer) return;
    window.print();
  }

  function handleSaveText() {
    if (!selectedCareer) return;

    const content = `
HIREMINDS CAREER DIRECTION

TARGET CAREER
${selectedCareer.title}

CAREER SNAPSHOT
${selectedCareer.summary}
${selectedCareer.medianPayLabel}

WHY THIS DIRECTION MAY FIT
${selectedCareer.whyItFits.map((item) => `- ${item}`).join("\n")}

TRAINING / EDUCATION / PREPARATION
${selectedCareer.whatYouNeed.map((item) => `- ${item}`).join("\n")}

CAREER GOAL
${careerGoalStatement}

RESEARCH COMPLETED
${researchDone || "Not provided"}

EXPECTED OUTCOME
${expectedOutcome || "Not provided"}

POTENTIAL BARRIERS
${barriers || "Not provided"}

BARRIER STRATEGY
${overcomeBarriers || "Not provided"}

SUPPORT SYSTEM
${supportSystem || "Not provided"}

TIMELINE
${startTimeline || "Not provided"}

ACTION PLAN / NEXT STEPS
${actionPlan.map((item) => `- ${item}`).join("\n")}
`.trim();

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hireminds-career-direction.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <main style={styles.page}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        @keyframes directionGlow {
          0%, 100% { opacity: .5; transform: scale(.96); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes directionFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        .direction-choice {
          transition:
            transform .16s ease,
            border-color .16s ease,
            background .16s ease,
            box-shadow .16s ease;
        }

        .direction-choice:hover {
          transform: translateY(-2px);
          border-color: rgba(22,119,255,.58) !important;
        }

        .direction-match {
          transition:
            transform .18s ease,
            border-color .18s ease,
            box-shadow .18s ease;
        }

        .direction-match:hover {
          transform: translateY(-4px);
          border-color: rgba(22,119,255,.55) !important;
          box-shadow: 0 22px 48px rgba(0,0,0,.32) !important;
        }

        .direction-button {
          transition:
            transform .16s ease,
            box-shadow .16s ease,
            filter .16s ease;
        }

        .direction-button:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
        }

        .direction-button:active {
          transform: translateY(1px);
        }

        @media (max-width: 960px) {
          .direction-two-col {
            grid-template-columns: 1fr !important;
          }

          .direction-match-grid {
            grid-template-columns: 1fr !important;
          }

          .direction-plan-grid {
            grid-template-columns: 1fr !important;
          }

          .direction-progress {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 620px) {
          .direction-page {
            padding: 20px 14px 44px !important;
          }

          .direction-hero {
            padding: 26px 20px !important;
            grid-template-columns: 1fr !important;
          }

          .direction-title {
            font-size: 42px !important;
          }

          .direction-progress {
            grid-template-columns: 1fr !important;
          }

          .direction-card {
            padding: 20px !important;
          }

          .direction-field-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          .print-wrap,
          .print-wrap * {
            visibility: visible !important;
          }

          .print-wrap {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #111827 !important;
            padding: 28px !important;
          }

          .print-wrap section {
            break-inside: avoid;
          }

          .print-hide {
            display: none !important;
          }
        }
      `}</style>

      <div className="direction-page" style={styles.shell}>
        <section className="direction-hero" style={styles.hero}>
          <div style={styles.heroGlow} />

          <div style={styles.heroContent}>
            <p style={styles.kicker}>CAREER TOOLKIT / CAREER DIRECTION</p>

            <h1 className="direction-title" style={styles.title}>
              Explore the path.
              <br />
              <span style={styles.titleBlue}>Build the direction.</span>
            </h1>

            <p style={styles.subtitle}>
              Explore careers that may fit your interests and work preferences,
              choose one direction, set a clear career goal, and leave with
              practical next steps.
            </p>

            <div style={styles.heroActions}>
              <a href="/career-toolkit" style={styles.backButton}>
                Back to Career Toolkit
              </a>

              {selectedCareer ? (
                <>
                  <button
                    type="button"
                    onClick={handleSaveText}
                    className="direction-button print-hide"
                    style={styles.secondaryButton}
                  >
                    Save Career Direction
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="direction-button print-hide"
                    style={styles.primaryButton}
                  >
                    Print / Save PDF
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.heroOrb} />

            <div style={styles.heroCardOne}>
              <span style={styles.visualLabel}>EXPLORE</span>
              <strong style={styles.visualTitle}>Career possibilities</strong>
              <span style={styles.visualText}>
                Interests • Work style • Training • Pay
              </span>
            </div>

            <div style={styles.heroCardTwo}>
              <span style={styles.visualLabel}>BUILD</span>
              <strong style={styles.visualTitle}>Career direction</strong>
              <span style={styles.visualText}>
                Goal • Barriers • Action plan • Timeline
              </span>
            </div>
          </div>
        </section>

        <section style={styles.disclaimerBanner}>
          <p style={styles.disclaimerTitle}>Important disclaimer</p>
          <p style={styles.disclaimerText}>
            This tool is for career exploration only. Salary can vary by state,
            industry, employer, schedule, experience, and credentials.
            HireMinds does not guarantee pay, job placement, admission into any
            program, certification, or employment. If a role suggests training
            or school, that does not mean completion will guarantee a job.
          </p>
        </section>

        <section className="direction-progress" style={styles.progress}>
          <ProgressItem
            number="01"
            title="Explore"
            active={activeStep === "explore"}
            complete={selectedChoices.length > 0}
          />
          <ProgressItem
            number="02"
            title="Choose"
            active={activeStep === "choose"}
            complete={Boolean(selectedCareer)}
          />
          <ProgressItem
            number="03"
            title="Set Goal"
            active={activeStep === "goal"}
            complete={completedGoalFields >= 4}
          />
          <ProgressItem
            number="04"
            title="Action Plan"
            active={activeStep === "plan"}
            complete={Boolean(selectedCareer && completedGoalFields >= 4)}
          />
        </section>

        <section className="direction-card" style={styles.card}>
          <div style={styles.sectionHeadingRow}>
            <div>
              <p style={styles.sectionKicker}>STEP 1 / EXPLORE</p>
              <h2 style={styles.sectionTitle}>What kind of work fits you?</h2>
              <p style={styles.sectionCopy}>
                Select the interests, environments, strengths, and work
                preferences that feel most like you.
              </p>
            </div>

            <span style={styles.selectionCount}>
              {selectedChoices.length} selected
            </span>
          </div>

          <div className="direction-field-grid" style={styles.prefGrid}>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>
                How quickly do you want to start?
              </label>
              <select
                value={educationPreference}
                onChange={(e) =>
                  setEducationPreference(
                    e.target.value as EducationPreference
                  )
                }
                style={styles.input}
              >
                <option value="quick-start">Quick start / little training</option>
                <option value="short-training">Short training okay</option>
                <option value="certificate-ok">Certificate okay</option>
                <option value="degree-ok">Degree path okay</option>
              </select>
            </div>

            <div style={styles.fieldWrap}>
              <label style={styles.label}>Pay priority</label>
              <select
                value={salaryPreference}
                onChange={(e) =>
                  setSalaryPreference(
                    e.target.value as SalaryPreference
                  )
                }
                style={styles.input}
              >
                <option value="entry-level">Entry-level okay</option>
                <option value="moderate">Moderate pay preferred</option>
                <option value="higher">Higher pay preferred</option>
              </select>
            </div>
          </div>

          <div style={styles.choiceWrap}>
            {(Object.keys(choiceLabels) as Choice[]).map((choice) => {
              const selected = selectedChoices.includes(choice);

              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => toggleChoice(choice)}
                  className="direction-choice"
                  style={{
                    ...styles.choiceButton,
                    ...(selected ? styles.choiceButtonActive : {}),
                  }}
                >
                  {choiceLabels[choice]}
                </button>
              );
            })}
          </div>

          <div style={styles.stepActionRow}>
            <button
              type="button"
              onClick={() => {
                setActiveStep("choose");
                document
                  .getElementById("career-matches")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              disabled={selectedChoices.length === 0}
              className="direction-button"
              style={{
                ...styles.primaryButton,
                ...(selectedChoices.length === 0
                  ? styles.disabledButton
                  : {}),
              }}
            >
              See Career Matches
            </button>
          </div>
        </section>

        <section
          id="career-matches"
          className="direction-card"
          style={styles.card}
        >
          <div style={styles.sectionHeadingRow}>
            <div>
              <p style={styles.sectionKicker}>STEP 2 / CHOOSE</p>
              <h2 style={styles.sectionTitle}>Career paths to explore</h2>
              <p style={styles.sectionCopy}>
                These matches are ranked from the choices you made above.
                Review the options and choose one direction to build out.
              </p>
            </div>
          </div>

          {selectedChoices.length === 0 ? (
            <div style={styles.emptyState}>
              Choose at least one interest, skill, or work preference above to
              make these matches more meaningful.
            </div>
          ) : (
            <div className="direction-match-grid" style={styles.matchGrid}>
              {matches.map((career) => {
                const selected = selectedCareerId === career.id;

                return (
                  <article
                    key={career.id}
                    className="direction-match"
                    style={{
                      ...styles.matchCard,
                      ...(selected ? styles.matchCardSelected : {}),
                    }}
                  >
                    <div style={styles.matchTop}>
                      <div>
                        <h3 style={styles.matchTitle}>{career.title}</h3>
                        <p style={styles.matchPay}>{career.medianPayLabel}</p>
                      </div>

                      <span style={styles.matchTag}>
                        {selected ? "Selected" : "Match"}
                      </span>
                    </div>

                    <p style={styles.matchSummary}>{career.summary}</p>

                    <div style={styles.matchBlock}>
                      <p style={styles.blockLabel}>Why this may fit</p>
                      {career.whyItFits.map((item) => (
                        <p key={item} style={styles.blockText}>
                          • {item}
                        </p>
                      ))}
                    </div>

                    <div style={styles.matchBlock}>
                      <p style={styles.blockLabel}>What you may need next</p>
                      {career.whatYouNeed.map((item) => (
                        <p key={item} style={styles.blockText}>
                          • {item}
                        </p>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => chooseCareer(career.id)}
                      className="direction-button"
                      style={
                        selected
                          ? styles.selectedCareerButton
                          : styles.selectCareerButton
                      }
                    >
                      {selected
                        ? "Career Direction Selected"
                        : "Choose This Direction"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section
          id="career-goal"
          className="direction-card"
          style={styles.card}
        >
          <div style={styles.sectionHeadingRow}>
            <div>
              <p style={styles.sectionKicker}>STEP 3 / SET THE GOAL</p>
              <h2 style={styles.sectionTitle}>
                Build the goal around your direction
              </h2>
              <p style={styles.sectionCopy}>
                {selectedCareer
                  ? `You selected ${selectedCareer.title}. Now turn that direction into a practical career goal.`
                  : "Choose a career direction above before completing this section."}
              </p>
            </div>

            {selectedCareer ? (
              <span style={styles.selectedCareerChip}>
                {selectedCareer.title}
              </span>
            ) : null}
          </div>

          <div
            style={selectedCareer ? styles.goalFields : styles.lockedSection}
          >
            <TextAreaField
              label="Why did you choose this path?"
              value={whyChosen}
              onChange={setWhyChosen}
              placeholder="What makes this career direction a good fit for you?"
              disabled={!selectedCareer}
            />

            <TextAreaField
              label="What research have you done?"
              value={researchDone}
              onChange={setResearchDone}
              placeholder="What have you learned about the role, field, training, or next steps?"
              disabled={!selectedCareer}
            />

            <TextAreaField
              label="What outcome are you working toward?"
              value={expectedOutcome}
              onChange={setExpectedOutcome}
              placeholder="Stable employment, a career change, growth, long-term opportunity, advancement, etc."
              disabled={!selectedCareer}
            />

            <div className="direction-field-grid" style={styles.twoCol}>
              <TextAreaField
                label="Potential barriers or challenges"
                value={barriers}
                onChange={setBarriers}
                placeholder="Transportation, finances, schedule, training, confidence, time, or another challenge."
                disabled={!selectedCareer}
              />

              <TextAreaField
                label="How will you address those barriers?"
                value={overcomeBarriers}
                onChange={setOvercomeBarriers}
                placeholder="What practical steps can help you move through those challenges?"
                disabled={!selectedCareer}
              />
            </div>

            <div className="direction-field-grid" style={styles.twoCol}>
              <TextAreaField
                label="Who or what can support you?"
                value={supportSystem}
                onChange={setSupportSystem}
                placeholder="Family, friends, mentors, coaches, community resources, training providers, etc."
                disabled={!selectedCareer}
              />

              <Field
                label="When are you ready to begin?"
                value={startTimeline}
                onChange={setStartTimeline}
                placeholder="As soon as possible, this month, after training, etc."
                disabled={!selectedCareer}
              />
            </div>

            <div style={styles.stepActionRow}>
              <button
                type="button"
                onClick={() => {
                  setActiveStep("plan");
                  document
                    .getElementById("career-plan")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }}
                disabled={!selectedCareer}
                className="direction-button"
                style={{
                  ...styles.primaryButton,
                  ...(!selectedCareer ? styles.disabledButton : {}),
                }}
              >
                Build My Career Direction
              </button>
            </div>
          </div>
        </section>

        <section
          id="career-plan"
          className="print-wrap direction-card"
          style={styles.planCard}
        >
          <div style={styles.planHeader}>
            <div>
              <p style={styles.planKicker}>HIREMINDS CAREER DIRECTION</p>
              <h2 style={styles.planTitle}>
                {selectedCareer
                  ? selectedCareer.title
                  : "Choose a career direction to build your plan"}
              </h2>
            </div>

            {selectedCareer ? (
              <span style={styles.planPay}>
                {selectedCareer.medianPayLabel}
              </span>
            ) : null}
          </div>

          {selectedCareer ? (
            <>
              <section style={styles.planSection}>
                <p style={styles.planLabel}>Career Snapshot</p>
                <p style={styles.planText}>{selectedCareer.summary}</p>
              </section>

              <div className="direction-plan-grid" style={styles.planGrid}>
                <section style={styles.planSection}>
                  <p style={styles.planLabel}>Why It May Fit</p>
                  {selectedCareer.whyItFits.map((item) => (
                    <p key={item} style={styles.planBullet}>
                      • {item}
                    </p>
                  ))}
                </section>

                <section style={styles.planSection}>
                  <p style={styles.planLabel}>
                    Training / Education / Preparation
                  </p>
                  {selectedCareer.whatYouNeed.map((item) => (
                    <p key={item} style={styles.planBullet}>
                      • {item}
                    </p>
                  ))}
                </section>
              </div>

              <section style={styles.planSection}>
                <p style={styles.planLabel}>Career Goal</p>
                <p style={styles.planGoal}>{careerGoalStatement}</p>
              </section>

              <div className="direction-plan-grid" style={styles.planGrid}>
                <section style={styles.planSection}>
                  <p style={styles.planLabel}>Potential Barriers</p>
                  <p style={styles.planText}>
                    {barriers || "No barriers entered yet."}
                  </p>
                </section>

                <section style={styles.planSection}>
                  <p style={styles.planLabel}>Barrier Strategy</p>
                  <p style={styles.planText}>
                    {overcomeBarriers || "No barrier strategy entered yet."}
                  </p>
                </section>

                <section style={styles.planSection}>
                  <p style={styles.planLabel}>Support System</p>
                  <p style={styles.planText}>
                    {supportSystem || "No support system entered yet."}
                  </p>
                </section>

                <section style={styles.planSection}>
                  <p style={styles.planLabel}>Timeline</p>
                  <p style={styles.planText}>
                    {startTimeline || "No timeline entered yet."}
                  </p>
                </section>
              </div>

              <section style={styles.planSection}>
                <p style={styles.planLabel}>Action Plan / Next Steps</p>
                {actionPlan.map((item) => (
                  <p key={item} style={styles.planBullet}>
                    • {item}
                  </p>
                ))}
              </section>

              <div className="print-hide" style={styles.planActions}>
                <button
                  type="button"
                  onClick={handleSaveText}
                  className="direction-button"
                  style={styles.secondaryButton}
                >
                  Save Career Direction
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="direction-button"
                  style={styles.primaryButton}
                >
                  Print / Save PDF
                </button>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              Complete Career Exploration and choose a direction first.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProgressItem({
  number,
  title,
  active,
  complete,
}: {
  number: string;
  title: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      style={{
        ...styles.progressItem,
        ...(active ? styles.progressItemActive : {}),
        ...(complete ? styles.progressItemComplete : {}),
      }}
    >
      <span style={styles.progressNumber}>{number}</span>
      <strong style={styles.progressTitle}>{title}</strong>
      <span style={styles.progressStatus}>
        {complete ? "Complete" : active ? "Current" : "Next"}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          ...styles.input,
          ...(disabled ? styles.inputDisabled : {}),
        }}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          ...styles.textarea,
          ...(disabled ? styles.inputDisabled : {}),
        }}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 12% 4%, rgba(22,119,255,.14), transparent 26%), linear-gradient(180deg, #03101D 0%, #061725 45%, #04111E 100%)",
    color: "#EAF2FA",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  shell: {
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "34px 24px 72px",
    display: "grid",
    gap: "22px",
  },

  hero: {
    position: "relative",
    minHeight: "410px",
    padding: "48px",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) minmax(360px,.72fr)",
    gap: "36px",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "30px",
    background:
      "radial-gradient(circle at 88% 14%, rgba(22,119,255,.26), transparent 26%), linear-gradient(135deg, rgba(5,22,39,.98), rgba(8,44,81,.96))",
    boxShadow: "0 30px 80px rgba(0,0,0,.28)",
  },

  heroGlow: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    right: "-120px",
    top: "-150px",
    background:
      "radial-gradient(circle, rgba(69,151,255,.24), transparent 70%)",
    animation: "directionGlow 5.5s ease-in-out infinite",
  },

  heroContent: {
    position: "relative",
    zIndex: 2,
  },

  kicker: {
    margin: "0 0 16px",
    color: "#69AEFF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".18em",
  },

  title: {
    margin: "0 0 20px",
    color: "#FFFFFF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(54px,5.7vw,84px)",
    lineHeight: .96,
    letterSpacing: "-.05em",
    fontWeight: 400,
  },

  titleBlue: {
    color: "#3D97FF",
  },

  subtitle: {
    maxWidth: "760px",
    margin: 0,
    color: "#C4D2E0",
    fontSize: "17px",
    lineHeight: 1.75,
  },

  heroActions: {
    marginTop: "26px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  backButton: {
    minHeight: "44px",
    padding: "0 16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.035)",
    color: "#DDEAF6",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 850,
  },

  primaryButton: {
    minHeight: "44px",
    padding: "0 18px",
    border: "1px solid rgba(255,255,255,.14)",
    borderRadius: "12px",
    background:
      "linear-gradient(180deg, #238AFF 0%, #0A6DEB 74%, #0758BE 100%)",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow:
      "0 5px 0 #064793, 0 13px 24px rgba(22,119,255,.21), inset 0 1px 0 rgba(255,255,255,.32)",
  },

  secondaryButton: {
    minHeight: "44px",
    padding: "0 18px",
    border: "1px solid rgba(102,175,255,.30)",
    borderRadius: "12px",
    background:
      "linear-gradient(180deg, rgba(18,59,99,.96), rgba(8,32,57,.98))",
    color: "#DDEEFF",
    fontSize: "12px",
    fontWeight: 850,
    cursor: "pointer",
    boxShadow:
      "0 4px 0 #020B14, 0 11px 22px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.08)",
  },

  disabledButton: {
    opacity: .42,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  heroVisual: {
    minHeight: "290px",
    position: "relative",
    zIndex: 2,
  },

  heroOrb: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    right: "6%",
    top: "0",
    background:
      "radial-gradient(circle, rgba(22,119,255,.23), rgba(22,119,255,.03) 58%, transparent 72%)",
  },

  heroCardOne: {
    position: "absolute",
    width: "74%",
    minHeight: "160px",
    top: "8%",
    left: "0",
    padding: "24px",
    borderRadius: "20px",
    background: "#F5F9FD",
    color: "#0D1C2D",
    boxShadow: "0 24px 50px rgba(0,0,0,.22)",
    animation: "directionFloat 5.4s ease-in-out infinite",
  },

  heroCardTwo: {
    position: "absolute",
    width: "72%",
    minHeight: "145px",
    right: "0",
    bottom: "3%",
    padding: "24px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,.10)",
    background: "#07192B",
    color: "#FFFFFF",
    boxShadow: "0 24px 50px rgba(0,0,0,.28)",
    animation: "directionFloat 6.2s ease-in-out .4s infinite",
  },

  visualLabel: {
    display: "block",
    marginBottom: "10px",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".14em",
  },

  visualTitle: {
    display: "block",
    marginBottom: "9px",
    fontSize: "24px",
    lineHeight: 1.08,
  },

  visualText: {
    color: "#708299",
    fontSize: "11px",
    lineHeight: 1.6,
  },

  disclaimerBanner: {
    padding: "17px 20px",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "18px",
    background: "rgba(255,255,255,.035)",
  },

  disclaimerTitle: {
    margin: "0 0 5px",
    color: "#F4F7FA",
    fontSize: "13px",
    fontWeight: 800,
  },

  disclaimerText: {
    margin: 0,
    color: "#AFC0D1",
    fontSize: "12px",
    lineHeight: 1.65,
  },

  progress: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
  },

  progressItem: {
    minHeight: "86px",
    padding: "16px",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    columnGap: "10px",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,.07)",
    borderRadius: "16px",
    background: "rgba(255,255,255,.025)",
  },

  progressItemActive: {
    borderColor: "rgba(22,119,255,.45)",
    background: "rgba(22,119,255,.09)",
  },

  progressItemComplete: {
    borderColor: "rgba(69,151,255,.28)",
  },

  progressNumber: {
    gridRow: "1 / span 2",
    color: "#1677FF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "29px",
  },

  progressTitle: {
    color: "#F5F8FC",
    fontSize: "13px",
  },

  progressStatus: {
    color: "#8396AA",
    fontSize: "9px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".08em",
  },

  card: {
    padding: "30px",
    border: "1px solid rgba(255,255,255,.07)",
    borderRadius: "26px",
    background:
      "linear-gradient(145deg, rgba(8,25,42,.98), rgba(5,18,31,.98))",
    boxShadow: "0 24px 62px rgba(0,0,0,.24)",
  },

  sectionHeadingRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
    marginBottom: "24px",
  },

  sectionKicker: {
    margin: "0 0 7px",
    color: "#63A9F7",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".15em",
  },

  sectionTitle: {
    margin: "0 0 8px",
    color: "#F5F8FB",
    fontSize: "30px",
    lineHeight: 1.12,
    letterSpacing: "-.03em",
    fontWeight: 800,
  },

  sectionCopy: {
    maxWidth: "820px",
    margin: 0,
    color: "#AFC0D1",
    fontSize: "14px",
    lineHeight: 1.65,
  },

  selectionCount: {
    flexShrink: 0,
    padding: "9px 12px",
    borderRadius: "999px",
    background: "rgba(22,119,255,.10)",
    border: "1px solid rgba(22,119,255,.26)",
    color: "#88C0FF",
    fontSize: "10px",
    fontWeight: 850,
  },

  prefGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "20px",
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },

  fieldWrap: {
    width: "100%",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#D4E0EB",
    fontSize: "12px",
    fontWeight: 750,
  },

  input: {
    width: "100%",
    minHeight: "48px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,.11)",
    background: "#07131F",
    color: "#F4F7FA",
    fontSize: "14px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: "116px",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,.11)",
    background: "#07131F",
    color: "#F4F7FA",
    fontSize: "14px",
    lineHeight: 1.55,
    resize: "vertical",
    outline: "none",
  },

  inputDisabled: {
    opacity: .48,
    cursor: "not-allowed",
  },

  choiceWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
  },

  choiceButton: {
    padding: "11px 13px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.035)",
    color: "#DCE7F2",
    fontSize: "12px",
    fontWeight: 750,
    cursor: "pointer",
  },

  choiceButtonActive: {
    borderColor: "rgba(22,119,255,.62)",
    background:
      "linear-gradient(180deg, rgba(22,119,255,.22), rgba(22,119,255,.10))",
    color: "#FFFFFF",
    boxShadow: "0 8px 18px rgba(22,119,255,.12)",
  },

  stepActionRow: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "flex-end",
  },

  emptyState: {
    padding: "28px",
    borderRadius: "18px",
    border: "1px dashed rgba(255,255,255,.13)",
    background: "rgba(255,255,255,.025)",
    color: "#98AABD",
    fontSize: "13px",
    lineHeight: 1.7,
  },

  matchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
    gap: "18px",
  },

  matchCard: {
    padding: "22px",
    display: "grid",
    gap: "15px",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "21px",
    background:
      "linear-gradient(145deg, rgba(10,32,54,.96), rgba(6,21,36,.98))",
    boxShadow: "0 18px 40px rgba(0,0,0,.19)",
  },

  matchCardSelected: {
    borderColor: "rgba(22,119,255,.66)",
    boxShadow:
      "0 0 0 1px rgba(22,119,255,.18), 0 23px 48px rgba(0,0,0,.28)",
  },

  matchTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
  },

  matchTitle: {
    margin: "0 0 5px",
    color: "#F7FAFD",
    fontSize: "22px",
    lineHeight: 1.15,
    fontWeight: 850,
  },

  matchPay: {
    margin: 0,
    color: "#86BCF8",
    fontSize: "12px",
    fontWeight: 750,
  },

  matchTag: {
    flexShrink: 0,
    padding: "7px 9px",
    borderRadius: "999px",
    border: "1px solid rgba(22,119,255,.29)",
    background: "rgba(22,119,255,.09)",
    color: "#8BC2FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".07em",
    textTransform: "uppercase",
  },

  matchSummary: {
    margin: 0,
    color: "#B8C6D5",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  matchBlock: {
    display: "grid",
    gap: "5px",
  },

  blockLabel: {
    margin: "0 0 2px",
    color: "#F0F5FA",
    fontSize: "11px",
    fontWeight: 850,
  },

  blockText: {
    margin: 0,
    color: "#AFC0D1",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  selectCareerButton: {
    width: "fit-content",
    minHeight: "41px",
    padding: "0 15px",
    borderRadius: "11px",
    border: "1px solid rgba(22,119,255,.30)",
    background:
      "linear-gradient(180deg, rgba(22,119,255,.18), rgba(22,119,255,.08))",
    color: "#9DCBFF",
    fontSize: "11px",
    fontWeight: 900,
    cursor: "pointer",
  },

  selectedCareerButton: {
    width: "fit-content",
    minHeight: "41px",
    padding: "0 15px",
    borderRadius: "11px",
    border: "1px solid rgba(22,119,255,.62)",
    background:
      "linear-gradient(180deg, #1F85FA 0%, #0869E6 100%)",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 5px 0 #054A9E",
  },

  selectedCareerChip: {
    flexShrink: 0,
    maxWidth: "320px",
    padding: "9px 12px",
    borderRadius: "10px",
    background: "rgba(22,119,255,.10)",
    border: "1px solid rgba(22,119,255,.28)",
    color: "#8FC5FF",
    fontSize: "11px",
    fontWeight: 850,
  },

  goalFields: {
    display: "grid",
    gap: "16px",
  },

  lockedSection: {
    display: "grid",
    gap: "16px",
    opacity: .72,
  },

  planCard: {
    padding: "34px",
    borderRadius: "26px",
    border: "1px solid rgba(22,119,255,.24)",
    background: "#F8FBFE",
    color: "#132033",
    boxShadow: "0 28px 70px rgba(0,0,0,.24)",
  },

  planHeader: {
    paddingBottom: "20px",
    marginBottom: "22px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
    borderBottom: "3px solid #1677FF",
  },

  planKicker: {
    margin: "0 0 7px",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".15em",
  },

  planTitle: {
    margin: 0,
    color: "#101B2B",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "35px",
    lineHeight: 1.06,
    fontWeight: 500,
    letterSpacing: "-.03em",
  },

  planPay: {
    flexShrink: 0,
    color: "#4F6680",
    fontSize: "11px",
    fontWeight: 800,
  },

  planGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  planSection: {
    marginBottom: "22px",
  },

  planLabel: {
    margin: "0 0 8px",
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".09em",
    textTransform: "uppercase",
  },

  planText: {
    margin: 0,
    color: "#34465B",
    fontSize: "13px",
    lineHeight: 1.72,
  },

  planGoal: {
    margin: 0,
    color: "#182538",
    fontSize: "17px",
    lineHeight: 1.7,
    fontWeight: 650,
  },

  planBullet: {
    margin: "0 0 5px",
    color: "#34465B",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  planActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "flex-end",
    paddingTop: "20px",
    borderTop: "1px solid #DCE5EE",
  },
};
