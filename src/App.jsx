import React, { useEffect, useMemo, useState } from "react";

const SAVE_KEY = "arabic_dyslexia_gamified_pretest_state_v2";

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

const flow = [
  { id: "welcome", kind: "welcome", childTitle: "بوابة فصيح", therapistTitle: "بداية التقييم" },
  { id: "onboarding", kind: "onboarding", childTitle: "بطاقة البداية", therapistTitle: "بيانات الطفل" },
  { id: "safety", kind: "safety", childTitle: "تجهيز الرحلة", therapistTitle: "فحص السمع والنظر" },
  { id: "calibration", kind: "module", childTitle: "مهمة الاستماع", therapistTitle: "معايرة اللغة" },
  { id: "phonological", kind: "module", childTitle: "مهمة الأصوات", therapistTitle: "الوعي الصوتي" },
  { id: "orthographic", kind: "module", childTitle: "مهمة الحروف", therapistTitle: "الحروف والأشكال" },
  { id: "rapidNaming", kind: "module", childTitle: "مهمة السرعة", therapistTitle: "سرعة التسمية" },
  { id: "decoding", kind: "module", childTitle: "مهمة القراءة", therapistTitle: "القراءة وفك التشفير" },
  { id: "spellingMemory", kind: "module", childTitle: "مهمة الذاكرة", therapistTitle: "الإملاء والذاكرة" },
  { id: "results", kind: "results", childTitle: "خريطة التدريب", therapistTitle: "التقرير والخطة" },
];

const missionMeta = {
  calibration: { domain: "spokenLanguage", title: "مهمة الاستماع", intro: "اسمع التعليمات واختار الإجابة المناسبة." },
  phonological: { domain: "phonological", title: "مهمة الأصوات", intro: "هنلعب مع بداية الصوت، آخر الصوت، القافية، والدمج." },
  orthographic: { domain: "orthographic", title: "مهمة الحروف", intro: "اصطد الحروف والأشكال المتشابهة بدقة." },
  rapidNaming: { domain: "rapidNaming", title: "مهمة السرعة", intro: "سمّي العناصر بسرعة وهدوء." },
  decoding: { domain: "decoding", title: "مهمة القراءة", intro: "اقرأ واختار الإجابة المناسبة." },
  spellingMemory: { domain: "spellingMemory", title: "مهمة الذاكرة", intro: "اكتب، رتّب، واحفظ تسلسلات قصيرة." },
};

const emoji = {
  كتاب: "📘",
  قطة: "🐱",
  كلب: "🐶",
  كرة: "⚽",
  بيت: "🏠",
  قلم: "✏️",
  شمس: "☀️",
  نار: "🔥",
  قمر: "🌙",
  سمك: "🐟",
  باب: "🚪",
  مدرسة: "🏫",
  شجرة: "🌳",
  تفاحة: "🍎",
  ولد: "🧒",
};

function option(value, icon = emoji[value] || "✨") {
  return { value, label: value, icon };
}

function choice(id, domain, skill, difficulty, prompt, choices, correctAnswer, spokenPrompt = "") {
  return { id, type: "choice", domain, skill, difficulty, prompt, choices, correctAnswer, spokenPrompt };
}

function imageChoice(id, domain, skill, difficulty, prompt, choices, correctAnswer, spokenPrompt = "") {
  return { id, type: "imageChoice", domain, skill, difficulty, prompt, choices, correctAnswer, spokenPrompt };
}

function timed(id, skill, prompt, stimuli, expectedCount, idealTimeMs) {
  return { id, type: "timedNaming", domain: "rapidNaming", skill, difficulty: 2, prompt, stimuli, expectedCount, idealTimeMs };
}

const questions = {
  calibration: [
    imageChoice("CAL_001", "spokenLanguage", "picture_instruction", 1, "اضغط صورة القطة", [option("قطة"), option("كلب"), option("كرة")], "قطة", "اضغط صورة القطة."),
    imageChoice("CAL_002", "spokenLanguage", "word_instruction", 1, "اختار صورة الكتاب", [option("كتاب"), option("قمر"), option("سمك")], "كتاب", "اختار صورة الكتاب."),
    { id: "CAL_003", type: "colorChoice", domain: "spokenLanguage", skill: "color_instruction", difficulty: 1, prompt: "اضغط الدائرة الحمراء", choices: [{ value: "أحمر", color: "#ef4444" }, { value: "أزرق", color: "#3b82f6" }, { value: "أصفر", color: "#eab308" }], correctAnswer: "أحمر", spokenPrompt: "اضغط الدائرة الحمراء." },
    { id: "CAL_004", type: "orderedTap", domain: "spokenLanguage", skill: "two_step_instruction", difficulty: 1, prompt: "اضغط بالترتيب: شمس ثم قمر", choices: ["قمر", "شمس", "كتاب", "قطة"], correctSequence: ["شمس", "قمر"], spokenPrompt: "اضغط شمس، وبعدها قمر." },
  ],
  phonological: [
    imageChoice("PA_001", "phonological", "initial_sound", 1, "أي صورة تبدأ بصوت ب؟", [option("بيت"), option("شمس"), option("قلم"), option("قمر")], "بيت", "أي صورة تبدأ بصوت ب؟"),
    imageChoice("PA_002", "phonological", "final_sound", 1, "أي صورة تنتهي بصوت ر؟", [option("قمر"), option("كتاب"), option("قطة"), option("سمك")], "قمر", "أي صورة آخرها صوت ر؟"),
    choice("PA_003", "phonological", "rhyme", 2, "أي كلمتين متشابهتين في آخر الصوت؟", ["نار / جار", "بيت / قلم", "شمس / بحر", "قطة / كتاب"], "نار / جار", "أي كلمتين شبه بعض في آخر الصوت؟"),
    choice("PA_004", "phonological", "blending", 2, "لو جمعنا: م + و + ز، تكون الكلمة؟", ["موز", "ماء", "نور", "بيت"], "موز", "م، و، ز. لما نجمعهم تبقى إيه؟"),
    choice("PA_005", "phonological", "deletion", 3, "كلمة كتاب بدون صوت ك تصبح؟", ["تاب", "باب", "كتاب", "كاب"], "تاب", "قول كتاب من غير ك."),
    choice("PA_006", "phonological", "sound_count", 2, "كلمة باب فيها كام صوت؟", ["2", "3", "4"], "3", "ب، ا، ب. فيها كام صوت؟"),
  ],
  orthographic: [
    choice("OR_001", "orthographic", "visual_discrimination", 1, "اصطد الحرف المختلف", ["ب", "ت", "ح", "ث"], "ح"),
    choice("OR_002", "orthographic", "dot_awareness", 1, "هل الكلمتان متشابهتان؟ بيت / نيت", ["متشابهتان", "مختلفتان"], "مختلفتان"),
    choice("OR_003", "orthographic", "harakat", 2, "اختار الشكل الذي يناسب الصوت: بِت", ["بَت", "بِت", "بُت", "بْت"], "بِت", "بِت. اختار الكتابة الصح."),
    { id: "OR_004", type: "multiSelect", domain: "orthographic", skill: "visual_scanning", difficulty: 2, prompt: "اصطد كل حرف ب فقط", grid: ["ب", "ت", "ب", "ث", "ن", "ب", "ي", "ت", "ب"], correctIndexes: [0, 2, 5, 8] },
    choice("OR_005", "orthographic", "shape_matching", 1, "اختار الشكل المطابق: ◆", ["◆", "◇", "●", "■"], "◆"),
    { id: "OR_006", type: "visualMemory", domain: "orthographic", skill: "orthographic_memory", difficulty: 3, prompt: "احفظ الكلمة التي ستظهر، ثم اختارها", stimulus: "شمس", exposureMs: 2200, choices: ["شمس", "سمش", "شمسـ", "سش"], correctAnswer: "شمس" },
  ],
  rapidNaming: [
    timed("RN_001", "object_naming", "سمّي الصور بسرعة من اليمين لليسار، ثم اضغط تم", ["🍎 تفاحة", "🐱 قطة", "☀️ شمس", "🚪 باب", "⚽ كرة", "🐟 سمك", "📘 كتاب", "🌙 قمر"], 8, 9000),
    timed("RN_002", "letter_naming", "سمّي الحروف بسرعة من اليمين لليسار، ثم اضغط تم", ["ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز"], 10, 9500),
    timed("RN_003", "symbol_naming", "سمّي الأرقام والألوان بسرعة، ثم اضغط تم", ["١", "أحمر", "٣", "أزرق", "٥", "أخضر", "٢", "أصفر"], 8, 8500),
    { id: "RN_004", type: "reactionChoice", domain: "rapidNaming", skill: "fast_retrieval", difficulty: 2, prompt: "اختار اسم الصورة بأسرع ما يمكن", stimulus: option("شمس"), choices: ["شمس", "قمر", "كتاب", "قطة"], correctAnswer: "شمس", idealTimeMs: 1800 },
  ],
  decoding: [
    imageChoice("RD_001", "decoding", "word_to_picture", 1, "اقرأ الكلمة واختار الصورة: قمر", [option("قمر"), option("شمس"), option("قطة"), option("كتاب")], "قمر"),
    imageChoice("RD_002", "decoding", "word_to_picture", 1, "اقرأ الكلمة واختار الصورة: مدرسة", [option("مدرسة"), option("بيت"), option("شجرة"), option("باب")], "مدرسة"),
    choice("RD_003", "decoding", "syllable_reading", 1, "أي مقطع يُقرأ: با؟", ["با", "بو", "بي", "بْ"], "با", "با."),
    choice("RD_004", "decoding", "nonword_decoding", 3, "أي نطق يناسب الكلمة التدريبية: دَبُت؟", ["دَ - بُت", "دِ - بات", "ذَ - بُت", "دَ - بيت"], "دَ - بُت"),
    { id: "RD_005", type: "orderedTap", domain: "decoding", skill: "syllable_building", difficulty: 2, prompt: "رتّب المقاطع لتكوين كلمة: مدرسة", choices: ["سة", "مد", "ر"], correctSequence: ["مد", "ر", "سة"] },
    { id: "RD_006", type: "timedReading", domain: "decoding", skill: "sentence_comprehension", difficulty: 3, prompt: "اقرأ الجملة ثم اختار الإجابة", text: "جلس عمر تحت الشجرة.", question: "أين جلس عمر؟", choices: ["تحت الشجرة", "في المدرسة", "داخل البيت"], correctAnswer: "تحت الشجرة", idealTimeMs: 11000 },
  ],
  spellingMemory: [
    { id: "SM_001", type: "textInput", domain: "spellingMemory", skill: "simple_spelling", difficulty: 1, prompt: "اكتب اسم الصورة: 🏠", correctAnswer: "بيت", spokenPrompt: "بيت.", placeholder: "اكتب هنا" },
    { id: "SM_002", type: "orderedTap", domain: "spellingMemory", skill: "word_building", difficulty: 2, prompt: "ابنِ كلمة قلم من الحروف", choices: ["م", "ق", "ل", "ب"], correctSequence: ["ق", "ل", "م"] },
    { id: "SM_003", type: "memorySpan", domain: "spellingMemory", skill: "auditory_memory", difficulty: 2, prompt: "احفظ الكلمات بالترتيب، ثم اكتبها", sequence: ["قلم", "باب", "قمر"], exposureMs: 3500, placeholder: "مثال: قلم باب قمر" },
    { id: "SM_004", type: "memorySpan", domain: "spellingMemory", skill: "digit_span", difficulty: 3, prompt: "احفظ الأرقام بالترتيب، ثم اكتبها", sequence: ["٣", "٧", "٢", "٥"], exposureMs: 3200, placeholder: "مثال: ٣ ٧ ٢ ٥" },
    choice("SM_005", "spellingMemory", "confusable_spelling", 3, "اختار الكتابة الصحيحة لكلمة: ذهب", ["دهب", "ذهب", "زهب", "ظهب"], "ذهب", "ذهب."),
  ],
};

function speak(text) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-EG";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
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

function fuzzyScore(answer, correct) {
  const a = normalizeArabic(answer).replace(/\s/g, "");
  const b = normalizeArabic(correct).replace(/\s/g, "");
  if (!a || !b) return 0;
  return clamp((1 - levenshtein(a, b) / Math.max(a.length, b.length)) * 100);
}

function expectedTime(item) {
  const base = {
    choice: 4500,
    imageChoice: 4200,
    colorChoice: 3200,
    orderedTap: 6500,
    multiSelect: 9000,
    visualMemory: 7000,
    memorySpan: 9500,
    textInput: 11000,
    timedReading: item.idealTimeMs || 12000,
    timedNaming: item.idealTimeMs || 9000,
    reactionChoice: item.idealTimeMs || 1800,
  };
  return base[item.type] || 6000;
}

function adaptiveScore(item, accuracyScore, responseTimeMs, extra = {}) {
  const speedScore = clamp((expectedTime(item) / Math.max(1, responseTimeMs)) * 100);
  const difficultyBonus = Math.max(0, (item.difficulty || 1) - 1) * 3;
  const weights = {
    rapidNaming: { accuracy: 0.55, speed: 0.45 },
    decoding: { accuracy: 0.75, speed: 0.25 },
    spellingMemory: { accuracy: 0.85, speed: 0.15 },
    orthographic: { accuracy: 0.8, speed: 0.2 },
    phonological: { accuracy: 0.9, speed: 0.1 },
    spokenLanguage: { accuracy: 0.85, speed: 0.15 },
  };
  const w = weights[item.domain] || { accuracy: 0.8, speed: 0.2 };
  let score = accuracyScore * w.accuracy + speedScore * w.speed + difficultyBonus;

  if (extra.errorCount) score -= extra.errorCount * 8;
  if (extra.falsePositiveCount) score -= extra.falsePositiveCount * 10;
  if (extra.missingCount) score -= extra.missingCount * 8;

  return {
    score: clamp(score),
    accuracyScore: clamp(accuracyScore),
    speedScore,
    difficultyBonus,
    weights: w,
    adaptiveVersion: "v2-domain-speed-difficulty",
  };
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
  if (!safety.understandsTask) flags.push("فهم التعليمات غير مؤكد؛ فسّر النتيجة بحذر.");

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
    spellingMemory: ["مغامرة الذاكرة", "بناء كلمات، إملاء، ترتيب أصوات، وذاكرة قصيرة"],
  };
  const plan = Object.entries(map)
    .filter(([domain]) => (scores[domain] ?? 100) < 60)
    .map(([domain, [title, game]]) => ({ domain, title, game, level: scores[domain] < 40 ? 1 : 2 }));
  return plan.length ? plan : [{ domain: "balanced", title: "رحلة متوازنة", game: "ابدأ بمستوى متوسط في كل الألعاب وأعد التقييم بعد 10 جلسات", level: 3 }];
}

function adaptiveNextIndex({ questionList, currentIndex, moduleResponses }) {
  const current = questionList[currentIndex];
  const recent2 = moduleResponses.slice(-2);
  const recent3 = moduleResponses.slice(-3);
  const recentAvg = avg(recent3.map((r) => r.score)) ?? 0;
  const currentDifficulty = current?.difficulty || 1;

  if (moduleResponses.length >= 4 && (recentAvg >= 90 || recentAvg < 35)) {
    return { stop: true, reason: recentAvg >= 90 ? "high_confidence_strong" : "high_confidence_needs_support" };
  }

  let nextIndex = currentIndex + 1;

  if (recent2.length === 2 && recent2.every((r) => r.score >= 85)) {
    const harder = questionList.findIndex((q, i) => i > currentIndex && (q.difficulty || 1) > currentDifficulty);
    if (harder !== -1) nextIndex = harder;
  }

  if (recent2.length === 2 && recent2.every((r) => r.score < 50)) {
    const easier = questionList.findIndex((q, i) => i > currentIndex && (q.difficulty || 1) <= currentDifficulty);
    if (easier !== -1) nextIndex = easier;
  }

  if (nextIndex >= questionList.length) return { stop: true, reason: "module_finished" };
  return { stop: false, nextIndex, reason: "continue" };
}

export default function App() {
  const [step, setStep] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [intake, setIntake] = useState(intakeDefaults);
  const [safety, setSafety] = useState(safetyDefaults);
  const [responses, setResponses] = useState([]);
  const [stars, setStars] = useState(0);
  const [viewMode, setViewMode] = useState("child");
  const [feedback, setFeedback] = useState(null);
  const [hasSaved, setHasSaved] = useState(false);

  const current = flow[step];
  const totalQuestions = Object.values(questions).reduce((sum, list) => sum + list.length, 0);
  const progress = Math.min(100, Math.round((responses.length / Math.max(1, totalQuestions)) * 100));

  useEffect(() => {
    setHasSaved(Boolean(localStorage.getItem(SAVE_KEY)));
  }, []);

  useEffect(() => {
    const payload = { step, questionIndex, intake, safety, responses, stars, viewMode, savedAt: new Date().toISOString() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    setHasSaved(true);
  }, [step, questionIndex, intake, safety, responses, stars, viewMode]);

  function restoreSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved) return;
      setStep(saved.step ?? 0);
      setQuestionIndex(saved.questionIndex ?? 0);
      setIntake(saved.intake ?? intakeDefaults);
      setSafety(saved.safety ?? safetyDefaults);
      setResponses(saved.responses ?? []);
      setStars(saved.stars ?? 0);
      setViewMode(saved.viewMode ?? "child");
    } catch {
      localStorage.removeItem(SAVE_KEY);
      setHasSaved(false);
    }
  }

  function clearSaved() {
    localStorage.removeItem(SAVE_KEY);
    setHasSaved(false);
  }

  function next() {
    setQuestionIndex(0);
    setStep((s) => Math.min(s + 1, flow.length - 1));
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 20);
  }

  function back() {
    setQuestionIndex(0);
    setStep((s) => Math.max(s - 1, 0));
  }

  function answer(response) {
    const scoreStars = response.score >= 75 ? 2 : response.score >= 45 ? 1 : 0;
    const currentList = questions[current.id];
    const updatedResponses = [...responses, response];
    setResponses(updatedResponses);
    setStars((old) => old + scoreStars);
    setFeedback({ score: response.score, stars: scoreStars });

    setTimeout(() => {
      setFeedback(null);
      const moduleResponses = updatedResponses.filter((r) => r.moduleId === current.id);
      const decision = adaptiveNextIndex({ questionList: currentList, currentIndex: questionIndex, moduleResponses });
      if (decision.stop) next();
      else setQuestionIndex(decision.nextIndex);
    }, 550);
  }

  function restart() {
    setStep(0);
    setQuestionIndex(0);
    setResponses([]);
    setStars(0);
    setSafety(safetyDefaults);
    clearSaved();
  }

  return (
    <div className="app" dir="rtl">
      <style>{css}</style>
      <Header current={current} progress={progress} stars={stars} viewMode={viewMode} setViewMode={setViewMode} />
      {feedback && <Feedback score={feedback.score} stars={feedback.stars} />}
      <div className={viewMode === "therapist" ? "layout therapistLayout" : "layout childLayout"}>
        <main>
          {current.kind === "welcome" && <Welcome onNext={next} hasSaved={hasSaved} onResume={restoreSaved} onClearSaved={clearSaved} />}
          {current.kind === "onboarding" && <Onboarding intake={intake} setIntake={setIntake} onNext={next} />}
          {current.kind === "safety" && <Safety safety={safety} setSafety={setSafety} onNext={next} onBack={back} />}
          {current.kind === "module" && <Mission id={current.id} index={questionIndex} onAnswer={answer} onBack={back} viewMode={viewMode} />}
          {current.kind === "results" && <Results intake={intake} safety={safety} responses={responses} stars={stars} viewMode={viewMode} onRestart={restart} />}
        </main>
        {viewMode === "therapist" && <Timeline step={step} />}
      </div>
    </div>
  );
}

function Header({ current, progress, stars, viewMode, setViewMode }) {
  return (
    <header className="hero">
      <div className="heroTop">
        <div className="mascot">🦉</div>
        <div>
          <p>رحلة فصيح</p>
          <h1>{viewMode === "child" ? current.childTitle : current.therapistTitle}</h1>
          <span>{viewMode === "child" ? "مهمات قصيرة، نجوم، وتشجيع." : "وضع الأخصائي: درجات، زمن، أخطاء، وتقرير."}</span>
        </div>
      </div>
      <div className="heroBadges">
        <Badge>⭐ {stars}</Badge>
        <Badge>{progress}%</Badge>
        <button className="modeButton" onClick={() => setViewMode(viewMode === "child" ? "therapist" : "child")}>{viewMode === "child" ? "وضع الأخصائي" : "وضع الطفل"}</button>
      </div>
      <Progress value={progress} />
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
          <span>{s.therapistTitle}</span>
        </div>
      ))}
    </aside>
  );
}

function Feedback({ score, stars }) {
  const message = score >= 75 ? "رائع!" : score >= 45 ? "محاولة جيدة" : "ولا يهمك، كمل";
  return <div className="feedback"><b>{message}</b><span>{"⭐".repeat(Math.max(1, stars))}</span></div>;
}

function Welcome({ onNext, hasSaved, onResume, onClearSaved }) {
  return (
    <section className="card intro">
      <div className="guide">
        <div className="owl">🦉</div>
        <div>
          <h2>أهلًا، أنا فصيح!</h2>
          <p>هنعمل شوية أنشطة قصيرة بالصور، الحروف، الأصوات، والذاكرة. اجمع نجوم وكمل الرحلة براحتك.</p>
        </div>
      </div>
      <div className="featureGrid">
        <Feature icon="🎧" title="اسمع" text="تعليمات قصيرة وواضحة." />
        <Feature icon="🧩" title="العب" text="اختيارات، ترتيب، صيد حروف، وسرعة." />
        <Feature icon="⭐" title="اجمع نجوم" text="تشجيع بعد كل نشاط." />
      </div>
      <Notice warn>هذه الرحلة للفرز والتوجيه التدريبي فقط، وليست تشخيصًا طبيًا نهائيًا.</Notice>
      <div className="row">
        <button className="primary big" onClick={onNext}>ابدأ الرحلة</button>
        {hasSaved && <button className="secondary" onClick={onResume}>استكمال السابق</button>}
        {hasSaved && <button className="ghost" onClick={onClearSaved}>مسح الحفظ</button>}
      </div>
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
        <Select label="تاريخ عائلي لصعوبات القراءة؟" value={intake.familyHistory} onChange={(v) => setIntake({ ...intake, familyHistory: v })} options={yn} />
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

function Mission({ id, index, onAnswer, onBack, viewMode }) {
  const [resting, setResting] = useState(false);
  const meta = missionMeta[id];
  const item = questions[id][index];
  return (
    <section className="card mission">
      <div className="missionHead">
        <div>
          <span className="missionTag">{viewMode === "child" ? meta.title : meta.domain}</span>
          <h2>{index === 0 ? meta.intro : "نشاط جديد"}</h2>
        </div>
        <div className="bubble">{index + 1}/{questions[id].length}</div>
      </div>
      <div className="miniProgress"><i style={{ width: `${(index / questions[id].length) * 100}%` }} /></div>
      {resting ? <Rest onResume={() => setResting(false)} /> : <Question key={item.id} item={item} moduleId={id} onAnswer={onAnswer} viewMode={viewMode} />}
      <div className="row footerActions"><button className="secondary" onClick={() => setResting(true)}>استراحة</button><button className="ghost" onClick={onBack}>رجوع</button></div>
    </section>
  );
}

function Rest({ onResume }) {
  return <div className="rest"><div>🍊</div><h3>استراحة قصيرة</h3><p>خد نفس، اشرب مياه، ولما تكون جاهز كمل الرحلة.</p><button className="primary" onClick={onResume}>كمل</button></div>;
}

function Question({ item, moduleId, onAnswer, viewMode }) {
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
    const id = setInterval(() => setElapsed(Date.now() - timerStart), 100);
    return () => clearInterval(id);
  }, [timerStart]);

  function finish(accuracyScore, answer, extra = {}) {
    const responseTimeMs = extra.elapsedMs || Date.now() - start;
    const scored = adaptiveScore(item, accuracyScore, responseTimeMs, extra);
    onAnswer({
      moduleId,
      itemId: item.id,
      domain: item.domain,
      skill: item.skill,
      type: item.type,
      difficulty: item.difficulty,
      prompt: item.prompt,
      selectedAnswer: answer,
      correctAnswer: item.correctAnswer || item.correctSequence || item.correctIndexes || item.sequence || null,
      score: scored.score,
      isCorrect: scored.score >= 70,
      responseTimeMs,
      scoring: scored,
      timestamp: new Date().toISOString(),
      ...extra,
    });
  }

  function submitChoice(value = selected) {
    finish(normalizeArabic(value) === normalizeArabic(item.correctAnswer) ? 100 : 0, value);
  }

  function submitText() {
    finish(fuzzyScore(text, item.correctAnswer), text);
  }

  function submitSequence() {
    let points = 0;
    item.correctSequence.forEach((value, i) => {
      if (normalizeArabic(sequence[i]) === normalizeArabic(value)) points += 1;
    });
    const lengthPenalty = Math.abs(sequence.length - item.correctSequence.length) * 12;
    finish((points / item.correctSequence.length) * 100 - lengthPenalty, sequence, { sequenceLength: sequence.length });
  }

  function submitMulti() {
    const correct = new Set(item.correctIndexes);
    const picked = new Set(multi);
    const falsePositiveCount = multi.filter((x) => !correct.has(x)).length;
    const missingCount = item.correctIndexes.filter((x) => !picked.has(x)).length;
    let points = 0;
    item.grid.forEach((_, i) => {
      if (correct.has(i) === picked.has(i)) points += 1;
    });
    finish((points / item.grid.length) * 100, multi, { falsePositiveCount, missingCount });
  }

  function reveal() {
    setShowStimulus(true);
    setStimulusSeen(true);
    setTimeout(() => setShowStimulus(false), item.exposureMs || 3000);
  }

  function submitMemory() {
    const typed = normalizeArabic(text).split(/[\s،,]+/).filter(Boolean);
    let points = 0;
    item.sequence.forEach((value, i) => {
      if (normalizeArabic(typed[i]) === normalizeArabic(value)) points += 1;
    });
    const extraPenalty = Math.max(0, typed.length - item.sequence.length) * 10;
    finish((points / item.sequence.length) * 100 - extraPenalty, typed);
  }

  function submitTimedNaming() {
    const used = elapsed || Date.now() - start;
    const errorCount = Number(errors || 0);
    const accuracy = ((item.expectedCount - errorCount) / item.expectedCount) * 100;
    finish(accuracy, `errors:${errorCount}`, { elapsedMs: used, errorCount });
  }

  function submitReaction() {
    const used = Date.now() - start;
    const correct = normalizeArabic(selected) === normalizeArabic(item.correctAnswer);
    finish(correct ? 100 : 0, selected, { elapsedMs: used });
  }

  function submitTimedReading() {
    const used = elapsed || Date.now() - start;
    const correct = normalizeArabic(selected) === normalizeArabic(item.correctAnswer);
    finish(correct ? 100 : 0, selected, { elapsedMs: used });
  }

  return (
    <div className="question">
      <div className="qTop">
        <span>🎯 نشاط</span>
        {viewMode === "therapist" && <span>صعوبة {item.difficulty}</span>}
        {item.spokenPrompt && <button className="sound" onClick={() => speak(item.spokenPrompt)}>🔊 اسمع</button>}
      </div>
      <h3>{item.prompt}</h3>

      {item.type === "imageChoice" && <ImageChoice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitChoice} />}
      {item.type === "choice" && <Choice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitChoice} />}
      {item.type === "colorChoice" && <ColorChoice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitChoice} />}
      {item.type === "multiSelect" && <><div className="letterGrid">{item.grid.map((x, i) => <button key={i} className={multi.includes(i) ? "selected" : ""} onClick={() => setMulti((old) => old.includes(i) ? old.filter((n) => n !== i) : [...old, i])}>{x}</button>)}</div><button className="primary" disabled={!multi.length} onClick={submitMulti}>تأكيد الصيد</button></>}
      {item.type === "orderedTap" && <OrderedTap choices={item.choices} sequence={sequence} setSequence={setSequence} onSubmit={submitSequence} />}
      {item.type === "visualMemory" && <><div className="memory">{!stimulusSeen && <button className="secondary" onClick={reveal}>إظهار الكلمة</button>}{showStimulus && <strong>{item.stimulus}</strong>}{stimulusSeen && !showStimulus && <span>اختار ما ظهر</span>}</div>{stimulusSeen && !showStimulus && <Choice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitChoice} />}</>}
      {item.type === "memorySpan" && <><div className="memory">{!stimulusSeen && <button className="secondary" onClick={reveal}>عرض التسلسل</button>}{showStimulus && <strong>{item.sequence.join("  •  ")}</strong>}{stimulusSeen && !showStimulus && <span>اكتب ما تتذكره</span>}</div><input className="answer" disabled={!stimulusSeen || showStimulus} value={text} onChange={(e) => setText(e.target.value)} placeholder={item.placeholder || "اكتب هنا"} /><button className="primary" disabled={!text.trim()} onClick={submitMemory}>تأكيد</button></>}
      {item.type === "textInput" && <><input className="answer" value={text} onChange={(e) => setText(e.target.value)} placeholder={item.placeholder || "اكتب هنا"} /><button className="primary" disabled={!text.trim()} onClick={submitText}>تأكيد</button></>}
      {item.type === "timedNaming" && <><Timer elapsed={elapsed} started={!!timerStart} onStart={() => setTimerStart(Date.now())} onStop={() => setTimerStart(null)} /><div className="timedGrid">{item.stimuli.map((x, i) => <div className="tile" key={i}>{x}</div>)}</div><label className="label compact">عدد الأخطاء أو الترددات<select value={errors} onChange={(e) => setErrors(e.target.value)}><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4 أو أكثر</option></select></label><button className="primary" disabled={!timerStart && !elapsed} onClick={submitTimedNaming}>تم</button></>}
      {item.type === "reactionChoice" && <><div className="emojiBig">{item.stimulus.icon}</div><Choice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitReaction} /></>}
      {item.type === "timedReading" && <><div className="reading">{item.text}</div><Timer elapsed={elapsed} started={!!timerStart} onStart={() => setTimerStart(Date.now())} onStop={() => setReadingDone(true)} stopText="انتهيت" />{readingDone && <><h4>{item.question}</h4><Choice choices={item.choices} selected={selected} setSelected={setSelected} onSubmit={submitTimedReading} /></>}</>}
    </div>
  );
}

function ImageChoice({ choices, selected, setSelected, onSubmit }) {
  return <><div className="imageChoices">{choices.map((c) => <button key={c.value} className={selected === c.value ? "selected" : ""} onClick={() => setSelected(c.value)}><div className="emojiCard">{c.icon}</div><b>{c.label}</b></button>)}</div><button className="primary" disabled={!selected} onClick={() => onSubmit(selected)}>تأكيد</button></>;
}

function Choice({ choices, selected, setSelected, onSubmit }) {
  return <><div className="choices">{choices.map((c) => <button key={c} className={selected === c ? "selected" : ""} onClick={() => setSelected(c)}>{c}</button>)}</div><button className="primary" disabled={!selected} onClick={() => onSubmit(selected)}>تأكيد</button></>;
}

function ColorChoice({ choices, selected, setSelected, onSubmit }) {
  return <><div className="colors">{choices.map((c) => <button key={c.value} className={selected === c.value ? "selected" : ""} style={{ background: c.color }} onClick={() => setSelected(c.value)} />)}</div><button className="primary" disabled={!selected} onClick={() => onSubmit(selected)}>تأكيد</button></>;
}

function OrderedTap({ choices, sequence, setSequence, onSubmit }) {
  return <><div className="sequence">اختيارك: <b>{sequence.length ? sequence.join(" ← ") : "ابدأ الضغط"}</b></div><div className="choices">{choices.map((c) => <button key={c} onClick={() => setSequence((old) => [...old, c])}>{c}</button>)}</div><div className="row"><button className="secondary" onClick={() => setSequence([])}>مسح</button><button className="primary" disabled={!sequence.length} onClick={onSubmit}>تأكيد</button></div></>;
}

function Timer({ elapsed, started, onStart, onStop, stopText = "إيقاف" }) {
  return <div className="timer"><div><span>الوقت</span><b>{(elapsed / 1000).toFixed(1)}s</b></div>{!started ? <button className="primary" onClick={onStart}>ابدأ</button> : <button className="secondary" onClick={onStop}>{stopText}</button>}</div>;
}

function Results({ intake, safety, responses, stars, viewMode, onRestart }) {
  const results = useMemo(() => computeResults(responses, safety, intake), [responses, safety, intake]);
  const plan = useMemo(() => makePlan(results.domainScores), [results.domainScores]);
  const [copied, setCopied] = useState(false);
  const labels = { spokenLanguage: "فهم التعليمات", phonological: "الأصوات", orthographic: "الحروف والأشكال", rapidNaming: "السرعة", decoding: "القراءة", spellingMemory: "الإملاء والذاكرة" };
  const payload = { assessmentType: "gamified_arabic_egyptian_pretest_v2", createdAt: new Date().toISOString(), intake, safety, stars, viewMode, ...results, therapyPlan: plan, responses, note: "Screening only. Not standalone diagnosis." };

  async function copy() {
    await navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  if (viewMode === "child") {
    return <section className="card results"><div className="resultHero"><div><span className="missionTag">خريطة فصيح</span><h2>أحسنت يا {intake.childName || "بطل"}!</h2><p>جمعت {stars} نجمة. سنبدأ لك رحلة تدريب مناسبة.</p></div><div className="scoreOrb"><b>⭐</b><span>{stars}</span></div></div><h3>المغامرات المقترحة</h3><div className="plans">{plan.map((p, i) => <div className="plan" key={p.domain}><b>{i + 1}</b><div><h4>{p.title}</h4><p>{p.game}</p></div><span>مستوى {p.level}</span></div>)}</div><button className="primary" onClick={onRestart}>رحلة جديدة</button></section>;
  }

  return <section className="card results"><div className="resultHero"><div><span className="missionTag">تقرير الأخصائي</span><h2>تقرير: {intake.childName || "بدون اسم"}</h2><p>الدرجة العامة تستخدم دقة، سرعة، صعوبة السؤال، واستبيان ولي الأمر.</p></div><div className="scoreOrb"><b>{results.overall}</b><span>/100</span></div></div><Notice>مؤشر استبيان ولي الأمر: <b>{results.questionnaireRisk}%</b>. يستخدم كمعلومة مساعدة فقط.</Notice>{results.flags.length > 0 && <Notice warn>{results.flags.map((f) => <p key={f}>{f}</p>)}</Notice>}<div className="scoreGrid">{Object.entries(results.domainScores).map(([d, s]) => <div className="scoreCard" key={d}><h3>{labels[d]}</h3><strong>{s ?? "—"}</strong><div className="miniProgress"><i style={{ width: `${s ?? 0}%` }} /></div></div>)}</div><h3>المسارات العلاجية المقترحة</h3><div className="plans">{plan.map((p, i) => <div className="plan" key={p.domain}><b>{i + 1}</b><div><h4>{p.title}</h4><p>{p.game}</p></div><span>مستوى {p.level}</span></div>)}</div><h3>أضعف المهارات التفصيلية</h3><div className="chips">{Object.entries(results.skillScores).sort((a, b) => a[1] - b[1]).slice(0, 8).map(([k, v]) => <span key={k}>{k}: {v}</span>)}</div><details className="json"><summary>JSON للتخزين</summary><pre>{JSON.stringify(payload, null, 2)}</pre></details><div className="row"><button className="secondary" onClick={onRestart}>إعادة الرحلة</button><button className="primary" onClick={copy}>{copied ? "تم النسخ" : "نسخ JSON"}</button></div></section>;
}

function Title({ tag, title, text }) { return <div className="title"><span className="missionTag">{tag}</span><div><h2>{title}</h2><p>{text}</p></div></div>; }
function Badge({ children }) { return <span className="badge">{children}</span>; }
function Feature({ icon, title, text }) { return <div className="feature"><div>{icon}</div><h3>{title}</h3><p>{text}</p></div>; }
function Notice({ children, warn }) { return <div className={`notice ${warn ? "warn" : ""}`}>{children}</div>; }
function Progress({ value }) { return <div className="progress"><i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>; }
function Field({ label, value, onChange, placeholder = "", type = "text" }) { return <label className="label">{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>; }
function Select({ label, value, onChange, options }) { return <label className="label">{label}<select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>; }
function Check({ checked, onChange, children }) { return <label className="check"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span>{children}</span></label>; }

const css = `
*{box-sizing:border-box}html,body,#root{margin:0;min-height:100%;width:100%;overflow-x:hidden}body{background:radial-gradient(circle at top right,#fed7aa,transparent 35%),#fff7ed;color:#3b2f2f;font-family:Inter,Tahoma,Arial,sans-serif}button,input,select{font:inherit}button{cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}.app{width:100%;max-width:1180px;margin-inline:auto;padding:22px}.hero{background:linear-gradient(135deg,#7c2d12,#f97316);color:white;border-radius:34px;padding:24px;box-shadow:0 24px 70px #9a341233;margin-bottom:22px}.heroTop{display:flex;align-items:center;gap:16px}.mascot{width:70px;height:70px;border-radius:25px;background:#ffffff26;display:grid;place-items:center;font-size:38px}.hero p{margin:0 0 4px;color:#ffedd5;font-size:13px;font-weight:900}.hero h1{margin:0;font-size:clamp(28px,4vw,44px)}.hero span{display:block;margin-top:8px;color:#ffedd5}.heroBadges{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}.badge,.modeButton{background:#fff7ed;color:#9a3412;border-radius:999px;padding:8px 14px;font-weight:950;border:0}.progress,.miniProgress{height:10px;background:#ffedd5;border-radius:999px;overflow:hidden}.progress i,.miniProgress i{display:block;height:100%;background:linear-gradient(90deg,#facc15,#fb923c,#ea580c);transition:.3s}.layout{display:grid;gap:22px;align-items:start}.therapistLayout{grid-template-columns:minmax(0,1fr) 300px;direction:ltr}.childLayout{grid-template-columns:minmax(0,1fr)}main{min-width:0;direction:rtl}.side{direction:rtl;position:sticky;top:20px;background:#fffaf3cc;border:1px solid #fed7aa;border-radius:26px;padding:18px;box-shadow:0 18px 55px #9a341212}.side h3{text-align:center;margin:0 0 14px}.step{display:flex;gap:10px;align-items:center;padding:10px;border-radius:16px;color:#7c5b45}.step b{width:28px;height:28px;border-radius:50%;background:#ffedd5;display:grid;place-items:center}.step.active{background:#fff7ed;color:#c2410c;font-weight:950}.step.active b{background:#f97316;color:white}.step.done{color:#15803d}.card{background:#fffaf3e8;border:1px solid #fed7aa;border-radius:34px;padding:28px;box-shadow:0 24px 70px #9a34121c;animation:fade .25s ease both}@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.guide,.title,.missionHead,.resultHero{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:22px}.guide{align-items:center}.owl{width:105px;height:105px;border-radius:34px;background:#ffedd5;display:grid;place-items:center;font-size:62px}.guide h2,.title h2,.missionHead h2,.resultHero h2{margin:0 0 8px;font-size:30px}.guide p,.title p,.missionHead p,.resultHero p,.feature p{color:#7c5b45;line-height:1.8;margin:0}.missionTag{display:inline-flex;background:#ffedd5;color:#c2410c;border-radius:999px;padding:8px 13px;font-size:12px;font-weight:950}.featureGrid,.grid2,.scoreGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.feature{background:white;border:1px solid #fed7aa;border-radius:26px;padding:18px}.feature div{font-size:35px}.feature h3{margin:8px 0 5px}.notice{background:#fff7ed;border:1px solid #fed7aa;border-radius:22px;padding:15px 17px;margin:18px 0;line-height:1.8}.notice.warn{background:#fff1f2;border-color:#fecdd3;color:#9f1239}.primary,.secondary,.ghost,.sound{border:0;border-radius:18px;padding:13px 20px;font-weight:950}.primary{background:#f97316;color:white;box-shadow:0 14px 28px #f9731633}.primary:hover:not(:disabled){background:#ea580c}.primary.big{font-size:18px;padding:16px 24px}.secondary{background:#ffedd5;color:#9a3412}.ghost{background:transparent;color:#9a3412}.sound{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.label{display:grid;gap:8px;font-weight:900;color:#5b4334}input,select{width:100%;border:1px solid #fed7aa;background:white;border-radius:18px;padding:14px;color:#3b2f2f;outline:none}input:focus,select:focus{border-color:#fb923c;box-shadow:0 0 0 4px #ffedd5}.checks{display:grid;gap:12px}.check{display:flex;gap:12px;align-items:center;background:white;border:1px solid #fed7aa;border-radius:20px;padding:14px;font-weight:900}.check input{width:20px;height:20px}.mission{min-height:620px}.bubble,.scoreOrb{width:96px;height:96px;border-radius:32px;background:#ffedd5;color:#c2410c;display:grid;place-items:center;font-size:26px;font-weight:950;flex:0 0 auto}.question{margin-top:22px;background:white;border:1px solid #fed7aa;border-radius:30px;padding:22px}.qTop{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px}.qTop span{background:#fff7ed;color:#9a3412;border-radius:999px;padding:7px 11px;font-weight:950;font-size:12px}.question h3{margin:0 0 16px;font-size:25px}.imageChoices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:18px 0}.imageChoices button{border:2px solid #fed7aa;background:#fffaf3;border-radius:28px;padding:12px;font-weight:950;color:#3b2f2f}.imageChoices button.selected,.choices button.selected,.letterGrid button.selected{border-color:#f97316;background:#ffedd5;box-shadow:0 0 0 4px #fed7aa}.emojiCard{height:130px;background:#fff7ed;border-radius:22px;display:grid;place-items:center;font-size:62px;margin-bottom:8px}.choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:18px 0}.choices button{min-height:62px;border:2px solid #fed7aa;background:#fffaf3;border-radius:20px;font-size:19px;font-weight:950;color:#3b2f2f}.colors{display:flex;gap:16px;justify-content:center;margin:24px 0}.colors button{width:96px;height:96px;border-radius:50%;border:6px solid white;box-shadow:0 10px 24px #7c2d121f}.colors button.selected{outline:6px solid #f97316}.letterGrid{display:grid;grid-template-columns:repeat(3,90px);gap:12px;justify-content:center;margin:20px 0}.letterGrid button,.tile{height:82px;border:2px solid #fed7aa;border-radius:22px;background:#fffaf3;font-size:28px;font-weight:950;color:#3b2f2f;display:grid;place-items:center}.sequence{background:#fff7ed;border:1px dashed #fb923c;border-radius:20px;padding:14px;margin:14px 0}.answer{margin:18px 0;font-size:22px;text-align:right}.memory,.rest{min-height:160px;background:#fff7ed;border:1px dashed #fb923c;border-radius:28px;margin:18px 0;padding:20px;display:grid;place-items:center;text-align:center}.memory strong{font-size:42px;color:#c2410c}.timer{display:flex;justify-content:space-between;gap:14px;align-items:center;background:#fff7ed;border:1px solid #fed7aa;border-radius:24px;padding:16px;margin:18px 0}.timer span{display:block;color:#9a3412;font-size:12px;font-weight:950}.timer b{font-size:32px}.timedGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:18px 0}.label.compact{max-width:260px}.reading{font-size:30px;line-height:2;font-weight:950;background:#fff7ed;border:1px solid #fed7aa;border-radius:24px;padding:22px;margin:18px 0}.emojiBig{height:180px;display:grid;place-items:center;font-size:90px;background:#fff7ed;border:1px dashed #fb923c;border-radius:28px;margin:18px 0}.feedback{position:fixed;top:22px;left:50%;transform:translateX(-50%);background:#431407;color:white;border-radius:999px;padding:14px 22px;z-index:20;display:flex;gap:12px;align-items:center;box-shadow:0 20px 50px #0003}.scoreOrb b{font-size:46px}.scoreOrb span{color:#9a3412}.scoreCard{background:white;border:1px solid #fed7aa;border-radius:24px;padding:18px}.scoreCard h3{margin:0}.scoreCard strong{font-size:42px}.plans{display:grid;gap:12px}.plan{display:grid;grid-template-columns:42px 1fr auto;gap:14px;align-items:center;background:white;border:1px solid #fed7aa;border-radius:24px;padding:16px}.plan>b{width:42px;height:42px;border-radius:16px;background:#ffedd5;color:#c2410c;display:grid;place-items:center}.plan h4,.plan p{margin:0}.plan p{color:#7c5b45}.plan span{background:#ffedd5;color:#c2410c;border-radius:999px;padding:8px 12px;font-weight:950}.chips{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}.chips span{background:#fff7ed;border:1px solid #fed7aa;border-radius:999px;padding:8px 12px;font-weight:900}.json{margin:18px 0;background:#431407;color:white;border-radius:22px;padding:14px}.json pre{direction:ltr;text-align:left;overflow:auto;max-height:320px;color:#ffedd5;font-size:12px}@media(max-width:850px){.therapistLayout,.featureGrid,.grid2,.imageChoices,.choices,.scoreGrid,.timedGrid{grid-template-columns:1fr}.guide,.missionHead,.resultHero{flex-direction:column}.plan{grid-template-columns:1fr}.side{position:static}.emojiCard{height:120px}}@media(max-width:520px){.app{padding:14px}.hero,.card{padding:18px;border-radius:26px}.heroTop{align-items:flex-start}.mascot{width:58px;height:58px;font-size:32px}.letterGrid{grid-template-columns:repeat(3,1fr)}.reading{font-size:23px}.colors button{width:76px;height:76px}.emojiCard{font-size:52px}}
`;
