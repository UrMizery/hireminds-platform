"use client";

import { useState } from "react";

export default function ResumeBuilder() {
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [workHistory, setWorkHistory] = useState<any[]>([]);

  const [showAutofillPrompt, setShowAutofillPrompt] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleResumeUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse-resume", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setParsedData(data);
    setShowAutofillPrompt(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Resume Builder</h1>

      {/* Upload */}
      <div className="mb-6">
        <input
          type="file"
          onChange={handleResumeUpload}
          className="block text-sm"
        />
      </div>

      {/* Autofill Prompt */}
      {showAutofillPrompt && (
        <div className="bg-zinc-900 p-4 rounded-lg mb-6">
          <p className="mb-3">
            Use this resume to auto-fill your new resume?
          </p>

          <div className="flex gap-3">
            <button
              className="bg-blue-600 px-4 py-2 rounded"
              onClick={() => {
                setSummary(parsedData.summary || "");
                setSkills(parsedData.skills || []);
                setEducation(parsedData.education || "");
                setCertifications(parsedData.certifications || "");
                setWorkHistory(parsedData.jobs || []);
                setShowAutofillPrompt(false);
              }}
            >
              Yes
            </button>

            <button
              className="bg-zinc-700 px-4 py-2 rounded"
              onClick={() => setShowAutofillPrompt(false)}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT SIDE FORM */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold">Summary</h3>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 bg-black border border-gray-700 rounded"
            />
          </div>

          <div>
            <h3 className="mb-2 font-semibold">
              Skills (comma separated)
            </h3>
            <input
              value={skills.join(", ")}
              onChange={(e) =>
                setSkills(
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
              className="w-full p-3 bg-black border border-gray-700 rounded"
            />
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Education</h3>
            <textarea
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full p-3 bg-black border border-gray-700 rounded"
            />
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Certifications</h3>
            <textarea
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              className="w-full p-3 bg-black border border-gray-700 rounded"
            />
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Work Experience</h3>

            {workHistory.map((job, i) => (
              <div
                key={i}
                className="bg-zinc-900 p-4 rounded mb-3 space-y-2"
              >
                <input
                  placeholder="Company"
                  value={job.company || ""}
                  onChange={(e) => {
                    const updated = [...workHistory];
                    updated[i].company = e.target.value;
                    setWorkHistory(updated);
                  }}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                />

                <input
                  placeholder="Title"
                  value={job.title || ""}
                  onChange={(e) => {
                    const updated = [...workHistory];
                    updated[i].title = e.target.value;
                    setWorkHistory(updated);
                  }}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE PREVIEW */}
        <div className="bg-zinc-900 p-6 rounded-xl sticky top-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Preview</h2>

          <h3 className="font-semibold">Summary</h3>
          <p className="mb-4 whitespace-pre-line">{summary}</p>

          <h3 className="font-semibold">Skills</h3>
          <ul className="list-disc ml-5 mb-4">
            {skills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h3 className="font-semibold">Education</h3>
          <p className="mb-4 whitespace-pre-line">{education}</p>

          <h3 className="font-semibold">Certifications</h3>
          <p className="mb-4 whitespace-pre-line">{certifications}</p>

          <h3 className="font-semibold">Work Experience</h3>
          {workHistory.map((job, i) => (
            <div key={i} className="mb-3">
              <p className="font-bold">
                {job.company} — {job.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
