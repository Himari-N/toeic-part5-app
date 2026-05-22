"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { downloadTemplate, parseExcel, ParseResult } from "@/lib/excel";
import { saveUserQuestion } from "@/lib/storage";

type Step = "idle" | "parsed" | "done";

export default function ImportPage() {
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [importCount, setImportCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
      alert("Excel（.xlsx/.xls）またはCSV（.csv）ファイルを選んでください");
      return;
    }
    const buf = await file.arrayBuffer();
    const parsed = parseExcel(buf);
    setResult(parsed);
    setStep("parsed");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = () => {
    if (!result) return;
    let count = 0;
    for (const q of result.questions) {
      saveUserQuestion(q);
      count++;
    }
    setImportCount(count);
    setStep("done");
  };

  const reset = () => {
    setStep("idle");
    setResult(null);
    setImportCount(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/manage" className="text-slate-400 hover:text-slate-600 text-sm">
          ← マイ問題一覧
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        Excelから一括インポート
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        公式問題集の誤答をExcelにまとめてまとめて登録できます
      </p>

      {/* Step 1: テンプレートDL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            1
          </div>
          <h2 className="text-sm font-semibold text-slate-700">
            テンプレートをダウンロードする
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-3 ml-10">
          テンプレートを開き、問題文・選択肢・正解・出典などを入力してください。
          サンプル行を参考にしながら入力できます。
        </p>
        <div className="ml-10">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            テンプレートExcelをダウンロード
          </button>
        </div>

        {/* 列の説明 */}
        <div className="ml-10 mt-4 bg-slate-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">必須列</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
            {[
              ["問題文（空欄は_____）", "空欄を「_____」で表記"],
              ["選択肢A〜D", "4択の語句"],
              ["正解（A/B/C/D）", "正解の記号"],
            ].map(([k, v]) => (
              <div key={k} className="col-span-2 flex gap-2">
                <span className="font-medium text-slate-700 flex-shrink-0">{k}</span>
                <span className="text-slate-400">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-3 mb-2">任意列</p>
          <div className="grid grid-cols-1 gap-y-1 text-xs text-slate-600">
            {[
              ["文法カテゴリ", "再帰代名詞 / 前置詞 / 数の一致 など"],
              ["出典", "公式問題集8 Part5 Q12 など"],
              ["解説メモ", "なぜ間違えたか・正解のポイント"],
              ["A〜D_誤答理由", "各選択肢の除外理由"],
              ["A〜D_エラーID", "E001 / E002 / E003"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="font-medium text-slate-700 flex-shrink-0">{k}</span>
                <span className="text-slate-400">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: ファイルアップロード */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            2
          </div>
          <h2 className="text-sm font-semibold text-slate-700">
            入力済みのファイルを読み込む
          </h2>
        </div>

        {step === "idle" && (
          <div
            className={`ml-10 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-blue-400 bg-blue-50"
                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-semibold text-slate-600 mb-1">
              ファイルをドラッグ＆ドロップ
            </p>
            <p className="text-xs text-slate-400">
              または クリックして選択（.xlsx / .xls / .csv）
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* パース結果プレビュー */}
        {(step === "parsed" || step === "done") && result && (
          <div className="ml-10">
            {/* 成功件数 */}
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 flex-1 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.questions.length}
                </div>
                <div className="text-xs text-green-600">インポート可能</div>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 flex-1 text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {result.errors.length}
                  </div>
                  <div className="text-xs text-red-500">エラー行</div>
                </div>
              )}
            </div>

            {/* エラー詳細 */}
            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-red-600 mb-2">
                  エラー行（スキップされます）
                </p>
                <div className="space-y-1">
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600">
                      {e.row}行目：{e.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* 問題プレビュー */}
            {result.questions.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-3 mb-4 max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  プレビュー
                </p>
                <div className="space-y-2">
                  {result.questions.map((q, i) => (
                    <div key={i} className="text-xs text-slate-600 bg-white rounded-lg p-2 border border-slate-100">
                      <span className="font-semibold text-slate-400 mr-2">
                        {i + 1}.
                      </span>
                      {q.sentence.length > 60
                        ? q.sentence.slice(0, 60) + "…"
                        : q.sentence}
                      <span className="ml-2 text-green-600 font-semibold">
                        → ({q.correctAnswer}){" "}
                        {q.choices.find((c) => c.id === q.correctAnswer)?.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={reset}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                やり直す
              </button>
              {step === "parsed" && result.questions.length > 0 && (
                <button
                  onClick={handleImport}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {result.questions.length}問をインポート
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 完了 */}
      {step === "done" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-green-600 mb-1">
            {importCount}問 登録完了！
          </p>
          <p className="text-sm text-slate-500 mb-4">
            マイ誤答リストに追加されました
          </p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/manage"
              className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              マイ問題一覧を見る
            </Link>
            <Link
              href="/quiz"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              練習する →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
