"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getStats, clearProgress, getWrongWordStats, exportAllData, importAllData } from "@/lib/storage";
import { WeakPoint } from "@/lib/types";

export default function StatsPage() {
  const [stats, setStats] = useState<{
    total: number;
    correct: number;
    rate: number;
    weakPoints: WeakPoint[];
  }>({ total: 0, correct: 0, rate: 0, weakPoints: [] });
  const [wrongWords, setWrongWords] = useState<{ text: string; count: number }[]>([]);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStats(getStats());
    setWrongWords(getWrongWordStats());
  }, []);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importAllData(text);
      setImportMsg(result);
      if (result.ok) {
        setStats(getStats());
        setWrongWords(getWrongWordStats());
      }
    };
    reader.readAsText(file);
    // inputをリセット（同じファイルを再選択できるよう）
    e.target.value = "";
  };

  const handleReset = () => {
    if (confirm("学習履歴をすべてリセットしますか？")) {
      clearProgress();
      setStats({ total: 0, correct: 0, rate: 0, weakPoints: [] });
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-slate-400 hover:text-slate-600 text-sm">
          ← ホーム
        </Link>
        <button
          onClick={handleReset}
          className="text-xs text-red-400 hover:text-red-600"
        >
          リセット
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">弱点分析</h1>

      {/* Overall stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          総合成績
        </h2>
        <div className="grid grid-cols-3 gap-4">
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
      </div>

      {/* Weak points */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          カテゴリ別エラー率
        </h2>

        {stats.weakPoints.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
            まだ回答データがありません
          </div>
        ) : (
          <div className="space-y-3">
            {stats.weakPoints.map((wp) => (
              <div
                key={wp.category}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {wp.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {wp.count}問回答
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        wp.errorRate >= 50
                          ? "text-red-500"
                          : wp.errorRate >= 30
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      エラー率 {wp.errorRate}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      wp.errorRate >= 50
                        ? "bg-red-400"
                        : wp.errorRate >= 30
                        ? "bg-yellow-400"
                        : "bg-green-400"
                    }`}
                    style={{ width: `${wp.errorRate}%` }}
                  />
                </div>
                {wp.errorRate >= 30 && (
                  <Link
                    href={`/quiz?category=${wp.category}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    このカテゴリを集中ドリル →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wrong word top 10 */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          よく間違える選択肢 Top 10
        </h2>
        {wrongWords.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
            まだ誤答データがありません
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {wrongWords.map((w, i) => {
              const maxCount = wrongWords[0].count;
              const pct = Math.round((w.count / maxCount) * 100);
              return (
                <div
                  key={w.text}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < wrongWords.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <span
                    className={`w-6 text-center text-xs font-bold flex-shrink-0 ${
                      i === 0
                        ? "text-red-500"
                        : i === 1
                        ? "text-orange-400"
                        : i === 2
                        ? "text-yellow-500"
                        : "text-slate-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {w.text}
                      </span>
                      <span className="text-xs text-red-500 font-bold ml-2 flex-shrink-0">
                        {w.count}回
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          i === 0 ? "bg-red-400" : i <= 2 ? "bg-orange-300" : "bg-slate-300"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-2 text-center">
          ※ 間違えて選んだ選択肢テキストの集計（同じ単語を繰り返し間違えるほど上位）
        </p>
      </div>

      {/* Error categories legend */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6">
        <p className="text-xs font-semibold text-slate-500 mb-3">
          エラーカテゴリー凡例
        </p>
        <div className="space-y-2">
          {(["E001", "E002", "E003"] as const).map((code) => {
            const labels: Record<string, string> = {
              E001: "品詞違い（POS Mismatch）",
              E002: "意味の不適合（Semantic Inconsistency）",
              E003: "文法ルールの不一致（Grammatical Incompatibility）",
            };
            const descs: Record<string, string> = {
              E001: "文構造上、配置不可能な品詞を選んでしまったミス",
              E002: "文脈上の意味矛盾・シソーラス不一致",
              E003: "態・数・時制・格の不一致",
            };
            return (
              <div key={code} className="flex gap-3">
                <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded flex-shrink-0">
                  {code}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    {labels[code]}
                  </p>
                  <p className="text-xs text-slate-500">{descs[code]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* データ管理（Safari↔ホーム画面アプリ間の移行用） */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
          データ管理
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Safariとホームアプリでデータを共有したいときに使用
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => exportAllData()}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            書き出し
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 rounded-xl transition-colors text-sm border border-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
            </svg>
            読み込み
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        {importMsg && (
          <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${
            importMsg.ok
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}>
            {importMsg.message}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          ① 今のデバイスで「書き出し」→ JSON ファイルを保存<br />
          ② 移行先のデバイス/ブラウザで「読み込み」→ 同じファイルを選択
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/quiz"
        className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors"
      >
        問題を解く →
      </Link>
    </main>
  );
}
