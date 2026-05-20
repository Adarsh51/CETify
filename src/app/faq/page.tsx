'use client';

import { useState } from 'react';
import Link from 'next/link';

const faqs = [
  {
    q: 'How do I get my response sheet HTML file?',
    a: 'Log in to your MHT CET dashboard at cetcell.mahacet.org with your credentials. Navigate to the "Objection Tracker" section. Once the response sheet page loads, press Ctrl+S (or Cmd+S on Mac) and save the page as an HTML file. Then upload that saved .html file here on CETify.',
  },
  {
    q: 'What file formats does CETify support?',
    a: 'CETify supports .html and .htm files saved from the official MHT CET objection tracker portal. Simply use your browser\'s "Save As" feature (Ctrl+S) and save the response sheet page. Upload the resulting HTML file.',
  },
  {
    q: 'Is my data safe and private?',
    a: 'Absolutely. CETify processes everything locally in your browser using JavaScript. Your response sheet file is never uploaded to any server. We don\'t collect, store, or transmit any of your personal data. You can even use CETify offline after the page loads.',
  },
  {
    q: 'Why does Mathematics have +2 marks per question?',
    a: 'As per the official MHT CET marking scheme, Mathematics questions carry 2 marks each while Physics and Chemistry questions carry 1 mark each. This makes the total maximum score 200 (Physics 50 + Chemistry 50 + Maths 100).',
  },
  {
    q: 'Is there negative marking in MHT CET?',
    a: 'No, there is no negative marking in MHT CET. Only correct answers are awarded marks. Incorrect or unattempted questions score zero.',
  },
  {
    q: 'How does the Shift Analytics / Leaderboard work?',
    a: 'When you calculate your score, CETify anonymously records your total marks for your specific shift (e.g. April 11 Shift 1). It then compares your score against all other students who have calculated their results for the same shift, showing you how many scored higher, how many scored lower, and the highest/average/lowest scores.',
  },
  {
    q: 'What if I\'m the first student in my shift?',
    a: 'If you are the first student to calculate results for your particular shift, CETify will show your score but display a notice that comparison data is not yet available. As more students use CETify for the same shift, the leaderboard and analytics will automatically populate.',
  },
  {
    q: 'Can I calculate my score for PCB?',
    a: 'No, CETify currently supports the PCM (Engineering) group exclusively. Support for the PCB (Pharmacy) group is not active at this time.',
  },
  {
    q: 'Does CETify work on mobile?',
    a: 'Yes, CETify is fully responsive and works on mobile browsers. However, you\'ll need to download your response sheet HTML from a desktop/laptop first, then transfer it to your phone, or simply use CETify on the same desktop where you downloaded the file.',
  },
  {
    q: 'Is CETify free to use?',
    a: 'Yes, CETify is completely free. No sign-ups, no subscriptions, no hidden fees. It was built by a fellow MHT CET aspirant to help students get their scores instantly.',
  },
];

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#0f172a]">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Everything you need to know about using CETify to calculate your MHT CET score.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-20">
        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:border-gray-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-[#0f172a] text-sm pr-4">{faq.q}</span>
                <svg
                  className={`w-5 h-5 shrink-0 text-gray-400 transition-transform duration-300 ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openFaq === i
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-bold text-[#0f172a] mb-2">Still have questions?</h3>
          <p className="text-gray-500 text-sm mb-6">
            Check out the About page for more details on how CETify works and our privacy policy.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/about"
              className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              About CETify
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 bg-[#4338ca] text-white text-sm font-semibold rounded-lg hover:bg-[#3730a3] transition-colors"
            >
              Start Calculating
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
