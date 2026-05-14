// Keiser University FAQ corpus — Skylar's grounding knowledge base.
// Sources:
//   1. Keiser_University_FAQ document supplied by the user.
//   2. keiseruniversity.edu homepage (scraped May 2026): institutional facts,
//      campus list, official FAQ block, rankings, contact numbers.
window.SKYLAR_DEFAULT_FAQS = [
  // ─── About Keiser ────────────────────────────────────────────────────────
  {
    q: "What is Keiser University?",
    a: "Keiser is a private, not-for-profit university in Florida, founded in 1977. It's the largest private not-for-profit university in the state — serving about 20,000 students and more than 100,000 alumni — and offers career-focused programs across 100+ fields of study.",
    tags: ["about", "keiser", "private", "not-for-profit", "history", "founded", "size", "florida"]
  },
  {
    q: "Is Keiser University a for-profit school?",
    a: "No — Keiser is a private not-for-profit university, and the largest private not-for-profit in Florida. Revenue is reinvested into academic programs, student services, and campus facilities.",
    tags: ["for-profit", "not-for-profit", "nonprofit", "private", "status"]
  },
  {
    q: "When was Keiser University founded?",
    a: "Keiser was founded in 1977 and has grown into a network of 18 Florida campuses, three international campuses, a graduate school, and an award-winning online division.",
    tags: ["founded", "history", "1977", "when", "started", "year"]
  },
  {
    q: "How big is Keiser University?",
    a: "Keiser serves approximately 20,000 students and has graduated more than 100,000 alumni. It's the largest private not-for-profit university in Florida, with 18 Florida campuses plus international and online divisions.",
    tags: ["size", "students", "alumni", "enrollment", "how many"]
  },
  {
    q: "How many campuses does Keiser have?",
    a: "Keiser University operates 18 Florida campuses, three international campuses (Nicaragua and China), and the Graduate School in Fort Lauderdale, plus a fully accredited online division.",
    tags: ["campuses", "how many", "locations", "florida", "international", "count"]
  },

  // ─── Contact ────────────────────────────────────────────────────────────
  {
    q: "How do I contact Keiser University?",
    a: "You can reach Keiser at 888-KEISER-9 (888.534.7379) for campuses, 888.453.4737 for the Online Division, 888.753.4737 for the Graduate School, or 888.960.8790 for En Línea en Español. You can also request info or live-chat from the website.",
    tags: ["contact", "phone", "number", "call", "reach", "talk to someone", "888"]
  },

  // ─── Admissions & Enrollment ────────────────────────────────────────────
  {
    q: "How do I apply to Keiser University?",
    a: "You can apply online through the admissions portal and submit your supporting documents — things like transcripts and a photo ID.",
    tags: ["apply", "application", "admissions", "enroll", "how", "online portal"]
  },
  {
    q: "Is there an application fee?",
    a: "Most applicants pay a $55 application fee, though fee waivers may sometimes apply.",
    tags: ["fee", "cost", "application", "waiver", "$55"]
  },
  {
    q: "Does Keiser have rolling admissions?",
    a: "Yes — many programs offer rolling admissions with multiple start dates throughout the year.",
    tags: ["rolling", "admissions", "start", "dates", "year-round"]
  },
  {
    q: "Do I need a high school diploma to attend?",
    a: "Yes. Candidates need to provide verification of high school graduation via transcript or diploma, GED scores or diploma, or proof of equivalent foreign secondary education.",
    tags: ["high school", "diploma", "ged", "transcript", "requirements", "prerequisite"]
  },
  {
    q: "Do I need SAT or ACT scores?",
    a: "Some undergraduate programs may request standardized test scores, but many career-focused and adult learner programs use alternative admissions pathways instead.",
    tags: ["sat", "act", "test", "scores", "standardized", "requirements"]
  },
  {
    q: "When can I start classes?",
    a: "Keiser offers monthly class starts — many programs begin every few weeks or every 8 weeks, especially online and graduate programs. An admissions counselor can help you pick a date.",
    tags: ["start", "classes", "when", "begin", "dates", "semester", "monthly"]
  },
  {
    q: "When is the next start date?",
    a: "The next undergraduate start date is June 8, 2026, and the next graduate start date is July 6, 2026. New start dates open throughout the year, so an admissions counselor can find the closest fit for you.",
    tags: ["next start", "june", "july", "2026", "upcoming", "dates", "calendar"]
  },
  {
    q: "Can I attend part-time?",
    a: "Yes — you can attend full-time or part-time depending on your schedule and the program.",
    tags: ["part-time", "full-time", "schedule", "pace"]
  },

  // ─── Academics & Programs ───────────────────────────────────────────────
  {
    q: "What degree programs does Keiser offer?",
    a: "Keiser offers associate, bachelor's, master's, doctoral, and certificate programs in fields like healthcare, business, technology, criminal justice, psychology, nursing, sports management, and more — over 100 programs in all.",
    tags: ["programs", "degrees", "majors", "associate", "bachelor", "master", "doctoral", "certificate", "fields", "100"]
  },
  {
    q: "What program areas can I study?",
    a: "Programs cluster into three big areas: Business & Professional Studies (Accounting, Business, MBA, Criminal Justice, Education, Hospitality, Legal Studies), Health & Wellness (Chiropractic, Nursing, Exercise & Sport Science, Health Care, Psychology, Sport Management, the College of Golf), and Specialized & Creative Fields (Cinematic Arts, Culinary, Cybersecurity, Engineering, Forensic Science, IT, Marketing).",
    tags: ["program areas", "categories", "subjects", "fields", "what can i study", "majors"]
  },
  {
    q: "What are the most popular programs?",
    a: "Popular programs include Nursing, Healthcare Administration, Business Administration, Criminal Justice, Psychology, Information Technology, Medical Assisting, and Exercise & Sport Science.",
    tags: ["popular", "programs", "nursing", "business", "psychology", "it", "criminal justice", "healthcare"]
  },
  {
    q: "Does Keiser offer a one-class-at-a-time format?",
    a: "Yes — many programs use a one-class-at-a-time format so students can focus on fewer subjects while balancing work and family.",
    tags: ["one class", "format", "schedule", "focus", "block"]
  },
  {
    q: "Are classes available online and on campus?",
    a: "Yes — Keiser offers on-campus programs, fully online programs, and hybrid learning options.",
    tags: ["online", "campus", "hybrid", "remote", "in-person", "format"]
  },
  {
    q: "How large are classes?",
    a: "Keiser promotes smaller class sizes and personalized instruction compared to large lecture-style universities.",
    tags: ["class size", "small", "students", "ratio", "personalized"]
  },
  {
    q: "Can working adults attend evening classes?",
    a: "Yes — many campuses offer day, evening, and online scheduling options for adult learners.",
    tags: ["evening", "night", "adult", "working", "schedule", "flexible"]
  },
  {
    q: "Does Keiser offer programs in Spanish?",
    a: "Yes — the Latin Division offers select programs 'En Linea en Espanol.'",
    tags: ["spanish", "espanol", "latin", "language"]
  },
  {
    q: "Does Keiser have a College of Golf?",
    a: "Yes — Keiser's College of Golf offers specialized golf management and instruction programs.",
    tags: ["golf", "college of golf", "management"]
  },
  {
    q: "Does Keiser accept credit for life experience?",
    a: "Yes — a student needs documented experience related to specific course objectives. The Dean of Academic Affairs determines eligibility.",
    tags: ["life experience", "credit", "prior learning", "documented"]
  },
  {
    q: "Does Keiser participate in the Advanced Placement Program?",
    a: "Yes — Keiser participates in the AP Program administered by high schools through the College Entrance Examination Board (CEEB).",
    tags: ["ap", "advanced placement", "ceeb", "high school credit"]
  },
  {
    q: "Does Keiser follow Florida's Common Course Numbering System?",
    a: "Yes, Keiser follows Florida's Common Course Numbering System.",
    tags: ["florida", "course numbering", "ccns", "common course"]
  },

  // ─── Transfer Credits ───────────────────────────────────────────────────
  {
    q: "Does Keiser accept transfer credits?",
    a: "Yes — transfer credits may be accepted from regionally accredited institutions for courses completed with a 'C' or better, subject to course equivalency and program requirements.",
    tags: ["transfer", "credits", "regionally accredited", "equivalency"]
  },
  {
    q: "Is there a limit to transfer credits?",
    a: "For many undergraduate programs, approved credits may transfer as long as residency requirements are met. Graduate programs generally allow up to 12 transfer credits for master's and up to 18 for doctoral programs.",
    tags: ["transfer", "limit", "credits", "graduate", "master", "doctoral", "residency"]
  },
  {
    q: "What grades are required for transfer?",
    a: "Only courses completed with a 'C' or higher (2.0 on a 4.0 scale) are considered for transfer credit.",
    tags: ["transfer", "grade", "gpa", "c", "2.0", "requirement"]
  },
  {
    q: "Does Keiser evaluate military transcripts?",
    a: "Yes — Keiser awards college credit for learning acquired in military service at levels consistent with ACE Guide recommendations. SMART and Joint Service military transcripts may be reviewed for transfer credit.",
    tags: ["military", "transcripts", "veterans", "service", "ace", "smart", "joint service"]
  },
  {
    q: "How do I send transcripts?",
    a: "You can submit transcripts electronically through services like Parchment or directly from prior schools. Official transcripts need to be received within your first semester.",
    tags: ["transcripts", "send", "submit", "parchment", "official"]
  },
  {
    q: "Will my Keiser credits transfer to another school?",
    a: "Transferability of credits is at the discretion of the receiving institution — Keiser can't guarantee it, but it has articulation agreements with some colleges and universities.",
    tags: ["transfer out", "credits", "other school", "articulation", "guarantee"]
  },
  {
    q: "Does Keiser have articulation agreements?",
    a: "Yes — Keiser maintains articulation agreements with various institutions. Contact Admissions or the Vice Chancellor of Academic Affairs for details.",
    tags: ["articulation", "agreements", "partnerships", "transfer"]
  },

  // ─── Financial Aid & Tuition ────────────────────────────────────────────
  {
    q: "Does Keiser offer financial aid?",
    a: "Yes — Keiser participates in Federal Title IV financial aid programs, including grants, loans, scholarships, and tuition reimbursement programs for qualified students.",
    tags: ["financial aid", "title iv", "grants", "loans", "scholarships", "reimbursement", "tuition"]
  },
  {
    q: "Does Keiser accept FAFSA?",
    a: "Yes — eligible students may apply for federal financial aid through the FAFSA.",
    tags: ["fafsa", "federal aid", "financial"]
  },
  {
    q: "Do I have to attend full-time to receive financial aid?",
    a: "No — federal aid programs are available to students attending full-time, 3/4 time, 1/2 time, and 1/4 time.",
    tags: ["financial aid", "part-time", "full-time", "eligibility"]
  },
  {
    q: "Are scholarships available?",
    a: "Yes — merit-based, need-based, military, first responder, alumni, and other scholarships may be available, including Florida Bright Futures. The Financial Services department can provide a full list.",
    tags: ["scholarships", "merit", "need", "military", "alumni", "bright futures", "florida"]
  },
  {
    q: "Does Keiser offer grants?",
    a: "Yes — grants are based on substantial financial need and may be applied for during your Financial Aid appointment.",
    tags: ["grants", "need-based", "financial aid"]
  },
  {
    q: "Can financial aid cover books and fees?",
    a: "In many cases, financial aid packages may include tuition, books, and certain fees depending on your eligibility.",
    tags: ["books", "fees", "financial aid", "tuition", "coverage"]
  },
  {
    q: "Does Keiser help students understand their financial aid options?",
    a: "Yes — admissions and financial services teams help students review funding plans before enrollment.",
    tags: ["financial aid", "guidance", "counseling", "advisor"]
  },

  // ─── Accreditation & Rankings ───────────────────────────────────────────
  {
    q: "Is Keiser University accredited?",
    a: "Yes — Keiser is accredited by the Southern Association of Colleges and Schools Commission on Colleges (SACSCOC) to award certificates and degrees at the associate, baccalaureate, master's, specialist, and doctoral levels. Individual programs hold additional specialized accreditations in nursing, business, and other fields.",
    tags: ["accredited", "accreditation", "sacscoc", "southern association", "specialized"]
  },
  {
    q: "Are online degrees respected?",
    a: "Keiser is institutionally accredited by SACSCOC, and online degrees are awarded by the same accredited university — there's no distinction on the diploma between online and on-campus.",
    tags: ["online", "degree", "respected", "accreditation", "diploma"]
  },
  {
    q: "What rankings has Keiser received?",
    a: "A few highlights: Top 25 in the U.S. for social mobility (U.S. News & World Report, ranked No. 1 in 2023), No. 2 Best Online Ph.D. in Educational Leadership (Forbes, 2024), No. 4 Best Online Master's in Psychology (Forbes, 2023), and No. 2 Best 4-year graduation rates among private nonprofit nonresidential schools (Chronicle of Higher Education, 2023).",
    tags: ["rankings", "rated", "best", "forbes", "us news", "chronicle", "awards", "social mobility"]
  },
  {
    q: "Is Keiser a Hispanic-Serving Institution?",
    a: "Yes — Keiser is a designated Hispanic-Serving Institution and was named among the Top 100 Hispanic-Serving Institutions by Hispanic Outlook on Education Magazine (2024).",
    tags: ["hispanic", "hsi", "serving", "latino", "diversity", "designation"]
  },

  // ─── Campuses & Locations ───────────────────────────────────────────────
  {
    q: "Where are Keiser University campuses located?",
    a: "Keiser has 18 Florida campuses: Clearwater, Daytona Beach, Flagship (West Palm Beach), Fort Lauderdale, Fort Myers, Jacksonville, Lakeland, Latin Division (Fort Lauderdale), Melbourne, Miami, Naples, New Port Richey, Orlando, Pembroke Pines, Port St. Lucie, Sarasota, Tallahassee, Tampa, and West Palm Beach — plus the Graduate School in Fort Lauderdale, the Online Division, and international campuses in Nicaragua and China.",
    tags: ["campus", "location", "florida", "miami", "orlando", "tampa", "west palm beach", "jacksonville", "fort lauderdale", "naples", "pembroke pines", "clearwater", "daytona", "fort myers", "lakeland", "melbourne", "new port richey", "port st. lucie", "sarasota", "tallahassee"]
  },
  {
    q: "What is the Flagship Campus?",
    a: "The residential Flagship Campus is in West Palm Beach and serves as the center for student housing, athletics, and traditional campus life.",
    tags: ["flagship", "west palm beach", "residential", "housing", "main campus"]
  },
  {
    q: "Does every campus offer housing?",
    a: "No — residential housing is primarily available at the Flagship Campus. Many other campuses are commuter-based.",
    tags: ["housing", "dorm", "residential", "commuter"]
  },
  {
    q: "Are there international campuses?",
    a: "Yes — Keiser has campuses in Managua and San Marcos (Carazo), Nicaragua, and in Shanghai, China.",
    tags: ["international", "nicaragua", "shanghai", "china", "managua", "san marcos", "carazo", "global", "abroad"]
  },
  {
    q: "Can students switch campuses?",
    a: "In many cases, you can transfer between Keiser campuses depending on program availability.",
    tags: ["switch", "transfer", "campus", "relocate"]
  },
  {
    q: "Can students visit campuses before enrolling?",
    a: "Yes — campus tours and admissions visits are available both in-person and virtually.",
    tags: ["visit", "tour", "campus", "virtual", "in-person"]
  },

  // ─── Athletics ──────────────────────────────────────────────────────────
  {
    q: "What is Keiser's mascot?",
    a: "The Seahawk! 🦅 That's me — Skylar, the official Keiser mascot.",
    tags: ["mascot", "seahawk", "skylar", "spirit"]
  },
  {
    q: "What athletic association does Keiser compete in?",
    a: "Keiser competes in the NAIA and is part of The Sun Conference.",
    tags: ["athletic", "naia", "sun conference", "league", "association"]
  },
  {
    q: "What sports does Keiser offer?",
    a: "Keiser offers more than 25 varsity sports including football, basketball, baseball, soccer, golf, volleyball, lacrosse, swimming, tennis, wrestling, flag football, softball, and track & field.",
    tags: ["sports", "athletics", "football", "basketball", "baseball", "soccer", "golf", "volleyball", "tennis", "wrestling", "softball", "track", "lacrosse", "swimming", "varsity"]
  },
  {
    q: "Does Keiser offer athletic scholarships?",
    a: "Yes — athletic scholarships may be available for eligible student-athletes depending on the sport and program.",
    tags: ["athletic", "scholarship", "student-athlete", "sports"]
  },
  {
    q: "Does Keiser stream games online?",
    a: "Yes — many home athletic events include live stats and video streaming online.",
    tags: ["stream", "games", "online", "watch", "broadcast", "live"]
  },
  {
    q: "Are there intramural or recreational sports?",
    a: "Yes — students can participate in recreational and wellness activities in addition to varsity athletics.",
    tags: ["intramural", "recreational", "rec", "wellness", "sports", "club"]
  },

  // ─── Social Media & Online Presence ─────────────────────────────────────
  {
    q: "Where can I find Keiser University on social media?",
    a: "Keiser is on Instagram (@KeiserU), Facebook (Keiser University), LinkedIn (Keiser University), YouTube (Keiser University Channel), X / Twitter (@KeiserU), and TikTok (Keiser University).",
    tags: ["social media", "instagram", "facebook", "linkedin", "youtube", "twitter", "x", "tiktok", "follow"]
  },
  {
    q: "Does Keiser have campus-specific or program-specific social accounts?",
    a: "Yes — Keiser maintains campus-specific and program-specific accounts for locations like Miami and Tampa, plus nursing programs, athletics teams, and the online division.",
    tags: ["social media", "campus", "program", "accounts", "specific"]
  },
  {
    q: "Where can I follow Keiser athletics on social media?",
    a: "You can follow the Keiser Seahawks athletics website and the KU Seahawks social accounts hub.",
    tags: ["athletics", "seahawks", "social media", "follow", "sports"]
  },

  // ─── Student Life & Support ─────────────────────────────────────────────
  {
    q: "What is student life like at the Flagship Campus?",
    a: "Students participate in campus events, tailgates, movie nights, clubs, fitness activities, cultural events, and student organizations.",
    tags: ["student life", "flagship", "campus life", "clubs", "events", "tailgate", "social"]
  },
  {
    q: "Does Keiser support military students and veterans?",
    a: "Yes — Keiser is a Military Friendly® institution and accepts a range of education benefits including the GI Bill®, MyCAA, and tuition assistance. Dedicated military advisors are available at each campus.",
    tags: ["military", "veterans", "support", "service members", "benefits", "gi bill", "mycaa", "tuition assistance", "military friendly"]
  },
  {
    q: "What military benefits does Keiser accept?",
    a: "Keiser accepts the GI Bill®, MyCAA, and tuition assistance, and supports active duty, veterans, military dependents, the GEM Program, and CLEP/DSST credit. A military advisor at your campus can walk you through your options.",
    tags: ["gi bill", "mycaa", "tuition assistance", "clep", "dsst", "gem", "military", "veterans", "active duty", "benefits"]
  },
  {
    q: "Are tutoring and academic support available?",
    a: "Yes — students have access to tutoring, writing support, advising, library services, and academic assistance.",
    tags: ["tutoring", "academic support", "writing", "advising", "library", "help"]
  },
  {
    q: "Does Keiser help students find jobs after graduation?",
    a: "Keiser offers career services including resume help, interview prep, career guidance, and job leads — though employment isn't guaranteed.",
    tags: ["career services", "jobs", "employment", "resume", "interview", "graduation", "placement"]
  },
  {
    q: "Does Keiser offer internships?",
    a: "Some programs include internships, externships, or clinical experiences depending on the field of study.",
    tags: ["internship", "externship", "clinical", "experience", "field"]
  },
  {
    q: "Is Keiser good for adult learners?",
    a: "Yes — flexible schedules, online learning, and career-focused programs make Keiser popular with working adults and nontraditional students.",
    tags: ["adult", "working", "nontraditional", "flexible", "career-focused"]
  },

  // ─── Common Action Links (round 3) ─────────────────────────────────
  // These entries contain official referring URLs supplied by the admissions team.
  // System prompt rule #10 instructs Skylar to surface these links verbatim when relevant.
  {
    q: "How do I order my transcripts?",
    a: "You can request an official Keiser University transcript here: [Order an Official Transcript](https://www.keiseruniversity.edu/transcripts/). The page has the most current instructions and fees.",
    tags: ["transcript", "transcripts", "records", "official", "order", "request", "academic record"]
  },
  {
    q: "What is Keiser University's website?",
    a: "Keiser's main website is [keiseruniversity.edu](https://www.keiseruniversity.edu/) — you can find programs, campuses, admissions info, and contact options there.",
    tags: ["website", "url", "site", "main", "find", "online", "web address"]
  },
  {
    q: "How do I order my books?",
    a: "Books are available through the official Keiser University bookstore: [KU Bookstore](http://www.bkstr.com/keiserstore/home). You'll need your course list to pick the right titles.",
    tags: ["books", "bookstore", "textbooks", "order", "buy", "course materials"]
  },
  {
    q: "How do I get into my student portal?",
    a: "You can sign in to the Keiser student portal here: [KU Student Portal](http://campusportal.keiseruniversity.edu). If you can't log in, contact the IT Help Desk at 1-855-412-3717 or [helpdesk@keiserschools.net](mailto:helpdesk@keiserschools.net).",
    tags: ["portal", "student portal", "login", "sign in", "campus portal", "access"]
  },
  {
    q: "Can I see the Keiser University catalog?",
    a: "Yes — the full catalog is published here: [KU Catalog](http://www.keiseruniversity.edu/catalog/). It covers programs, policies, and academic information.",
    tags: ["catalog", "course catalog", "programs list", "policies", "handbook"]
  },
  {
    q: "How do I log into class?",
    a: "Classes are delivered through Blackboard: [KU Class Login](https://keiseruniversity.blackboard.com/). Use your student credentials to sign in. If you have trouble, the Help Desk can assist at 1-855-412-3717.",
    tags: ["class", "log in", "login", "blackboard", "lms", "course", "online class", "access class"]
  },
  {
    q: "How do I get help with technical issues?",
    a: "You can reach the Keiser IT Help Desk at 1-855-412-3717 or by email at [helpdesk@keiserschools.net](mailto:helpdesk@keiserschools.net). They handle portal access, email, and class-login issues.",
    tags: ["help", "helpdesk", "tech support", "technical", "it", "password", "login issue", "can't access"]
  },
  {
    q: "Can I chat live with an admissions counselor?",
    a: "Yes — you can chat with a live admissions counselor through the university's official chat window. Visit [keiseruniversity.edu](https://www.keiseruniversity.edu/) and look for the chat option, or request information to be contacted directly.",
    tags: ["live chat", "counselor", "talk", "speak", "agent", "human", "admissions counselor"]
  },

  // ─── Apply Now — Campus & Modality Routing ─────────────────────────
  // Skylar should ask for modality + language + campus first, then surface the matching link.
  // All links live in a single answer body so retrieval surfaces the full table; the LLM
  // selects the right line per the student's stated preference, citing the link verbatim.
  {
    q: "I'd like to apply now. How do I start?",
    a: "Before I share a link, can you tell me three things? (1) In person or online, (2) English or Spanish, and (3) undergraduate or graduate? Once I know, I'll point you to the right Request Information page.\n\nOnline options:\n• Online — English: [Online English RFI](https://enroll.enrolledu.net/rfi-profile-online?SourceSubCat=af14d3ea-f843-ed11-bba1-000d3a314f47&Source=App%20Profile)\n• Online — Spanish: [Online Spanish RFI](https://enroll.enrolledu.net/rfi-profile-online?SourceSubCat=d7454b43-62da-ef11-a730-000d3a14c365&Source=App%20Profile)\n• Online — Graduate: [Graduate Online RFI](https://enroll.enrolledu.net/rfi-profile-grad)\n\nCampus options:\n• Flagship (West Palm Beach area): [Flagship RFI](https://enroll.enrolledu.net/rfi-profile-flagship)\n• Clearwater: [Clearwater RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Clearwater)\n• Daytona Beach: [Daytona RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Daytona)\n• Fort Lauderdale: [Fort Lauderdale RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Fort%20Lauderdale)\n• Fort Myers: [Fort Myers RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Fort%20Myers)\n• Jacksonville: [Jacksonville RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Jacksonville)\n• Lakeland: [Lakeland RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Lakeland)\n• Melbourne: [Melbourne RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Melbourne)\n• Miami: [Miami RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Miami)\n• Naples: [Naples RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Naples)\n• New Port Richey: [New Port Richey RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=New%20Port%20Richey)\n• Orlando: [Orlando RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Orlando)\n• Pembroke Pines: [Pembroke Pines RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Pembroke%20Pines)\n• Port St. Lucie: [Port St. Lucie RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Port%20St.%20Lucie)\n• Sarasota: [Sarasota RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Sarasota)\n• Tallahassee: [Tallahassee RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Tallahassee)\n• Tampa: [Tampa RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=Tampa)\n• West Palm Beach: [West Palm Beach RFI](https://enroll.enrolledu.net/rfi-profile-GroundCampus?Campus=West%20Palm%20Beach)\n• Nicaragua (Managua or San Marcos): [Request Information](https://www.keiseruniversity.edu/request-information/)",
    tags: ["apply", "application", "start", "enroll", "rfi", "request information", "sign up", "campus", "modality", "online", "in person", "spanish", "english", "graduate", "undergraduate"]
  }
];
