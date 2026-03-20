"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";

export default function ResumeBuilder() {
  const [font, setFont] = useState("serif");

  const [data, setData] = useState<any>({
    name: "",
    phone: "",
    email: "",
    linkedin: "",
    location: "",
    summary: "",
    skills: [],
    education: [],
    work: [],
    sections: ["summary", "skills", "education", "work"],
  });

  const update = (field: string, value: any) => {
    setData({ ...data, [field]: value });
  };

  // ---------------- SKILLS ----------------
  const addSkill = (skill: string) => {
    if (!skill || data.skills.length >= 9) return;
    update("skills", [...data.skills, skill]);
  };

  // ---------------- EDUCATION ----------------
  const addEducation = () => {
    update("education", [
      ...data.education,
      {
        id: uuid(),
        school: "",
        location: "",
        date: "",
        degree: "",
        details: "",
      },
    ]);
  };

  // ---------------- WORK ----------------
  const addWork = () => {
    update("work", [
      ...data.work,
      {
        id: uuid(),
        company: "",
        location: "",
        date: "",
        title: "",
        bullets: [],
      },
    ]);
  };

  const addBullet = (id: string, text: string) => {
    if (!text) return;

    const updated = data.work.map((job: any) => {
      if (job.id === id && job.bullets.length < 4) {
        return { ...job, bullets: [...job.bullets, text] };
      }
      return job;
    });

    update("work", updated);
  };

  // ---------------- REORDER ----------------
  const moveSection = (i: number, dir: number) => {
    const arr = [...data.sections];
    [arr[i], arr[i + dir]] = [arr[i + dir], arr[i]];
    update("sections", arr);
  };

  // ---------------- FONTS ----------------
  const fontClass =
    font === "serif"
      ? "font-serif"
      : font === "modern"
      ? "font-sans"
      : "font-mono";

  return (
    <div className="flex h-screen">

      {/* LEFT SIDE FORM */}
      <div className="w-1/2 overflow-y-scroll border-r p-6 space-y-4">

        <h2 className="font-bold text-lg">Header</h2>

        <input placeholder="Full Name" onChange={(e) => update("name", e.target.value)} />
        <input placeholder="Phone" onChange={(e) => update("phone", e.target.value)} />
        <input placeholder="Email" onChange={(e) => update("email", e.target.value)} />
        <input placeholder="LinkedIn" onChange={(e) => update("linkedin", e.target.value)} />
        <input placeholder="City, State" onChange={(e) => update("location", e.target.value)} />

        <select onChange={(e) => setFont(e.target.value)}>
          <option value="serif">Professional Serif</option>
          <option value="modern">Modern Sans</option>
          <option value="classic">Classic Mono</option>
        </select>

        <h2 className="font-bold text-lg">Summary / Title</h2>
        <textarea onChange={(e) => update("summary", e.target.value)} />

        <h2 className="font-bold text-lg">Skills (max 9)</h2>
        <input
          placeholder="Press Enter"
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill(e.target.value);
              e.target.value = "";
            }
          }}
        />

        {data.skills.map((s: string, i: number) => (
          <div key={i}>• {s}</div>
        ))}

        <h2 className="font-bold text-lg">Education</h2>
        <button onClick={addEducation}>Add Education</button>

        {data.education.map((ed: any, i: number) => (
          <div key={ed.id}>
            <input placeholder="School" onChange={(e) => {
              const arr = [...data.education];
              arr[i].school = e.target.value;
              update("education", arr);
            }} />
            <input placeholder="Location" onChange={(e) => {
              const arr = [...data.education];
              arr[i].location = e.target.value;
              update("education", arr);
            }} />
            <input placeholder="Dates" onChange={(e) => {
              const arr = [...data.education];
              arr[i].date = e.target.value;
              update("education", arr);
            }} />
            <input placeholder="Degree" onChange={(e) => {
              const arr = [...data.education];
              arr[i].degree = e.target.value;
              update("education", arr);
            }} />
          </div>
        ))}

        <h2 className="font-bold text-lg">Work Experience</h2>
        <button onClick={addWork}>Add Job</button>

        {data.work.map((job: any, i: number) => (
          <div key={job.id}>
            <input placeholder="Company" onChange={(e) => {
              const arr = [...data.work];
              arr[i].company = e.target.value;
              update("work", arr);
            }} />

            <input placeholder="Location" onChange={(e) => {
              const arr = [...data.work];
              arr[i].location = e.target.value;
              update("work", arr);
            }} />

            <input placeholder="Dates" onChange={(e) => {
              const arr = [...data.work];
              arr[i].date = e.target.value;
              update("work", arr);
            }} />

            <input placeholder="Title" onChange={(e) => {
              const arr = [...data.work];
              arr[i].title = e.target.value;
              update("work", arr);
            }} />

            <input
              placeholder="Add bullet (max 4)"
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addBullet(job.id, e.target.value);
                  e.target.value = "";
                }
              }}
            />

            {job.bullets.map((b: string, idx: number) => (
              <div key={idx}>• {b}</div>
            ))}
          </div>
        ))}

        <h2 className="font-bold text-lg">Reorder Sections</h2>
        {data.sections.map((s: string, i: number) => (
          <div key={i} className="flex gap-2">
            <span>{s}</span>
            {i > 0 && <button onClick={() => moveSection(i, -1)}>↑</button>}
            {i < data.sections.length - 1 && <button onClick={() => moveSection(i, 1)}>↓</button>}
          </div>
        ))}

      </div>

      {/* RIGHT SIDE PREVIEW */}
      <div className="w-1/2 overflow-y-scroll bg-gray-100 p-6">
        <div className={`bg-white p-10 shadow max-w-[850px] mx-auto ${fontClass}`}>

          {/* HEADER */}
          <div className="text-center font-bold text-2xl">
            {data.name}
          </div>

          <div className="flex justify-between text-sm mt-2">
            <div>{data.phone}</div>
            <div>{data.email} | {data.linkedin}</div>
            <div>{data.location}</div>
          </div>

          {/* SECTIONS */}
          {data.sections.map((section: string) => {

            if (section === "summary") {
              return (
                <div key={section}>
                  <h2 className="text-center font-bold mt-4">Summary</h2>
                  <p>{data.summary}</p>
                </div>
              );
            }

            if (section === "skills") {
              return (
                <div key={section}>
                  <h2 className="text-center font-bold mt-4">Skills</h2>
                  <div className="grid grid-cols-3">
                    {data.skills.map((s: string, i: number) => (
                      <div key={i}>• {s}</div>
                    ))}
                  </div>
                </div>
              );
            }

            if (section === "education") {
              return (
                <div key={section}>
                  <h2 className="text-center font-bold mt-4">Education</h2>
                  {data.education.map((ed: any) => (
                    <div key={ed.id}>
                      <div className="flex justify-between font-bold">
                        <span>{ed.school}, {ed.location}</span>
                        <span>{ed.date}</span>
                      </div>
                      <div><strong>{ed.degree}</strong></div>
                    </div>
                  ))}
                </div>
              );
            }

            if (section === "work") {
              return (
                <div key={section}>
                  <h2 className="text-center font-bold mt-4">Work Experience</h2>
                  {data.work.map((job: any) => (
                    <div key={job.id}>
                      <div className="flex justify-between font-bold">
                        <span>{job.company}, {job.location}</span>
                        <span>{job.date}</span>
                      </div>
                      <div>{job.title}</div>
                      <ul>
                        {job.bullets.map((b: string, i: number) => (
                          <li key={i}>• {b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            }

          })}

        </div>
      </div>
    </div>
  );
}
