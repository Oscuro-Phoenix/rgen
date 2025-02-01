"use client";

import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";

export default function Home() {
  const [answers, setAnswers] = useState({
    name: '',
    email: '',
    experience: '',
    education: '',
    skills: ''
  });
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResumeUrl(null);

    try {
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate resume");
      }

      // Get the PDF blob directly from the response
      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      setResumeUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add cleanup for the blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (resumeUrl) {
        URL.revokeObjectURL(resumeUrl);
      }
    };
  }, [resumeUrl]);

  const handleInputChange = (field: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <main className="flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-center">RGen Test</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-medium">Full Name</label>
            <input
              type="text"
              id="name"
              value={answers.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="border rounded-md p-2"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium">Email</label>
            <input
              type="email"
              id="email"
              value={answers.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="border rounded-md p-2"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="experience" className="font-medium">Work Experience</label>
            <textarea
              id="experience"
              value={answers.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              className="border rounded-md p-2 min-h-[100px]"
              placeholder="List your work experience..."
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="education" className="font-medium">Education</label>
            <textarea
              id="education"
              value={answers.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              className="border rounded-md p-2 min-h-[100px]"
              placeholder="List your education..."
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="skills" className="font-medium">Skills</label>
            <textarea
              id="skills"
              value={answers.skills}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              className="border rounded-md p-2 min-h-[100px]"
              placeholder="List your skills..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 text-white py-2 px-4 hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </form>

        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}

        {resumeUrl && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-green-600">Resume Generated!</p>
            <a
              href={resumeUrl}
              download="resume.pdf"
              className="rounded-md bg-green-600 text-white py-2 px-4 hover:bg-green-700"
            >
              Download PDF
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
