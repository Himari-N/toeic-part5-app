import { UserProgress, UserAnswer, WeakPoint, Question, Choice } from "@/lib/types";
import { questions as builtInQuestions } from "@/data/questions";
import { grammarLabels } from "@/lib/constants";

const STORAGE_KEY = "toeic_part5_progress";
const USER_QUESTIONS_KEY = "toeic_part5_user_questions";

// ── ユーザー登録問題 ──────────────────────────────────────────
export function loadUserQuestions(): Question[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(USER_QUESTIONS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Question[];
}

export function saveUserQuestion(q: Question): void {
  const existing = loadUserQuestions();
  // 同IDがあれば上書き、なければ追加
  const idx = existing.findIndex((e) => e.id === q.id);
  if (idx >= 0) existing[idx] = q;
  else existing.push(q);
  localStorage.setItem(USER_QUESTIONS_KEY, JSON.stringify(existing));
}

export function deleteUserQuestion(id: string): void {
  const existing = loadUserQuestions().filter((q) => q.id !== id);
  localStorage.setItem(USER_QUESTIONS_KEY, JSON.stringify(existing));
}

/** 組み込み問題 ＋ ユーザー登録問題を結合して返す */
export function getAllQuestions(): Question[] {
  return [...builtInQuestions, ...loadUserQuestions()];
}

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return { answers: [], lastUpdated: 0 };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { answers: [], lastUpdated: 0 };
  return JSON.parse(raw) as UserProgress;
}

export function saveAnswer(answer: UserAnswer): void {
  const progress = loadProgress();
  progress.answers.push(answer);
  progress.lastUpdated = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStats(): {
  total: number;
  correct: number;
  rate: number;
  weakPoints: WeakPoint[];
} {
  const progress = loadProgress();
  const total = progress.answers.length;
  const correct = progress.answers.filter((a) => a.isCorrect).length;
  const rate = total === 0 ? 0 : Math.round((correct / total) * 100);

  const allQ = getAllQuestions();
  const categoryMap: Record<string, { correct: number; total: number }> = {};
  for (const answer of progress.answers) {
    const q = allQ.find((q) => q.id === answer.questionId);
    if (!q) continue;
    const cat = q.grammarCategory;
    if (!categoryMap[cat]) categoryMap[cat] = { correct: 0, total: 0 };
    categoryMap[cat].total++;
    if (answer.isCorrect) categoryMap[cat].correct++;
  }

  const weakPoints: WeakPoint[] = Object.entries(categoryMap)
    .map(([category, { correct, total }]) => ({
      category: category as WeakPoint["category"],
      label: grammarLabels[category as WeakPoint["category"]] ?? category,
      errorRate: Math.round(((total - correct) / total) * 100),
      count: total,
    }))
    .sort((a, b) => b.errorRate - a.errorRate);

  return { total, correct, rate, weakPoints };
}

export function getAnsweredIds(): Set<string> {
  const progress = loadProgress();
  return new Set(progress.answers.map((a) => a.questionId));
}

/** 問題IDごとの正誤統計を返す */
export function getQuestionStats(): Record<string, { total: number; wrong: number }> {
  const progress = loadProgress();
  const map: Record<string, { total: number; wrong: number }> = {};
  for (const a of progress.answers) {
    if (!map[a.questionId]) map[a.questionId] = { total: 0, wrong: 0 };
    map[a.questionId].total++;
    if (!a.isCorrect) map[a.questionId].wrong++;
  }
  return map;
}

/** 誤答した選択肢テキストの頻度ランキングを返す（多い順、上位10件） */
export function getWrongWordStats(): { text: string; count: number }[] {
  const progress = loadProgress();
  const allQ = getAllQuestions();
  const qMap: Record<string, Question> = {};
  for (const q of allQ) qMap[q.id] = q;

  const wordCount: Record<string, number> = {};

  for (const a of progress.answers) {
    if (a.isCorrect) continue;
    const q = qMap[a.questionId];
    if (!q) continue;
    const choice: Choice | undefined = q.choices.find((c) => c.id === a.selectedAnswer);
    if (!choice) continue;
    const text = choice.text;
    wordCount[text] = (wordCount[text] ?? 0) + 1;
  }

  return Object.entries(wordCount)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/** 日付ごとの回答数を返す（キー: "YYYY-MM-DD"） */
export function getDailyAnswerCounts(): Record<string, number> {
  const progress = loadProgress();
  const map: Record<string, number> = {};
  for (const a of progress.answers) {
    const d = new Date(a.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    map[key] = (map[key] ?? 0) + 1;
  }
  return map;
}
