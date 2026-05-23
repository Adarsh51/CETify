'use client';

import Link from 'next/link';

const scoringData = [
  { subject: 'Physics', perCorrect: '+1', questions: 50, maxMarks: 50 },
  { subject: 'Chemistry', perCorrect: '+1', questions: 50, maxMarks: 50 },
  { subject: 'Mathematics', perCorrect: '+2', questions: 50, maxMarks: 100 },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#0f172a]">
            About CETify
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Built by a student who gave MHT CET this year, for every student
            who wants instant clarity on their score.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-20 space-y-12">
        {/* Our Story */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">Our Story</h2>
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p>
              CETify was built out of pure frustration. After giving MHT CET 2026, 
              the wait to know your actual score feels endless. The official portal 
              gives you a response sheet, but no quick way to calculate your marks. 
              You&apos;re left manually counting correct and incorrect answers — or 
              relying on random apps that want your personal data.
            </p>
            <p>
              So I decided to build something better. CETify is a simple, fast, 
              and completely private tool that does one thing really well — it 
              takes your official response sheet HTML and instantly tells you your 
              total score, subject breakdown, and how you compare with other 
              students in your shift.
            </p>
            <p>
              No sign-ups. No data collection. No ads. Just upload, calculate, done.
            </p>
            <p className="text-gray-400 text-xs italic">
              — A fellow MHT CET 2026 aspirant
            </p>
          </div>
        </section>

        {/* What is CETify */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">What is CETify?</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            CETify is a free tool that lets you instantly calculate your MHT CET 
            score by uploading your response sheet HTML file from the official CET 
            Cell portal. It parses the file right in your browser — no data is 
            ever sent to any server. You get a detailed breakdown of your marks, 
            subject-wise analysis, accuracy stats, and shift-wise rankings.
          </p>
        </section>

        {/* Scoring Rules */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">How Scoring Works</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Per Correct
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Max Marks
                  </th>
                </tr>
              </thead>
              <tbody>
                {scoringData.map((row) => (
                  <tr
                    key={row.subject}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#0f172a] text-sm">{row.subject}</td>
                    <td className="px-6 py-4 text-center text-green-600 font-semibold text-sm">
                      {row.perCorrect}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">{row.questions}</td>
                    <td className="px-6 py-4 text-center font-semibold text-[#0f172a] text-sm">
                      {row.maxMarks}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#eef2ff]">
                  <td className="px-6 py-4 font-bold text-[#0f172a] text-sm">Total</td>
                  <td className="px-6 py-4 text-center text-gray-400 text-sm">—</td>
                  <td className="px-6 py-4 text-center font-bold text-[#0f172a] text-sm">150</td>
                  <td className="px-6 py-4 text-center font-bold text-[#4338ca] text-sm">
                    200
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Note: There is no negative marking in MHT CET.
          </p>
        </section>

        {/* Privacy */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-3">
                Your Privacy Matters
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                CETify processes your response sheet <strong>entirely in your browser</strong>.
                No data is uploaded, stored, or transmitted to any server.
                The file you upload never leaves your device.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  No server uploads
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  No cookies or tracking
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  No data collection
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Works offline after loading
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Meet the Creator */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">Meet the Creator</h2>
          <div className="text-gray-600 text-sm leading-relaxed mb-4">
            <p className="mb-2">
              Hey! I'm <strong>Adarsh Dubey</strong>, the developer behind CETify.
            </p>
            <p>
              I built this platform to solve a real problem I faced during my own MHT CET journey. 
              My goal was to create something fast, beautiful, and completely privacy-focused for the student community.
            </p>
          </div>
          <a
            href="https://www.linkedin.com/in/adarsh-dubey-048689213"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#4338ca] hover:text-[#3730a3] font-semibold transition-colors text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            Connect with me on LinkedIn
          </a>
        </section>

        {/* CTA */}
        <div className="text-center py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#4338ca] text-white text-sm font-semibold rounded-lg hover:bg-[#3730a3] transition-colors"
          >
            Start Calculating
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
