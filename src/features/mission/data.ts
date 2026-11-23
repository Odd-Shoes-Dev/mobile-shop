import type { ArtCategory } from "@/components/ArtIcon";
import type { UseCase } from "@/lib/eri";

export interface Mission {
  key: string;
  name: string;
  use: UseCase;
  cls: "tile--k" | "tile--g" | "tile--y" | "";
  tag: string;
  icon: ArtCategory;
  acc: ArtCategory[];
  setup: string;
  priority?: "portable" | "performance";
  tips: string[];
}

/** Ported verbatim from the prototype's `MISSIONS`. */
export const MISSIONS: Record<string, Mission> = {
  game: {
    key: "game",
    name: "GAME MODE",
    use: "gaming",
    cls: "tile--k",
    tag: "Frames per second, not excuses.",
    icon: "headphones",
    acc: ["mouse", "keyboard", "headphones", "cooling"],
    setup: "gamer",
    tips: [
      "Graphics matter most. A dedicated graphics card is what makes demanding games playable.",
      "16GB of RAM is the comfortable level for modern games.",
      "A cooling pad helps a gaming laptop stay fast during long sessions.",
    ],
  },
  study: {
    key: "study",
    name: "STUDY MODE",
    use: "study",
    cls: "",
    tag: "Light, long-lasting and kind to your budget.",
    icon: "bag",
    acc: ["bag", "headphones", "storage", "mouse"],
    setup: "student",
    priority: "portable",
    tips: [
      "Battery life and weight matter more than raw power for lectures.",
      "8GB RAM and an SSD are enough for classes, research and documents.",
      "A padded bag and a backup drive protect your assignments.",
    ],
  },
  create: {
    key: "create",
    name: "CREATE MODE",
    use: "create",
    cls: "tile--g",
    tag: "Edit, design and make music without lag.",
    icon: "monitor",
    acc: ["monitor", "storage", "keyboard", "headphones"],
    setup: "creator",
    tips: [
      "RAM and the processor decide how smoothly editing software runs.",
      "Plenty of fast storage means space for footage and projects.",
      "A bigger, sharper monitor changes how you work.",
    ],
  },
  work: {
    key: "work",
    name: "WORK MODE",
    use: "work",
    cls: "tile--y",
    tag: "Reliable machines for the office and the road.",
    icon: "keyboard",
    acc: ["mouse", "monitor", "bag", "keyboard"],
    setup: "student",
    tips: [
      "Battery life and a sturdy build beat flashy specs for daily work.",
      "16GB RAM keeps spreadsheets, browsers and video calls smooth together.",
      "A second monitor makes long work days easier.",
    ],
  },
};

export const BUDGET_PRESETS: [string, number | null][] = [
  ["Under UGX 1.5M", 1_500_000],
  ["Up to UGX 2.5M", 2_500_000],
  ["Up to UGX 4M", 4_000_000],
  ["No limit", null],
];
