import React, { useEffect, useMemo, useState } from "react";

const intakeDefaults = {
  childName: "",
  age: "",
  grade: "",
  assessorRole: "parent",
  assessorName: "",
  dialectExposure: "high",
  msaExposure: "medium",
  previousDiagnosis: "unknown",
  notes: "",
};

const safetyDefaults = {
  hearingIssue: false,
  visionIssue: false,
  tiredToday: false,
  attentionIssue: false,
  understandsTask: true,
};

const flow = [
  { id: "onboarding", kind: "onboarding", title: "بيانات البداية" },
  { id: "safety", kind: "safety", title: "تنبيه السمع والنظر" },
  { id: "calibration", kind: "module", title: "معايرة اللغة" },
  { id: "phonological", kind: "module", title: "الوعي الصوتي" },
  { id: "orthographic", kind: "module", title: "الحروف والأشكال" },
  { id: "rapidNaming", kind: "module", title: "سرعة التسمية" },
  { id: "decoding", kind: "module", title: "القراءة وفك التشفير" },
  { id: "spellingMemory", kind: "module", title: "الإملاء والذاكرة" },
  { id: "results", kind: "results", title: "النتيجة والخطة" },
];

const moduleMeta = {
  calibration: {
    title: "معايرة اللغة والتعليمات",
    domain: "spokenLanguage",
    intro: "نتأكد أن الطفل فاهم التعليمات باللهجة المصرية قبل الاختبارات الأساسية.",
  },
  phonological: {
    title: "الوعي الصوتي",
    domain: "phonological",
    intro: "تمييز بداية الصوت ونهايته، دمج الأصوات، حذف صوت، وعدّ المقاطع.",
  },
  orthographic: {
    title: "الحروف والأشكال",
    domain: "orthographic",
    intro: "تمييز الحروف المتشابهة، النقاط، الحركات، وأشكال الحرف داخل الكلمة.",
  },
  rapidNaming: {
    title: "سرعة التسمية",
    domain: "rapidNaming",
    intro: "قياس سرعة تسمية الأشياء والحروف والرموز مع حساب الأخطاء.",
  },
  decoding: {
    title: "القراءة وفك التشفير",
    domain: "decoding",
    intro: "ربط الحروف بالأصوات، قراءة المقاطع، الكلمات غير الحقيقية، والجمل القصيرة.",
  },
  spellingMemory: {
    title: "الإملاء والذاكرة",
    domain: "spellingMemory",
    intro: "إملاء كلمات قصيرة، ذاكرة سمعية، وترتيب أصوات أو أرقام.",
  },
};

const questions = {
  calibration: [
    q("CAL_001", "choice", "spokenLanguage", "instruction_comprehension", 1, "اسمع التعليمات واختار كلمة: كتاب", ["كتاب", "قطة", "كرة"], "كتاب", "اختار كلمة كتاب."),
    {
      id: "CAL_002",
      type: "orderedTap",
      domain: "spokenLanguage",
      skill: "two_step_instruction",
      difficulty: 1,
      prompt: "نفّذ التعليمات بالترتيب: دائرة ثم مربع.",
      spokenPrompt: "اضغط دائرة، وبعدها مربع.",
      choices: ["دائرة", "نجمة", "مربع", "قلب"],
      correctSequence: ["دائرة", "مربع"],
      helper: "هذا يقيس فهم التعليمات، وليس القراءة.",
    },
    q("CAL_003", "choice", "spokenLanguage", "dialect_mapping", 1, "كلمة عايز معناها إيه؟", ["يريد", "يجري", "ينام"], "يريد", "كلمة عايز معناها إيه؟"),
    q("CAL_004", "choice", "spokenLanguage", "task_rule", 1, "لما نقول: اختار المختلف، تعمل إيه؟", ["أختار الشيء المختلف", "أختار أول شيء", "لا أضغط"], "أختار الشيء المختلف", "لما أقول اختار المختلف، تعمل إيه؟"),
  ],
  phonological: [
    q("PA_001", "choice", "phonological", "initial_sound", 1, "أي كلمة تبدأ بصوت ب؟", ["بيت", "قلم", "شمس", "نار"], "بيت", "أي كلمة بتبدأ بصوت ب؟"),
    q("PA_002", "choice", "phonological", "final_sound", 1, "أي كلمة تنتهي بصوت ر؟", ["قمر", "كتاب", "ولد", "قطة"], "قمر", "أي كلمة آخرها صوت ر؟"),
    q("PA_003", "choice", "phonological", "blending", 2, "لو جمعنا: م + و + ز، تكون الكلمة؟", ["موز", "ماء", "نور", "بيت"], "موز", "م، و، ز. لما نجمعهم تبقى إيه؟"),
    q("PA_004", "choice", "phonological", "deletion", 3, "كلمة كتاب بدون صوت ك تصبح؟", ["تاب", "باب", "كتاب", "كاب"], "تاب", "قول كتاب من غير ك."),
    q("PA_005", "choice", "phonological", "syllable_count", 2, "كلمة مكتبة فيها كام مقطع صوتي تقريبًا؟", ["2", "3", "4"], "3", "كلمة مكتبة فيها كام جزء صوتي؟"),
    q("PA_006", "choice", "phonological", "rhyme", 2, "أي كلمتين متشابهتين في آخر الصوت؟", ["نار / جار", "بيت / قلم", "شمس / بحر", "قطة / كتاب"], "نار / جار", "أي كلمتين شبه بعض في آخر الصوت؟"),
  ],
  orthographic: [
    q("OR_001", "choice", "orthographic", "visual_discrimination", 1, "أي حرف مختلف عن الباقي؟", ["ب", "ت", "ح", "ث"], "ح"),
    q("OR_002", "choice", "orthographic", "dot_awareness", 1, "هل الكلمتان متشابهتان أم مختلفتان؟ بيت / نيت", ["متشابهتان", "مختلفتان"], "مختلفتان"),
    q("OR_003", "choice", "orthographic", "harakat", 2, "اختار الشكل الذي يناسب الصوت: بِت", ["بَت", "بِت", "بُت", "بْت"], "بِت", "بِت. اختار الكتابة الصح."),
    q("OR_004", "choice", "orthographic", "positional_form", 2, "أي صيغة تمثل حرف ع في وسط الكلمة؟", ["ع", "ـعـ", "ـع", "عـ"], "ـعـ"),
    {
      id: "OR_005",
      type: "multiSelect",
      domain: "orthographic",
      skill: "visual_scanning",
      difficulty: 2,
      prompt: "اختار كل حرف ب فقط من الشبكة.",
      grid: ["ب", "ت", "ب", "ث", "ن", "ب", "ي", "ت", "ب"],
      correctIndexes: [0, 2, 5, 8],
      helper: "اضغط على كل الخانات التي فيها ب فقط.",
    },
    {
      id: "OR_006",
      type: "visualMemory",
      domain: "orthographic",
      skill: "orthographic_memory",
      difficulty: 3,
      prompt: "احفظ الكلمة التي ستظهر، ثم اختارها بعد أن تختفي.",
      stimulus: "شمس",
      exposureMs: 2500,
      choices: ["شمس", "سمش", "شمسـ", "سش"],
      correctAnswer: "شمس",
    },
  ],
  rapidNaming: [
    timed("RN_001", "object_naming", "سمِّ العناصر بسرعة من اليمين لليسار، ثم اضغط تم.", ["🍎 تفاحة", "🐱 قطة", "☀️ شمس", "🚪 باب", "⚽ كرة", "🐟 سمك", "📘 كتاب", "🌙 قمر"], 8, 9000),
    timed("RN_002", "letter_naming", "سمِّ الحروف بسرعة من اليمين لليسار، ثم اضغط تم.", ["ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز"], 10, 9500),
    timed("RN_003", "symbol_naming", "سمِّ الأرقام والألوان بسرعة، ثم اضغط تم.", ["١", "أحمر", "٣", "أزرق", "٥", "أخضر", "٢", "أصفر"], 8, 8500),
  ],
  decoding: [
    q("RD_001", "choice", "decoding", "letter_sound", 1, "أي حرف يمثل الصوت ب؟", ["ب", "ت", "ث", "ن"], "ب", "اختار الحرف الذي صوته ب."),
    q("RD_002", "choice", "decoding", "syllable_reading", 1, "أي مقطع يُقرأ: با؟", ["با", "بو", "بي", "بْ"], "با", "با."),
    q("RD_003", "choice", "decoding", "nonword_decoding", 3, "أي نطق يناسب الكلمة غير الحقيقية: دَبُت؟", ["دَ - بُت", "دِ - بات", "ذَ - بُت", "دَ - بيت"], "دَ - بُت"),
    q("RD_004", "choice", "decoding", "lexical_decision", 2, "هل لَمَت كلمة حقيقية شائعة أم كلمة تدريبية غير حقيقية؟", ["كلمة حقيقية شائعة", "كلمة تدريبية غير حقيقية"], "كلمة تدريبية غير حقيقية"),
    q("RD_005", "choice", "decoding", "sentence_comprehension", 2, "اقرأ: جلس عمر تحت الشجرة. أين جلس عمر؟", ["تحت الشجرة", "في المدرسة", "على البحر", "داخل البيت"], "تحت الشجرة"),
    {
      id: "RD_006",
      type: "timedReading",
      domain: "decoding",
      skill: "oral_reading_fluency",
      difficulty: 3,
      prompt: "اقرأ النص بصوت واضح، ثم اضغط تم وأجب.",
      text: "ذهب سامي إلى الحديقة. رأى قطة صغيرة تحت الشجرة.",
      question: "ماذا رأى سامي؟",
      choices: ["قطة صغيرة", "كرة كبيرة", "كتاب جديد", "سمكة"],
      correctAnswer: "قطة صغيرة",
      idealTimeMs: 13000,
    },
  ],
  spellingMemory: [
    textq("SM_001", "simple_spelling", "اكتب الكلمة التي تسمعها: بيت", "بيت", "بيت."),
    textq("SM_002", "word_spelling", "اكتب الكلمة التي تسمعها: مدرسة", "مدرسة", "مدرسة."),
    {
      id: "SM_003",
      type: "memorySpan",
      domain: "spellingMemory",
      skill: "auditory_memory",
      difficulty: 2,
      prompt: "احفظ الكلمات بالترتيب، ثم اكتبها بعد أن تختفي.",
      sequence: ["قلم", "باب", "قمر"],
      exposureMs: 4000,
      placeholder: "مثال: قلم باب قمر",
    },
    {
      id: "SM_004",
      type: "orderedTap",
      domain: "spellingMemory",
      skill: "sound_order_memory",
      difficulty: 2,
      prompt: "اضغط الأصوات بالترتيب: س ثم م ثم ك.",
      spokenPrompt: "س، م، ك. اضغطهم بنفس الترتيب.",
      choices: ["م", "ك", "ب", "س"],
      correctSequence: ["س", "م", "ك"],
    },
    {
      id: "SM_005",
      type: "memorySpan",
      domain: "spellingMemory",
      skill: "digit_span",
      difficulty: 3,
      prompt: "احفظ الأرقام بالترتيب، ثم اكتبها بعد أن تختفي.",
      sequence: ["٣", "٧", "٢", "٥"],
      exposureMs: 3500,
      placeholder: "مثال: ٣ ٧ ٢ ٥",
    },
    q("SM_006", "choice", "spellingMemory", "confusable_spelling", 3, "اختار الكتابة الصحيحة لكلمة: ذهب", ["دهب", "ذهب", "زهب", "ظهب"], "ذهب", "ذهب."),
  ],
};

function q(id, type, domain, skill, difficulty, prompt, choices, correctAnswer, spokenPrompt = "") {
  return { id, type, domain, skill, difficulty, prompt, choices, correctAnswer, spokenPrompt };
}

function textq(id, skill, prompt, correctAnswer, spokenPrompt) {
  return { id, type: "textInput", domain: "spellingMemory", skill, difficulty: 2, prompt, correctAnswer, spokenPrompt, placeholder: "اكتب هنا" };
}

function timed(id, skill, prompt, stimuli, expectedCount, idealTimeMs) {
  return { id, type: "timedNaming", domain: "rapidNaming", skill, difficulty: 2, prompt, stimuli, expectedCount, idealTimeMs };
}

function speak(text) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ar-EG";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function normalizeArabic(value) {
  return String(value || "")
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/ـ/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");
}

function levenshtein(a, b) {
  const s = normalizeArabic(a).replace(/\s/g, "");
  const t = normalizeArabic(b).replace(/\s/g, "");
  const dp = Array.from({ length: s.length + 1 }, () => Array(t.length + 1).fill(0));
  for (let i = 0; i <= s.length; i++) dp[i][0] = i;
  for (let j = 0; j <= t.length; j++) dp[0][j] = j;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[s.length][t.length];
}

function similarityScore(answer, correct) {
  const a = normalizeArabic(answer).replace(/\s/g, "");
  const b = normalizeArabic(correct).replace(/\s/g, "");
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, Math.round((1 - levenshtein(a, b) / maxLen) * 100));
}

function avg(values) {
  const valid = values.filter((x) => Number.isFinite(x));
  if (!valid.length) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function level(score) {
  if (score >= 80) return ["قوي", "good"];
  if (score >= 60) return ["متوسط", "mid"];
  if (score >= 40) return ["يحتاج دعم", "warn"];
  return ["مرتفع الخطورة", "bad"];
}

function computeResults(responses, safety) {
  const domains = ["spokenLanguage", "phonological", "orthographic", "rapidNaming", "decoding", "spellingMemory"];
  const domainScores = Object.fromEntries(domains.map((d) => [d, avg(responses.filter((r) => r.domain === d).map((r) => r.score))]));
  const skills = {};
  responses.forEach((r) => {
    skills[r.skill] ||= [];
    skills[r.skill].push(r.score);
  });
  const skillScores = Object.fromEntries(Object.entries(skills).map(([k, v]) => [k, avg(v)]));
  const core = [domainScores.phonological, domainScores.orthographic, domainScores.rapidNaming, domainScores.decoding, domainScores.spellingMemory].filter((x) => x !== null);
  const overall = avg(core) ?? 0;
  const weakDomains = Object.entries(domainScores).filter(([d, s]) => d !== "spokenLanguage" && s !== null && s < 60).map(([d]) => d);
  const flags = [];
  if (safety.hearingIssue) flags.push("ملاحظة سمعية قد تؤثر على الأسئلة الصوتية.");
  if (safety.visionIssue) flags.push("ملاحظة بصرية قد تؤثر على أسئلة الحروف والشكل.");
  if (safety.tiredToday) flags.push("الطفل مرهق اليوم؛ يفضل إعادة التقييم لاحقًا للتأكيد.");
  if (safety.attentionIssue) flags.push("تشتت الانتباه قد يؤثر على الوقت والدقة.");
  if (!safety.understandsTask) flags.push("فهم التعليمات غير مؤكد؛ لا تعتمد على النتيجة وحدها.");
  let risk = "منخفض";
  if (overall < 45 || weakDomains.length >= 3) risk = "مرتفع";
  else if (overall < 65 || weakDomains.length >= 2) risk = "متوسط";
  return { domainScores, skillScores, overall, weakDomains, flags, risk };
}

function therapyPlan(scores) {
  const names = {
    phonological: ["مسار الوعي الصوتي", "ألعاب بداية الصوت، الدمج، الحذف، وعد المقاطع"],
    orthographic: ["مسار الحروف المتشابهة", "ألعاب النقاط، الحركات، شكل الحرف، والبحث البصري"],
    rapidNaming: ["مسار سرعة التسمية", "ألعاب تسمية الأشياء والحروف والأرقام بسرعة"],
    decoding: ["مسار القراءة", "حرف-صوت، مقاطع، كلمات غير حقيقية، كلمات حقيقية، ثم جمل"],
    spellingMemory: ["مسار الإملاء والذاكرة", "إملاء، ترتيب أصوات، ذاكرة كلمات وأرقام"],
  };
  const plan = Object.entries(names)
    .filter(([domain]) => (scores[domain] ?? 100) < 60)
    .map(([domain, [title, game]]) => ({ domain, title, game, level: scores[domain] < 40 ? 1 : 2 }));
  return plan.length ? plan : [{ domain: "balanced", title: "مسار متوازن", game: "ابدأ بمستوى متوسط في كل الألعاب وأعد التقييم بعد 10 جلسات", level: 3 }];
}

export default function App() {
  const [step, setStep] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [intake, setIntake] = useState(intakeDefaults);
  const [safety, setSafety] = useState(safetyDefaults);
  const [responses, setResponses] = useState([]);
  const current = flow[step];

  function next() {
    setQuestionIndex(0);
    setStep((s) => Math.min(s + 1, flow.length - 1));
    scrollToTop();
  }

  function back() {
    setQuestionIndex(0);
    setStep((s) => Math.max(s - 1, 0));
    scrollToTop();
  }

  function scrollToTop() {
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 20);
  }

  function answer(response) {
    const qs = questions[current.id];
    setResponses((prev) => [...prev, response]);

    // Do NOT scroll to the top after every answer.
    // Only move naturally to the next question inside the same module.
    if (questionIndex + 1 < qs.length) {
      setQuestionIndex((i) => i + 1);
      return;
    }

    // Scroll only when moving to a new major step/module.
    next();
  }

  function restart() {
    setStep(0);
    setQuestionIndex(0);
    setResponses([]);
    setSafety(safetyDefaults);
    scrollToTop();
  }

  return (
    <div className="app" dir="rtl">
      <style>{css}</style>
      <Header step={step} responses={responses} />
      <div className="layout">
        <main>
          {current.kind === "onboarding" && <Onboarding intake={intake} setIntake={setIntake} onNext={next} />}
          {current.kind === "safety" && <Safety safety={safety} setSafety={setSafety} onNext={next} onBack={back} />}
          {current.kind === "module" && <Module id={current.id} index={questionIndex} onAnswer={answer} onBack={back} />}
          {current.kind === "results" && <Results intake={intake} safety={safety} responses={responses} onRestart={restart} />}
        </main>
        <Timeline step={step} />
      </div>
    </div>
  );
}

function Header({ step, responses }) {
  return (
    <header className="hero">
      <div className="logo">ض</div>
      <div className="heroText">
        <p>Arabic / Egyptian Dyslexia Screening Prototype</p>
        <h1>التقييم المبدئي لصعوبات القراءة</h1>
        <span>فرز مبدئي، ملف مهارات، وتوجيه تلقائي لمسار الألعاب العلاجية.</span>
      </div>
      <div className="heroBadges">
        <Badge>الخطوة {step + 1} من {flow.length}</Badge>
        <Badge>{responses.length} إجابة</Badge>
        <Badge>ليس تشخيصًا نهائيًا</Badge>
      </div>
      <Progress value={((step + 1) / flow.length) * 100} />
    </header>
  );
}

function Timeline({ step }) {
  return (
    <aside className="side">
      <h3>مسار التقييم</h3>
      {flow.map((s, i) => (
        <div key={s.id} className={`step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
          <b>{i < step ? "✓" : i + 1}</b>
          <span>{s.title}</span>
        </div>
      ))}
    </aside>
  );
}

function Onboarding({ intake, setIntake, onNext }) {
  const ok = intake.childName.trim() && intake.age;
  return (
    <section className="card" dir="rtl">
      <Title tag="01" title="بيانات البداية" text="املأ بيانات الطفل والمقيم. هذه البيانات تساعد في تفسير النتيجة حسب العمر واللغة." />
      <div className="grid2">
        <Field label="اسم الطفل" value={intake.childName} onChange={(v) => setIntake({ ...intake, childName: v })} placeholder="مثال: آدم" />
        <Field label="العمر" type="number" value={intake.age} onChange={(v) => setIntake({ ...intake, age: v })} placeholder="مثال: 8" />
        <Field label="الصف الدراسي" value={intake.grade} onChange={(v) => setIntake({ ...intake, grade: v })} placeholder="مثال: الصف الثالث" />
        <Field label="اسم المقيم" value={intake.assessorName} onChange={(v) => setIntake({ ...intake, assessorName: v })} placeholder="ولي الأمر أو المعالج" />
        <Select label="صفة المقيم" value={intake.assessorRole} onChange={(v) => setIntake({ ...intake, assessorRole: v })} options={[['parent','ولي أمر'],['therapist','أخصائي / معالج'],['teacher','مدرس'],['researcher','باحث']]} />
        <Select label="التعرض للهجة المصرية" value={intake.dialectExposure} onChange={(v) => setIntake({ ...intake, dialectExposure: v })} options={[['high','مرتفع'],['medium','متوسط'],['low','ضعيف']]} />
        <Select label="التعرض للعربية الفصحى" value={intake.msaExposure} onChange={(v) => setIntake({ ...intake, msaExposure: v })} options={[['high','مرتفع'],['medium','متوسط'],['low','ضعيف']]} />
        <Select label="تشخيص سابق؟" value={intake.previousDiagnosis} onChange={(v) => setIntake({ ...intake, previousDiagnosis: v })} options={[['unknown','غير معروف'],['yes','نعم'],['no','لا']]} />
      </div>
      <label className="label">ملاحظات<textarea value={intake.notes} onChange={(e) => setIntake({ ...intake, notes: e.target.value })} placeholder="مثال: الطفل متوتر اليوم / يلبس نظارة" /></label>
      <Notice>هذا الاختبار للفرز وتحديد المسار التدريبي فقط، ولا يغني عن التشخيص الكامل بواسطة مختص.</Notice>
      <button className="primary" disabled={!ok} onClick={onNext}>ابدأ التقييم</button>
    </section>
  );
}

function Safety({ safety, setSafety, onNext, onBack }) {
  const items = [
    ["hearingIssue", "يوجد ضعف سمع أو صعوبة في سماع التعليمات"],
    ["visionIssue", "يوجد ضعف نظر أو صعوبة في رؤية الحروف"],
    ["tiredToday", "الطفل مرهق أو نعسان أو متوتر اليوم"],
    ["attentionIssue", "يوجد تشتت انتباه واضح أثناء الجلسة"],
  ];
  return (
    <section className="card" dir="rtl">
      <Title tag="فحص" title="تنبيه السمع والنظر والانتباه" text="هذه الملاحظات لا تمنع الاختبار، لكنها تجعل تفسير النتيجة أكثر حذرًا." />
      <div className="checks">
        {items.map(([key, text]) => <Check key={key} checked={safety[key]} onChange={(v) => setSafety({ ...safety, [key]: v })}>{text}</Check>)}
        <Check checked={safety.understandsTask} onChange={(v) => setSafety({ ...safety, understandsTask: v })}>الطفل يبدو فاهمًا لفكرة الاختيار والضغط على الإجابة</Check>
      </div>
      <Notice warn>في النسخة الطبية النهائية، يفضل إيقاف الاختبار إذا كانت مشكلة السمع أو النظر شديدة وتحويل الطفل لفحص مناسب.</Notice>
      <div className="row"><button className="secondary" onClick={onBack}>رجوع</button><button className="primary" onClick={onNext}>متابعة</button></div>
    </section>
  );
}

function Module({ id, index, onAnswer, onBack }) {
  const meta = moduleMeta[id];
  const item = questions[id][index];
  return (
    <section className="card" dir="rtl">
      <div className="moduleHead">
        <div>
          <Badge>{meta.domain}</Badge>
          <h2>{meta.title}</h2>
          {index === 0 && <p>{meta.intro}</p>}
        </div>
        <strong>{index + 1}/{questions[id].length}</strong>
      </div>
      <Progress value={(index / questions[id].length) * 100} />
      <Question item={item} onAnswer={onAnswer} />
      <button className="link" onClick={onBack}>رجوع للخطوة السابقة</button>
    </section>
  );
}

function Question({ item, onAnswer }) {
  const [selected, setSelected] = useState("");
  const [multi, setMulti] = useState([]);
  const [sequence, setSequence] = useState([]);
  const [text, setText] = useState("");
  const [start] = useState(Date.now());
  const [timerStart, setTimerStart] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [errors, setErrors] = useState("0");
  const [showStimulus, setShowStimulus] = useState(false);
  const [stimulusSeen, setStimulusSeen] = useState(false);
  const [readingDone, setReadingDone] = useState(false);

  useEffect(() => {
    if (!timerStart) return;
    const id = setInterval(() => setElapsed(Date.now() - timerStart), 120);
    return () => clearInterval(id);
  }, [timerStart]);

  function base(score, answer, extra = {}) {
    onAnswer({
      itemId: item.id,
      domain: item.domain,
      skill: item.skill,
      type: item.type,
      difficulty: item.difficulty,
      prompt: item.prompt,
      selectedAnswer: answer,
      correctAnswer: item.correctAnswer || item.correctSequence || item.sequence || item.correctIndexes || null,
      score: clamp(score),
      isCorrect: score >= 70,
      responseTimeMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      ...extra,
    });
  }

  function submitChoice() {
    base(normalizeArabic(selected) === normalizeArabic(item.correctAnswer) ? 100 : 0, selected);
  }

  function submitText() {
    base(similarityScore(text, item.correctAnswer), text);
  }

  function submitMulti() {
    const correct = new Set(item.correctIndexes);
    const picked = new Set(multi);
    let points = 0;
    item.grid.forEach((_, i) => { if (correct.has(i) === picked.has(i)) points += 1; });
    base((points / item.grid.length) * 100, multi);
  }

  function submitSequence() {
    let points = 0;
    item.correctSequence.forEach((x, i) => { if (normalizeArabic(sequence[i]) === normalizeArabic(x)) points += 1; });
    base((points / item.correctSequence.length) * 100 - Math.abs(sequence.length - item.correctSequence.length) * 15, sequence);
  }

  function reveal() {
    setShowStimulus(true);
    setStimulusSeen(true);
    setTimeout(() => setShowStimulus(false), item.exposureMs || 3000);
  }

  function submitMemory() {
    const typed = normalizeArabic(text).split(/[\s،,]+/).filter(Boolean);
    let points = 0;
    item.sequence.forEach((x, i) => { if (normalizeArabic(typed[i]) === normalizeArabic(x)) points += 1; });
    base((points / item.sequence.length) * 100 - Math.max(0, typed.length - item.sequence.length) * 10, typed);
  }

  function submitTimedNaming() {
    const errorCount = Number(errors || 0);
    const used = elapsed || Date.now() - start;
    const accuracy = ((item.expectedCount - errorCount) / item.expectedCount) * 100;
    const speed = Math.min(100, (item.idealTimeMs / Math.max(1, used)) * 100);
    base(accuracy * 0.65 + speed * 0.35, `errors:${errorCount}`, { elapsedMs: used, errorCount });
  }

  function submitTimedReading() {
    const used = elapsed || Date.now() - start;
    const correct = normalizeArabic(selected) === normalizeArabic(item.correctAnswer);
    const speed = Math.min(100, (item.idealTimeMs / Math.max(1, used)) * 100);
    base(correct ? 70 + speed * 0.3 : speed * 0.25, selected, { elapsedMs: used });
  }

  return (
    <div className="question">
      <div className="qTop"><Badge>{item.skill}</Badge><Badge>صعوبة {item.difficulty}</Badge>{item.spokenPrompt && <button className="audio" onClick={() => speak(item.spokenPrompt)}>🔊 اسمع</button>}</div>
      <h3>{item.prompt}</h3>
      {item.helper && <p className="muted">{item.helper}</p>}

      {item.type === "choice" && <Choice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitChoice} />}

      {item.type === "textInput" && <><input className="answer" value={text} onChange={(e) => setText(e.target.value)} placeholder={item.placeholder || "اكتب هنا"} /><button className="primary" disabled={!text.trim()} onClick={submitText}>تأكيد</button></>}

      {item.type === "multiSelect" && <><div className="letters">{item.grid.map((x, i) => <button key={i} className={multi.includes(i) ? "selected" : ""} onClick={() => setMulti((p) => p.includes(i) ? p.filter((z) => z !== i) : [...p, i])}>{x}</button>)}</div><button className="primary" disabled={!multi.length} onClick={submitMulti}>تأكيد الاختيارات</button></>}

      {item.type === "orderedTap" && <><div className="sequence">اختيارك: <b>{sequence.length ? sequence.join(" ← ") : "لا يوجد"}</b></div><div className="choices big">{item.choices.map((c) => <button key={c} onClick={() => setSequence((p) => [...p, c])}>{c}</button>)}</div><div className="row"><button className="secondary" onClick={() => setSequence([])}>مسح</button><button className="primary" disabled={!sequence.length} onClick={submitSequence}>تأكيد</button></div></>}

      {item.type === "visualMemory" && <><div className="memory">{!stimulusSeen && <button className="secondary" onClick={reveal}>إظهار الكلمة</button>}{showStimulus && <strong>{item.stimulus}</strong>}{stimulusSeen && !showStimulus && <span>اختار الكلمة التي ظهرت</span>}</div>{stimulusSeen && !showStimulus && <Choice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitChoice} />}</>}

      {item.type === "memorySpan" && <><div className="memory">{!stimulusSeen && <button className="secondary" onClick={reveal}>عرض التسلسل</button>}{showStimulus && <strong>{item.sequence.join("  •  ")}</strong>}{stimulusSeen && !showStimulus && <span>اكتب ما تتذكره بالترتيب</span>}</div><input className="answer" disabled={!stimulusSeen || showStimulus} value={text} onChange={(e) => setText(e.target.value)} placeholder={item.placeholder || "اكتب هنا"} /><button className="primary" disabled={!stimulusSeen || showStimulus || !text.trim()} onClick={submitMemory}>تأكيد</button></>}

      {item.type === "timedNaming" && <><Timer elapsed={elapsed} started={!!timerStart} onStart={() => setTimerStart(Date.now())} onStop={() => setTimerStart(null)} /><div className="naming">{item.stimuli.map((s, i) => <div key={i}>{s}</div>)}</div><label className="label small">عدد الأخطاء أو الترددات<select value={errors} onChange={(e) => setErrors(e.target.value)}><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4 أو أكثر</option></select></label><button className="primary" disabled={!timerStart && elapsed === 0} onClick={submitTimedNaming}>تم التسمية</button></>}

      {item.type === "timedReading" && <><div className="reading">{item.text}</div><Timer elapsed={elapsed} started={!!timerStart} onStart={() => setTimerStart(Date.now())} onStop={() => setReadingDone(true)} stopText="انتهيت من القراءة" />{readingDone && <><h4>{item.question}</h4><Choice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitTimedReading} /></>}</>}
    </div>
  );
}

function Choice({ choices, selected, setSelected, onSubmit }) {
  return <><div className="choices">{choices.map((c) => <button key={c} className={selected === c ? "selected" : ""} onClick={() => setSelected(c)}>{c}</button>)}</div><button className="primary" disabled={!selected} onClick={onSubmit}>تأكيد الإجابة</button></>;
}

function Timer({ elapsed, started, onStart, onStop, stopText = "إيقاف مؤقت" }) {
  return <div className="timer"><div><span>الوقت</span><b>{(elapsed / 1000).toFixed(1)}s</b></div>{!started ? <button className="primary" onClick={onStart}>ابدأ المؤقت</button> : <button className="secondary" onClick={onStop}>{stopText}</button>}</div>;
}

function Results({ intake, safety, responses, onRestart }) {
  const results = useMemo(() => computeResults(responses, safety), [responses, safety]);
  const plan = therapyPlan(results.domainScores);
  const [copied, setCopied] = useState(false);
  const labels = { spokenLanguage: "فهم التعليمات", phonological: "الوعي الصوتي", orthographic: "الحروف والأشكال", rapidNaming: "سرعة التسمية", decoding: "القراءة", spellingMemory: "الإملاء والذاكرة" };
  const payload = { assessmentType: "arabic_egyptian_dyslexia_pretest_v2", createdAt: new Date().toISOString(), intake, safety, ...results, therapyPlan: plan, responses, note: "Screening only, not standalone diagnosis." };
  async function copy() { await navigator.clipboard?.writeText(JSON.stringify(payload, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1600); }
  return (
    <section className="card" dir="rtl">
      <div className="resultHead"><div><Badge>مستوى الخطورة: {results.risk}</Badge><h2>ملف التقييم: {intake.childName || "بدون اسم"}</h2><p>الدرجة العامة مبنية على المجالات القرائية الأساسية، مع فصل فهم التعليمات عن القراءة.</p></div><div className="overall"><b>{results.overall}</b><span>/100</span></div></div>
      {results.flags.length > 0 && <Notice warn><b>ملاحظات تفسيرية:</b><ul>{results.flags.map((f) => <li key={f}>{f}</li>)}</ul></Notice>}
      <div className="scores">{Object.entries(results.domainScores).map(([d, s]) => { const [txt, cls] = level(s ?? 0); return <div className="score" key={d}><div><h3>{labels[d]}</h3><span className={cls}>{s === null ? "غير مكتمل" : txt}</span></div><strong>{s ?? "—"}</strong><Progress value={s ?? 0} /></div>; })}</div>
      <h3>المسار العلاجي المقترح</h3>
      <div className="plans">{plan.map((p, i) => <div className="plan" key={p.domain}><b>{i + 1}</b><div><h4>{p.title}</h4><p>{p.game}</p></div><Badge>مستوى {p.level}</Badge></div>)}</div>
      <h3>أضعف المهارات التفصيلية</h3>
      <div className="chips">{Object.entries(results.skillScores).sort((a,b)=>a[1]-b[1]).slice(0,8).map(([k,v])=><span key={k}>{k}: {v}</span>)}</div>
      <details className="json"><summary>عرض JSON للتخزين في قاعدة البيانات</summary><pre>{JSON.stringify(payload, null, 2)}</pre></details>
      <div className="row"><button className="secondary" onClick={onRestart}>إعادة الاختبار</button><button className="primary" onClick={copy}>{copied ? "تم النسخ" : "نسخ JSON"}</button></div>
    </section>
  );
}

function Title({ tag, title, text }) { return <div className="title"><Badge>{tag}</Badge><div><h2>{title}</h2><p>{text}</p></div></div>; }
function Badge({ children }) { return <span className="badge">{children}</span>; }
function Notice({ children, warn }) { return <div className={`notice ${warn ? "warn" : ""}`}>{children}</div>; }
function Progress({ value }) { return <div className="progress"><i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>; }
function Field({ label, value, onChange, placeholder, type = "text" }) { return <label className="label">{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>; }
function Select({ label, value, onChange, options }) { return <label className="label">{label}<select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v,t]) => <option key={v} value={v}>{t}</option>)}</select></label>; }
function Check({ checked, onChange, children }) { return <label className="check"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span>{children}</span></label>; }

const css = `
*{box-sizing:border-box}html,body,#root{margin:0;min-height:100%;width:100%;overflow-x:hidden}body{background:#eef3f8;color:#172033;font-family:Inter,Tahoma,Arial,sans-serif}#root{display:block}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}.app{width:100%;max-width:1220px;margin-left:auto;margin-right:auto;padding:24px;overflow-x:hidden}.hero{background:linear-gradient(135deg,#0f172a,#1d4ed8);color:white;border-radius:30px;padding:26px;box-shadow:0 24px 70px #0f172a22;margin-bottom:22px}.logo{width:62px;height:62px;border-radius:22px;background:#ffffff22;display:grid;place-items:center;font-size:34px;font-weight:900;float:right;margin-left:16px;flex:0 0 auto}.heroText p{margin:0 0 6px;color:#bfdbfe;font-size:13px;text-transform:uppercase;letter-spacing:.04em}.hero h1{margin:0;font-size:clamp(28px,4vw,46px)}.heroText span{display:block;margin-top:8px;color:#dbeafe}.heroBadges{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0 14px}.layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:22px;align-items:start;width:100%;direction:ltr}main{min-width:0;direction:rtl}.side{direction:rtl}.side{position:sticky;top:20px;background:#ffffffcc;border:1px solid #dbe4ef;border-radius:26px;padding:18px;box-shadow:0 18px 55px #0f172a12}.side h3{margin:0 0 14px}.step{display:flex;align-items:center;gap:10px;padding:10px;border-radius:16px;color:#64748b}.step b{width:28px;height:28px;border-radius:50%;background:#e2e8f0;display:grid;place-items:center;font-size:12px}.step.active{background:#eff6ff;color:#1d4ed8;font-weight:900}.step.active b{background:#2563eb;color:white}.step.done{color:#0f766e}.step.done b{background:#ccfbf1}.card{background:#fffffff0;border:1px solid #dbe4ef;border-radius:30px;padding:26px;box-shadow:0 24px 70px #0f172a18;animation:fade .25s ease both}@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.badge{display:inline-flex;align-items:center;padding:7px 11px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-weight:900;font-size:12px}.progress{height:10px;background:#e2e8f0;border-radius:999px;overflow:hidden}.progress i{display:block;height:100%;background:linear-gradient(90deg,#38bdf8,#2563eb,#7c3aed);transition:.3s}.title,.moduleHead,.resultHead{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:22px}.title{justify-content:flex-start}.title h2,.moduleHead h2,.resultHead h2{margin:6px 0 6px;font-size:28px}.title p,.moduleHead p,.resultHead p,.muted{color:#64748b;line-height:1.8;margin:0}.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.label{display:grid;gap:8px;font-weight:900;color:#334155;margin-bottom:14px}input,select,textarea{width:100%;border:1px solid #dbe4ef;background:white;border-radius:16px;padding:13px;outline:0}input:focus,select:focus,textarea:focus{border-color:#60a5fa;box-shadow:0 0 0 4px #dbeafe}textarea{min-height:100px;resize:vertical}.notice{background:#f8fafc;border:1px solid #dbe4ef;border-radius:20px;padding:14px 16px;margin:18px 0;line-height:1.8}.notice.warn{background:#fff7ed;border-color:#fed7aa;color:#9a3412}.primary,.secondary,.link,.audio{border:0;border-radius:16px;padding:13px 18px;font-weight:900}.primary{background:#2563eb;color:white;box-shadow:0 12px 30px #2563eb33}.primary:hover:not(:disabled){background:#1d4ed8}.secondary{background:#eef2ff;color:#3730a3}.link{background:transparent;color:#64748b;margin-top:18px}.audio{background:#ecfeff;color:#0e7490;border:1px solid #a5f3fc}.row{display:flex;gap:12px;flex-wrap:wrap}.checks{display:grid;gap:12px}.check{display:flex;gap:12px;align-items:center;padding:14px;border:1px solid #dbe4ef;border-radius:18px;background:white;font-weight:900}.check input{width:20px;height:20px}.moduleHead strong{width:84px;height:84px;border-radius:28px;background:#eff6ff;color:#1d4ed8;display:grid;place-items:center;font-size:25px}.question{margin-top:22px;background:#fbfdff;border:1px solid #dbe4ef;border-radius:26px;padding:22px}.qTop{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:18px}.question h3{font-size:23px;margin:0 0 10px}.choices{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:18px 0}.choices.big{grid-template-columns:repeat(4,1fr)}.choices button,.letters button{min-height:58px;border:1px solid #dbe4ef;border-radius:18px;background:white;font-weight:900;font-size:18px;color:#172033}.choices button:hover,.letters button:hover{background:#eff6ff;border-color:#93c5fd}.choices .selected,.letters .selected{background:#dbeafe;border-color:#2563eb;color:#1d4ed8;box-shadow:inset 0 0 0 2px #2563eb}.letters{display:grid;grid-template-columns:repeat(3,90px);gap:12px;justify-content:center;margin:20px 0}.letters button{height:78px;font-size:34px}.sequence{padding:14px;border-radius:18px;background:#f8fafc;border:1px dashed #cbd5e1;margin:16px 0}.answer{margin:18px 0;font-size:22px;font-weight:900;text-align:right}.memory{min-height:112px;border:1px dashed #cbd5e1;border-radius:24px;background:#f8fafc;display:grid;place-items:center;margin:18px 0;padding:18px}.memory strong{font-size:34px;color:#1d4ed8}.timer{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:16px;border-radius:22px;background:#f8fafc;border:1px solid #dbe4ef;margin:18px 0}.timer span{color:#64748b;font-size:12px;font-weight:900}.timer b{display:block;font-size:32px}.naming{direction:rtl;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.naming div{background:white;border:1px solid #dbe4ef;border-radius:20px;min-height:74px;display:grid;place-items:center;font-size:21px;font-weight:900}.reading{font-size:28px;line-height:2;font-weight:900;background:white;border:1px solid #dbe4ef;border-radius:24px;padding:22px;margin:18px 0}.resultHead{align-items:center;border-bottom:1px solid #dbe4ef;padding-bottom:18px}.overall{width:130px;height:130px;border-radius:40px;background:linear-gradient(135deg,#dbeafe,#dcfce7);display:grid;place-items:center}.overall b{font-size:48px}.overall span{color:#64748b}.scores{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:22px 0}.score{background:white;border:1px solid #dbe4ef;border-radius:24px;padding:18px}.score>div{display:flex;justify-content:space-between;align-items:center;gap:10px}.score h3{font-size:17px;margin:0}.score strong{font-size:44px;display:block;margin:10px 0}.good,.mid,.warn,.bad{border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900;white-space:nowrap}.good{background:#dcfce7;color:#15803d}.mid{background:#fef9c3;color:#a16207}.warn{background:#ffedd5;color:#c2410c}.bad{background:#ffe4e6;color:#be123c}.plans{display:grid;gap:12px}.plan{display:grid;grid-template-columns:42px 1fr auto;gap:14px;align-items:center;border:1px solid #dbe4ef;border-radius:22px;padding:16px;background:white}.plan>b{width:42px;height:42px;border-radius:16px;background:#eff6ff;color:#1d4ed8;display:grid;place-items:center}.plan h4{margin:0 0 5px}.plan p{margin:0;color:#334155}.chips{display:flex;flex-wrap:wrap;gap:10px}.chips span{background:#f1f5f9;border:1px solid #dbe4ef;border-radius:999px;padding:9px 12px;font-weight:800;font-size:13px}.json{margin:18px 0;border:1px solid #dbe4ef;border-radius:20px;padding:14px;background:#0f172a;color:white}.json pre{direction:ltr;text-align:left;overflow:auto;max-height:360px;color:#dbeafe;font-size:12px}@media(max-width:940px){.layout{grid-template-columns:1fr;direction:rtl}.side{position:static}.grid2,.scores,.choices{grid-template-columns:1fr}.choices.big{grid-template-columns:repeat(2,1fr)}.naming{grid-template-columns:repeat(2,1fr)}.title,.moduleHead,.resultHead{flex-direction:column}.plan{grid-template-columns:1fr}}@media(max-width:560px){.app{padding:14px}.hero,.card{padding:18px;border-radius:24px}.letters{grid-template-columns:repeat(3,1fr)}.choices.big{grid-template-columns:1fr}}
`;
