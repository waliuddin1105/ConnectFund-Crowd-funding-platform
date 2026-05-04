import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_FAQS = [
    {
        q: "How do I upload images to my campaign?",
        a: "Go to create campaign page, select your image file, and save. Supported formats: .jpg, .png. Maximum file size: 5MB.",
    },
    {
        q: "What is the scope of this project?",
        a: "To target the major and minor funding collection organizations (Saylani/JDC etc.) and provide them with the platform to post campaigns and receive donations",
    },
    {
        q: "Can I edit my donation after it's submitted?",
        a: "No — donations are processed immediately. If you need changes, please contact support",
    },
    {
        q: "How do refunds work?",
        a: "They dont. We have a no refund policy",
    },
    {
        q: "Where can i find the source code of this beautiful project",
        a: (
            <span>
                You can visit{' '}
                <a
                    href="https://github.com/Sajjadecoder/Crowd-funding"
                    className="text-indigo-400 underline hover:text-indigo-300"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    the GitHub repository
                </a>.
            </span>
        ),
    },
];

export default function FAQs({ className = "", data = MOCK_FAQS }) {
    const [openIndex, setOpenIndex] = useState(null);
    const navigate = useNavigate()
    const toggle = (idx) => {
        setOpenIndex((prev) => (prev === idx ? null : idx));
    };

    const handleKey = (e, idx) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle(idx);
        }
    };

    return (
        <section
            className={`max-w-5xl mx-auto p-4 text-gray-200 ${className}`}
            aria-label="Frequently asked questions"
        >
            <h2 className="text-2xl font-semibold mb-4 text-white">Frequently Asked Questions</h2>

            <ul className="space-y-2">
                {data.map((item, idx) => {
                    const isOpen = openIndex === idx;
                    return (
                        <li
                            key={idx}
                            className="bg-[#1c1c1f] border border-gray-700 rounded-xl shadow-sm overflow-hidden"
                        >
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => toggle(idx)}
                                    onKeyDown={(e) => handleKey(e, idx)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-panel-${idx}`}
                                    className="w-full text-left p-4 flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 text-gray-200"
                                >
                                    <span className="flex-1">
                                        <span className="text-base font-medium text-white">{item.q}</span>
                                    </span>

                                    {/* Arrow icon */}
                                    <span
                                        className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                                        aria-hidden
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-300"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                        >
                                            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>

                            <div
                                id={`faq-panel-${idx}`}
                                role="region"
                                aria-labelledby={`faq-${idx}`}
                                className={`px-4 pb-4 transition-[max-height,opacity] duration-200 ease-in-out overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <p className="text-sm leading-relaxed text-gray-400">{item.a}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <p className="mt-4 text-sm text-gray-500" onClick={() => { navigate('/contact-us') }}>Can't find an answer? Contact our support team.</p>
        </section>
    );
}