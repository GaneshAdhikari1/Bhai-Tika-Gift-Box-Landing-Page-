"use client";

import { useState } from "react";
import Icon from "./Icon";

const faqs = [
  {
    question: "What is included in the Premium Bhai Tika Gift Box?",
    answer: "The hamper includes premium chocolates, Ferrero Rocher, Haldiram’s Gulab Jamun, a reusable refreshment bottle, and other festive treats, arranged in a personalized wooden-style gift box."
  },
  {
    question: "Do you deliver outside Kathmandu Valley?",
    answer: "Yes. We deliver across Nepal. Delivery is Rs. 100 inside Kathmandu Valley and Rs. 200 for locations outside the Valley."
  },
  {
    question: "How do I pay for my order?",
    answer: "This offer uses Cash on Delivery. You pay when your order reaches the delivery address. No online payment is required."
  },
  {
    question: "Will someone confirm my order?",
    answer: "Yes. After you place the order, our sales representative will call you to verify the delivery information and confirm your order."
  },
  {
    question: "Can I send the box directly to my brother?",
    answer: "Absolutely. Enter your brother’s exact delivery location and a reachable phone number during checkout, and we can deliver the gift directly."
  },
  {
    question: "Is the gift box ready to give?",
    answer: "Yes. The hamper comes arranged and festively wrapped, so no additional wrapping is needed."
  },
  {
    question: "When should I place my order?",
    answer: "Festival demand can be high, so ordering early is recommended. We will confirm the expected delivery timing when we call you."
  }
];

export default function FaqList() {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-ink/10 overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-card">
      {faqs.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? -1 : index)}
              aria-expanded={expanded}
              className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-bold text-ink transition hover:bg-rosewash/35 sm:px-8"
            >
              <span>{item.question}</span>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${expanded ? "rotate-45 bg-plum text-white" : "bg-rosewash text-plum"}`}>
                <Icon name="plus" className="h-4 w-4" />
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="px-6 pb-6 leading-7 text-ink/65 sm:px-8">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
