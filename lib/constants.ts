import { GrammarCategory, ErrorCategory } from "@/lib/types";

export const grammarLabels: Record<GrammarCategory, string> = {
  "reflexive-pronoun": "再帰代名詞",
  "participial-adjective": "分詞形容詞・複合名詞",
  preposition: "前置詞の語法",
  "extreme-adverb": "極限副詞",
  "subject-verb-agreement": "数の一致（A of B / A and B）",
  tense: "時制",
  voice: "態（能動 vs 受動）",
  collocation: "語法・コロケーション",
  conjunction: "接続詞",
  other: "その他",
};

export const errorLabels: Record<ErrorCategory, string> = {
  E001: "品詞違い",
  E002: "意味の不適合",
  E003: "文法ルールの不一致",
};

export const errorDescriptions: Record<ErrorCategory, string> = {
  E001: "配置不可能な品詞（文構造上のミス）",
  E002: "文脈上の意味矛盾",
  E003: "態・数・時制の不一致",
};

export const tagColors: Record<string, string> = {
  S: "bg-blue-100 text-blue-800 border-blue-300",
  V: "bg-red-100 text-red-800 border-red-300",
  O: "bg-green-100 text-green-800 border-green-300",
  C: "bg-purple-100 text-purple-800 border-purple-300",
  M: "bg-yellow-100 text-yellow-800 border-yellow-300",
};
