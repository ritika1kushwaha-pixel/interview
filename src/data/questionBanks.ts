import { DomainMeta, QuestionHintSTAR } from '../types/interview';

export interface PrebuiltQuestion {
  questionText: string;
  category: string;
  difficulty: 'Friendly' | 'Standard' | 'Challenging' | 'Brutal FAANG';
  seniority: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead / Staff' | 'Executive';
  type: string;
  hintSTAR: QuestionHintSTAR;
  modelAnswer: string;
}

export const DOMAINS: DomainMeta[] = [
  {
    id: 'tech',
    name: 'Software & Cloud Engineering',
    badge: 'High Demand',
    description: 'Frontend, Backend, Distributed Systems, Cloud Architecture, and DevOps.',
    icon: 'Code2',
    roles: [
      'Full Stack Engineer',
      'Frontend Architect',
      'Backend & API Engineer',
      'Distributed Systems Engineer',
      'DevOps & Site Reliability Engineer',
      'Mobile iOS/Android Engineer',
    ],
    exampleQuestions: [
      'Explain how you would design a scalable rate limiter.',
      'How do you manage state consistency across distributed microservices?',
      'Describe a production outage you debugged under high pressure.',
    ],
  },
  {
    id: 'data-ai',
    name: 'AI, ML & Data Science',
    badge: 'Trending',
    description: 'Machine Learning, LLMs & GenAI, Data Pipelines, MLOps, and Analytics.',
    icon: 'BrainCircuit',
    roles: [
      'Machine Learning Engineer',
      'GenAI & LLM Application Engineer',
      'Data Scientist',
      'Data Platform Engineer',
      'AI Research Scientist',
    ],
    exampleQuestions: [
      'How do you prevent hallucinations and ensure low-latency in RAG architectures?',
      'Walk me through training vs inference bottlenecks for large transformer models.',
      'How would you detect data drift and model degradation in production?',
    ],
  },
  {
    id: 'product',
    name: 'Product Management',
    badge: 'Strategic',
    description: 'Product sense, execution, metrics tradeoffs, roadmap prioritization, and UX.',
    icon: 'Briefcase',
    roles: [
      'Technical Product Manager',
      'Growth Product Manager',
      'Principal Product Lead',
      'Group Product Manager (GPM)',
      'Product Operations Lead',
    ],
    exampleQuestions: [
      'How would you improve Google Maps for daily commuters?',
      'Your flagship feature caused an 8% drop in DAU but a 15% increase in revenue. How do you decide next steps?',
      'Tell me about a time you killed a high-profile feature despite stakeholder opposition.',
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Banking',
    badge: 'Analytical',
    description: 'Investment banking, financial modeling, valuation, equity research, and risk.',
    icon: 'TrendingUp',
    roles: [
      'Investment Banking Analyst/Associate',
      'Corporate Financial Analyst (FP&A)',
      'Private Equity Associate',
      'Risk & Quantitative Analyst',
      'Portfolio Manager',
    ],
    exampleQuestions: [
      'Walk me through how a $10 increase in depreciation cascades through the 3 financial statements.',
      'How would you value a high-growth SaaS business with negative EBITDA?',
      'Describe your methodology for stress-testing credit portfolios against interest rate shocks.',
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Growth',
    badge: 'Creative & Data',
    description: 'Performance marketing, CAC/LTV optimization, brand strategy, and product marketing.',
    icon: 'Megaphone',
    roles: [
      'Head of Growth',
      'Product Marketing Manager (PMM)',
      'Performance Marketing Lead',
      'Brand & Content Strategist',
      'Lifecycle & CRM Lead',
    ],
    exampleQuestions: [
      'Your Customer Acquisition Cost (CAC) doubled month-over-month. What diagnostic steps do you take?',
      'How would you execute a zero-budget GTM launch for a B2B developer tool?',
      'Describe a high-impact multivariate A/B test you designed and how you interpreted statistical significance.',
    ],
  },
  {
    id: 'sales',
    name: 'Sales & Client Partnerships',
    badge: 'Revenue',
    description: 'Enterprise discovery, objection handling, multi-stakeholder MEDDPICC, and closing.',
    icon: 'Handshake',
    roles: [
      'Enterprise Account Executive',
      'Sales Development Representative (SDR/BDR)',
      'Customer Success Director',
      'Solutions Architect / Pre-Sales',
      'Head of Commercial Sales',
    ],
    exampleQuestions: [
      'A prospect says: "Your competitor is 40% cheaper and offers the exact same features." How do you respond?',
      'Walk me through how you navigate a deal where the economic buyer went silent before signature.',
      'Tell me about a complex enterprise deal you rescued from the brink of churn.',
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Clinical Operations',
    badge: 'Vital Sector',
    description: 'Hospital operations, health informatics, clinical research, and bio-compliance.',
    icon: 'Activity',
    roles: [
      'Healthcare Administrator',
      'Clinical Operations Manager',
      'Biomedical Informatics Specialist',
      'Quality & Patient Safety Director',
      'Health Tech Implementation Lead',
    ],
    exampleQuestions: [
      'How do you balance strict HIPAA data governance with clinical interoperability needs?',
      'Describe an emergency protocol implementation where staff resistance was high.',
      'How would you reduce emergency room patient boarding times by 25% without adding nursing staff?',
    ],
  },
  {
    id: 'people',
    name: 'HR & People Operations',
    badge: 'Culture',
    description: 'Talent acquisition, executive compensation, organizational design, and employee relations.',
    icon: 'Users',
    roles: [
      'Head of People / HR Director',
      'Senior Technical Recruiter',
      'Compensation & Benefits Lead',
      'Employee Relations Partner',
      'DEI Strategy Director',
    ],
    exampleQuestions: [
      'How do you mediate a high-stakes conflict between two critical senior executives?',
      'Design an equitable performance calibration process across distributed global teams.',
      'Walk me through your framework for restructuring a business unit with zero regulatory backlash.',
    ],
  },
  {
    id: 'behavioral',
    name: 'Leadership & Behavioral (STAR)',
    badge: 'Universal Core',
    description: 'Amazon Leadership Principles, executive presence, cross-functional persuasion, and resilience.',
    icon: 'Award',
    roles: [
      'Engineering Manager',
      'Department Director',
      'Chief of Staff',
      'Cross-functional Project Lead',
      'Senior Individual Contributor',
    ],
    exampleQuestions: [
      'Tell me about a time you strongly disagreed with leadership but committed to execution.',
      'Describe a catastrophic project failure you were accountable for and how you turned it around.',
      'Give an example of delivering a critical business outcome with ambiguous or incomplete data.',
    ],
  },
];

export const PREBUILT_QUESTIONS_BY_DOMAIN: Record<string, PrebuiltQuestion[]> = {
  tech: [
    {
      questionText: 'How would you design a distributed cache system like Redis that handles 100,000 requests per second with high availability and fault tolerance?',
      category: 'System Design & Architecture',
      difficulty: 'Challenging',
      seniority: 'Senior',
      type: 'Technical & Knowledge',
      hintSTAR: {
        situation: 'Establish the scale: throughput, read/write ratio, latency SLA (<5ms), and eviction policy.',
        task: 'Identify partitioned nodes, consistent hashing, replication strategy, and failover mechanism.',
        action: 'Discuss master-replica replication, Raft/Paxos consensus for failover, memory management (LRU/LFU), and write-through vs write-back caching.',
        result: 'Conclude with network partition resilience (CAP theorem tradeoffs) and monitoring metrics.',
      },
      modelAnswer: 'To design a distributed cache handling 100k QPS, I would adopt a cluster of nodes partitioned using consistent hashing with virtual nodes to prevent hot spotting. For high availability, each primary shard replicates asynchronously to 2 read replicas across distinct availability zones. Write policies default to write-around with cache-aside to keep memory lean, using an approximate LRU eviction policy with sampling. If a primary fails, an automated leader election via Raft or Redis Sentinel promotes a replica in under 3 seconds. For client access, client-side cluster routing caches hash slots to avoid proxy hops.',
    },
    {
      questionText: 'Describe a complex race condition or concurrency bug you encountered in production. How did you diagnose, isolate, and permanently resolve it?',
      category: 'Debugging & Concurrency',
      difficulty: 'Standard',
      seniority: 'Mid-Level',
      type: 'Technical & Knowledge',
      hintSTAR: {
        situation: 'Set up the production impact (e.g., duplicate charges, inconsistent balance, deadlock).',
        task: 'Define what made it difficult to reproduce locally.',
        action: 'Detail the log analysis, distributed tracing, database isolation levels (SERIALIZABLE vs READ COMMITTED), and mutex/optimistic locking applied.',
        result: 'State the outcome, zero regressions, and automated tests added.',
      },
      modelAnswer: 'In our order processing pipeline, high-frequency checkout retries created duplicate inventory reservations due to a classic read-modify-write race condition under peak traffic. The symptom only manifested above 5,000 concurrent checkouts. I isolated it by analyzing trace spans in OpenTelemetry showing overlapping database transactions. Rather than introducing heavy pessimistic table locks that would bottleneck throughput, I introduced optimistic concurrency control with a version column and an idempotent idempotency key at the API gateway layer backed by a Redis TTL lock. This eliminated duplicate reservations completely with zero throughput degradation.',
    },
    {
      questionText: 'Explain the internal workings of the JavaScript Event Loop, Microtasks vs Macrotasks, and how modern V8 optimizations affect execution order.',
      category: 'Core Fundamentals',
      difficulty: 'Standard',
      seniority: 'Mid-Level',
      type: 'Technical & Knowledge',
      hintSTAR: {
        situation: 'Clarify single-threaded call stack execution in JavaScript.',
        task: 'Contrast the Call Stack, Web APIs, Microtask Queue (Promises, queueMicrotask), and Task Queue (setTimeout, requestAnimationFrame).',
        action: 'Walk step-by-step through execution priority: stack drains -> microtask queue drains completely -> render phase -> one macrotask executes.',
        result: 'Mention real-world implications like UI freezing from microtask loops.',
      },
      modelAnswer: 'JavaScript operates on a single-threaded event loop. When synchronous code runs on the call stack, asynchronous callbacks are offloaded to host APIs. Once the call stack is empty, the Event Loop processes queues in strict hierarchy: first, the microtask queue (Promise.then, MutationObserver, queueMicrotask) is drained completely until empty, including any microtasks enqueued during draining. Only then does the browser consider rendering frames, before pulling exactly one macrotask (setTimeout, setInterval, I/O) from the task queue. An infinite loop of microtasks will starve the macrotask queue and completely freeze rendering.',
    },
  ],
  'data-ai': [
    {
      questionText: 'How would you architect an enterprise Retrieval-Augmented Generation (RAG) system that minimizes hallucinations, ensures sub-second retrieval, and respects document-level access control?',
      category: 'GenAI & RAG Architecture',
      difficulty: 'Challenging',
      seniority: 'Senior',
      type: 'Technical & Knowledge',
      hintSTAR: {
        situation: 'Describe unstructured enterprise docs (PDFs, Confluence) needing accurate answers without leaking sensitive departmental data.',
        task: 'Address chunking strategies, hybrid vector + keyword search, re-ranking, and ACL filtering.',
        action: 'Explain semantic chunking, cross-encoder re-ranking (Cohere/bge-reranker), metadata pre-filtering on user tokens, and citation verification.',
        result: 'Quantify retrieval precision, latency (<800ms), and hallucinations reduced to <1%.',
      },
      modelAnswer: 'For our enterprise RAG pipeline, I architected a multi-stage retrieval workflow. First, documents are ingested with hierarchical semantic chunking preserving parent-child context and tagged with cryptographic tenant and ACL metadata. In the query phase, we execute hybrid search combining dense HNSW vector embeddings with sparse BM25 keyword search. We pre-filter the vector index by candidate user security groups to guarantee zero data leakage. The top 50 candidates are re-ranked using a lightweight cross-encoder down to the top 5 chunks. Finally, we prompt the LLM with strict grounding instructions requiring verifiable inline citations, reducing hallucinations by 92%.',
    },
    {
      questionText: 'How do you detect, monitor, and mitigate feature drift and concept drift in a real-time fraud detection model in production?',
      category: 'MLOps & Model Monitoring',
      difficulty: 'Standard',
      seniority: 'Senior',
      type: 'Technical & Knowledge',
      hintSTAR: {
        situation: 'A production fraud model starts experiencing false negatives as fraudsters change patterns.',
        task: 'Differentiate feature drift (P(X) changes) from concept drift (P(Y|X) changes).',
        action: 'Deploy statistical tests (Population Stability Index, Kolmogorov-Smirnov, Wasserstein distance) on feature streams and monitor ground-truth lag.',
        result: 'Automate retraining triggers and fallback rule engines to safeguard transactions.',
      },
      modelAnswer: 'To monitor fraud detection in real-time, I separate feature drift from concept drift. Feature drift is tracked on continuous input streams using daily Population Stability Index (PSI) and Kolmogorov-Smirnov tests comparing production distributions against training baselines. For concept drift, because true fraud labels have a 30-to-60 day dispute lag, we track proxy metrics like transaction anomaly density and sudden shifts in prediction confidence intervals. When PSI exceeds 0.25 on critical features, alerts trigger automated shadow retraining on the latest 14-day window with human-in-the-loop validation before live promotion.',
    },
  ],
  product: [
    {
      questionText: 'Imagine you are the Head of Product for an enterprise productivity app. A competitor launches an AI copilot feature that is creating massive buzz. How do you evaluate whether and how to respond?',
      category: 'Product Strategy & Competitive Response',
      difficulty: 'Standard',
      seniority: 'Senior',
      type: 'Case Study & Strategy',
      hintSTAR: {
        situation: 'Competitor hype creates anxiety among internal sales teams and board members.',
        task: 'Avoid knee-jerk feature parity; anchor to customer workflows, retention drivers, and core differentiators.',
        action: 'Interview top churn-risk customers, audit competitor utility vs gimmick, run a fast 2-week prototype or wizard-of-oz test, and define success metrics.',
        result: 'Formulate an integrated strategy that compounds your proprietary data moat rather than copying a generic wrapper.',
      },
      modelAnswer: 'My framework begins by disaggregating market hype from genuine customer workflow adoption. First, I would spend 48 hours interviewing enterprise customers who trialed the competitor to understand: is this driving retention or merely top-of-funnel curiosity? Second, I evaluate our unique data moat: where can AI provide 10x value uniquely in our ecosystem rather than a commoditized summary button? In parallel, I arm sales with an objective battlecard highlighting our reliability and security compliance. We then launch a targeted beta focusing on our users highest friction bottleneck, measuring weekly active engagement rather than just launch-day clicks.',
    },
  ],
  finance: [
    {
      questionText: 'Walk me through how a $10 increase in depreciation cascades across the Income Statement, Cash Flow Statement, and Balance Sheet, assuming a 20% corporate tax rate.',
      category: 'Financial Modeling & Accounting',
      difficulty: 'Standard',
      seniority: 'Mid-Level',
      type: 'Technical & Knowledge',
      hintSTAR: {
        situation: 'Standard 3-statement accounting linkage.',
        task: 'Track changes step-by-step in logical order: Income Statement first, then Cash Flow, then Balance Sheet balance.',
        action: 'Operating Income drops by $10. Tax drops by $2 (20%). Net income drops by $8. On Cash Flow: Net Income -8, add back non-cash Depreciation +10, net cash increase +$2. Balance Sheet: Cash +$2, PP&E -$10, total Assets -$8. Retained Earnings -$8. Both sides balance.',
        result: 'Deliver with concise, structured confidence without hesitation.',
      },
      modelAnswer: 'Starting on the Income Statement: Operating income (EBIT) decreases by $10 due to higher depreciation. At a 20% tax rate, income taxes decrease by $2, so Net Income declines by $8. Next, on the Cash Flow Statement: Under Cash from Operations, Net Income starts $8 lower, but we add back the full $10 non-cash depreciation expense. Therefore, Cash from Operations and overall Net Cash increases by $2 due to the tax shield. Finally, on the Balance Sheet: Assets reflect Cash up by $2, but Net PP&E is down by $10 from the accumulated depreciation, making total Assets down by $8. On the Liabilities & Equity side, Retained Earnings declines by $8 from lower Net Income. Both sides balance perfectly at negative $8.',
    },
  ],
  behavioral: [
    {
      questionText: 'Tell me about a time you strongly disagreed with a senior leader or stakeholder on a strategic decision. How did you handle the situation and what was the outcome?',
      category: 'Conflict Resolution & Leadership',
      difficulty: 'Challenging',
      seniority: 'Senior',
      type: 'Behavioral & STAR',
      hintSTAR: {
        situation: 'Describe a high-stakes scenario with genuine differences of opinion based on principles, not ego.',
        task: 'Show your obligation to respectfully push back when data indicates risk, while respecting organizational hierarchy.',
        action: 'Focus on objective data gathered, side-by-side risk modeling, 1-on-1 private alignment discussions, and clean consensus.',
        result: 'Explain the outcome (whether adopted or disagreed and committed), business results, and strengthened relationship.',
      },
      modelAnswer: 'At my previous company, our VP of Engineering wanted to rewrite our core billing service from scratch right before Q4 peak shopping season to migrate to Rust. While I supported the architectural vision, our telemetry indicated significant failure risk during our highest revenue quarter. Instead of confronting him publicly in team standup, I scheduled a 1-on-1 and brought empirical latency benchmarks and an impact analysis showing that 85% of existing bottlenecks were database index locks, not language overhead. I proposed a phased approach: optimize the existing query indexes in 1 sprint to guarantee Q4 stability, and pilot the Rust rewrite on an isolated microservice in Q1. He agreed, we sailed through Q4 with zero downtime generating $18M in revenue, and completed the strategic migration smoothly the following spring.',
    },
  ],
};
