"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats, getAllQuestions } from "@/lib/storage";

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, correct: 0, rate: 0 });
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const s = getStats();
    setStats({ total: s.total, correct: s.correct, rate: s.rate });
    setTotalQuestions(getAllQuestions().length);
  }, []);
  const progressPct =
    totalQuestions === 0 ? 0 : Math.round((stats.total / totalQuestions) * 100);

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
          TOEIC Part 5
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          論理プロセス トレーナー
        </h1>
        <p className="text-slate-500 text-sm">
          スラッシュリーディング × 3ステップ解法で正答率を上げる
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          学習進捗
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">
              {stats.total}
            </div>
            <div className="text-xs text-slate-500 mt-1">回答済み</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.correct}
            </div>
            <div className="text-xs text-slate-500 mt-1">正解</div>
          </div>
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${
                stats.rate >= 80
                  ? "text-green-600"
                  : stats.rate >= 60
                  ? "text-yellow-600"
                  : "text-red-500"
              }`}
            >
              {stats.rate}%
            </div>
            <div className="text-xs text-slate-500 mt-1">正答率</div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>問題カバー率</span>
            <span>
              {stats.total} / {totalQuestions}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        <Link
          href="/quiz"
          className="flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          <div>
            <div className="text-base">問題を解く</div>
            <div className="text-xs text-blue-200 mt-0.5">
              全 {totalQuestions} 問 · スラッシュリーディング付き
            </div>
          </div>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>

        <Link
          href="/manage"
          className="flex items-center justify-between w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          <div>
            <div className="text-base">マイ誤答リスト</div>
            <div className="text-xs text-slate-400 mt-0.5">
              公式問題集の間違いを登録・復習
            </div>
          </div>
          <svg
            className="w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>

        <Link
          href="/stats"
          className="flex items-center justify-between w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          <div>
            <div className="text-base">弱点分析</div>
            <div className="text-xs text-slate-400 mt-0.5">
              カテゴリ別エラー率 · 集中ドリル
            </div>
          </div>
          <svg
            className="w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Feature Badges */}
      <div className="bg-slate-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-500 mb-3">搭載機能</p>
        <div className="flex flex-wrap gap-2">
          {[
            "構造可視化トグル [S/V/O/M]",
            "スラッシュリーディング",
            "3ステップ解法",
            "ディストラクター分析",
            "弱点集中ドリル",
            "近接トラップ検知",
          ].map((f) => (
            <span
              key={f}
              className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
