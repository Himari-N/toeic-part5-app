"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Question, GrammarCategory, ErrorCategory } from "@/lib/types";
import { saveUserQuestion } from "@/lib/storage";
import { grammarLabels, errorLabels } from "@/lib/constants";

const GRAMMAR_CATEGORIES = Object.entries(grammarLabels) as [
  GrammarCategory,
  string
][];

const ERROR_CATEGORIES: { value: ErrorCategory | ""; label: string }[] = [
  { value: "", label: "なし（正解）" },
  { value: "E001", label: "E001 品詞違い" },
  { value: "E002", label: "E002 意味の不適合" },
  { value: "E003", label: "E003 文法ルールの不一致" },
];

interface ChoiceForm {
  text: string;
  errorCategory: ErrorCategory | "";
  errorReason: string;
}

const emptyChoice = (): ChoiceForm => ({
  text: "",
  errorCategory: "",
  errorReason: "",
});

export default function AddQuestionPage() {
  const router = useRouter();
  const [sentence, setSentence] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState<"A" | "B" | "C" | "D">(
    "A"
  );
  const [choices, setChoices] = useState<[ChoiceForm, ChoiceForm, ChoiceForm, ChoiceForm]>([
    emptyChoice(),
    emptyChoice(),
    emptyChoice(),
    emptyChoice(),
  ]);
  const [category, setCategory] = useState<GrammarCategory>("other");
  const [explanation, setExplanation] = useState("");
  const [source, setSource] = useState(""); // 問題集名・問題番号
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const updateChoice = (
    i: number,
    field: keyof ChoiceForm,
    value: string
  ) => {
    setChoices((prev) => {
      const next = [...prev] as typeof prev;
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!sentence.includes("_____"))
      errs.push("問題文に空欄「_____」（アンダースコア5つ）を含めてください");
    if (choices.some((c) => !c.text.trim()))
      errs.push("選択肢 A〜D をすべて入力してください");
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);

    const id = `user_${Date.now()}`;
    const ids = ["A", "B", "C", "D"] as const;

    // シンプルなチャンク生成（スラッシュ/SVO不要の最小構成）
    const blankSentence = sentence;

    const q: Question = {
      id,
      sentence: blankSentence,
      chunks: [{ text: blankSentence, isBlank: false }],
      slashGroups: [blankSentence],
      correctAnswer,
      choices: ids.map((id, i) => ({
        id,
        text: choices[i].text.trim(),
        errorCategory: choices[i].errorCategory || undefined,
        errorReason: choices[i].errorReason.trim(),
      })),
      grammarCategory: category,
      grammarLabel: grammarLabels[category],
      solutionSteps: {
        step1: "問題文の空欄位置と前後の語を確認する。",
        step2: "選択肢の品詞・意味・文法ルールを確認する。",
        step3: "消去法で正解を確定する。",
      },
      explanation: explanation.trim() || "（解説未入力）",
      tips: [],
      // @ts-ignore — ユーザー問題マーカー（表示用）
      isUserAdded: true,
      source: source.trim(),
    };

    saveUserQuestion(q);
    setSaved(true);
    setTimeout(() => router.push("/manage"), 1200);
  };

  const choiceLabels = ["A", "B", "C", "D"] as const;

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/manage" className="text-slate-400 hover:text-slate-600 text-sm">
          ← マイ問題一覧
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">誤答を登録する</h1>
      <p className="text-sm text-slate-500 mb-6">
        公式問題集などで間違えた問題を登録して復習できます
      </p>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
          保存しました！マイ問題一覧に移動します…
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 space-y-1">
          {errors.map((e, i) => (
            <p key={i}>⚠ {e}</p>
          ))}
        </div>
      )}

      {/* 問題文 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          問題文 <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-400 mb-2">
          空欄は半角アンダースコア5つ「_____」で表してください
        </p>
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          rows={3}
          placeholder="例: The committee members pride _____ on their ability to resolve conflicts."
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
        {sentence.includes("_____") && (
          <p className="text-xs text-green-600 mt-1">✓ 空欄を検出しました</p>
        )}
      </section>

      {/* 選択肢 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700">
            選択肢 A〜D <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            正解：
            {choiceLabels.map((l) => (
              <button
                key={l}
                onClick={() => setCorrectAnswer(l)}
                className={`w-7 h-7 rounded-full font-bold transition-colors ${
                  correctAnswer === l
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {choiceLabels.map((label, i) => (
            <div key={label} className={`rounded-xl border p-3 ${correctAnswer === label ? "border-green-300 bg-green-50" : "border-slate-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    correctAnswer === label
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {label}
                </span>
                <input
                  value={choices[i].text}
                  onChange={(e) => updateChoice(i, "text", e.target.value)}
                  placeholder={`選択肢 ${label} の語句`}
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {correctAnswer !== label && (
                  <select
                    value={choices[i].errorCategory}
                    onChange={(e) =>
                      updateChoice(i, "errorCategory", e.target.value)
                    }
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {ERROR_CATEGORIES.map((ec) => (
                      <option key={ec.value} value={ec.value}>
                        {ec.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {correctAnswer !== label && (
                <input
                  value={choices[i].errorReason}
                  onChange={(e) => updateChoice(i, "errorReason", e.target.value)}
                  placeholder="なぜ不正解か（任意）"
                  className="w-full text-xs border border-slate-100 bg-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* カテゴリ・出典 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              文法カテゴリ
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GrammarCategory)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {GRAMMAR_CATEGORIES.map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              出典（任意）
            </label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="例: 公式問題集8 Part5 Q12"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </section>

      {/* 解説 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          解説メモ（任意）
        </label>
        <p className="text-xs text-slate-400 mb-2">
          なぜ間違えたか、正解のポイントなどを自由に書けます
        </p>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={3}
          placeholder="例: through と by の違いを混同した。受動態の動作主は by。"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
      </section>

      <button
        onClick={handleSave}
        disabled={saved}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-4 rounded-xl transition-colors text-sm"
      >
        登録して復習リストに追加
      </button>
    </main>
  );
}
