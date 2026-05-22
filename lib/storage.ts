import { UserProgress, UserAnswer, WeakPoint, Question } from "@/lib/types";
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
