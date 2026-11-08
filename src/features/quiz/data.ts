import type { ArtCategory } from "@/components/ArtIcon";

export interface QuizOption {
  label: string;
  value: string;
  icon: ArtCategory;
}

export interface QuizStep {
  key: "for" | "budget" | "prio" | "focus" | "brand";
  question: string;
  /** null means: build options from the live brand list at render time. */
  options: QuizOption[] | null;
}

/** Ported verbatim from the prototype's `QUIZ` array. */
export const QUIZ: QuizStep[] = [
  {
    key: "for",
    question: "What will you use it for?",
    options: [
      { label: "School or study", value: "study", icon: "bag" },
      { label: "Office or business", value: "work", icon: "keyboard" },
      { label: "Fun and browsing", value: "study", icon: "headphones" },
      { label: "Side hustle or content", value: "create", icon: "monitor" },
    ],
  },
  {
    key: "budget",
    question: "What is your budget?",
    options: [
      { label: "Under UGX 1.5M", value: "1500000", icon: "storage" },
      { label: "Up to UGX 2.5M", value: "2500000", icon: "storage" },
      { label: "Up to UGX 4M", value: "4000000", icon: "storage" },
      { label: "More than 4M", value: "99000000", icon: "storage" },
    ],
  },
  {
    key: "prio",
    question: "Portability or performance?",
    options: [
      { label: "Easy to carry", value: "portable", icon: "bag" },
      { label: "Maximum power", value: "performance", icon: "cooling" },
      { label: "A bit of both", value: "", icon: "laptop" },
    ],
  },
  {
    key: "focus",
    question: "Gaming, creative work or productivity?",
    options: [
      { label: "Gaming", value: "gaming", icon: "mouse" },
      { label: "Creative work", value: "create", icon: "monitor" },
      { label: "Productivity", value: "work", icon: "keyboard" },
      { label: "None of these", value: "none", icon: "laptop" },
    ],
  },
  { key: "brand", question: "Any brand you prefer?", options: null },
];
