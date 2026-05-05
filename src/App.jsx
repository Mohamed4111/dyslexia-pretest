import React, { useEffect, useMemo, useState } from "react";

const ORANGE = "#f97316";

const intakeDefaults = {
  childName: "",
  age: "",
  grade: "",
  assessorRole: "parent",
  familyHistory: "unknown",
  avoidsReading: "unknown",
  spellingStruggle: "unknown",
  slowReading: "unknown",
};

const safetyDefaults = {
  hearingIssue: false,
  visionIssue: false,
  tiredToday: false,
  attentionIssue: false,
  understandsTask: true,
};

const pics = {
  cat: { label: "قطة", emoji: "🐱", image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80" },
  dog: { label: "كلب", emoji: "🐶", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80" },
  ball: { label: "كرة", emoji: "⚽", image: "https://images.unsplash.com/photo-1552318965-6e6be7484ada?auto=format&fit=crop&w=600&q=80" },
  house: { label: "بيت", emoji: "🏠", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80" },
  pen: { label: "قلم", emoji: "✏️", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80" },
  sun: { label: "شمس", emoji: "☀️", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80" },
  fire: { label: "نار", emoji: "🔥", image: "https://images.unsplash.com/photo-1523861751938-121b5323b48b?auto=format&fit=crop&w=600&q=80" },
  moon: { label: "قمر", emoji: "🌙", image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=600&q=80" },
  book: { label: "كتاب", emoji: "📘", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80" },
  fish: { label: "سمك", emoji: "🐟", image: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&w=600&q=80" },
  door: { label: "باب", emoji: "🚪", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80" },
  school: { label: "مدرسة", emoji: "🏫", image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80" },
  tree: { label: "شجرة", emoji: "🌳", image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80" },
  child: { label: "ولد", emoji: "🧒", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80" },
};

function imgOpt(key, value = pics[key].label) {
  return { value, label: pics[key].label, emoji: pics[key].emoji, image: pics[key].image };
}

const journey = [
  { id: "welcome", kind: "welcome", mission: "بوابة فصيح" },
  { id: "onboarding", kind: "onboarding", mission: "بطاقة البداية" },
  { id: "safety", kind: "safety", mission: "تجهيز الرحلة" },
  { id: "calibration", kind: "mission", mission: "مهمة الاستماع" },
  { id: "phonological", kind: "mission", mission: "مهمة الأصوات" },
  { id: "orthographic", kind: "mission", mission: "مهمة الأشكال" },
  { id: "rapidNaming", kind: "mission", mission: "مهمة السرعة" },
  { id: "decoding", kind: "mission", mission: "مهمة القراءة" },
  { id: "spellingMemory", kind: "mission", mission: "مهمة الذاكرة" },
  { id: "results", kind: "results", mission: "خريطة التدريب" },
];

const missionMeta = {
  calibration: { domain: "spokenLanguage", title: "مهمة الاستماع", intro: "اسمع فصيح واختار الصورة أو الشكل المناسب." },
  phonological: { domain: "phonological", title: "مهمة الأصوات", intro: "هنلعب مع بداية الصوت، آخر الصوت، والقافية." },
  orthographic: { domain: "orthographic", title: "مهمة الأشكال والحروف", intro: "اصطد الحروف والأشكال المتشابهة بدقة." },
  rapidNaming: { domain: "rapidNaming", title: "مهمة السرعة", intro: "سمّي الصور والرموز بسرعة وهدوء." },
  decoding: { domain: "decoding", title: "مهمة القراءة", intro: "اقرأ كلمة أو جملة واختار الصورة المناسبة." },
  spellingMemory: { domain: "spellingMemory", title: "مهمة الذاكرة والإملاء", intro: "ابنِ كلمات وتذكر تسلسلات قصيرة." },
};

const missions = {
  calibration: [
    imageQ("CAL_01", "spokenLanguage", "picture_instruction", "اضغط صورة القطة", [imgOpt("cat"), imgOpt("dog"), imgOpt("ball")], "قطة", "اضغط صورة القطة."),
    imageQ("CAL_02", "spokenLanguage", "word_picture", "اختار صورة الكتاب", [imgOpt("book"), imgOpt("moon"), imgOpt("fish")], "كتاب", "اختار صورة الكتاب."),
    { id: "CAL_03", type: "colorChoice", domain: "spokenLanguage", skill: "color_instruction", difficulty: 1, prompt: "اضغط الدائرة الحمراء", choices: [{ value: "أحمر", color: "#ef4444" }, { value: "أزرق", color: "#3b82f6" }, { value: "أصفر", color: "#eab308" }], correctAnswer: "أحمر", spokenPrompt: "اضغط الدائرة الحمراء." },
    { id: "CAL_04", type: "orderedTap", domain: "spokenLanguage", skill: "two_step_instruction", difficulty: 1, prompt: "اضغط بالترتيب: شمس ثم قمر", choices: ["قمر", "شمس", "كتاب", "قطة"], correctSequence: ["شمس", "قمر"], spokenPrompt: "اضغط شمس وبعدها قمر." },
  ],
  phonological: [
    imageQ("PA_01", "phonological", "initial_sound", "أي صورة تبدأ بصوت ب؟", [imgOpt("house"), imgOpt("sun"), imgOpt("pen"), imgOpt("moon")], "بيت", "أي صورة تبدأ بصوت ب؟"),
    imageQ("PA_02", "phonological", "final_sound", "أي صورة تنتهي بصوت ر؟", [imgOpt("moon"), imgOpt("book"), imgOpt("cat"), imgOpt("fish")], "قمر", "أي صورة آخرها صوت ر؟"),
    choiceQ("PA_03", "phonological", "rhyme", "أي كلمتين متشابهتين في آخر الصوت؟", ["نار / جار", "بيت / قلم", "شمس / بحر", "قطة / كتاب"], "نار / جار", "أي كلمتين شبه بعض في آخر الصوت؟"),
    choiceQ("PA_04", "phonological", "blending", "لو جمعنا: م + و + ز، تكون الكلمة؟", ["موز", "ماء", "نور", "بيت"], "موز", "م، و، ز. لما نجمعهم تبقى إيه؟"),
    choiceQ("PA_05", "phonological", "deletion", "كلمة كتاب بدون صوت ك تصبح؟", ["تاب", "باب", "كتاب", "كاب"], "تاب", "قول كتاب من غير ك."),
    choiceQ("PA_06", "phonological", "sound_count", "كلمة باب فيها كام صوت؟", ["2", "3", "4"], "3", "ب، ا، ب. فيها كام صوت؟"),
  ],
  orthographic: [
    choiceQ("OR_01", "orthographic", "visual_discrimination", "اصطد الحرف المختلف", ["ب", "ت", "ح", "ث"], "ح"),
    choiceQ("OR_02", "orthographic", "dot_awareness", "هل الكلمتان متشابهتان؟ بيت / نيت", ["متشابهتان", "مختلفتان"], "مختلفتان"),
    choiceQ("OR_03", "orthographic", "harakat", "اختار الشكل الذي يناسب الصوت: بِت", ["بَت", "بِت", "بُت", "بْت"], "بِت", "بِت. اختار الكتابة الصح."),
    { id: "OR_04", type: "letterHunt", domain: "orthographic", skill: "visual_scanning", difficulty: 2, prompt: "اصطد كل حرف ب فقط", grid: ["ب", "ت", "ب", "ث", "ن", "ب", "ي", "ت", "ب"], correctIndexes: [0, 2, 5, 8] },
    choiceQ("OR_05", "orthographic", "shape_matching", "اختار الشكل المطابق: ◆", ["◆", "◇", "●", "■"], "◆"),
    { id: "OR_06", type: "visualMemory", domain: "orthographic", skill: "orthographic_memory", difficulty: 3, prompt: "احفظ الكلمة التي ستظهر، ثم اختارها", stimulus: "شمس", choices: ["شمس", "سمش", "شمسـ", "سش"], correctAnswer: "شمس", exposureMs: 2200 },
  ],
  rapidNaming: [
    { id: "RN_01", type: "timedGrid", domain: "rapidNaming", skill: "object_naming", difficulty: 2, prompt: "سمّي الصور بسرعة من اليمين لليسار", items: [imgOpt("cat"), imgOpt("sun"), imgOpt("book"), imgOpt("fish"), imgOpt("ball"), imgOpt("moon"), imgOpt("door"), imgOpt("house")], expectedCount: 8, idealTimeMs: 9000 },
    { id: "RN_02", type: "timedGrid", domain: "rapidNaming", skill: "letter_naming", difficulty: 2, prompt: "سمّي الحروف بسرعة", items: ["ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز"], expectedCount: 10, idealTimeMs: 9000 },
    { id: "RN_03", type: "reactionImage", domain: "rapidNaming", skill: "fast_retrieval", difficulty: 2, prompt: "اختار اسم الصورة بأسرع ما يمكن", image: imgOpt("sun"), choices: ["شمس", "قمر", "كتاب", "قطة"], correctAnswer: "شمس", idealTimeMs: 1800 },
  ],
  decoding: [
    imageQ("RD_01", "decoding", "word_to_picture", "اقرأ الكلمة واختار الصورة: قمر", [imgOpt("moon"), imgOpt("sun"), imgOpt("cat"), imgOpt("book")], "قمر"),
    imageQ("RD_02", "decoding", "word_to_picture", "اقرأ الكلمة واختار الصورة: مدرسة", [imgOpt("school"), imgOpt("house"), imgOpt("tree"), imgOpt("door")], "مدرسة"),
    choiceQ("RD_03", "decoding", "syllable_reading", "أي مقطع يُقرأ: با؟", ["با", "بو", "بي", "بْ"], "با", "با."),
    choiceQ("RD_04", "decoding", "nonword_decoding", "أي نطق يناسب الكلمة التدريبية: دَبُت؟", ["دَ - بُت", "دِ - بات", "ذَ - بُت", "دَ - بيت"], "دَ - بُت"),
    { id: "RD_05", type: "orderedTap", domain: "decoding", skill: "syllable_building", difficulty: 2, prompt: "رتّب المقاطع لتكوين كلمة: مدرسة", choices: ["سة", "مد", "ر"], correctSequence: ["مد", "ر", "سة"] },
    { id: "RD_06", type: "timedReading", domain: "decoding", skill: "sentence_comprehension", difficulty: 3, prompt: "اقرأ الجملة ثم اختار الصورة المناسبة", text: "جلس عمر تحت الشجرة.", question: "أين جلس عمر؟", choices: [imgOpt("tree", "تحت الشجرة"), imgOpt("school", "في المدرسة"), imgOpt("house", "داخل البيت")], correctAnswer: "تحت الشجرة", idealTimeMs: 11000 },
  ],
  spellingMemory: [
    { id: "SM_01", type: "imageTextInput", domain: "spellingMemory", skill: "simple_spelling", difficulty: 1, prompt: "اكتب اسم الصورة", image: imgOpt("house"), correctAnswer: "بيت", spokenPrompt: "بيت." },
    { id: "SM_02", type: "wordBuilder", domain: "spellingMemory", skill: "word_building", difficulty: 2, prompt: "ابنِ كلمة قلم من الحروف", image: imgOpt("pen"), choices: ["م", "ق", "ل", "ب"], correctSequence: ["ق", "ل", "م"] },
    { id: "SM_03", type: "memorySpan", domain: "spellingMemory", skill: "auditory_memory", difficulty: 2, prompt: "احفظ الصور بالترتيب، ثم اختار ترتيبها", sequence: [imgOpt("pen"), imgOpt("door"), imgOpt("moon")], choices: ["قلم باب قمر", "باب قلم قمر", "قمر باب قلم"], correctAnswer: "قلم باب قمر", exposureMs: 3500 },
    choiceQ("SM_04", "spellingMemory", "confusable_spelling", "اختار الكتابة الصحيحة لكلمة: ذهب", ["دهب", "ذهب", "زهب", "ظهب"], "ذهب", "ذهب."),
    { id: "SM_05", type: "memorySpanText", domain: "spellingMemory", skill: "digit_span", difficulty: 3, prompt: "احفظ الأرقام بالترتيب، ثم اكتبها", sequence: ["٣", "٧", "٢", "٥"], correctAnswer: "٣ ٧ ٢ ٥", exposureMs: 3200 },
  ],
};

function imageQ(id, domain, skill, prompt, options, correctAnswer, spokenPrompt = "") {
  return { id, type: "imageChoice", domain, skill, difficulty: 1, prompt, choices: options, correctAnswer, spokenPrompt };
}

function choiceQ(id, domain, skill, prompt, choices, correctAnswer, spokenPrompt = "") {
  return { id, type: "choice", domain, skill, difficulty: 2, prompt, choices, correctAnswer, spokenPrompt };
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

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function avg(values) {
  const clean = values.filter(Number.isFinite);
  if (!clean.length) return null;
  return Math.round(clean.reduce((a, b) => a + b, 0) / clean.length);
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

function fuzzy(answer, correct) {
  const a = normalizeArabic(answer).replace(/\s/g, "");
  const b = normalizeArabic(correct).replace(/\s/g, "");
  if (!a || !b) return 0;
  return clamp((1 - levenshtein(a, b) / Math.max(a.length, b.length)) * 100);
}

function parentRisk(intake) {
  let risk = 0;
  if (intake.familyHistory === "yes") risk += 25;
  if (intake.avoidsReading === "yes") risk += 25;
  if (intake.spellingStruggle === "yes") risk += 25;
  if (intake.slowReading === "yes") risk += 25;
  return risk;
}

function computeResults(responses, safety, intake) {
  const domains = ["spokenLanguage", "phonological", "orthographic", "rapidNaming", "decoding", "spellingMemory"];
  const domainScores = Object.fromEntries(domains.map((d) => [d, avg(responses.filter((r) => r.domain === d).map((r) => r.score))]));
  const skillScores = {};
  responses.forEach((r) => {
    skillScores[r.skill] ||= [];
    skillScores[r.skill].push(r.score);
  });
  Object.keys(skillScores).forEach((k) => (skillScores[k] = avg(skillScores[k])));
  const core = [domainScores.phonological, domainScores.orthographic, domainScores.rapidNaming, domainScores.decoding, domainScores.spellingMemory].filter((x) => x !== null);
  const coreScore = avg(core) ?? 0;
  const questionnaireRisk = parentRisk(intake);
  const overall = clamp(coreScore * 0.9 + (100 - questionnaireRisk) * 0.1);
  const weakDomains = Object.entries(domainScores).filter(([d, s]) => d !== "spokenLanguage" && s !== null && s < 60).map(([d]) => d);
  const flags = [];
  if (safety.hearingIssue) flags.push("ملاحظة سمعية قد تؤثر على أنشطة الصوت.");
  if (safety.visionIssue) flags.push("ملاحظة بصرية قد تؤثر على أنشطة الصور والحروف.");
  if (safety.tiredToday) flags.push("الطفل مرهق اليوم؛ يفضل إعادة التجربة لاحقًا للتأكيد.");
  if (safety.attentionIssue) flags.push("تشتت الانتباه قد يؤثر على السرعة والدقة.");
  let risk = "منخفض";
  if (overall < 45 || weakDomains.length >= 3) risk = "مرتفع";
  else if (overall < 65 || weakDomains.length >= 2) risk = "متوسط";
  return { domainScores, skillScores, weakDomains, flags, overall, risk, questionnaireRisk };
}

function makePlan(scores) {
  const map = {
    phonological: ["مغامرة الأصوات", "ألعاب القافية، بداية الصوت، الدمج، والحذف"],
    orthographic: ["مغامرة الحروف", "تمييز النقاط، الحركات، البحث البصري، والحروف المتشابهة"],
    rapidNaming: ["مغامرة السرعة", "تسمية الصور، الألوان، الأرقام، والحروف بمؤقت لطيف"],
    decoding: ["مغامرة القراءة", "حرف-صوت، مقاطع، كلمات تدريبية، ثم جمل قصيرة"],
    spellingMemory: ["مغامرة الذاكرة", "بناء كلمات، إملاء، ترتيب أصوات، وذاكرة صور"],
  };
  const plan = Object.entries(map)
    .filter(([domain]) => (scores[domain] ?? 100) < 60)
    .map(([domain, [title, game]]) => ({ domain, title, game, level: scores[domain] < 40 ? 1 : 2 }));
  return plan.length ? plan : [{ domain: "balanced", title: "رحلة متوازنة", game: "ابدأ بمستوى متوسط في كل الألعاب وأعد التقييم بعد 10 جلسات", level: 3 }];
}

export default function App() {
  const [step, setStep] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [intake, setIntake] = useState(intakeDefaults);
  const [safety, setSafety] = useState(safetyDefaults);
  const [responses, setResponses] = useState([]);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const current = journey[step];
  const totalActivities = journey.filter((x) => x.kind === "mission").reduce((sum, x) => sum + missions[x.id].length, 0);
  const progress = Math.round(((responses.length + (current.kind === "results" ? 1 : 0)) / Math.max(1, totalActivities)) * 100);

  function nextStep() {
    setQIndex(0);
    setStep((s) => Math.min(s + 1, journey.length - 1));
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 20);
  }

  function prevStep() {
    setQIndex(0);
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleAnswer(response) {
    const earned = response.score >= 70 ? 2 : response.score >= 40 ? 1 : 0;
    setResponses((old) => [...old, response]);
    setStars((old) => old + earned);
    setFeedback({ score: response.score, earned });

    window.setTimeout(() => {
      setFeedback(null);
      const qs = missions[current.id];
      if (qIndex + 1 < qs.length) setQIndex((i) => i + 1);
      else nextStep();
    }, 650);
  }

  function restart() {
    setStep(0);
    setQIndex(0);
    setResponses([]);
    setStars(0);
    setSafety(safetyDefaults);
  }

  return (
    <div className="app" dir="rtl">
      <style>{css}</style>
      <TopBar mission={current.mission} progress={progress} stars={stars} />
      {feedback && <Feedback score={feedback.score} earned={feedback.earned} />}
      <main className="stage">
        {current.kind === "welcome" && <Welcome onNext={nextStep} />}
        {current.kind === "onboarding" && <Onboarding intake={intake} setIntake={setIntake} onNext={nextStep} />}
        {current.kind === "safety" && <Safety safety={safety} setSafety={setSafety} onNext={nextStep} onBack={prevStep} />}
        {current.kind === "mission" && <Mission id={current.id} qIndex={qIndex} onAnswer={handleAnswer} onBack={prevStep} />}
        {current.kind === "results" && <Results intake={intake} safety={safety} responses={responses} stars={stars} onRestart={restart} />}
      </main>
    </div>
  );
}

function TopBar({ mission, progress, stars }) {
  return (
    <header className="top">
      <div className="brand">
        <div className="mascot">🦉</div>
        <div>
          <p>رحلة فصيح</p>
          <h1>{mission}</h1>
        </div>
      </div>
      <div className="topStats">
        <span>⭐ {stars}</span>
        <span>{progress}%</span>
      </div>
      <div className="progress"><i style={{ width: `${progress}%` }} /></div>
    </header>
  );
}

function Feedback({ score, earned }) {
  const msg = score >= 70 ? "رائع!" : score >= 40 ? "محاولة جيدة" : "ولا يهمك، كمل";
  return <div className="feedback"><b>{msg}</b><span>{"⭐".repeat(earned || 1)}</span></div>;
}

function Welcome({ onNext }) {
  return (
    <section className="card intro">
      <div className="guide">
        <div className="owl">🦉</div>
        <div>
          <h2>أهلًا، أنا فصيح!</h2>
          <p>هنعمل شوية أنشطة ممتعة بالصور والأصوات. الهدف إننا نعرف إيه المهارات اللي محتاجة تدريب أكتر.</p>
        </div>
      </div>
      <div className="featureGrid">
        <Feature icon="🎧" title="اسمع" text="تعليمات قصيرة وواضحة." />
        <Feature icon="🖼️" title="اختار" text="صور وبطاقات كبيرة." />
        <Feature icon="⭐" title="اجمع نجوم" text="كل نشاط يعطيك تقدم وتشجيع." />
      </div>
      <Notice warn>هذه الرحلة ليست تشخيصًا طبيًا نهائيًا. إذا ظهر احتياج قوي للدعم، يُفضّل الرجوع إلى مختص.</Notice>
      <button className="primary big" onClick={onNext}>ابدأ الرحلة</button>
    </section>
  );
}

function Onboarding({ intake, setIntake, onNext }) {
  const ok = intake.childName.trim() && intake.age;
  const yn = [["unknown", "غير معروف"], ["yes", "نعم"], ["no", "لا"]];
  return (
    <section className="card">
      <Title tag="بطاقة" title="بطاقة البداية" text="بيانات بسيطة تساعدنا نفهم الرحلة بشكل أفضل." />
      <div className="grid2">
        <Field label="اسم الطفل" value={intake.childName} onChange={(v) => setIntake({ ...intake, childName: v })} placeholder="مثال: آدم" />
        <Field label="العمر" type="number" value={intake.age} onChange={(v) => setIntake({ ...intake, age: v })} placeholder="مثال: 8" />
        <Field label="الصف الدراسي" value={intake.grade} onChange={(v) => setIntake({ ...intake, grade: v })} placeholder="مثال: الصف الثالث" />
        <Select label="صفة المقيم" value={intake.assessorRole} onChange={(v) => setIntake({ ...intake, assessorRole: v })} options={[["parent", "ولي أمر"], ["therapist", "أخصائي"], ["teacher", "مدرس"]]} />
        <Select label="هل يوجد تاريخ عائلي لصعوبات القراءة؟" value={intake.familyHistory} onChange={(v) => setIntake({ ...intake, familyHistory: v })} options={yn} />
        <Select label="هل الطفل يتجنب القراءة؟" value={intake.avoidsReading} onChange={(v) => setIntake({ ...intake, avoidsReading: v })} options={yn} />
        <Select label="هل يعاني في الإملاء؟" value={intake.spellingStruggle} onChange={(v) => setIntake({ ...intake, spellingStruggle: v })} options={yn} />
        <Select label="هل يقرأ ببطء؟" value={intake.slowReading} onChange={(v) => setIntake({ ...intake, slowReading: v })} options={yn} />
      </div>
      <button className="primary" disabled={!ok} onClick={onNext}>جاهز للمهمة</button>
    </section>
  );
}

function Safety({ safety, setSafety, onNext, onBack }) {
  const items = [
    ["hearingIssue", "يوجد صعوبة في السمع أو الصوت غير واضح"],
    ["visionIssue", "يوجد صعوبة في رؤية الشاشة أو الحروف"],
    ["tiredToday", "الطفل مرهق أو متوتر اليوم"],
    ["attentionIssue", "يوجد تشتت انتباه واضح"],
  ];
  return (
    <section className="card">
      <Title tag="تجهيز" title="قبل ما نبدأ" text="خلّي الصوت واضح والشاشة مريحة. لو فيه ملاحظة، سنأخذها في التقرير." />
      <div className="checks">
        {items.map(([key, label]) => <Check key={key} checked={safety[key]} onChange={(v) => setSafety({ ...safety, [key]: v })}>{label}</Check>)}
        <Check checked={safety.understandsTask} onChange={(v) => setSafety({ ...safety, understandsTask: v })}>الطفل فاهم فكرة الاختيار والضغط</Check>
      </div>
      <div className="row"><button className="secondary" onClick={onBack}>رجوع</button><button className="primary" onClick={onNext}>كمل</button></div>
    </section>
  );
}

function Mission({ id, qIndex, onAnswer, onBack }) {
  const [resting, setResting] = useState(false);
  const meta = missionMeta[id];
  const item = missions[id][qIndex];
  return (
    <section className="card mission">
      <div className="missionHead">
        <div>
          <span className="missionTag">{meta.title}</span>
          <h2>{qIndex === 0 ? meta.intro : "نشاط جديد"}</h2>
        </div>
        <div className="bubble">{qIndex + 1}/{missions[id].length}</div>
      </div>
      <div className="miniProgress"><i style={{ width: `${(qIndex / missions[id].length) * 100}%` }} /></div>
      {resting ? <Rest onResume={() => setResting(false)} /> : <Question key={item.id} item={item} onAnswer={onAnswer} />}
      <div className="row footerActions"><button className="secondary" onClick={() => setResting(true)}>استراحة</button><button className="ghost" onClick={onBack}>رجوع</button></div>
    </section>
  );
}

function Rest({ onResume }) {
  return <div className="rest"><div>🍊</div><h3>استراحة قصيرة</h3><p>خد نفس، اشرب مياه، ولما تكون جاهز كمل الرحلة.</p><button className="primary" onClick={onResume}>كمل</button></div>;
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
  const [show, setShow] = useState(false);
  const [seen, setSeen] = useState(false);
  const [readingDone, setReadingDone] = useState(false);

  useEffect(() => {
    if (!timerStart) return;
    const id = setInterval(() => setElapsed(Date.now() - timerStart), 100);
    return () => clearInterval(id);
  }, [timerStart]);

  function submit(score, answer, extra = {}) {
    onAnswer({
      itemId: item.id,
      domain: item.domain,
      skill: item.skill,
      type: item.type,
      difficulty: item.difficulty,
      prompt: item.prompt,
      selectedAnswer: answer,
      correctAnswer: item.correctAnswer || item.correctSequence || item.correctIndexes || null,
      score: clamp(score),
      isCorrect: score >= 70,
      responseTimeMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      ...extra,
    });
  }

  function submitChoice(value = selected) {
    submit(normalizeArabic(value) === normalizeArabic(item.correctAnswer) ? 100 : 0, value);
  }

  function submitImage(value = selected) {
    submit(normalizeArabic(value) === normalizeArabic(item.correctAnswer) ? 100 : 0, value);
  }

  function submitText() {
    submit(fuzzy(text, item.correctAnswer), text);
  }

  function submitSequence() {
    let points = 0;
    item.correctSequence.forEach((v, i) => { if (normalizeArabic(sequence[i]) === normalizeArabic(v)) points++; });
    submit((points / item.correctSequence.length) * 100 - Math.abs(sequence.length - item.correctSequence.length) * 15, sequence);
  }

  function submitHunt() {
    const correct = new Set(item.correctIndexes);
    const chosen = new Set(multi);
    let points = 0;
    item.grid.forEach((_, i) => { if (correct.has(i) === chosen.has(i)) points++; });
    submit((points / item.grid.length) * 100, multi);
  }

  function reveal() {
    setShow(true); setSeen(true);
    setTimeout(() => setShow(false), item.exposureMs || 3000);
  }

  function submitTimedGrid() {
    const used = elapsed || Date.now() - start;
    const err = Number(errors || 0);
    const accuracy = ((item.expectedCount - err) / item.expectedCount) * 100;
    const speed = Math.min(100, (item.idealTimeMs / Math.max(1, used)) * 100);
    submit(accuracy * 0.65 + speed * 0.35, `errors:${err}`, { elapsedMs: used, errorCount: err });
  }

  function submitReaction() {
    const used = Date.now() - start;
    const correct = normalizeArabic(selected) === normalizeArabic(item.correctAnswer);
    const speed = Math.min(100, (item.idealTimeMs / Math.max(1, used)) * 100);
    submit(correct ? 70 + speed * 0.3 : speed * 0.2, selected, { elapsedMs: used });
  }

  function submitTimedReading() {
    const used = elapsed || Date.now() - start;
    const correct = normalizeArabic(selected) === normalizeArabic(item.correctAnswer);
    const speed = Math.min(100, (item.idealTimeMs / Math.max(1, used)) * 100);
    submit(correct ? 70 + speed * 0.3 : speed * 0.25, selected, { elapsedMs: used });
  }

  return (
    <div className="question">
      <div className="qTop">
        <span>🎯 نشاط</span>
        {item.spokenPrompt && <button className="sound" onClick={() => speak(item.spokenPrompt)}>🔊 اسمع</button>}
      </div>
      <h3>{item.prompt}</h3>

      {item.type === "imageChoice" && <ImageChoice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitImage} />}
      {item.type === "choice" && <Choice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={() => submitChoice()} />}
      {item.type === "colorChoice" && <ColorChoice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={() => submitChoice()} />}
      {item.type === "letterHunt" && <><div className="letterGrid">{item.grid.map((v, i) => <button key={i} className={multi.includes(i) ? "selected" : ""} onClick={() => setMulti((old) => old.includes(i) ? old.filter((x) => x !== i) : [...old, i])}>{v}</button>)}</div><button className="primary" disabled={!multi.length} onClick={submitHunt}>تأكيد الصيد</button></>}
      {item.type === "orderedTap" && <OrderedTap choices={item.choices} sequence={sequence} setSequence={setSequence} onSubmit={submitSequence} />}
      {item.type === "wordBuilder" && <><PictureCard item={item.image} /><OrderedTap choices={item.choices} sequence={sequence} setSequence={setSequence} onSubmit={submitSequence} /></>}
      {item.type === "visualMemory" && <><div className="memory">{!seen && <button className="secondary" onClick={reveal}>إظهار الكلمة</button>}{show && <strong>{item.stimulus}</strong>}{seen && !show && <span>اختار ما ظهر</span>}</div>{seen && !show && <Choice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={() => submitChoice()} />}</>}
      {item.type === "memorySpan" && <><div className="memory">{!seen && <button className="secondary" onClick={reveal}>عرض الصور</button>}{show && <div className="miniPics">{item.sequence.map((x) => <PictureCard key={x.label} item={x} small />)}</div>}{seen && !show && <span>اختار الترتيب الصحيح</span>}</div>{seen && !show && <Choice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={() => submitChoice()} />}</>}
      {item.type === "memorySpanText" && <><div className="memory">{!seen && <button className="secondary" onClick={reveal}>عرض التسلسل</button>}{show && <strong>{item.sequence.join("  •  ")}</strong>}{seen && !show && <span>اكتب ما تتذكره</span>}</div><input className="answer" disabled={!seen || show} value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب هنا" /><button className="primary" disabled={!text.trim()} onClick={submitText}>تأكيد</button></>}
      {item.type === "imageTextInput" && <><PictureCard item={item.image} /><input className="answer" value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب اسم الصورة" /><button className="primary" disabled={!text.trim()} onClick={submitText}>تأكيد</button></>}
      {item.type === "timedGrid" && <><Timer elapsed={elapsed} started={!!timerStart} onStart={() => setTimerStart(Date.now())} onStop={() => setTimerStart(null)} /><div className="timedGrid">{item.items.map((x, i) => typeof x === "string" ? <div className="letterTile" key={i}>{x}</div> : <PictureCard item={x} small key={x.label} />)}</div><label className="label compact">عدد الأخطاء أو الترددات<select value={errors} onChange={(e) => setErrors(e.target.value)}><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4 أو أكثر</option></select></label><button className="primary" disabled={!timerStart && !elapsed} onClick={submitTimedGrid}>تم</button></>}
      {item.type === "reactionImage" && <><PictureCard item={item.image} large /><Choice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitReaction} /></>}
      {item.type === "timedReading" && <><div className="reading">{item.text}</div><Timer elapsed={elapsed} started={!!timerStart} onStart={() => setTimerStart(Date.now())} onStop={() => setReadingDone(true)} stopText="انتهيت" />{readingDone && <><h4>{item.question}</h4><ImageChoice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitTimedReading} /></>}</>}
    </div>
  );
}

function ImageChoice({ choices, selected, setSelected, onSubmit }) {
  return <><div className="imageChoices">{choices.map((c) => <button key={c.value} className={selected === c.value ? "selected" : ""} onClick={() => setSelected(c.value)}><PictureCard item={c} /><b>{c.label}</b></button>)}</div><button className="primary" disabled={!selected} onClick={() => onSubmit(selected)}>تأكيد</button></>;
}

function PictureCard({ item, small, large }) {
  return <div className={`pic ${small ? "small" : ""} ${large ? "large" : ""}`}><img src={item.image} alt={item.label} /><span>{item.emoji}</span></div>;
}

function Choice({ choices, selected, setSelected, onSubmit }) {
  return <><div className="choices">{choices.map((c) => <button key={c} className={selected === c ? "selected" : ""} onClick={() => setSelected(c)}>{c}</button>)}</div><button className="primary" disabled={!selected} onClick={onSubmit}>تأكيد</button></>;
}

function ColorChoice({ choices, selected, setSelected, onSubmit }) {
  return <><div className="colors">{choices.map((c) => <button key={c.value} className={selected === c.value ? "selected" : ""} style={{ background: c.color }} onClick={() => setSelected(c.value)} />)}</div><button className="primary" disabled={!selected} onClick={onSubmit}>تأكيد</button></>;
}

function OrderedTap({ choices, sequence, setSequence, onSubmit }) {
  return <><div className="sequence">اختيارك: <b>{sequence.length ? sequence.join(" ← ") : "ابدأ الضغط"}</b></div><div className="choices">{choices.map((c) => <button key={c} onClick={() => setSequence((old) => [...old, c])}>{c}</button>)}</div><div className="row"><button className="secondary" onClick={() => setSequence([])}>مسح</button><button className="primary" disabled={!sequence.length} onClick={onSubmit}>تأكيد</button></div></>;
}

function Timer({ elapsed, started, onStart, onStop, stopText = "إيقاف" }) {
  return <div className="timer"><div><span>الوقت</span><b>{(elapsed / 1000).toFixed(1)}s</b></div>{!started ? <button className="primary" onClick={onStart}>ابدأ</button> : <button className="secondary" onClick={onStop}>{stopText}</button>}</div>;
}

function Results({ intake, safety, responses, stars, onRestart }) {
  const results = useMemo(() => computeResults(responses, safety, intake), [responses, safety, intake]);
  const plan = useMemo(() => makePlan(results.domainScores), [results.domainScores]);
  const [copied, setCopied] = useState(false);
  const labels = { spokenLanguage: "فهم التعليمات", phonological: "الأصوات", orthographic: "الحروف والأشكال", rapidNaming: "السرعة", decoding: "القراءة", spellingMemory: "الإملاء والذاكرة" };
  const payload = { assessmentType: "gamified_arabic_egyptian_pretest_v1", createdAt: new Date().toISOString(), intake, safety, stars, ...results, therapyPlan: plan, responses, note: "Screening only. Not standalone diagnosis." };
  async function copy() { await navigator.clipboard?.writeText(JSON.stringify(payload, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1400); }
  return <section className="card results"><div className="resultHero"><div><span className="missionTag">خريطة فصيح</span><h2>أحسنت يا {intake.childName || "بطل"}!</h2><p>جمعت {stars} نجمة. هذه خريطة تدريب مبدئية وليست تشخيصًا نهائيًا.</p></div><div className="scoreOrb"><b>{results.overall}</b><span>/100</span></div></div><Notice>مؤشر استبيان ولي الأمر: <b>{results.questionnaireRisk}%</b>. يستخدم كمعلومة مساعدة فقط.</Notice>{results.flags.length > 0 && <Notice warn>{results.flags.map((f) => <p key={f}>{f}</p>)}</Notice>}<div className="scoreGrid">{Object.entries(results.domainScores).map(([d, s]) => <div className="scoreCard" key={d}><h3>{labels[d]}</h3><strong>{s ?? "—"}</strong><div className="miniProgress"><i style={{ width: `${s ?? 0}%` }} /></div></div>)}</div><h3>المغامرات المقترحة</h3><div className="plans">{plan.map((p, i) => <div className="plan" key={p.domain}><b>{i + 1}</b><div><h4>{p.title}</h4><p>{p.game}</p></div><span>مستوى {p.level}</span></div>)}</div><details className="json"><summary>JSON للتخزين</summary><pre>{JSON.stringify(payload, null, 2)}</pre></details><div className="row"><button className="secondary" onClick={onRestart}>إعادة الرحلة</button><button className="primary" onClick={copy}>{copied ? "تم النسخ" : "نسخ JSON"}</button></div></section>;
}

function Title({ tag, title, text }) { return <div className="title"><span className="missionTag">{tag}</span><div><h2>{title}</h2><p>{text}</p></div></div>; }
function Feature({ icon, title, text }) { return <div className="feature"><div>{icon}</div><h3>{title}</h3><p>{text}</p></div>; }
function Notice({ children, warn }) { return <div className={`notice ${warn ? "warn" : ""}`}>{children}</div>; }
function Field({ label, value, onChange, placeholder = "", type = "text" }) { return <label className="label">{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>; }
function Select({ label, value, onChange, options }) { return <label className="label">{label}<select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>; }
function Check({ checked, onChange, children }) { return <label className="check"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span>{children}</span></label>; }

const css = `
*{box-sizing:border-box}html,body,#root{margin:0;min-height:100%;width:100%;overflow-x:hidden}body{background:radial-gradient(circle at top right,#fed7aa,transparent 35%),#fff7ed;color:#3b2f2f;font-family:Inter,Tahoma,Arial,sans-serif}button,input,select{font:inherit}button{cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}.app{width:100%;max-width:1180px;margin-inline:auto;padding:22px}.top{background:linear-gradient(135deg,#7c2d12,#f97316);color:white;border-radius:34px;padding:24px;box-shadow:0 24px 70px #9a341233;margin-bottom:22px}.brand{display:flex;align-items:center;gap:16px}.mascot{width:70px;height:70px;border-radius:25px;background:#ffffff26;display:grid;place-items:center;font-size:38px}.brand p{margin:0 0 4px;color:#ffedd5;font-size:13px;font-weight:900}.brand h1{margin:0;font-size:clamp(28px,4vw,44px)}.topStats{display:flex;gap:10px;margin:18px 0}.topStats span{background:#fff7ed;color:#9a3412;border-radius:999px;padding:8px 14px;font-weight:950}.progress,.miniProgress{height:10px;background:#ffedd5;border-radius:999px;overflow:hidden}.progress i,.miniProgress i{display:block;height:100%;background:linear-gradient(90deg,#facc15,#fb923c,#ea580c);transition:.3s}.stage{display:block}.card{background:#fffaf3e8;border:1px solid #fed7aa;border-radius:34px;padding:28px;box-shadow:0 24px 70px #9a34121c;animation:fade .25s ease both}@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.guide,.title,.missionHead,.resultHero{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:22px}.guide{align-items:center}.owl{width:105px;height:105px;border-radius:34px;background:#ffedd5;display:grid;place-items:center;font-size:62px}.guide h2,.title h2,.missionHead h2,.resultHero h2{margin:0 0 8px;font-size:30px}.guide p,.title p,.missionHead p,.resultHero p,.feature p{color:#7c5b45;line-height:1.8;margin:0}.missionTag{display:inline-flex;background:#ffedd5;color:#c2410c;border-radius:999px;padding:8px 13px;font-size:12px;font-weight:950}.featureGrid,.grid2,.scoreGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.feature{background:white;border:1px solid #fed7aa;border-radius:26px;padding:18px}.feature div{font-size:35px}.feature h3{margin:8px 0 5px}.notice{background:#fff7ed;border:1px solid #fed7aa;border-radius:22px;padding:15px 17px;margin:18px 0;line-height:1.8}.notice.warn{background:#fff1f2;border-color:#fecdd3;color:#9f1239}.primary,.secondary,.ghost,.sound{border:0;border-radius:18px;padding:13px 20px;font-weight:950}.primary{background:#f97316;color:white;box-shadow:0 14px 28px #f9731633}.primary:hover:not(:disabled){background:#ea580c}.primary.big{font-size:18px;padding:16px 24px}.secondary{background:#ffedd5;color:#9a3412}.ghost{background:transparent;color:#9a3412}.sound{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.label{display:grid;gap:8px;font-weight:900;color:#5b4334}input,select{width:100%;border:1px solid #fed7aa;background:white;border-radius:18px;padding:14px;color:#3b2f2f;outline:none}input:focus,select:focus{border-color:#fb923c;box-shadow:0 0 0 4px #ffedd5}.checks{display:grid;gap:12px}.check{display:flex;gap:12px;align-items:center;background:white;border:1px solid #fed7aa;border-radius:20px;padding:14px;font-weight:900}.check input{width:20px;height:20px}.mission{min-height:620px}.bubble,.scoreOrb{width:96px;height:96px;border-radius:32px;background:#ffedd5;color:#c2410c;display:grid;place-items:center;font-size:26px;font-weight:950;flex:0 0 auto}.question{margin-top:22px;background:white;border:1px solid #fed7aa;border-radius:30px;padding:22px}.qTop{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px}.qTop span{background:#fff7ed;color:#9a3412;border-radius:999px;padding:7px 11px;font-weight:950;font-size:12px}.question h3{margin:0 0 16px;font-size:25px}.imageChoices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:18px 0}.imageChoices button{border:2px solid #fed7aa;background:#fffaf3;border-radius:28px;padding:12px;font-weight:950;color:#3b2f2f}.imageChoices button.selected,.choices button.selected,.letterGrid button.selected{border-color:#f97316;background:#ffedd5;box-shadow:0 0 0 4px #fed7aa}.pic{position:relative;border-radius:22px;overflow:hidden;height:170px;background:#ffedd5;display:grid;place-items:center}.pic.small{height:92px;border-radius:18px}.pic.large{height:240px}.pic img{width:100%;height:100%;object-fit:cover;display:block}.pic span{position:absolute;right:10px;bottom:8px;font-size:34px;background:#ffffffd9;border-radius:14px;padding:3px 7px}.choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:18px 0}.choices button{min-height:62px;border:2px solid #fed7aa;background:#fffaf3;border-radius:20px;font-size:19px;font-weight:950;color:#3b2f2f}.colors{display:flex;gap:16px;justify-content:center;margin:24px 0}.colors button{width:96px;height:96px;border-radius:50%;border:6px solid white;box-shadow:0 10px 24px #7c2d121f}.colors button.selected{outline:6px solid #f97316}.letterGrid{display:grid;grid-template-columns:repeat(3,90px);gap:12px;justify-content:center;margin:20px 0}.letterGrid button,.letterTile{height:82px;border:2px solid #fed7aa;border-radius:22px;background:#fffaf3;font-size:36px;font-weight:950;color:#3b2f2f;display:grid;place-items:center}.sequence{background:#fff7ed;border:1px dashed #fb923c;border-radius:20px;padding:14px;margin:14px 0}.answer{margin:18px 0;font-size:22px;text-align:right}.memory,.rest{min-height:160px;background:#fff7ed;border:1px dashed #fb923c;border-radius:28px;margin:18px 0;padding:20px;display:grid;place-items:center;text-align:center}.memory strong{font-size:42px;color:#c2410c}.miniPics{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}.timer{display:flex;justify-content:space-between;gap:14px;align-items:center;background:#fff7ed;border:1px solid #fed7aa;border-radius:24px;padding:16px;margin:18px 0}.timer span{display:block;color:#9a3412;font-size:12px;font-weight:950}.timer b{font-size:32px}.timedGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:18px 0}.label.compact{max-width:260px}.reading{font-size:30px;line-height:2;font-weight:950;background:#fff7ed;border:1px solid #fed7aa;border-radius:24px;padding:22px;margin:18px 0}.feedback{position:fixed;top:22px;left:50%;transform:translateX(-50%);background:#431407;color:white;border-radius:999px;padding:14px 22px;z-index:20;display:flex;gap:12px;align-items:center;box-shadow:0 20px 50px #0003}.scoreOrb b{font-size:46px}.scoreOrb span{color:#9a3412}.scoreCard{background:white;border:1px solid #fed7aa;border-radius:24px;padding:18px}.scoreCard h3{margin:0}.scoreCard strong{font-size:42px}.plans{display:grid;gap:12px}.plan{display:grid;grid-template-columns:42px 1fr auto;gap:14px;align-items:center;background:white;border:1px solid #fed7aa;border-radius:24px;padding:16px}.plan>b{width:42px;height:42px;border-radius:16px;background:#ffedd5;color:#c2410c;display:grid;place-items:center}.plan h4,.plan p{margin:0}.plan p{color:#7c5b45}.plan span{background:#ffedd5;color:#c2410c;border-radius:999px;padding:8px 12px;font-weight:950}.json{margin:18px 0;background:#431407;color:white;border-radius:22px;padding:14px}.json pre{direction:ltr;text-align:left;overflow:auto;max-height:320px;color:#ffedd5;font-size:12px}@media(max-width:850px){.featureGrid,.grid2,.imageChoices,.choices,.scoreGrid,.timedGrid{grid-template-columns:1fr}.guide,.missionHead,.resultHero{flex-direction:column}.plan{grid-template-columns:1fr}.pic{height:150px}}@media(max-width:520px){.app{padding:14px}.top,.card{padding:18px;border-radius:26px}.brand{align-items:flex-start}.mascot{width:58px;height:58px;font-size:32px}.letterGrid{grid-template-columns:repeat(3,1fr)}.reading{font-size:23px}.colors button{width:76px;height:76px}}
`;
