/**
 * GWD CLUB — MASTER DATA ARCHITECTURE
 * 
 * Strict Content Rule:
 * DO NOT INVENT REAL INFORMATION.
 * Only use real information provided by the user.
 * For unprovided content, use exact placeholder tags like [ADD FOUNDING STORY], [ADD AUTHENTIC QUOTE], etc.
 */

export const GWD_INFO = {
  name: "GWD CLUB",
  fullName: "GET WORK DONE CLUB",
  tagline: "EVERY STORY HAS A BEGINNING.",
  logoUrl: "/gwd-logo.png",
};

export const CHAPTERS = [
  { id: "00", key: "void", title: "THE VOID", subtitle: "Where silence meets vision" },
  { id: "01", key: "beginning", title: "THE BEGINNING", subtitle: "One point. One line. A network." },
  { id: "02", key: "why", title: "WHY GWD EXISTS", subtitle: "Purpose beyond titles" },
  { id: "03", key: "people", title: "THE PEOPLE", subtitle: "Built by people, not a logo" },
  { id: "04", key: "leaders", title: "THE LEADERS", subtitle: "Current Leadership" },
  { id: "05", key: "voices", title: "VOICES OF GWD CLUB", subtitle: "Authentic Words" },
  { id: "06", key: "core-team", title: "THE CORE TEAM", subtitle: "One Club. Many Minds." },
  { id: "07", key: "members", title: "TEAM MEMBERS", subtitle: "Branch Directory" },
  { id: "08", key: "events", title: "THE EVENTS", subtitle: "Recovered Archives" },
  { id: "09", key: "projects", title: "THE PROJECTS", subtitle: "Case Files" },
  { id: "10", key: "memories", title: "THE MEMORIES", subtitle: "Photography Exhibition" },
  { id: "11", key: "achievements", title: "THE ACHIEVEMENTS", subtitle: "Verified Evidence" },
  { id: "13", key: "future", title: "THE FUTURE", subtitle: "The Unknown" }
];

// Single source of truth for all leaders (strictly provided names only)
// Note: Nishta and Burhan are TWO SEPARATE PEOPLE sharing the same position.
export const LEADERSHIP = [
  {
    id: "aldrin-paul",
    position: "President",
    name: "Aldrin Paul",
    photoPlaceholder: "[PHOTO — ALDRIN PAUL]",
    photoUrl: "/photos/aldrin-paul.webp",
    branch: "Executive",
  },
  {
    id: "mohd-ismail",
    position: "Vice President",
    name: "Mohd Ismail",
    photoPlaceholder: "[PHOTO — MOHD ISMAIL]",
    photoUrl: "/photos/mohd-ismail.webp",
    branch: "Executive",
  },
  {
    id: "g-sravya",
    position: "General Secretary",
    name: "G. Sravya",
    photoPlaceholder: "[PHOTO — G. SRAVYA]",
    photoUrl: "/photos/g-sravya.webp",
    branch: "Administration",
  },
  {
    id: "anvitha-reddy",
    position: "Marketing Lead",
    name: "Anvitha Reddy",
    photoPlaceholder: "[PHOTO — ANVITHA REDDY]",
    photoUrl: "/photos/anvitha-reddy.webp",
    branch: "Outreach",
  },
  {
    id: "bhavya-chaudhary",
    position: "Event Management Lead",
    name: "Bhavya Chaudhary",
    photoPlaceholder: "[PHOTO — BHAVYA CHAUDHARY]",
    photoUrl: "/photos/bhavya-chaudhary.webp",
    branch: "Operations",
  },
  {
    id: "tuba-azeem",
    position: "PR Lead",
    name: "Tuba Azeem",
    photoPlaceholder: "[PHOTO — TUBA AZEEM]",
    photoUrl: "/photos/tuba-azeem.webp",
    branch: "Public Relations",
  },
  {
    id: "nishta",
    position: "Creative & Visual Media Lead",
    name: "Nishta",
    photoPlaceholder: "[PHOTO — NISHTA]",
    photoUrl: "/photos/nishta.webp",
    branch: "Creative",
  },
  {
    id: "burhan",
    position: "Creative & Visual Media Lead",
    name: "Burhan",
    photoPlaceholder: "[PHOTO — BURHAN]",
    photoUrl: "/photos/burhan.webp",
    branch: "Creative",
  },
  {
    id: "deekshit",
    position: "Technical Lead",
    name: "Deekshith",
    photoPlaceholder: "[PHOTO — DEEKSHITH]",
    photoUrl: "/photos/deekshith.webp",
    branch: "Technical",
  }
];

// Members placeholder data (ready for real uploads)
export const MEMBERS_DATA = [
  { id: "member-01", placeholderName: "[MEMBER NAME]", team: "[TEAM / DOMAIN]", photoPlaceholder: "[PHOTO — MEMBER NAME]" },
  { id: "member-02", placeholderName: "[MEMBER NAME]", team: "[TEAM / DOMAIN]", photoPlaceholder: "[PHOTO — MEMBER NAME]" },
  { id: "member-03", placeholderName: "[MEMBER NAME]", team: "[TEAM / DOMAIN]", photoPlaceholder: "[PHOTO — MEMBER NAME]" },
  { id: "member-04", placeholderName: "[MEMBER NAME]", team: "[TEAM / DOMAIN]", photoPlaceholder: "[PHOTO — MEMBER NAME]" },
  { id: "member-05", placeholderName: "[MEMBER NAME]", team: "[TEAM / DOMAIN]", photoPlaceholder: "[PHOTO — MEMBER NAME]" },
  { id: "member-06", placeholderName: "[MEMBER NAME]", team: "[TEAM / DOMAIN]", photoPlaceholder: "[PHOTO — MEMBER NAME]" },
];

// Timeline Journey Data
export const JOURNEY_TIMELINE = [
  {
    year: "PHASE 01",
    tag: "INCEPTION",
    title: "[ADD EVENT / MILESTONE]",
    description: "[ADD DESCRIPTION]",
    photoPlaceholder: "[PHOTO — MILESTONE 01]"
  },
  {
    year: "PHASE 02",
    tag: "EXPANSION",
    title: "[ADD EVENT / MILESTONE]",
    description: "[ADD DESCRIPTION]",
    photoPlaceholder: "[PHOTO — MILESTONE 02]"
  },
  {
    year: "PHASE 03",
    tag: "CONSOLIDATION",
    title: "[ADD EVENT / MILESTONE]",
    description: "[ADD DESCRIPTION]",
    photoPlaceholder: "[PHOTO — MILESTONE 03]"
  },
  {
    year: "PRESENT",
    tag: "CURRENT ERA",
    title: "[ADD CURRENT MILESTONE]",
    description: "[ADD DESCRIPTION]",
    photoPlaceholder: "[PHOTO — PRESENT]"
  }
];

// Events Data
export const EVENTS_DATA = [
  {
    id: "event-01",
    name: "[ADD EVENT NAME]",
    date: "[ADD DATE]",
    description: "[ADD EVENT DESCRIPTION]",
    outcome: "[ADD OUTCOME / IMPACT]",
    leadId: "bhavya-chaudhary",
    photoPlaceholder: "[PHOTO — EVENT NAME]",
  },
  {
    id: "event-02",
    name: "[ADD EVENT NAME]",
    date: "[ADD DATE]",
    description: "[ADD EVENT DESCRIPTION]",
    outcome: "[ADD OUTCOME / IMPACT]",
    leadId: "anvitha-reddy",
    photoPlaceholder: "[PHOTO — EVENT NAME]",
  },
  {
    id: "event-03",
    name: "[ADD EVENT NAME]",
    date: "[ADD DATE]",
    description: "[ADD EVENT DESCRIPTION]",
    outcome: "[ADD OUTCOME / IMPACT]",
    leadId: "deekshit",
    photoPlaceholder: "[PHOTO — EVENT NAME]",
  }
];

// Projects Data
export const PROJECTS_DATA = [
  {
    id: "proj-01",
    title: "[ADD PROJECT]",
    whyCreated: "[ADD PURPOSE / REASON]",
    whatCreated: "[ADD WHAT WAS CREATED]",
    result: "[ADD RESULT]",
    leadId: "deekshit",
    photoPlaceholder: "[PHOTO — PROJECT]",
  },
  {
    id: "proj-02",
    title: "[ADD PROJECT]",
    whyCreated: "[ADD PURPOSE / REASON]",
    whatCreated: "[ADD WHAT WAS CREATED]",
    result: "[ADD RESULT]",
    leadId: "nishta",
    photoPlaceholder: "[PHOTO — PROJECT]",
  }
];

// Memories Archive Data (Real Photos)
export const MEMORIES_DATA = [
  {
    id: "mem-01",
    label: "MEMORY 01",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-01.jpg",
    alt: "GWD Archive Memory 01",
    position: "left"
  },
  {
    id: "mem-02",
    label: "MEMORY 02",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-02.jpg",
    alt: "GWD Archive Memory 02",
    position: "center"
  },
  {
    id: "mem-03",
    label: "MEMORY 03",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-03.jpg",
    alt: "GWD Archive Memory 03",
    position: "right"
  },
  {
    id: "mem-04",
    label: "MEMORY 04",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-04.jpg",
    alt: "GWD Archive Memory 04",
    position: "left"
  },
  {
    id: "mem-05",
    label: "MEMORY 05",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-05.jpg",
    alt: "GWD Archive Memory 05",
    position: "center"
  },
  {
    id: "mem-06",
    label: "MEMORY 06",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-06.jpg",
    alt: "GWD Archive Memory 06",
    position: "right"
  },
  {
    id: "mem-07",
    label: "MEMORY 07",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-07.jpg",
    alt: "GWD Archive Memory 07",
    position: "left"
  },
  {
    id: "mem-08",
    label: "MEMORY 08",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-08.png",
    alt: "GWD Archive Memory 08",
    position: "center"
  },
  {
    id: "mem-09",
    label: "MEMORY 09",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-09.png",
    alt: "GWD Archive Memory 09",
    position: "right"
  }
];

// Achievements Data
export const ACHIEVEMENTS_DATA = [
  { label: "EVENTS EXECUTED", value: "[VERIFIED COUNT]", placeholder: "[ADD VERIFIED STATISTICS]" },
  { label: "MEMBERS & BUILDERS", value: "[VERIFIED COUNT]", placeholder: "[ADD VERIFIED STATISTICS]" },
  { label: "PROJECTS DELIVERED", value: "[VERIFIED COUNT]", placeholder: "[ADD VERIFIED STATISTICS]" },
  { label: "YEARS OF IMPACT", value: "[VERIFIED COUNT]", placeholder: "[ADD VERIFIED STATISTICS]" },
];

// Voices of GWD Quotes (Official Leadership Words)
export const VOICES_OF_GWD = [
  {
    quote: "Provides strategic direction for the club by shaping its vision, encouraging collaboration, and creating opportunities for members to learn and grow. Focuses on building a strong community where students can take ownership, contribute meaningfully, and develop leadership skills while moving the club toward impactful projects and future opportunities.",
    author: "Aldrin Paul",
    position: "President",
    leaderId: "aldrin-paul"
  },
  {
    quote: "Supports the club's vision by turning ideas into structured initiatives and ensuring effective coordination and execution. Encourages practical learning, teamwork, and hands-on experiences while creating an environment where members can experiment, develop their skills, and contribute to continuous growth and innovation.",
    author: "Mohd Ismail",
    position: "Vice President",
    leaderId: "mohd-ismail"
  },
  {
    quote: "Connects technical web design with marketing, communication, media, and digital strategies through practical learning. Encourages collaboration on creative technology projects while helping members develop industry-relevant skills and build strong portfolios that reflect both technical ability and strategic thinking.",
    author: "G. Sravya",
    position: "General Secretary",
    leaderId: "g-sravya"
  }
];

// Stage 1 Content: The Void, The Beginning, Why GWD Exists
export const STAGE_1_DATA = {
  void: {
    superTitle: "GWD CLUB",
    manifestoLine: "EVERY STORY HAS A BEGINNING.",
    callToAction: "SCROLL TO ENTER",
  },
  beginning: {
    title: "THE BEGINNING",
    whatItStandsFor: "GET WORK DONE",
    subtitle: "A SINGLE SPARK IN THE VOID",
    storyParagraphs: [
      "[ADD FOUNDING STORY]"
    ],
    milestones: [
      {
        stage: "PHASE 01",
        label: "ONE POINT",
        detail: "The inception of an idea. A conviction to turn thought into relentless execution."
      },
      {
        stage: "PHASE 02",
        label: "ONE LINE",
        detail: "The first connection formed between passionate minds striving to build something real."
      },
      {
        stage: "PHASE 03",
        label: "A NETWORK",
        detail: "An evolving ecosystem of creators, builders, strategists, and visionaries."
      }
    ]
  },
  why: {
    chapterLabel: "CHAPTER 02 — PURPOSE & ETHOS",
    title: "WHY?",
    centralMessage: [
      "FROM LEARNING TO IMPLEMENTING.",
      "FROM STUDENTS TO BUILDERS."
    ],
    sections: [
      {
        tag: "01 / PURPOSE",
        title: "BRIDGE THE GAP",
        text: "Connect what students learn with real-world technology, projects, and opportunities."
      },
      {
        tag: "02 / VALUES",
        title: "LEARN. BUILD. DELIVER.",
        text: "Learn by doing, take ownership, collaborate, and turn ideas into something real."
      },
      {
        tag: "03 / VISION",
        title: "BUILD THE FUTURE",
        text: "Create a community where students develop the skills, confidence, and mindset to become future technologists, creators, and leaders."
      }
    ],
    evolution: [
      { stage: "01", label: "LEARNING" },
      { stage: "02", label: "IMPLEMENTING" },
      { stage: "03", label: "BUILDING" },
      { stage: "04", label: "FUTURE" }
    ]
  }
};
