/**
 * Single source of truth for every piece of copy on the site.
 * Content is carried over verbatim from the v1 portfolio — client work stays
 * labelled by capability only, with no internal project names.
 */

export const PROFILE = {
  first: "SALA",
  middle: "TENDOOL",
  last: "SRIVATSAV",
  full: "Sala Tendool Srivatsav",
  role: "AI/ML Engineer — Agentic Systems & Applied Deep Learning",
  status: "Available for AI/ML roles · 2027",
  badge: "AI Intern · Yitro Global",
  email: "tendoolsrivatsav@gmail.com",
  phones: ["+91 93964 66665", "+91 94916 66665"],
  tels: ["+919396466665", "+919491666665"],
  location: ["Bobbili, Vizianagaram", "Andhra Pradesh, India"],
  github: "https://github.com/Tendool",
  linkedin: "https://www.linkedin.com/in/sala-tendool-srivatsav/",
  stats: [
    { v: "13", l: "Projects Shipped" },
    { v: "6", l: "Domains" },
  ],
};

export type RosterEntry = {
  code: string;
  spec: string;
  tags: string[];
  impact: string;
  flag: string;
  glyph: string;
};

export const ROSTER: RosterEntry[] = [
  {
    code: "Agent Commander",
    spec: "Agentic AI & LLM Systems",
    tags: ["RAG", "Fine-Tuning", "Multi-Agent", "Python"],
    impact:
      "Multi-agent + RAG architecture grounded in company HR policy data, reducing manual ticket resolution time.",
    flag: "Agentic HR resolution, adaptive tutoring & multi-agent orchestration systems (client work)",
    glyph:
      '<circle cx="12" cy="12" r="2.6"/><circle cx="4.5" cy="5.5" r="1.9"/><circle cx="19.5" cy="5.5" r="1.9"/><circle cx="4.5" cy="18.5" r="1.9"/><circle cx="19.5" cy="18.5" r="1.9"/><path d="M12 9.4V7.4M13.9 10.4l3.9-3.2M10.1 10.4L6.2 7.2M13.9 13.6l3.9 3.2M10.1 13.6l-3.9 3.2"/>',
  },
  {
    code: "Vision Specialist",
    spec: "Computer Vision & Robotics",
    tags: ["OpenCV", "ASR", "Jetson Nano", "Deep Learning"],
    impact:
      "Real-time obstacle detection and voice guidance from a phone camera alone — no external hardware.",
    flag: "SmartSight · Fire Fighting Robot · Robotic Hand",
    glyph:
      '<path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
  },
  {
    code: "Quantum Strategist",
    spec: "Quantum Machine Learning",
    tags: ["Qiskit", "QNN", "VQC", "TensorFlow"],
    impact:
      "~87% prediction accuracy with improved recall and sensitivity vs. Random Forest, SVM and MLP baselines.",
    flag: "Quantum ML for Multimodal Disease Prediction",
    glyph:
      '<ellipse cx="12" cy="12" rx="9.5" ry="3.6"/><ellipse cx="12" cy="12" rx="9.5" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.6" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  },
  {
    code: "Data Sentinel",
    spec: "Big Data & Cloud Systems",
    tags: ["AWS", "HDFS", "Hadoop", "Spark"],
    impact:
      "Distributed HDFS pipeline processing prescription data at scale, flagging unsafe drug combinations in real time.",
    flag: "Real-Time Prescription Validation & Drug Interaction Warnings",
    glyph:
      '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  },
  {
    code: "Sustainability Engineer",
    spec: "Applied ML — Energy & Agriculture",
    tags: ["Predictive ML", "Energy Systems", "AWS"],
    impact:
      "Predictive pipelines and intelligent energy management optimising green hydrogen cell efficiency.",
    flag: "SOEC Green Hydrogen Optimisation · AgriX Farming App",
    glyph:
      '<path d="M12 2.5c3.4 4.6 5.6 7.9 5.6 11a5.6 5.6 0 11-11.2 0c0-3.1 2.2-6.4 5.6-11z"/><path d="M12 21.5v-4.5"/>',
  },
  {
    code: "Enterprise Architect",
    spec: "CRM & Talent-Matching Systems",
    tags: ["Graph DB", "Multi-Agent", "LLM Chatbots"],
    impact:
      "Graph-based clan clustering surfacing optimal candidate-role fits for recruiters.",
    flag: "Yitro Global — Talent Network · End-to-End CRM",
    glyph:
      '<rect x="9" y="2.5" width="6" height="5.5" rx="1"/><rect x="2.5" y="16" width="6" height="5.5" rx="1"/><rect x="15.5" y="16" width="6" height="5.5" rx="1"/><path d="M12 8v4M5.5 16v-2.5h13V16"/>',
  },
];

/**
 * Skill-based summaries of Yitro Global work — deliberately generic:
 * no product/project names, per client confidentiality.
 */
export const TIMELINE = [
  {
    t: "Small Language Models & Real-Time Voice Agents",
    d: "Worked hands-on with Small Language Model (SLM) deployment for real-time, low-latency interaction — including agent-driven conversational interfaces, dynamic content generation, and Text-to-Speech integration.",
  },
  {
    t: "Graph Databases for Multi-Agent Systems",
    d: "Applied graph database design to power multi-agent architectures, structuring relationship-rich data for agent-based retrieval and matching use cases.",
  },
  {
    t: "LLM-Driven Conversational Automation",
    d: "Built LLM-powered chatbots to automate workflows within enterprise platforms, translating conversational input into structured actions and data updates.",
  },
  {
    t: "Graph-Based Matching & Clustering",
    d: "Designed clustering-based matching logic over graph-structured data to surface relevant connections between entities at scale.",
  },
  {
    t: "Multi-Agent Orchestration for Enterprise Retrieval",
    d: "Composed multi-agent pipelines — combining knowledge retrieval, structured data extraction, and voice-based interaction agents — to automate enterprise information workflows.",
  },
];

export const ROLE = {
  org: "Yitro Global",
  title: "AI Intern · AI Algorithms for Enterprise Systems",
  span: "Sep 2025 — Present",
  mode: "Remote",
  event: { label: "Event Log", detail: "NVIDIA RTX AI PC Day · Jan 2026" },
};

export type Project = {
  n: string;
  t: string;
  o: string;
  c: string[];
  conf?: boolean;
  tags: string[];
  b: string[];
};

export const PROJECTS: Project[] = [
  {
    n: "Agentic HR Query Resolution System",
    t: "Jan 2026 — Present",
    o: "Yitro Global",
    c: ["agentic"],
    conf: true,
    tags: ["LLMs", "Fine-Tuning", "RAG", "Python"],
    b: [
      "Designed a multi-agent architecture combining a data extraction agent, a knowledge-based search agent for automated HR query clarification, and a voice analytics agent for conversational insight generation.",
      "Applied LLM fine-tuning and Retrieval-Augmented Generation to ground responses in company-specific HR policy data, improving answer accuracy and reducing manual HR ticket resolution time.",
    ],
  },
  {
    n: "SmartSight: Vision-Based Wearable Guidance App",
    t: "Nov 2025 — Present",
    o: "University",
    c: ["vision"],
    tags: ["Deep Learning", "Android Studio", "OpenCV", "ASR", "Jetson Nano"],
    b: [
      "Built a smartphone-based navigation assistant for visually impaired users, delivering real-time obstacle detection and interactive voice guidance using only the device’s built-in camera — no external hardware required.",
      "Integrated deep learning-based object detection with Automatic Speech Recognition to create a hands-free, voice-interactive navigation experience.",
    ],
  },
  {
    n: "SLM-Driven Adaptive Tutoring Agent",
    t: "Feb 2026 — Present",
    o: "Yitro Global",
    c: ["agentic"],
    conf: true,
    tags: ["SLM", "CUDA", "TTS", "RAG"],
    b: [
      "Built a self-paced learning agent that dynamically tailors content, pacing and difficulty to each learner’s progress using RAG-grounded content retrieval.",
      "Leveraged CUDA-accelerated inference and Text-to-Speech to deliver low-latency, voice-interactive tutoring sessions.",
    ],
  },
  {
    n: "Multi-Agent Orchestration Platform",
    t: "Dec 2025 — Feb 2026",
    o: "Yitro Global",
    c: ["agentic"],
    conf: true,
    tags: ["Python", "CUDA", "RAG", "LLMs", "SLMs"],
    b: [
      "Built a multi-agent orchestration platform combining LLMs, SLMs and local models for enterprise agentic workflows.",
    ],
  },
  {
    n: "ML-Assisted Optimisation of Solid Oxide Electrolysis Cells",
    t: "Nov 2025 — Present",
    o: "University",
    c: ["energy"],
    tags: ["Machine Learning", "Predictive Modeling", "Energy Systems"],
    b: [
      "Developed predictive ML pipelines and intelligent energy management models to optimise Solid Oxide Electrolysis Cell performance and efficiency for green hydrogen production.",
    ],
  },
  {
    n: "Quantum ML for Multimodal Disease Prediction",
    t: "Jun 2025 — Oct 2025",
    o: "University",
    c: ["quantum", "healthcare"],
    tags: ["Qiskit", "TensorFlow", "QNN", "VQC"],
    b: [
      "Built Quantum Neural Network, Variational Quantum Classifier and hybrid classical-quantum models using Qiskit and TensorFlow.",
      "Achieved ~87% prediction accuracy with improved recall and sensitivity versus classical baselines (Random Forest, SVM, MLP).",
    ],
  },
  {
    n: "Cloud & HDFS Big Data Analytics — Prescription Validation",
    t: "Jun 2025 — Oct 2025",
    o: "University",
    c: ["healthcare"],
    tags: ["AWS", "Machine Learning", "HDFS", "Python"],
    b: [
      "Built a distributed big data pipeline on HDFS to process patient prescription data at scale.",
      "Developed a machine learning-based validation engine that flags unsafe drug combinations in real time for patients managing multiple prescriptions, improving prescription safety.",
    ],
  },
  {
    n: "AI-Powered Farming Management App (AgriX)",
    t: "Dec 2024 — Apr 2025",
    o: "University",
    c: ["energy", "vision"],
    tags: ["Machine Learning", "AWS", "HTML", "Java", "CSS"],
    b: [
      "Developed a machine learning-based crop disease identification tool enabling farmers to diagnose plant health issues from images.",
      "Built a marketplace module for agricultural machinery, and delivered personalised fertiliser and crop-care recommendations based on real-time crop and soil status.",
    ],
  },
  {
    n: "Drug Target Identification using AI",
    t: "Aug 2023 — Feb 2024",
    o: "University",
    c: ["healthcare"],
    tags: ["TensorFlow", "Scikit-learn"],
    b: [
      "Developed ML/DL predictive models using TensorFlow and scikit-learn on bioinformatics datasets, improving model accuracy through domain-specific feature engineering.",
    ],
  },
  {
    n: "Fire Fighting Robot",
    t: "Nov 2023 — Oct 2024",
    o: "University",
    c: ["robotics"],
    tags: ["Deep Learning", "Raspberry Pi", "OpenCV", "Arduino", "Sensors"],
    b: [
      "Designed an autonomous robot capable of navigating unpredictable surfaces to detect and reach fire sources.",
      "Integrated sensor-driven fire detection with an automated water-pump extinguishing mechanism to suppress fires without human intervention.",
    ],
  },
  {
    n: "Self-Driving Car — Lane Detection & Text Recognition",
    t: "Jun 2024 — Nov 2024",
    o: "University",
    c: ["robotics", "vision"],
    tags: ["Raspberry Pi", "Deep Learning", "Flask"],
    b: [
      "Built a lane detection and text recognition system on Raspberry Pi with a deep learning pipeline and Flask interface.",
    ],
  },
  {
    n: "Robotic Hand Mimicking User Hand Gestures",
    t: "Jun 2025 — Oct 2025",
    o: "University",
    c: ["robotics", "vision"],
    tags: ["Deep Learning", "OpenCV", "Robotics", "Raspberry Pi", "Python"],
    b: [
      "Developed a robotic hand that mimics user hand gestures in real time using deep learning and OpenCV on Raspberry Pi.",
    ],
  },
  {
    n: "Adaptive Traffic Management via Network Slicing",
    t: "Jun 2024 — Nov 2024",
    o: "University",
    c: [],
    tags: ["Deep Learning", "RNN"],
    b: [
      "Built deep learning-enabled network slicing using RNNs for adaptive traffic management in next-generation networks.",
    ],
  },
];

export const FILTERS: [string, string][] = [
  ["all", "All"],
  ["agentic", "Agentic AI"],
  ["vision", "Computer Vision"],
  ["healthcare", "Healthcare"],
  ["robotics", "Robotics"],
  ["energy", "Energy"],
  ["quantum", "Quantum"],
];

export type SkillTier = "core" | "prof" | "work";

export const ARSENAL: { g: string; i: [string, SkillTier][] }[] = [
  {
    g: "Languages & Frameworks",
    i: [
      ["Python", "core"],
      ["PyTorch", "core"],
      ["TensorFlow", "core"],
      ["CUDA", "core"],
      ["Keras", "prof"],
      ["Scikit-learn", "prof"],
      ["Matplotlib", "prof"],
      ["C", "work"],
      ["Java", "work"],
      ["MATLAB", "work"],
      ["Spark", "work"],
      ["Scala", "work"],
    ],
  },
  {
    g: "LLM & Agentic AI",
    i: [
      ["RAG", "core"],
      ["Multi-Agent Systems", "core"],
      ["Fine-Tuning", "core"],
      ["Prompt Engineering", "prof"],
      ["SLM", "prof"],
      ["TTS", "prof"],
      ["ASR", "prof"],
    ],
  },
  {
    g: "ML / DL Domains",
    i: [
      ["Deep Learning", "core"],
      ["Machine Learning", "core"],
      ["NLP", "prof"],
      ["Transformers", "prof"],
      ["Generative AI", "prof"],
      ["Data Analytics", "prof"],
      ["Optimization", "prof"],
      ["Reinforcement Learning", "work"],
      ["Quantum ML", "work"],
    ],
  },
  {
    g: "Cloud & Big Data",
    i: [
      ["AWS", "prof"],
      ["HDFS", "prof"],
      ["Hadoop", "work"],
      ["DBMS", "work"],
      ["E2E Networks", "work"],
    ],
  },
  {
    g: "Hardware & Robotics",
    i: [
      ["Jetson Nano", "prof"],
      ["Raspberry Pi", "prof"],
      ["Arduino", "work"],
      ["ROS", "work"],
    ],
  },
  {
    g: "Engineering Practice",
    i: [
      ["Git / GitHub", "core"],
      ["CI/CD Pipelines", "prof"],
      ["DSA", "prof"],
      ["OOP", "prof"],
      ["DevOps", "work"],
    ],
  },
];

/** Flat list of everything in the arsenal, used to seed the 3D orbit. */
export const ORBIT_NODES: { name: string; tier: SkillTier; group: string }[] =
  ARSENAL.flatMap((a) =>
    a.i.map(([name, tier]) => ({ name, tier, group: a.g })),
  );

/**
 * ALBUM — drop a file into /public/assets/projects using the exact `f:` name
 * and the feed fills itself in. A missing file degrades to a NO SIGNAL panel.
 * Client work is labelled by capability only — no internal project names.
 */
export const GALLERY = [
  {
    f: "agentic-hr-01.jpg",
    cat: "agentic",
    tag: "Agentic HR System",
    cap: "Multi-agent HR query resolution — agent routing view",
  },
  {
    f: "smartsight-01.jpg",
    cat: "vision",
    tag: "SmartSight",
    cap: "Wearable navigation aid — live obstacle detection",
  },
  {
    f: "tutoring-agent-01.jpg",
    cat: "agentic",
    tag: "Tutoring Agent",
    cap: "SLM tutor with agent avatar and TTS playback",
  },
  {
    f: "multi-agent-01.jpg",
    cat: "agentic",
    tag: "Agent Orchestration",
    cap: "Knowledge, extraction and voice agents in orchestration",
  },
  {
    f: "firebot-01.jpg",
    cat: "robotics",
    tag: "Fire Fighting Robot",
    cap: "Autonomous fire-seeking rover with pump assembly",
  },
  {
    f: "robotic-hand-01.jpg",
    cat: "robotics",
    tag: "Robotic Hand",
    cap: "Gesture-mimicking robotic hand on Raspberry Pi",
  },
  {
    f: "selfdriving-01.jpg",
    cat: "robotics",
    tag: "Self-Driving Car",
    cap: "Lane detection and text recognition test run",
  },
  {
    f: "quantum-01.jpg",
    cat: "quantum",
    tag: "Quantum ML",
    cap: "QNN / VQC circuits — ~87% multimodal accuracy",
  },
  {
    f: "soec-01.jpg",
    cat: "energy",
    tag: "SOEC Hydrogen",
    cap: "Electrolysis cell optimisation — predictive pipeline",
  },
  {
    f: "agrix-01.jpg",
    cat: "energy",
    tag: "AgriX",
    cap: "Crop disease identification from field imagery",
  },
  {
    f: "hdfs-01.jpg",
    cat: "healthcare",
    tag: "Prescription Validation",
    cap: "HDFS pipeline flagging unsafe drug interactions",
  },
  {
    f: "drug-target-01.jpg",
    cat: "healthcare",
    tag: "Drug Target ID",
    cap: "Bioinformatics feature engineering results",
  },
];

export const GAL_FILTERS: [string, string][] = [
  ["all", "All"],
  ["agentic", "Agentic AI"],
  ["vision", "Vision"],
  ["robotics", "Robotics"],
  ["healthcare", "Healthcare"],
  ["energy", "Energy"],
  ["quantum", "Quantum"],
];

export const EDU = [
  {
    y: "2027",
    s: "ASE, Coimbatore",
    d: "B.Tech · Artificial Intelligence and Data Science",
    m: "CGPA 6.89 / 10",
    live: true,
  },
  {
    y: "2023",
    s: "Sri Viswa Junior College",
    d: "Class XII · MPC · Board of Intermediate Education, AP",
    m: "93%",
  },
  {
    y: "2021",
    s: "Swetha Chalapathi Samasthanam EM HS",
    d: "Class X · Board of Secondary Education, AP · Bobbili",
    m: "97.6%",
  },
];

export const NAV = [
  { id: "hero", label: "Home" },
  { id: "roster", label: "Roster" },
  { id: "missions", label: "Mission Log" },
  { id: "files", label: "Mission Files" },
  { id: "gallery", label: "Album" },
  { id: "arsenal", label: "Arsenal" },
  { id: "origin", label: "Origin" },
];
