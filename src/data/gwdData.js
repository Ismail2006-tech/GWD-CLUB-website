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

// Events Data — Recovered Archives
export const EVENTS_DATA = [
  {
    id: "event-01",
    dossierLabel: "DOSSIER 01",
    name: "ONE DAY. ONE ROOM. THIRTY STUDIOS.",
    date: "[ADD VERIFIED DATE]",
    subtitle: "NOT A LECTURE. A BUILD.",
    overview: "A one-day build experience at VJIT where 160 students formed 30 teams and built immersive 3D websites before the day ended.",
    keyMetrics: [
      "160 PARTICIPANTS",
      "30 TEAMS",
      "27 IMMERSIVE 3D WEBSITES SHIPPED"
    ],
    format: "NOT A LECTURE. A BUILD.",
    hostedBy: "The Directors of GWD Global Pvt Ltd",
    associations: [
      "Department of CSE (AI & ML)",
      "ACM Student Chapter",
      "In association with IIIC — VJIT"
    ],
    builtWith: [
      "Google Antigravity",
      "Google Stitch",
      "Claude Opus 5",
      "Higgsfield MCP",
      "GWD Skill Library"
    ],
    closingQuote: "“The tools are free. The skill is not. Now they have both.”",
    photos: [
      "/photos/event-01-01.jpg",
      "/photos/event-01-02.png",
      "/photos/event-01-03.png",
      "/photos/event-01-04.jpg"
    ]
  },
  {
    id: "event-02",
    dossierLabel: "DOSSIER 02",
    name: "GWD CLUB — INTRODUCTION & ORIENTATION",
    date: "[ADD VERIFIED DATE]",
    subtitle: "ORIENTATION DAY",
    overview: "An orientation session introducing GWD Club to the college community, its purpose, activities, and opportunities for students to get involved.",
    focus: [
      "INTRODUCING GWD",
      "BUILDING AWARENESS",
      "CONNECTING WITH STUDENTS"
    ],
    photos: [
      "/photos/event-02-01.png",
      "/photos/event-02-02.png"
    ]
  },
  {
    id: "event-03",
    dossierLabel: "DOSSIER 03",
    name: "GWD CORE TEAM",
    date: "[ADD VERIFIED DATE]",
    subtitle: "CORE TEAM MEMBER",
    overview: "A new milestone in the GWD journey, welcoming a new Core Team Member to the GWD (Get Work Done) team.",
    milestone: "CORE TEAM MEMBER",
    milestoneDescription: "An opportunity to work closely with the team, take responsibility, share ideas, contribute, learn through challenges, and grow.",
    themes: [
      "LEARNING",
      "COLLABORATION",
      "RESPONSIBILITY",
      "CONTRIBUTION",
      "GROWTH"
    ],
    closingQuote: "PROUD TO BE A PART OF GWD.\nLET'S GET WORK DONE!",
    photos: []
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
    photo: "/photos/memory-03.jpg",
    alt: "GWD Archive Memory 01",
    position: "left"
  },
  {
    id: "mem-02",
    label: "MEMORY 02",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-05.jpg",
    alt: "GWD Archive Memory 02",
    position: "right"
  },
  {
    id: "mem-03",
    label: "MEMORY 03",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-06.jpg",
    alt: "GWD Archive Memory 03",
    position: "left"
  },
  {
    id: "mem-04",
    label: "MEMORY 04",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-07.jpg",
    alt: "GWD Archive Memory 04",
    position: "right"
  },
  {
    id: "mem-05",
    label: "MEMORY 05",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-08.png",
    alt: "GWD Archive Memory 05",
    position: "left"
  },
  {
    id: "mem-06",
    label: "MEMORY 06",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-09.png",
    alt: "GWD Archive Memory 06",
    position: "right"
  },
  {
    id: "mem-07",
    label: "MEMORY 07",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-10.jpg",
    alt: "GWD Archive Memory 07",
    position: "left"
  },
  {
    id: "mem-08",
    label: "MEMORY 08",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-11.png",
    alt: "GWD Archive Memory 08",
    position: "right"
  },
  {
    id: "mem-09",
    label: "MEMORY 09",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-12.jpg",
    alt: "GWD Archive Memory 09",
    position: "left"
  },
  {
    id: "mem-10",
    label: "MEMORY 10",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-13.jpg",
    alt: "GWD Archive Memory 10",
    position: "right"
  },
  {
    id: "mem-11",
    label: "MEMORY 11",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-14.jpg",
    alt: "GWD Archive Memory 11",
    position: "left"
  },
  {
    id: "mem-12",
    label: "MEMORY 12",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-15.png",
    alt: "GWD Archive Memory 12",
    position: "right"
  },
  {
    id: "mem-13",
    label: "MEMORY 13",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-16.jpg",
    alt: "GWD Archive Memory 13",
    position: "left"
  },
  {
    id: "mem-14",
    label: "MEMORY 14",
    sub: "GWD / ARCHIVE",
    photo: "/photos/memory-17.jpg",
    alt: "GWD Archive Memory 14",
    position: "right"
  }
];

// Achievements Data — Structured Dossiers with multi-photo support
export const ACHIEVEMENTS_DATA = [
  {
    id: "ach-01",
    dossierLabel: "DOSSIER 01",
    date: "01 MARCH 2025",
    subtitle: "2ND PLACE",
    title: "CONTRIVE 2K25",
    blocks: [
      {
        label: "01 / ACHIEVEMENT OVERVIEW",
        text: "Contrive 2K25 brought together student teams to showcase their ideas and projects in a competitive environment. The UniMarket team participated in the event and earned 2nd Place, marking an important achievement for the team and GWD.",
        isAccent: false
      },
      {
        label: "02 / RESULT",
        text: "🥈 2nd Place",
        isAccent: false
      },
      {
        label: "03 / TEAM / PROJECT",
        text: "UniMarket",
        isAccent: true
      }
    ],
    photos: [
      "/photos/achievement-01-01.png",
      "/photos/achievement-01-02.jpg",
      "/photos/achievement-01-03.jpg",
      "/photos/achievement-01-04.png",
      "/photos/achievement-01-05.jpg"
    ]
  },
  {
    id: "ach-02",
    dossierLabel: "DOSSIER 02",
    date: "EUREKA! 2024",
    subtitle: "TOP 3 — PITCHQUEST",
    title: "EUREKA! 2024",
    blocks: [
      {
        label: "01 / ACHIEVEMENT OVERVIEW",
        text: "Eureka! 2024 featured PitchQuest, where the GWD team presented its business idea, “GWD: Get Work Done.” The team secured a position in the Top 3 and advanced to the zonal round in Bangalore.",
        isAccent: false
      },
      {
        label: "02 / POSITION / RESULT",
        text: "🏆 TOP 3 — PITCHQUEST",
        isAccent: false
      },
      {
        label: "03 / EVENT",
        text: "Eureka! 2024",
        isAccent: false
      },
      {
        label: "04 / BUSINESS IDEA",
        text: "GWD: Get Work Done",
        isAccent: false
      },
      {
        label: "05 / NEXT STAGE",
        text: "Advanced to the Zonal Round — Bangalore",
        isAccent: true
      }
    ],
    photos: [
      "/photos/achievement-02-01.jpg"
    ]
  }
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
