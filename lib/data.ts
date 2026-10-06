/**
 * Single source of truth for every piece of copy on the site.
 * Client work stays labelled by capability only — no internal project names.
 */

export const PROFILE = {
  first: "Sala",
  middle: "Tendool",
  last: "Srivatsav",
  full: "Sala Tendool Srivatsav",
  role: "AI/ML & Data Engineer",
  email: "tendoolsrivatsav@gmail.com",
  phones: ["+91 93964 66665", "+91 94916 66665"],
  tels: ["+919396466665", "+919491666665"],
  location: { town: "Bobbili, Vizianagaram", region: "Andhra Pradesh, India" },
  timeZone: "Asia/Kolkata",
  github: "https://github.com/Tendool",
  linkedin: "https://www.linkedin.com/in/sala-tendool-srivatsav/",
};

/** Areas of focus, each tied to the work that backs it up. */
export const FOCUS = [
  {
    title: "Agentic AI & LLM systems",
    impact:
      "Multi-agent and RAG architectures grounded in an organisation’s own documents, so answers come from policy rather than guesswork.",
    flagship: "HR query resolution, adaptive tutoring, multi-agent orchestration",
  },
  {
    title: "Computer vision & robotics",
    impact:
      "Real-time detection on small hardware — a phone camera, a Raspberry Pi, a Jetson Nano — with speech in and out.",
    flagship: "SmartSight, Fire Fighting Robot, Robotic Hand",
  },
  {
    title: "Quantum machine learning",
    impact:
      "Quantum neural networks and variational classifiers benchmarked honestly against classical baselines.",
    flagship: "Multimodal disease prediction",
  },
  {
    title: "Data engineering & big data",
    impact:
      "Distributed HDFS pipelines that process prescription data at scale, and cleaning and analytics tools tested against the real data before any model is allowed near it.",
    flagship: "Prescription validation, BI agent over live board data",
  },
  {
    title: "Applied ML for energy & agriculture",
    impact:
      "Predictive models for green-hydrogen electrolysis cells, and crop-disease identification from field photos.",
    flagship: "SOEC optimisation, AgriX",
  },
  {
    title: "Enterprise systems",
    impact:
      "Graph-based clan clustering that surfaces candidate-to-role fits, and LLM chatbots that agentize CRM workflows end to end.",
    flagship: "Agentic CRM, talent-matching network, recruiter matching app",
  },
];

/**
 * Yitro Global work, as on the resume. Client work is described by what it
 * does — internal product names are left out.
 */
export const TIMELINE = [
  {
    t: "SLM-driven tutoring application",
    d: "Engineered an AI tutoring application driven by a small language model, with an interactive agent avatar delivering real-time explanations, quizzes and hands-on coding feedback — alongside a teacher-facing analytics and classroom-management dashboard.",
  },
  {
    t: "Enterprise talent-matching network",
    d: "Architected a talent-matching network on graph databases and multi-agent orchestration, helping recruiters find the best candidate-to-role fits through clan-based clustering.",
  },
  {
    t: "Agentic CRM platform",
    d: "Built an end-to-end CRM platform and designed LLM-driven chatbots that agentize its workflows, automating lead management and customer interactions.",
  },
  {
    t: "Recruiter–job seeker matching app",
    d: "Developed a recruiter–job seeker matching application that uses graph-based clan clustering to improve candidate discovery and engagement.",
  },
  {
    t: "Multi-agent enterprise retrieval",
    d: "Designed a multi-agent system — a knowledge-based search agent, a data extraction agent and a voice agent — to automate enterprise information retrieval and query resolution.",
  },
];

export const ROLE = {
  org: "Yitro Global",
  title: "AI Intern",
  team: "AI Algorithms for Enterprise Systems",
  span: "Sep 2025 — present",
  mode: "Remote",
  event: "NVIDIA RTX AI PC Day, Jan 2026",
};

export type Category = "agentic" | "data" | "vision" | "healthcare" | "robotics" | "energy" | "quantum";

export type Project = {
  id: string;
  n: string;
  t: string;
  o: string;
  c: Category[];
  conf?: boolean;
  tags: string[];
  b: string[];
};

export const PROJECTS: Project[] = [
  {
    id: "agentic-hr",
    n: "Agentic HR Query Resolution Platform",
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
    id: "smartsight",
    n: "SmartSight: Vision-Based Wearable Interactive Guidance App",
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
    id: "tutoring-agent",
    n: "AI Tutor Agent — SLM-Driven Adaptive Tutoring",
    t: "Feb 2026 — Present",
    o: "Yitro Global",
    c: ["agentic"],
    conf: true,
    tags: ["SLM", "CUDA", "TTS", "RAG"],
    b: [
      "An AI-powered tutoring application driven by a Small Language Model, with an interactive agent avatar delivering real-time explanations, quizzes and hands-on coding feedback, plus a teacher-facing analytics and classroom management dashboard.",
      "Built a self-paced learning agent that dynamically tailors content, pacing and difficulty to each learner’s progress using RAG-grounded content retrieval.",
      "Leveraged CUDA-accelerated inference and Text-to-Speech to deliver low-latency, voice-interactive tutoring sessions.",
    ],
  },
  {
    id: "orchestration",
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
    id: "agentic-crm",
    n: "Agentic CRM Platform",
    t: "Sep 2025 — Present",
    o: "Yitro Global",
    c: ["agentic"],
    conf: true,
    tags: ["LLMs", "Chatbots", "Agentic AI", "CRM"],
    b: [
      "Built an end-to-end CRM platform and designed LLM-driven chatbots to agentize CRM workflows, automating lead management and customer interactions.",
    ],
  },
  {
    id: "talent-network",
    n: "Enterprise Talent-Matching Network",
    t: "Sep 2025 — Present",
    o: "Yitro Global",
    c: ["agentic", "data"],
    conf: true,
    tags: ["Graph DB", "Multi-Agent", "Clustering"],
    b: [
      "Architected an enterprise talent-matching network using graph databases and multi-agent orchestration, enabling recruiters to identify optimal candidate-role fits through clan-based clustering.",
    ],
  },
  {
    id: "recruiter-matching",
    n: "Recruiter–Job Seeker Matching App",
    t: "Sep 2025 — Present",
    o: "Yitro Global",
    c: ["data"],
    conf: true,
    tags: ["Graph DB", "Clustering"],
    b: [
      "Developed a recruiter–job seeker matching application leveraging graph-based clan clustering to improve candidate discovery and engagement.",
    ],
  },
  {
    id: "tara",
    n: "TARA — Fully Local Voice Assistant",
    t: "Sep 2026 — Present",
    o: "Personal",
    c: ["agentic"],
    tags: ["Python", "Ollama", "SLM", "ASR", "TTS"],
    b: [
      "Built an end-to-end voice assistant that runs entirely on-device — wake word detection, speech-to-text, a local language model with tool use, and speech synthesis — with no cloud service anywhere in the loop.",
      "Wired openWakeWord, faster-whisper, a locally served Qwen model and Piper TTS into a single tool-calling loop, verifying each stage round-trip against real microphone input rather than mocking it.",
    ],
  },
  {
    id: "ojas",
    n: "OJAS — Personal Mobile Assistant",
    t: "Sep 2026 — Present",
    o: "Personal",
    c: ["agentic"],
    tags: ["Mobile", "Assistant"],
    b: ["A personal mobile assistant application, currently in active development."],
  },
  {
    id: "bi-agent",
    n: "Business Intelligence Agent over Live Board Data",
    t: "Aug 2026",
    o: "Assessment",
    c: ["agentic", "data"],
    tags: ["Python", "React", "Docker", "LLM Tool Use"],
    b: [
      "Built a conversational agent answering founder-level business questions from two live project-management boards, reconciling a client-code mismatch that turned out to be the real cross-board join key and discarding corrupted rows that would otherwise have silently broken every cross-board metric.",
      "Wrote and unit-tested the cleaning, normalisation and analytics tools against the real data with no model in the loop, so the agent only had to call verified tools correctly and surface their caveats rather than do the arithmetic itself.",
    ],
  },
  {
    id: "portfolio",
    n: "This Portfolio",
    t: "Sep 2026 — Present",
    o: "Personal",
    c: [],
    tags: ["Next.js", "React Three Fiber", "GLSL", "TypeScript"],
    b: [
      "Designed and built this site: an editorial layout whose figures are live WebGL scenes, all drawn through a single shared canvas and shaded by one ordered-dither shader so they print like 1-bit illustrations.",
      "Every figure is lit from wherever the cursor is, and is assembled from primitives in code — there are no model or texture files.",
    ],
  },
  {
    id: "soec",
    n: "ML-Assisted Optimisation of Solid Oxide Electrolysis Cells (Green Hydrogen)",
    t: "Nov 2025 — Present",
    o: "University",
    c: ["energy"],
    tags: ["Machine Learning", "Predictive Modeling", "Energy Systems"],
    b: [
      "Developed predictive ML pipelines and intelligent energy management models to optimise Solid Oxide Electrolysis Cell performance and efficiency for green hydrogen production.",
    ],
  },
  {
    id: "quantum",
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
    id: "hdfs",
    n: "Cloud & HDFS Big Data Analytics — Real-Time Prescription Validation and Drug Interaction Warnings",
    t: "Jun 2025 — Oct 2025",
    o: "University",
    c: ["healthcare", "data"],
    tags: ["AWS", "Machine Learning", "HDFS", "Python"],
    b: [
      "Built a distributed big data pipeline on HDFS to process patient prescription data at scale.",
      "Developed a machine learning-based validation engine that flags unsafe drug combinations in real time for patients managing multiple prescriptions, improving prescription safety.",
    ],
  },
  {
    id: "agrix",
    n: "AI-Powered Farming Management App (AgriX)",
    t: "Dec 2024 — Apr 2025",
    o: "University",
    c: ["energy", "vision"],
    tags: ["Machine Learning", "AWS", "HTML", "Java", "CSS"],
    b: [
      "Developed a machine learning-based crop disease identification tool enabling farmers to diagnose plant health issues from images.",
      "Built a marketplace module for farmers to buy and sell agricultural machinery and equipment, and delivered personalised fertiliser and crop-care recommendations based on real-time crop and soil status.",
    ],
  },
  {
    id: "drug-target",
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
    id: "firebot",
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
    id: "self-driving",
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
    id: "robotic-hand",
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
    id: "network-slicing",
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

export const FILTERS: [Category | "all", string][] = [
  ["all", "All"],
  ["agentic", "Agentic AI"],
  ["data", "Data"],
  ["vision", "Vision"],
  ["healthcare", "Healthcare"],
  ["robotics", "Robotics"],
  ["energy", "Energy & agri"],
  ["quantum", "Quantum"],
];

/** Which drawing each featured project gets. See components/figures/scenes. */
export type FigureKind = "pipeline" | "agents" | "voice" | "steps" | "eye" | "bloch" | "pills";

/**
 * The projects given a full spread. `fact` is the one number or claim a
 * reader should leave with; every fact is lifted from the project's own bullets.
 */
export const FEATURED: {
  id: string;
  title: string;
  context: string;
  span: string;
  summary: string;
  fact: { k: string; v: string };
  figure: FigureKind;
  /** Accessible description of the drawing. */
  label: string;
}[] = [
  {
    id: "agentic-hr",
    title: "Agentic HR query resolution",
    context: "Yitro Global · client work",
    span: "2026 — now",
    summary:
      "Three cooperating agents — data extraction, knowledge search and voice analytics — answer employees’ HR questions, grounded in the company’s own policy documents through fine-tuning and retrieval-augmented generation.",
    fact: { k: "3 agents", v: "one shared, policy-grounded knowledge base" },
    figure: "agents",
    label: "An orchestrator, three agents, and the policy documents they search.",
  },
  {
    id: "tara",
    title: "TARA, a voice assistant that never phones home",
    context: "Personal",
    span: "2026 — now",
    summary:
      "Wake word, speech-to-text, a local language model that can call tools, and speech synthesis — openWakeWord, faster-whisper, Qwen and Piper wired into one loop that runs entirely on the machine in front of you.",
    fact: { k: "0", v: "cloud services anywhere in the loop" },
    figure: "voice",
    label: "Speech, drawn as a ring of levels around a local model.",
  },
  {
    id: "tutoring-agent",
    title: "SLM-driven adaptive tutoring agent",
    context: "Yitro Global · client work",
    span: "2026 — now",
    summary:
      "A self-paced learning agent that tailors what it teaches, how fast and how hard to each learner’s progress, grounded with retrieval-augmented generation — and talks the lesson through, using CUDA-accelerated inference and text-to-speech to keep the voice low-latency.",
    fact: { k: "3", v: "things it adapts per learner: content, pacing and difficulty" },
    figure: "steps",
    label: "A staircase whose steps resize to suit whoever is climbing it.",
  },
  {
    id: "smartsight",
    title: "SmartSight, guidance from a phone camera",
    context: "University",
    span: "2025 — now",
    summary:
      "A navigation assistant for visually impaired users: real-time obstacle detection and spoken, hands-free guidance, using object detection and speech recognition on the phone they already carry.",
    fact: { k: "1 camera", v: "the phone’s own — no external hardware" },
    figure: "eye",
    label: "An eye that tracks your cursor. SmartSight does the same for obstacles.",
  },
  {
    id: "quantum",
    title: "Quantum ML for multimodal disease prediction",
    context: "University",
    span: "2025",
    summary:
      "Quantum neural networks, variational quantum classifiers and hybrid classical–quantum models built in Qiskit and TensorFlow, then measured against the classical models a clinician would actually reach for.",
    fact: { k: "~87%", v: "accuracy, with better recall than RF, SVM and MLP" },
    figure: "bloch",
    label: "A Bloch sphere: the state of one qubit, precessing.",
  },
  {
    id: "hdfs",
    title: "Prescription validation on HDFS",
    context: "University",
    span: "2025",
    summary:
      "A distributed big-data pipeline on HDFS that processes patient prescription data at scale, feeding a machine-learning validation engine that warns patients on several prescriptions about unsafe drug combinations.",
    fact: { k: "Real-time", v: "flags for unsafe drug combinations" },
    figure: "pills",
    label: "Two prescriptions that should never meet, flagged the moment they do.",
  },
];

export type SkillTier = "core" | "prof" | "work";

export const ARSENAL: { g: string; i: [string, SkillTier][] }[] = [
  {
    g: "Languages & frameworks",
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
    g: "LLMs & agents",
    i: [
      ["LLMs", "core"],
      ["Agentic AI", "core"],
      ["RAG", "core"],
      ["Multi-agent systems", "core"],
      ["Fine-tuning", "core"],
      ["Prompt engineering", "prof"],
      ["Small language models", "prof"],
      ["Text-to-speech", "prof"],
      ["Speech recognition", "prof"],
    ],
  },
  {
    g: "ML & DL",
    i: [
      ["Deep learning", "core"],
      ["Machine learning", "core"],
      ["NLP", "prof"],
      ["Transformers", "prof"],
      ["Generative AI", "prof"],
      ["Data analytics", "prof"],
      ["Optimisation", "prof"],
      ["Reinforcement learning", "work"],
      ["Quantum ML", "work"],
    ],
  },
  {
    g: "Data engineering & cloud",
    i: [
      ["AWS", "prof"],
      ["HDFS", "prof"],
      ["Hadoop", "work"],
      ["DBMS", "work"],
      ["E2E Networks", "work"],
    ],
  },
  {
    g: "Hardware & robotics",
    i: [
      ["Jetson Nano", "prof"],
      ["Raspberry Pi", "prof"],
      ["Arduino", "work"],
      ["ROS", "work"],
    ],
  },
  {
    g: "Engineering practice",
    i: [
      ["Git & GitHub", "core"],
      ["CI/CD pipelines", "prof"],
      ["Data structures & algorithms", "prof"],
      ["OOP", "prof"],
      ["DevOps", "work"],
    ],
  },
];

export const TIERS: Record<SkillTier, { label: string; level: number }> = {
  core: { label: "Daily driver", level: 3 },
  prof: { label: "Proficient", level: 2 },
  work: { label: "Working knowledge", level: 1 },
};

/**
 * Project photographs. Drop a file into /public/assets/projects using the
 * exact `f` name and it appears on the page — entries without a file are left
 * out entirely. Client work is labelled by capability only.
 */
export const GALLERY = [
  { f: "agentic-hr-01.jpg", tag: "Agentic HR system", cap: "Multi-agent HR query resolution — agent routing view" },
  { f: "smartsight-01.jpg", tag: "SmartSight", cap: "Wearable navigation aid — live obstacle detection" },
  { f: "tutoring-agent-01.jpg", tag: "Tutoring agent", cap: "SLM tutor with agent avatar and TTS playback" },
  { f: "multi-agent-01.jpg", tag: "Agent orchestration", cap: "Knowledge, extraction and voice agents in orchestration" },
  { f: "firebot-01.jpg", tag: "Fire Fighting Robot", cap: "Autonomous fire-seeking rover with pump assembly" },
  { f: "robotic-hand-01.jpg", tag: "Robotic hand", cap: "Gesture-mimicking robotic hand on Raspberry Pi" },
  { f: "selfdriving-01.jpg", tag: "Self-driving car", cap: "Lane detection and text recognition test run" },
  { f: "quantum-01.jpg", tag: "Quantum ML", cap: "QNN / VQC circuits — ~87% multimodal accuracy" },
  { f: "soec-01.jpg", tag: "SOEC hydrogen", cap: "Electrolysis cell optimisation — predictive pipeline" },
  { f: "agrix-01.jpg", tag: "AgriX", cap: "Crop disease identification from field imagery" },
  { f: "hdfs-01.jpg", tag: "Prescription validation", cap: "HDFS pipeline flagging unsafe drug interactions" },
  { f: "drug-target-01.jpg", tag: "Drug target ID", cap: "Bioinformatics feature engineering results" },
];

export const EDU = [
  {
    y: "2027",
    s: "ASE, Coimbatore",
    d: "B.Tech, Artificial Intelligence & Data Science",
    m: "CGPA 6.89 / 10",
    live: true,
  },
  {
    y: "2023",
    s: "Sri Viswa Junior College",
    d: "Class XII, MPC — Board of Intermediate Education, AP · Visakhapatnam",
    m: "93%",
  },
  {
    y: "2021",
    s: "Swetha Chalapathi Samasthanam EM High School",
    d: "Class X — Board of Secondary Education, AP, Bobbili",
    m: "97.6%",
  },
];

export const NAV = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "index", label: "Index" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Nov 2025 — Present" → 2025.83, for sorting the index newest-first. */
export function startOf(t: string): number {
  const [mon, year] = t.split("—")[0].trim().split(/\s+/);
  return Number(year) + MONTHS.indexOf(mon) / 12;
}
