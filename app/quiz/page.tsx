"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Question } from "@/lib/types";
import { saveAnswer, getAllQuestions, getQuestionStats } from "@/lib/storage";
import { tagColors, errorLabels } from "@/lib/constants";

type Phase = "question" | "result";

// タイマー設定（秒数、0 = オフ、任意の正の整数も可）
type TimerSetting = number;

const TIMER_PRESETS: { label: string; value: number }[] = [
  { label: "なし", value: 0 },
  { label: "20秒", value: 20 },
  { label: "30秒", value: 30 },
  { label: "1分", value: 60 },
  { label: "1分30秒", value: 90 },
  { label: "2分", value: 120 },
];

const TIMER_STORAGE_KEY = "toeic_part5_timer_setting";
const SHUFFLE_STORAGE_KEY = "toeic_part5_shuffle";
const WEAK_STORAGE_KEY = "toeic_part5_weak_mode";
const SPEECH_RATE_KEY = "toeic_part5_speech_rate";

// ── Web Speech API ────────────────────────────────────────────
function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState<number>(() => {
    if (typeof window === "undefined") return 1.0;
    return Number(localStorage.getItem(SPEECH_RATE_KEY)) || 1.0;
  });

  const stop = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    stop();
    const clean = text.replace(/_+/g, "blank");
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "en-US";
    utter.rate = rate;
    // 英語音声を優先して選択
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Daniel") || v.name.includes("Google US English"))
    ) ?? voices.find((v) => v.lang.startsWith("en-US")) ?? voices.find((v) => v.lang.startsWith("en"));
    if (enVoice) utter.voice = enVoice;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const changeRate = (r: number) => {
    setRate(r);
    localStorage.setItem(SPEECH_RATE_KEY, String(r));
    stop();
  };

  return { speak, stop, isSpeaking, rate, changeRate };
}

// スピーカーボタンコンポーネント
function SpeakButton({ text, speak, isSpeaking, stop }: {
  text: string;
  speak: (t: string) => void;
  isSpeaking: boolean;
  stop: () => void;
}) {
  return (
    <button
      onClick={() => isSpeaking ? stop() : speak(text)}
      className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
        isSpeaking
          ? "bg-blue-600 border-blue-600 text-white"
          : "bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500"
      }`}
    >
      {isSpeaking ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M9 12H3m18 0h-3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5L6 9H2v6h4l5 4V5z" />
        </svg>
      )}
    </button>
  );
}

function loadTimerSetting(): TimerSetting {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem(TIMER_STORAGE_KEY);
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function loadShuffleSetting(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SHUFFLE_STORAGE_KEY) === "true";
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 苦手優先：間違えた問題ほど前に来るよう重み付きソート
function weakPrioritySort(qs: Question[], stats: Record<string, { total: number; wrong: number }>): Question[] {
  return [...qs].sort((a, b) => {
    const sa = stats[a.id];
    const sb = stats[b.id];
    // 未回答=最優先(weight=1.0)、回答済みは誤答率で決定
    const wa = sa ? sa.wrong / sa.total : 1.0;
    const wb = sb ? sb.wrong / sb.total : 1.0;
    if (wb !== wa) return wb - wa; // 誤答率が高い順
    return Math.random() - 0.5; // 同率はランダム
  });
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // SSR時は空、クライアントでユーザー問題を含む全問取得
  const [allQuestions, setAllQuestions] = useState<Question[] | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [weakMode, setWeakMode] = useState(false);
  const [displayQuestions, setDisplayQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    const qs = getAllQuestions();
    const s = loadShuffleSetting();
    const w = localStorage.getItem(WEAK_STORAGE_KEY) === "true";
    setShuffle(s);
    setWeakMode(w);
    setAllQuestions(qs);
  }, []);

  const categoryFilter = searchParams.get("category");

  // allQuestions / shuffle / weakMode が変わったら表示用リストを再生成
  useEffect(() => {
    if (allQuestions === null) return;
    const filtered = categoryFilter
      ? allQuestions.filter((q) => q.grammarCategory === categoryFilter)
      : allQuestions;
    let ordered: Question[];
    if (weakMode) {
      ordered = weakPrioritySort(filtered, getQuestionStats());
    } else if (shuffle) {
      ordered = shuffleArray(filtered);
    } else {
      ordered = filtered;
    }
    setDisplayQuestions(ordered);
    setIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allQuestions, shuffle, weakMode, categoryFilter]);

  const toggleShuffle = () => {
    const next = !shuffle;
    setShuffle(next);
    localStorage.setItem(SHUFFLE_STORAGE_KEY, String(next));
    if (next) { setWeakMode(false); localStorage.setItem(WEAK_STORAGE_KEY, "false"); }
    if (allQuestions !== null) {
      const filtered = categoryFilter
        ? allQuestions.filter((q) => q.grammarCategory === categoryFilter)
        : allQuestions;
      setDisplayQuestions(next ? shuffleArray(filtered) : filtered);
      setIndex(0);
    }
  };

  const toggleWeakMode = () => {
    const next = !weakMode;
    setWeakMode(next);
    localStorage.setItem(WEAK_STORAGE_KEY, String(next));
    if (next) { setShuffle(false); localStorage.setItem(SHUFFLE_STORAGE_KEY, "false"); }
    if (allQuestions !== null) {
      const filtered = categoryFilter
        ? allQuestions.filter((q) => q.grammarCategory === categoryFilter)
        : allQuestions;
      setDisplayQuestions(next ? weakPrioritySort(filtered, getQuestionStats()) : filtered);
      setIndex(0);
    }
  };

  const filteredQuestions = displayQuestions;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [phase, setPhase] = useState<Phase>("question");
  const [showSlash, setShowSlash] = useState(false);
  const [showSVO, setShowSVO] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [stepUnlocked, setStepUnlocked] = useState<1 | 2 | 3>(1);
  const [showRateMenu, setShowRateMenu] = useState(false);

  // ── 音声読み上げ ──
  const { speak, stop, isSpeaking, rate, changeRate } = useSpeech();

  // 問題が変わったら読み上げ停止
  useEffect(() => { stop(); }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── タイマー関連 ──
  const [timerSetting, setTimerSetting] = useState<TimerSetting>(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 設定ロード
  useEffect(() => {
    setTimerSetting(loadTimerSetting());
  }, []);

  // タイマー開始
  const startTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (seconds === 0) return;
    setTimeLeft(seconds);
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // タイマー停止
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
  };

  // 問題が変わったらタイマーをリセット・再スタート
  useEffect(() => {
    startTimer(timerSetting);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, timerSetting]);

  // 回答したらタイマー停止
  useEffect(() => {
    if (phase === "result") stopTimer();
  }, [phase]);

  const q: Question | undefined = filteredQuestions?.[index];

  // スラッシュ・SVOデータが有効かどうか（インポート問題は持っていない）
  const hasSlashData = (q?.slashGroups?.length ?? 0) > 1;
  const hasSVOData = q?.chunks?.some((c) => c.tag) ?? false;

  useEffect(() => {
    setSelected(null);
    setPhase("question");
    setShowSlash(false);
    setShowSVO(false);
    setCurrentStep(1);
    setStepUnlocked(1);
  }, [index]);

  // タイマー設定を変更（プリセット）
  const changeTimer = (value: number) => {
    setTimerSetting(value);
    localStorage.setItem(TIMER_STORAGE_KEY, String(value));
    setCustomInput("");
    setShowTimerMenu(false);
  };

  // カスタム秒数を確定
  const applyCustomTimer = () => {
    const n = parseInt(customInput, 10);
    if (!Number.isFinite(n) || n <= 0 || n > 3600) return;
    changeTimer(n);
  };

  // ローディング中
  if (filteredQuestions === null) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 text-center text-slate-400 text-sm">
        読み込み中…
      </main>
    );
  }

  if (!q) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-slate-500 mb-4">このカテゴリの問題はありません。</p>
        <Link href="/manage" className="text-blue-600 underline text-sm">
          問題を追加する →
        </Link>
      </main>
    );
  }

  const isCorrect = selected === q.correctAnswer;

  const handleSelect = (choice: "A" | "B" | "C" | "D") => {
    if (phase === "result") return;
    setSelected(choice);
    setPhase("result");
    saveAnswer({
      questionId: q.id,
      selectedAnswer: choice,
      isCorrect: choice === q.correctAnswer,
      timestamp: Date.now(),
      stepReached: stepUnlocked,
    });
  };

  const unlockStep = (step: 1 | 2 | 3) => {
    if (step > stepUnlocked) setStepUnlocked(step);
    setCurrentStep(step);
  };

  const goNext = () => {
    if (index < filteredQuestions.length - 1) {
      setIndex(index + 1);
    } else {
      router.push("/stats");
    }
  };

  const isLast = index === filteredQuestions.length - 1;

  // タイマーの進捗（1.0 → 0.0）
  const timerPct = timerSetting > 0 ? timeLeft / timerSetting : 1;
  const timerColor =
    timerPct > 0.5
      ? "bg-blue-500"
      : timerPct > 0.25
      ? "bg-yellow-400"
      : "bg-red-500";
  const timeExpired = timerSetting > 0 && timeLeft === 0 && phase === "question";

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      {/* Nav */}
      <div className="flex items-center justify-between mb-3">
        <Link href="/" className="text-slate-400 hover:text-slate-600 text-sm">
          ← ホーム
        </Link>
        <div className="flex items-center gap-2">
          {/* 苦手優先ボタン */}
          <button
            onClick={toggleWeakMode}
            title="間違えた問題を優先して出題"
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              weakMode
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {weakMode ? "苦手優先" : "苦手優先"}
          </button>

          {/* シャッフルボタン */}
          <button
            onClick={toggleShuffle}
            title={shuffle ? "シャッフルON（クリックでOFF）" : "シャッフルOFF（クリックでON）"}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              shuffle
                ? "bg-violet-50 border-violet-300 text-violet-700"
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4h5l2 2h9M4 20h5l2-2h9M16 4l4 4-4 4M20 8H9M16 20l4-4-4-4M20 16H9" />
            </svg>
            {shuffle ? "シャッフル" : "固定順"}
          </button>

          {/* 音声速度ボタン */}
          <div className="relative">
            <button
              onClick={() => { setShowRateMenu((v) => !v); setShowTimerMenu(false); }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                isSpeaking
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              </svg>
              {rate}x
            </button>
            {showRateMenu && (
              <div className="absolute right-0 top-9 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 min-w-[100px]">
                {[0.75, 1.0, 1.25, 1.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => { changeRate(r); setShowRateMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                      rate === r ? "text-blue-600 font-semibold" : "text-slate-700"
                    }`}
                  >
                    {r}x {r === 0.75 ? "（遅め）" : r === 1.0 ? "（標準）" : r === 1.25 ? "（速め）" : "（速い）"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* タイマー設定ボタン */}
          <div className="relative">
            <button
              onClick={() => setShowTimerMenu((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                timerSetting > 0
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timerSetting > 0
                ? (TIMER_PRESETS.find((o) => o.value === timerSetting)?.label ?? `${timerSetting}秒`)
                : "タイマー"}
            </button>

            {showTimerMenu && (
              <div className="absolute right-0 top-9 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 min-w-[150px]">
                {TIMER_PRESETS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => changeTimer(opt.value)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                      timerSetting === opt.value
                        ? "text-blue-600 font-semibold"
                        : "text-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                {/* カスタム入力 */}
                <div className="px-3 py-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-1.5">カスタム（秒）</p>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={3600}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyCustomTimer()}
                      placeholder="例: 45"
                      className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={applyCustomTimer}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg transition-colors flex-shrink-0"
                    >
                      設定
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-slate-500">
            {index + 1} / {filteredQuestions.length}
            {categoryFilter && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                絞込中
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 問題進捗バー */}
      <div className="h-1 bg-slate-100 rounded-full mb-2 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${((index + 1) / filteredQuestions.length) * 100}%` }}
        />
      </div>

      {/* タイマーバー */}
      {timerSetting > 0 && (
        <div className="mb-4">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
              style={{ width: `${timerPct * 100}%` }}
            />
          </div>
          <div className="flex justify-end mt-0.5">
            <span
              className={`text-xs font-semibold tabular-nums ${
                timeExpired
                  ? "text-red-500"
                  : timerPct <= 0.25
                  ? "text-red-500"
                  : timerPct <= 0.5
                  ? "text-yellow-600"
                  : "text-slate-400"
              }`}
            >
              {timeExpired ? "時間切れ" : `${timeLeft}秒`}
            </span>
          </div>
        </div>
      )}

      {/* Grammar label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
          {q.grammarLabel}
        </span>
      </div>

      {/* Sentence display */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4 shadow-sm">
        {/* 読み上げボタン */}
        <div className="flex items-center justify-between mb-3">
          <SpeakButton text={q.sentence} speak={speak} isSpeaking={isSpeaking} stop={stop} />
          <span className="text-xs text-slate-400">タップで問題文を読み上げ</span>
        </div>

        {/* Toggle buttons（組み込み問題のみ表示） */}
        {(hasSlashData || hasSVOData) && (
          <div className="flex gap-2 mb-4">
            {hasSlashData && (
              <button
                onClick={() => {
                  setShowSlash(!showSlash);
                  if (showSVO) setShowSVO(false);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  showSlash
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}
              >
                / スラッシュ
              </button>
            )}
            {hasSVOData && (
              <button
                onClick={() => {
                  setShowSVO(!showSVO);
                  if (showSlash) setShowSlash(false);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  showSVO
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                S/V/O/M タグ
              </button>
            )}
          </div>
        )}

        {/* Sentence */}
        <div className="text-lg leading-relaxed font-medium text-slate-900">
          {showSVO ? (
            <div className="flex flex-wrap gap-1 items-baseline">
              {q.chunks.map((chunk, i) => (
                <span key={i} className="inline-flex flex-col items-center">
                  <span
                    className={`text-[10px] font-bold px-1 rounded border mb-0.5 ${
                      chunk.tag ? tagColors[chunk.tag] : "text-transparent"
                    }`}
                  >
                    {chunk.tag ?? "·"}
                  </span>
                  {chunk.isBlank ? (
                    <span className="inline-block bg-yellow-200 border-b-2 border-yellow-500 px-3 py-0.5 rounded text-yellow-800 font-bold">
                      ______
                    </span>
                  ) : (
                    <span>{chunk.text}</span>
                  )}
                </span>
              ))}
            </div>
          ) : showSlash ? (
            <div className="flex flex-wrap items-center gap-0">
              {q.slashGroups.map((group, i) => (
                <span key={i} className="inline-flex items-center">
                  {group.includes("_____") ? (
                    <span className="inline-block bg-yellow-200 border-b-2 border-yellow-500 px-3 py-0.5 rounded text-yellow-800 font-bold mx-0.5">
                      {group.replace("_____", "______")}
                    </span>
                  ) : (
                    <span>{group}</span>
                  )}
                  {i < q.slashGroups.length - 1 && (
                    <span className="text-blue-400 font-bold mx-1.5">/</span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <span>
              {q.sentence
                .replace("_____", "______")
                .split("______")
                .map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="inline-block bg-yellow-200 border-b-2 border-yellow-500 px-3 py-0.5 rounded text-yellow-800 font-bold mx-0.5">
                        ______
                      </span>
                    )}
                  </span>
                ))}
            </span>
          )}
        </div>
      </div>

      {/* 3-Step Solution Flow */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
        <p className="text-xs font-semibold text-slate-500 mb-2">3ステップ解法</p>
        <div className="flex gap-2 mb-3">
          {([1, 2, 3] as const).map((step) => (
            <button
              key={step}
              onClick={() => unlockStep(step)}
              disabled={step > stepUnlocked + 1}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors ${
                currentStep === step
                  ? "bg-blue-600 text-white"
                  : step <= stepUnlocked
                  ? "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              }`}
            >
              Step {step}
            </button>
          ))}
        </div>
        <div className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-100 min-h-[3rem]">
          {currentStep === 1 && q.solutionSteps.step1}
          {currentStep === 2 &&
            (stepUnlocked >= 1 ? (
              q.solutionSteps.step2
            ) : (
              <span className="text-slate-300">Step 1 を先に確認してください</span>
            ))}
          {currentStep === 3 &&
            (stepUnlocked >= 2 ? (
              q.solutionSteps.step3
            ) : (
              <span className="text-slate-300">Step 2 を先に確認してください</span>
            ))}
        </div>
      </div>

      {/* Choices */}
      <div className="space-y-2 mb-6">
        {q.choices.map((choice) => {
          let style =
            "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50";
          if (phase === "result") {
            if (choice.id === q.correctAnswer) {
              style = "bg-green-50 border-2 border-green-500 text-green-800 font-semibold";
            } else if (choice.id === selected) {
              style = "bg-red-50 border-2 border-red-400 text-red-800 font-semibold";
            } else {
              style = "bg-white border border-slate-200 text-slate-400";
            }
          }

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              disabled={phase === "result"}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${style}`}
            >
              <span className="font-bold mr-2">({choice.id})</span>
              {choice.text}
              {phase === "result" && choice.id !== q.correctAnswer && choice.errorCategory && (
                <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                  {errorLabels[choice.errorCategory]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Result Panel */}
      {phase === "result" && (
        <div
          className={`rounded-2xl border p-5 mb-4 ${
            isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className={`text-2xl font-black ${
                isCorrect ? "text-green-600" : "text-red-500"
              }`}
            >
              {isCorrect ? "正解！" : "不正解"}
            </span>
            <span className="text-slate-500 text-sm flex-1">
              正解：({q.correctAnswer}) {q.choices.find((c) => c.id === q.correctAnswer)?.text}
            </span>
            <SpeakButton
              text={q.choices.find((c) => c.id === q.correctAnswer)?.text ?? ""}
              speak={speak}
              isSpeaking={isSpeaking}
              stop={stop}
            />
          </div>

          {/* Explanation */}
          <p className="text-sm text-slate-700 mb-4 leading-relaxed">{q.explanation}</p>

          {/* Wrong choices breakdown */}
          {q.choices
            .filter((c) => c.id !== q.correctAnswer)
            .map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-lg p-3 border border-slate-100 mb-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-500 text-sm">
                    ({c.id}) {c.text}
                  </span>
                  {c.errorCategory && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                      {c.errorCategory} {errorLabels[c.errorCategory]}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.errorReason}</p>
              </div>
            ))}

          {/* Tips */}
          {q.tips.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                高価値Tips
              </p>
              {q.tips.map((tip, i) => (
                <div
                  key={i}
                  className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2"
                >
                  <p className="text-xs font-semibold text-blue-800 mb-1">{tip.title}</p>
                  <p className="text-xs text-blue-700 leading-relaxed">{tip.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Next button */}
          <button
            onClick={goNext}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {isLast ? "結果を見る →" : "次の問題 →"}
          </button>
        </div>
      )}
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-10 text-center text-slate-400">
          読み込み中...
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
