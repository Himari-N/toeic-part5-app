import * as XLSX from "xlsx";
import { Question, GrammarCategory, ErrorCategory } from "@/lib/types";
import { grammarLabels } from "@/lib/constants";

// ── テンプレート列定義 ────────────────────────────────────────
export const TEMPLATE_COLUMNS = [
  "問題文（空欄は_____）",
  "選択肢A",
  "選択肢B",
  "選択肢C",
  "選択肢D",
  "正解（A/B/C/D）",
  "文法カテゴリ",
  "出典",
  "解説メモ",
  "A_誤答理由",
  "B_誤答理由",
  "C_誤答理由",
  "D_誤答理由",
  "A_エラーID（E001/E002/E003）",
  "B_エラーID（E001/E002/E003）",
  "C_エラーID（E001/E002/E003）",
  "D_エラーID（E001/E002/E003）",
];

const CATEGORY_MAP: Record<string, GrammarCategory> = {
  再帰代名詞: "reflexive-pronoun",
  "分詞形容詞・複合名詞": "participial-adjective",
  分詞形容詞: "participial-adjective",
  前置詞: "preposition",
  "前置詞の語法": "preposition",
  極限副詞: "extreme-adverb",
  "数の一致": "subject-verb-agreement",
  "数の一致（A of B / A and B）": "subject-verb-agreement",
  時制: "tense",
  "態（能動 vs 受動）": "voice",
  態: "voice",
  "語法・コロケーション": "collocation",
  語法: "collocation",
  接続詞: "conjunction",
  その他: "other",
};

// ── テンプレートExcelを生成してダウンロード ──────────────────
export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  // サンプル1行
  const sampleRow = [
    "The committee members pride _____ on their ability to resolve conflicts.",
    "them",
    "their",
    "themselves",
    "they",
    "C",
    "再帰代名詞",
    "公式問題集9 Part5 Q5",
    "pride oneself on の再帰代名詞を選ぶ問題。主語が複数なので themselves。",
    "him/herself ではなく themselves（主語が複数）",
    "their は所有格で目的語位置に置けない",
    "",
    "they は主格なので目的語位置不可",
    "E003",
    "E001",
    "",
    "E001",
  ];

  // カテゴリ一覧シート
  const categoryRows = Object.entries(grammarLabels).map(([, label]) => [
    label,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_COLUMNS, sampleRow]);
  const wsNote = XLSX.utils.aoa_to_sheet([
    ["文法カテゴリ一覧（コピーして使用）"],
    ...categoryRows,
  ]);

  // 列幅設定
  ws["!cols"] = [
    { wch: 60 }, // 問題文
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 20 },
    { wch: 25 },
    { wch: 40 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "問題データ");
  XLSX.utils.book_append_sheet(wb, wsNote, "カテゴリ一覧");

  // ブラウザ向けダウンロード
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "TOEIC_Part5_誤答登録テンプレート.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Excelファイルをパースして Question[] に変換 ──────────────
export interface ParseResult {
  questions: Question[];
  errors: { row: number; message: string }[];
}

// ── 列名の柔軟なルックアップ ─────────────────────────────────
// 複数の候補列名のうち最初に値が見つかったものを返す
function col(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = String(row[k] ?? "").trim();
    if (v !== "") return v;
  }
  return "";
}

// 空欄表記を統一（2文字以上のアンダースコア連続 → _____）
function normalizeBlank(s: string): string {
  return s.replace(/_{2,}/g, "_____");
}

export function parseExcel(buffer: ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
    defval: "",
  });

  const questions: Question[] = [];
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // ヘッダー行 + 1-indexed

    // 列名エイリアス対応（テンプレート列名 or 短縮名のどちらでも可）
    const sentenceRaw = col(row, "問題文（空欄は_____）", "問題文", "sentence");
    const sentence = normalizeBlank(sentenceRaw);
    const choiceA = col(row, "選択肢A", "A", "choiceA");
    const choiceB = col(row, "選択肢B", "B", "choiceB");
    const choiceC = col(row, "選択肢C", "C", "choiceC");
    const choiceD = col(row, "選択肢D", "D", "choiceD");
    const correct = col(row, "正解（A/B/C/D）", "正解", "answer", "correct").toUpperCase();
    const categoryRaw = col(row, "文法カテゴリ", "カテゴリ", "category");
    const source = col(row, "出典", "source");
    const explanation = col(row, "解説メモ", "解説", "explanation");

    // バリデーション
    if (!sentence) {
      errors.push({ row: rowNum, message: "問題文が空です" });
      continue;
    }
    if (!sentence.includes("_____")) {
      errors.push({
        row: rowNum,
        message: `問題文に空欄「_____」がありません: ${sentence.slice(0, 30)}`,
      });
      continue;
    }
    if (!choiceA || !choiceB || !choiceC || !choiceD) {
      errors.push({ row: rowNum, message: "選択肢A〜Dのいずれかが空です" });
      continue;
    }
    if (!["A", "B", "C", "D"].includes(correct)) {
      errors.push({
        row: rowNum,
        message: `正解列が A/B/C/D 以外です: "${correct}"`,
      });
      continue;
    }

    const category: GrammarCategory =
      CATEGORY_MAP[categoryRaw] ?? "other";

    const errorIds = [
      col(row, "A_エラーID（E001/E002/E003）", "A_エラーID"),
      col(row, "B_エラーID（E001/E002/E003）", "B_エラーID"),
      col(row, "C_エラーID（E001/E002/E003）", "C_エラーID"),
      col(row, "D_エラーID（E001/E002/E003）", "D_エラーID"),
    ];
    const errorReasons = [
      col(row, "A_誤答理由"),
      col(row, "B_誤答理由"),
      col(row, "C_誤答理由"),
      col(row, "D_誤答理由"),
    ];

    const ids = ["A", "B", "C", "D"] as const;
    const texts = [choiceA, choiceB, choiceC, choiceD];

    const q: Question & { isUserAdded?: boolean; source?: string } = {
      id: `user_${Date.now()}_${i}`,
      sentence,
      chunks: [{ text: sentence }],
      slashGroups: [sentence],
      correctAnswer: correct as "A" | "B" | "C" | "D",
      choices: ids.map((id, idx) => ({
        id,
        text: texts[idx],
        errorCategory: (["E001", "E002", "E003"].includes(errorIds[idx])
          ? errorIds[idx]
          : undefined) as ErrorCategory | undefined,
        errorReason: errorReasons[idx],
      })),
      grammarCategory: category,
      grammarLabel: grammarLabels[category],
      solutionSteps: {
        step1: "問題文の空欄位置と前後の語を確認する。",
        step2: "選択肢の品詞・意味・文法ルールを確認する。",
        step3: "消去法で正解を確定する。",
      },
      explanation: explanation || "（解説未入力）",
      tips: [],
      isUserAdded: true,
      source,
    };

    questions.push(q);
  }

  return { questions, errors };
}
