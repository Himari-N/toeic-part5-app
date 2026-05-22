"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Question } from "@/lib/types";
import { loadUserQuestions, deleteUserQuestion } from "@/lib/storage";

export default function ManagePage() {
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const reload = () => setUserQuestions(loadUserQuestions());

  useEffect(() => {
    reload();
  }, []);

  // 選択モード終了時にリセット
  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === userQuestions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(userQuestions.map((q) => q.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selected.size === 0) return;
    if (!confirm(`選択した ${selected.size} 問を削除しますか？`)) return;
    selected.forEach((id) => deleteUserQuestion(id));
    exitSelectMode();
    reload();
  };

  const handleDeleteOne = (id: string, sentence: string) => {
    if (confirm(`この問題を削除しますか？\n「${sentence.slice(0, 40)}…」`)) {
      deleteUserQuestion(id);
      reload();
    }
  };

  const allSelected = selected.size === userQuestions.length && userQuestions.length > 0;

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-slate-400 hover:text-slate-600 text-sm">
          ← ホーム
        </Link>
        <div className="flex gap-2">
          {!selectMode ? (
            <>
              <Link
                href="/import"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Excelインポート
              </Link>
              <Link
                href="/add"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                ＋ 手動追加
              </Link>
            </>
          ) : (
            <button
              onClick={exitSelectMode}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">マイ誤答リスト</h1>
      <p className="text-sm text-slate-500 mb-6">
        登録した問題は通常のクイズに混ぜて出題されます
      </p>

      {userQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400 text-sm mb-4">まだ問題が登録されていません</p>
          <Link
            href="/add"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            最初の問題を登録する
          </Link>
        </div>
      ) : (
        <>
          {/* ツールバー */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400">
              {userQuestions.length} 問登録済み
            </p>
            {!selectMode ? (
              <button
                onClick={() => setSelectMode(true)}
                className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                複数選択
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  {allSelected ? "全解除" : "全選択"}
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selected.size === 0}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                    selected.size > 0
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-slate-100 text-slate-300 cursor-not-allowed"
                  }`}
                >
                  {selected.size > 0 ? `${selected.size}問を削除` : "削除"}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {userQuestions.map((q) => {
              // @ts-ignore
              const source = q.source as string | undefined;
              const isSelected = selected.has(q.id);
              return (
                <div
                  key={q.id}
                  onClick={selectMode ? () => toggleSelect(q.id) : undefined}
                  className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${
                    selectMode ? "cursor-pointer" : ""
                  } ${
                    isSelected
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* チェックボックス */}
                    {selectMode && (
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {source && (
                        <span className="inline-block text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full mb-1">
                          {source}
                        </span>
                      )}
                      <p className="text-sm text-slate-700 font-medium leading-snug line-clamp-2 mb-1">
                        {q.sentence}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full">
                          {q.grammarLabel}
                        </span>
                        <span>
                          正解：({q.correctAnswer}){" "}
                          {q.choices.find((c) => c.id === q.correctAnswer)?.text}
                        </span>
                      </div>
                    </div>

                    {/* 編集・削除ボタン（選択モード以外） */}
                    {!selectMode && (
                      <div className="flex gap-1 flex-shrink-0">
                        <Link
                          href={`/add?edit=${q.id}`}
                          className="text-xs text-slate-400 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          編集
                        </Link>
                        <button
                          onClick={() => handleDeleteOne(q.id, q.sentence)}
                          className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <Link
              href="/quiz"
              className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors text-sm"
            >
              全問題（組み込み＋マイ問題）で練習する →
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
