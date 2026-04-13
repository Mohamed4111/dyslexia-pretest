import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { CheckCircle2, Clock3, Brain, BookOpen, AudioLines, RotateCcw } from "lucide-react";

const intakeDefaults = {
  childName: "",
  age: "",
  grade: "",
  canReadLetters: "yes",
  usesHarakat: "sometimes",
  dialect: "egyptian",
};

const modules = [
  { id: "phonological", title: "الوعي الصوتي", icon: AudioLines },
  { id: "orthographic", title: "التمييز البصري والحروفي", icon: Brain },
  { id: "rapidNaming", title: "السرعة والاسترجاع", icon: Clock3 },
  { id: "decoding", title: "فك التشفير والقراءة", icon: BookOpen },
];

const questions = [
  {
    id: "PA_001",
    module: "phonological",
    type: "mcq",
    prompt: "أي كلمة تبدأ بنفس الصوت: ب؟",
    helper: "اختَر الكلمة التي تبدأ بصوت ب.",
    choices: ["بيت", "قلم", "شمس"],
    correctAnswer: "بيت",
    difficulty: 1,
    skill: "phoneme_initial",
  },
  {
    id: "PA_002",
    module: "phonological",
    type: "mcq",
    prompt: "لو جمعنا الأصوات: ب + ا + ب، تكون الكلمة؟",
    helper: "جرّب نطق الأصوات معًا.",
    choices: ["باب", "بحر", "بيت"],
    correctAnswer: "باب",
    difficulty: 1,
    skill: "blending",
  },
  {
    id: "PA_003",
    module: "phonological",
    type: "mcq",
    prompt: "ما الكلمة الناتجة من كلمة كتاب بدون ك؟",
    helper: "احذف أول صوت فقط.",
    choices: ["تاب", "باب", "كتاب"],
    correctAnswer: "تاب",
    difficulty: 2,
    skill: "deletion",
  },
  {
    id: "PA_004",
    module: "phonological",
    type: "mcq",
    prompt: "كلمة مدرسة فيها كام جزء صوتي قريب؟",
    helper: "فكّر فيها كمقاطع: مد / ر / سة.",
    choices: ["2", "3", "4"],
    correctAnswer: "3",
    difficulty: 2,
    skill: "segmentation",
  },
  {
    id: "OR_001",
    module: "orthographic",
    type: "mcq",
    prompt: "أي حرف مختلف عن الباقي؟",
    helper: "ركّز على شكل الحرف والنِّقاط.",
    choices: ["ب", "ت", "ح"],
    correctAnswer: "ح",
    difficulty: 1,
    skill: "visual_discrimination",
  },
  {
    id: "OR_002",
    module: "orthographic",
    type: "mcq",
    prompt: "هل الكلمتان متشابهتان أم مختلفتان؟ بيت / نيت",
    helper: "لاحظ الحرف الأول جيدًا.",
    choices: ["متشابهتان", "مختلفتان"],
    correctAnswer: "مختلفتان",
    difficulty: 1,
    skill: "word_compare",
  },
  {
    id: "OR_003",
    module: "orthographic",
    type: "mcq",
    prompt: "أي شكل يناسب الصوت: بِت؟",
    helper: "انتبه إلى الكسرة.",
    choices: ["بَت", "بِت", "بُت"],
    correctAnswer: "بِت",
    difficulty: 2,
    skill: "harakat_mapping",
  },
  {
    id: "OR_004",
    module: "orthographic",
    type: "mcq",
    prompt: "أي صيغة تمثل حرف ع في وسط الكلمة؟",
    helper: "فكّر في الشكل الوسطي للحرف.",
    choices: ["ع", "ـعـ", "ـع"],
    correctAnswer: "ـعـ",
    difficulty: 2,
    skill: "positional_form",
  },
  {
    id: "RN_001",
    module: "rapidNaming",
    type: "timedGrid",
    prompt: "سمِّ العناصر التالية بسرعة بالترتيب، ثم اضغط تم.",
    helper: "اقرأ: تفاحة، قطة، شمس، باب، كرة، سمك.",
    stimuli: ["تفاحة", "قطة", "شمس", "باب", "كرة", "سمك"],
    difficulty: 1,
    skill: "rapid_retrieval",
    idealTimeMs: 6000,
  },
  {
    id: "RN_002",
    module: "rapidNaming",
    type: "timedGrid",
    prompt: "سمِّ هذه العناصر بسرعة، ثم اضغط تم.",
    helper: "اقرأ: قمر، وردة، قلم، عين، كتاب، موز.",
    stimuli: ["قمر", "وردة", "قلم", "عين", "كتاب", "موز"],
    difficulty: 2,
    skill: "rapid_retrieval",
    idealTimeMs: 7000,
  },
  {
    id: "RD_001",
    module: "decoding",
    type: "mcq",
    prompt: "أي حرف يمثل الصوت ب؟",
    helper: "اختَر الحرف الصحيح.",
    choices: ["ب", "ت", "ث"],
    correctAnswer: "ب",
    difficulty: 1,
    skill: "letter_sound",
  },
  {
    id: "RD_002",
    module: "decoding",
    type: "mcq",
    prompt: "أي كلمة غير حقيقية ولكن يمكن قراءتها؟",
    helper: "هذه لا تحتاج حفظ، فقط فك حروفها.",
    choices: ["دَبُت", "مدرسة", "قلم"],
    correctAnswer: "دَبُت",
    difficulty: 2,
    skill: "nonword_decoding",
  },
  {
    id: "RD_003",
    module: "decoding",
    type: "mcq",
    prompt: "أي قراءة صحيحة للكلمة: مدرسة؟",
    helper: "اختَر النطق الأقرب الصحيح.",
    choices: ["مدرسة", "مزرسة", "مدسرة"],
    correctAnswer: "مدرسة",
    difficulty: 2,
    skill: "word_reading",
  },
  {
    id: "RD_004",
    module: "decoding",
    type: "mcq",
    prompt: "أي جملة أبسط وأسهل في القراءة؟",
    helper: "هذا يقيس بداية الطلاقة القرائية.",
    choices: ["ذهب الولد إلى المدرسة", "استطاع المستكشف استكشاف المستودع", "تتشابك الأغصان المتداخلة"],
    correctAnswer: "ذهب الولد إلى المدرسة",
    difficulty: 3,
    skill: "sentence_reading",
  },
];

function levelLabel(score) {
  if (score >= 80) return { text: "قوي", tone: "bg-green-100 text-green-700" };
  if (score >= 60) return { text: "محتاج متابعة بسيطة", tone: "bg-yellow-100 text-yellow-700" };
  if (score >= 40) return { text: "ضعيف متوسط", tone: "bg-orange-100 text-orange-700" };
  return { text: "ضعيف", tone: "bg-red-100 text-red-700" };
}

function recommendationForScores(scores) {
  const recs = [];
  if ((scores.phonological ?? 100) < 60) recs.push("ابدأ بألعاب الوعي الصوتي: البداية بالصوت، دمج الأصوات، حذف الصوت.");
  if ((scores.orthographic ?? 100) < 60) recs.push("ابدأ بألعاب التمييز بين الحروف المتشابهة والنقاط والحركات.");
  if ((scores.rapidNaming ?? 100) < 60) recs.push("أضف ألعاب سرعة التسمية والاسترجاع السريع مع عناصر مألوفة.");
  if ((scores.decoding ?? 100) < 60) recs.push("ابدأ بمستويات قراءة الحرف، ثم المقطع، ثم الكلمات غير الحقيقية، ثم الكلمات الحقيقية.");
  if (recs.length === 0) recs.push("يمكن البدء بمسار متوازن مع مستوى متوسط في جميع الألعاب ثم إعادة التقييم لاحقًا.");
  return recs;
}

function AppHeader() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-900 p-3 text-white">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Arabic Dyslexia Pretest</h1>
          <p className="text-sm text-slate-600">نموذج أولي قابل للتجربة لتقييم مبدئي لمستخدمين اللغة العربية باللهجة المصرية في التعليمات.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Badge key={m.id} variant="secondary" className="rounded-full px-3 py-1 text-sm">
              <Icon className="mr-1 h-4 w-4" /> {m.title}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

function IntakeScreen({ intake, setIntake, onStart }) {
  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-right text-2xl">بيانات البداية</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-right">
        <p className="text-sm text-slate-600">هنبدأ شوية أسئلة بسيطة علشان نعرف المستوى ونطلع خطة مناسبة للألعاب العلاجية.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>اسم الطفل</Label>
            <Input value={intake.childName} onChange={(e) => setIntake({ ...intake, childName: e.target.value })} placeholder="مثال: آدم" />
          </div>
          <div className="grid gap-2">
            <Label>العمر</Label>
            <Input type="number" value={intake.age} onChange={(e) => setIntake({ ...intake, age: e.target.value })} placeholder="8" />
          </div>
          <div className="grid gap-2">
            <Label>الصف الدراسي</Label>
            <Input value={intake.grade} onChange={(e) => setIntake({ ...intake, grade: e.target.value })} placeholder="مثال: Grade 3" />
          </div>
          <div className="grid gap-2 text-right">
            <Label>اللهجة المستخدمة في التعليمات</Label>
            <Select value={intake.dialect} onValueChange={(v) => setIntake({ ...intake, dialect: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="egyptian">Egyptian Arabic</SelectItem>
                <SelectItem value="msa">Modern Standard Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 text-right">
            <Label>هل يعرف الحروف العربية؟</Label>
            <Select value={intake.canReadLetters} onValueChange={(v) => setIntake({ ...intake, canReadLetters: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">نعم</SelectItem>
                <SelectItem value="a_little">قليلًا</SelectItem>
                <SelectItem value="no">لا</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 text-right">
            <Label>هل يقرأ عادةً بالحركات؟</Label>
            <Select value={intake.usesHarakat} onValueChange={(v) => setIntake({ ...intake, usesHarakat: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">نعم</SelectItem>
                <SelectItem value="sometimes">أحيانًا</SelectItem>
                <SelectItem value="no">لا</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="mt-2 rounded-2xl" onClick={onStart}>ابدأ التقييم</Button>
      </CardContent>
    </Card>
  );
}

function ChoiceQuestion({ question, value, onChange }) {
  return (
    <RadioGroup value={value || ""} onValueChange={onChange} className="grid gap-3">
      {question.choices.map((choice) => (
        <label key={choice} className="flex cursor-pointer items-center justify-between rounded-2xl border p-4 hover:bg-slate-50">
          <span className="text-right text-lg">{choice}</span>
          <RadioGroupItem value={choice} />
        </label>
      ))}
    </RadioGroup>
  );
}

function TimedGridQuestion({ question, response, setResponse, currentElapsed, timerActive, onStartTimer, onFinishTimer }) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {question.stimuli.map((item) => (
          <div key={item} className="rounded-2xl border bg-white p-6 text-center text-xl font-semibold shadow-sm">
            {item}
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        المطلوب الآن: سمِّ العناصر بالترتيب بصوت عالٍ، ثم قيِّم الأداء بشكل يدوي مؤقتًا من خلال الوقت والدقة حتى نربطه لاحقًا بالصوت.
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {!timerActive ? (
          <Button onClick={onStartTimer} className="rounded-2xl">ابدأ التوقيت</Button>
        ) : (
          <Button onClick={onFinishTimer} className="rounded-2xl">تم</Button>
        )}
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-base">الوقت: {(currentElapsed / 1000).toFixed(1)} ثانية</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>عدد العناصر الصحيحة</Label>
          <Input
            type="number"
            min={0}
            max={question.stimuli.length}
            value={response?.correctCount ?? ""}
            onChange={(e) => setResponse({ ...(response || {}), correctCount: Number(e.target.value) })}
          />
        </div>
        <div className="grid gap-2">
          <Label>عدد الترددات</Label>
          <Input
            type="number"
            min={0}
            value={response?.hesitations ?? ""}
            onChange={(e) => setResponse({ ...(response || {}), hesitations: Number(e.target.value) })}
          />
        </div>
        <div className="grid gap-2">
          <Label>عدد التصحيحات الذاتية</Label>
          <Input
            type="number"
            min={0}
            value={response?.selfCorrections ?? ""}
            onChange={(e) => setResponse({ ...(response || {}), selfCorrections: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}

function TestScreen({
  question,
  index,
  total,
  answer,
  setAnswer,
  timedResponse,
  setTimedResponse,
  onNext,
  onBack,
  currentElapsed,
  timerActive,
  onStartTimer,
  onFinishTimer,
}) {
  const moduleInfo = modules.find((m) => m.id === question.module);
  const progress = ((index + 1) / total) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-3xl shadow-lg">
        <CardHeader className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <Badge className="rounded-full px-3 py-1">السؤال {index + 1} من {total}</Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">{moduleInfo?.title}</Badge>
          </div>
          <Progress value={progress} className="h-3" />
          <CardTitle className="text-right text-2xl">{question.prompt}</CardTitle>
          <p className="text-right text-sm text-slate-600">{question.helper}</p>
        </CardHeader>
        <CardContent className="grid gap-6 text-right">
          {question.type === "mcq" ? (
            <ChoiceQuestion question={question} value={answer} onChange={setAnswer} />
          ) : (
            <TimedGridQuestion
              question={question}
              response={timedResponse}
              setResponse={setTimedResponse}
              currentElapsed={currentElapsed}
              timerActive={timerActive}
              onStartTimer={onStartTimer}
              onFinishTimer={onFinishTimer}
            />
          )}
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" className="rounded-2xl" onClick={onBack} disabled={index === 0}>السابق</Button>
            <Button className="rounded-2xl" onClick={onNext}>التالي</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ResultCard({ title, score }) {
  const label = levelLabel(score);
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge className={`rounded-full px-3 py-1 ${label.tone}`}>{label.text}</Badge>
      </div>
      <div className="mb-2 text-3xl font-bold">{score}%</div>
      <Progress value={score} className="h-3" />
    </div>
  );
}

function ResultsScreen({ intake, results, onReset }) {
  const domainNames = {
    phonological: "الوعي الصوتي",
    orthographic: "التمييز البصري والحروفي",
    rapidNaming: "السرعة والاسترجاع",
    decoding: "فك التشفير والقراءة",
  };

  const overall = Math.round(
    Object.values(results.scores).reduce((a, b) => a + b, 0) / Object.values(results.scores).length
  );
  const recs = recommendationForScores(results.scores);

  return (
    <div className="grid gap-6">
      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle2 className="h-6 w-6" /> نتيجة التقييم
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="rounded-3xl bg-slate-50 p-5">
            <div className="text-sm text-slate-500">الاسم</div>
            <div className="text-xl font-semibold">{intake.childName || "بدون اسم"}</div>
            <div className="mt-3 text-sm text-slate-500">النتيجة العامة</div>
            <div className="text-4xl font-bold">{overall}%</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(results.scores).map(([key, value]) => (
              <ResultCard key={key} title={domainNames[key]} score={value} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle>التوصيات العلاجية المبدئية</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-right">
          {recs.map((rec, i) => (
            <div key={i} className="rounded-2xl border p-4">{rec}</div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle>بيانات قابلة للتحويل لقاعدة البيانات</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
{JSON.stringify(results.payload, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" className="rounded-2xl" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" /> إعادة المحاولة
        </Button>
      </div>
    </div>
  );
}

function scoreMcq(response, question) {
  if (!response) return 0;
  const base = response.selectedAnswer === question.correctAnswer ? 100 : 0;
  const speedBonus = response.responseTimeMs <= 5000 ? 5 : response.responseTimeMs <= 9000 ? 0 : -5;
  return Math.max(0, Math.min(100, base + speedBonus));
}

function scoreTimed(response, question) {
  if (!response) return 0;
  const correctCount = Number(response.correctCount || 0);
  const hesitations = Number(response.hesitations || 0);
  const selfCorrections = Number(response.selfCorrections || 0);
  const completionTime = Number(response.responseTimeMs || question.idealTimeMs * 1.8);
  const accuracyRatio = correctCount / question.stimuli.length;
  const speedRatio = Math.min(1, question.idealTimeMs / Math.max(completionTime, 1));
  const penalty = hesitations * 5 + selfCorrections * 3;
  const raw = accuracyRatio * 70 + speedRatio * 30 - penalty;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function computeResults(intake, responses) {
  const grouped = {
    phonological: [],
    orthographic: [],
    rapidNaming: [],
    decoding: [],
  };

  const responseRows = questions.map((q) => {
    const response = responses[q.id];
    const itemScore = q.type === "mcq" ? scoreMcq(response, q) : scoreTimed(response, q);
    grouped[q.module].push(itemScore);

    return {
      item_id: q.id,
      module: q.module,
      type: q.type,
      selected_answer: response?.selectedAnswer ?? null,
      is_correct: q.type === "mcq" ? response?.selectedAnswer === q.correctAnswer : null,
      response_time_ms: response?.responseTimeMs ?? null,
      correct_count: response?.correctCount ?? null,
      hesitations: response?.hesitations ?? null,
      self_corrections: response?.selfCorrections ?? null,
      item_score: itemScore,
      difficulty: q.difficulty,
      skill: q.skill,
    };
  });

  const scores = Object.fromEntries(
    Object.entries(grouped).map(([key, values]) => [
      key,
      Math.round(values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1)),
    ])
  );

  return {
    scores,
    payload: {
      intake,
      assessment_session: {
        created_at: new Date().toISOString(),
        overall_score: Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length),
      },
      domain_scores: scores,
      responses: responseRows,
      recommendations: recommendationForScores(scores),
    },
  };
}

export default function ArabicDyslexiaPretestPrototype() {
  const [stage, setStage] = useState("intro");
  const [intake, setIntake] = useState(intakeDefaults);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentElapsed, setCurrentElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerStart, setTimerStart] = useState(null);

  const currentQuestion = questions[currentIndex];
  const computed = useMemo(() => computeResults(intake, responses), [intake, responses]);

  useEffect(() => {
    let interval;
    if (timerActive && timerStart) {
      interval = setInterval(() => {
        setCurrentElapsed(Date.now() - timerStart);
      }, 100);
    }
    return () => interval && clearInterval(interval);
  }, [timerActive, timerStart]);

  useEffect(() => {
    if (!currentQuestion) return;
    const existing = responses[currentQuestion.id];
    setCurrentAnswer(existing?.selectedAnswer || "");
    setCurrentElapsed(existing?.responseTimeMs || 0);
    setTimerActive(false);
    setTimerStart(null);
  }, [currentIndex]);

  const saveCurrentResponse = () => {
    const q = currentQuestion;
    if (!q) return;

    if (q.type === "mcq") {
      setResponses((prev) => ({
        ...prev,
        [q.id]: {
          ...prev[q.id],
          selectedAnswer: currentAnswer,
          responseTimeMs: prev[q.id]?.responseTimeMs ?? 4000,
        },
      }));
    }
  };

  const handleNext = () => {
    const q = currentQuestion;

    if (q.type === "mcq") {
      const startedAt = responses[q.id]?.startedAt ?? Date.now() - 4000;
      setResponses((prev) => ({
        ...prev,
        [q.id]: {
          ...prev[q.id],
          selectedAnswer: currentAnswer,
          responseTimeMs: prev[q.id]?.responseTimeMs ?? Date.now() - startedAt,
        },
      }));
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    setStage("results");
  };

  const handleBack = () => {
    saveCurrentResponse();
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const startTest = () => {
    setStage("test");
    setCurrentIndex(0);
    setResponses({
      [questions[0].id]: { startedAt: Date.now() },
    });
  };

  useEffect(() => {
    if (stage === "test" && currentQuestion?.type === "mcq") {
      setResponses((prev) => {
        if (prev[currentQuestion.id]?.startedAt) return prev;
        return {
          ...prev,
          [currentQuestion.id]: {
            ...prev[currentQuestion.id],
            startedAt: Date.now(),
          },
        };
      });
    }
  }, [stage, currentQuestion?.id]);

  const setTimedResponse = (value) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        ...value,
        responseTimeMs: currentElapsed,
      },
    }));
  };

  const onStartTimer = () => {
    setTimerStart(Date.now());
    setCurrentElapsed(0);
    setTimerActive(true);
  };

  const onFinishTimer = () => {
    setTimerActive(false);
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        responseTimeMs: currentElapsed,
      },
    }));
  };

  const resetAll = () => {
    setStage("intro");
    setIntake(intakeDefaults);
    setCurrentIndex(0);
    setResponses({});
    setCurrentAnswer("");
    setCurrentElapsed(0);
    setTimerActive(false);
    setTimerStart(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8" dir="rtl">
      <div className="mx-auto grid max-w-5xl gap-6">
        <AppHeader />

        {stage === "intro" && (
          <IntakeScreen intake={intake} setIntake={setIntake} onStart={startTest} />
        )}

        {stage === "test" && currentQuestion && (
          <TestScreen
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            answer={currentAnswer}
            setAnswer={setCurrentAnswer}
            timedResponse={responses[currentQuestion.id]}
            setTimedResponse={setTimedResponse}
            onNext={handleNext}
            onBack={handleBack}
            currentElapsed={currentElapsed}
            timerActive={timerActive}
            onStartTimer={onStartTimer}
            onFinishTimer={onFinishTimer}
          />
        )}

        {stage === "results" && (
          <ResultsScreen intake={intake} results={computed} onReset={resetAll} />
        )}
      </div>
    </div>
  );
}
