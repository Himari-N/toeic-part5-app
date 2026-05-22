import { Question } from "@/lib/types";

export const questions: Question[] = [
  {
    id: "q001",
    sentence:
      "The newly appointed CEO will deliver a _____ speech for the upcoming fiscal year.",
    chunks: [
      { text: "The newly appointed CEO", tag: "S" },
      { text: "will deliver", tag: "V" },
      { text: "a", tag: "O" },
      { text: "_____", tag: "O", isBlank: true },
      { text: "speech", tag: "O" },
      { text: "for the upcoming fiscal year", tag: "M" },
    ],
    slashGroups: [
      "The newly appointed CEO",
      "will deliver a _____ speech",
      "for the upcoming fiscal year",
    ],
    correctAnswer: "B",
    choices: [
      {
        id: "A",
        text: "deliver",
        errorCategory: "E001",
        errorReason:
          "助動詞 will の後には動詞の原形が来るため、will deliver が正しい形です。この選択肢単体では助動詞と重複します。",
      },
      {
        id: "B",
        text: "keynote",
        errorCategory: undefined,
        errorReason: "",
      },
      {
        id: "C",
        text: "delivering",
        errorCategory: "E001",
        errorReason:
          "will の後は原形。delivering（進行形）は不可。will be delivering なら可能ですが、この文では単純未来が自然です。",
      },
      {
        id: "D",
        text: "delivered",
        errorCategory: "E003",
        errorReason:
          "CEO（人）が能動的に行う行為なので受動態 delivered は不適切。受動態は「物が〜される」文脈で使います。",
      },
    ],
    grammarCategory: "participial-adjective",
    grammarLabel: "分詞形容詞・複合名詞",
    solutionSteps: {
      step1:
        "空欄の位置を確認：空欄は名詞 speech の前にあり、名詞を修飾する形容詞的な語が必要です。",
      step2:
          "候補を絞る：名詞 speech を修飾できるのは形容詞か名詞（複合名詞）。keynote（基調の）は名詞が形容詞的に機能する語で speech と結合して「基調演説」を形成します。",
      step3:
        "結論：keynote speech は TOEIC 頻出の複合名詞。他の選択肢は品詞が一致しません。",
    },
    explanation:
      "keynote speech（基調演説）は TOEIC 頻出のコロケーション。空欄直後に名詞 speech があるため、それを修飾できる語が必要です。deliver a keynote speech で「基調演説を行う」という定型表現を押さえましょう。",
    tips: [
      {
        title: "「空欄 ＋ 名詞」の法則",
        body: "空欄の直後に名詞がある場合、形容詞・分詞（-ed/-ing）・名詞（複合名詞）の3パターンを優先確認する。",
      },
      {
        title: "deliver の頻出コロケーション",
        body: "deliver a speech / presentation / keynote / report — いずれも「提供・実施する」の意味で使う。",
      },
    ],
  },
  {
    id: "q002",
    sentence:
      "The committee members pride _____ on their ability to resolve conflicts efficiently.",
    chunks: [
      { text: "The committee members", tag: "S" },
      { text: "pride", tag: "V" },
      { text: "_____", tag: "O", isBlank: true },
      { text: "on their ability", tag: "M" },
      { text: "to resolve conflicts efficiently", tag: "M" },
    ],
    slashGroups: [
      "The committee members",
      "pride _____ on",
      "their ability",
      "to resolve conflicts efficiently",
    ],
    correctAnswer: "C",
    choices: [
      {
        id: "A",
        text: "them",
        errorCategory: "E003",
        errorReason:
          "them は他者を指す目的格。pride oneself on は主語と目的語が同一人物である再帰表現のため、them では主語（members）と不一致。",
      },
      {
        id: "B",
        text: "their",
        errorCategory: "E001",
        errorReason:
          "their は所有格（形容詞）。動詞の目的語位置には代名詞の目的格か再帰代名詞が必要です。",
      },
      {
        id: "C",
        text: "themselves",
        errorCategory: undefined,
        errorReason: "",
      },
      {
        id: "D",
        text: "they",
        errorCategory: "E001",
        errorReason:
          "they は主格。目的語の位置に主格は置けません。品詞ミス（E001）です。",
      },
    ],
    grammarCategory: "reflexive-pronoun",
    grammarLabel: "再帰代名詞",
    solutionSteps: {
      step1:
        "空欄の品詞を特定：動詞 pride の目的語位置。代名詞の目的格か再帰代名詞が候補。",
      step2:
        "主語との関係を確認：pride oneself on = be proud of。主語 The committee members と目的語が同一→再帰代名詞 themselves が必要。",
      step3:
        "数の確認：主語が複数（members）なので themselves（複数再帰）が正解。himself/herself は単数なので不可。",
    },
    explanation:
      "pride oneself on ～ は「〜を誇りに思う」という定型表現。主語と目的語が同一人物・物の場合は再帰代名詞を使います。The committee members（複数）→ themselves が正解。",
    tips: [
      {
        title: "再帰代名詞の3大定型表現",
        body: "pride oneself on / help oneself to / devote oneself to — TOEIC Part 5 の頻出パターン。主語の数に応じて -self/-selves を使い分ける。",
      },
      {
        title: "言い換えセット",
        body: "pride oneself on = be proud of = take pride in — 前置詞の違い（on/of/in）を問う問題も出題される。",
      },
    ],
  },
  {
    id: "q003",
    sentence:
      "The revised budget proposal was approved _____ the board of directors last Monday.",
    chunks: [
      { text: "The revised budget proposal", tag: "S" },
      { text: "was approved", tag: "V" },
      { text: "_____", tag: "M", isBlank: true },
      { text: "the board of directors", tag: "M" },
      { text: "last Monday", tag: "M" },
    ],
    slashGroups: [
      "The revised budget proposal",
      "was approved _____",
      "the board of directors",
      "last Monday",
    ],
    correctAnswer: "A",
    choices: [
      {
        id: "A",
        text: "by",
        errorCategory: undefined,
        errorReason: "",
      },
      {
        id: "B",
        text: "through",
        errorCategory: "E002",
        errorReason:
          "through は「窓口・媒介・手段」を示す前置詞。行為の主体（agent）を示すのは by。approve の動作主は board なので by が正解。",
      },
      {
        id: "C",
        text: "from",
        errorCategory: "E002",
        errorReason:
          "from は「出所・起点」を示す。受動態の動作主を示す用法はなく、文脈的に不自然。",
      },
      {
        id: "D",
        text: "with",
        errorCategory: "E002",
        errorReason:
          "with は「道具・同伴」を示す。行為の主体（誰が承認したか）を示す前置詞ではありません。",
      },
    ],
    grammarCategory: "preposition",
    grammarLabel: "前置詞の語法（by vs through）",
    solutionSteps: {
      step1:
        "受動態を確認：was approved（過去受動態）。受動態の「動作主」を示す前置詞が空欄に入る。",
      step2:
        "by vs through の識別：by = 行為の直接的主体（agent）。through = 媒介・窓口（medium）。board of directors は直接承認した主体 → by。",
      step3:
        "結論：受動態 + 動作主 → by。be approved by ～ で「〜によって承認される」。",
    },
    explanation:
      "受動態（be + 過去分詞）の動作主を示す前置詞は by。through は「〜を通じて・〜経由で」と媒介・手段を示す点で異なります。例：approved by the manager（主体）vs. communicated through email（媒介）。",
    tips: [
      {
        title: "by vs through の識別法",
        body: "by = 誰が（行為の主体）/ through = 何を通じて（媒介・手段）。受動態の動作主には必ず by。",
      },
      {
        title: "revised の客体論理",
        body: "revised budget は「budget が修正された」→ 物が他動詞の客体。このパターンで過去分詞（-ed）が形容詞として機能する典型例。",
      },
    ],
  },
  {
    id: "q004",
    sentence:
      "Though it was drizzling and cloudy, the views from the top of the mountain were _____ breathtaking.",
    chunks: [
      { text: "Though it was drizzling and cloudy", tag: "M" },
      { text: "the views", tag: "S" },
      { text: "from the top of the mountain", tag: "M" },
      { text: "were", tag: "V" },
      { text: "_____", tag: "M", isBlank: true },
      { text: "breathtaking", tag: "C" },
    ],
    slashGroups: [
      "Though it was drizzling and cloudy,",
      "the views",
      "from the top of the mountain",
      "were _____ breathtaking",
    ],
    correctAnswer: "D",
    choices: [
      {
        id: "A",
        text: "very",
        errorCategory: "E002",
        errorReason:
          "breathtaking は「息をのむような」という極限の意味を持つ形容詞（極限形容詞）。very は段階的な強調に使い、極限形容詞には使えません。",
      },
      {
        id: "B",
        text: "disappointingly",
        errorCategory: "E002",
        errorReason:
          "Though（逆接）の後のメイン節はプラス評価のはず。disappointingly（失望させるほど）は逆接の文脈と矛盾します（シソーラス不一致）。",
      },
      {
        id: "C",
        text: "fairly",
        errorCategory: "E002",
        errorReason:
          "fairly は「かなり・まあまあ」という中程度の強調。breathtaking（極限形容詞）の修飾には弱すぎ、意味的に不自然。",
      },
      {
        id: "D",
        text: "utterly",
        errorCategory: undefined,
        errorReason: "",
      },
    ],
    grammarCategory: "extreme-adverb",
    grammarLabel: "極限副詞と逆接の文脈",
    solutionSteps: {
      step1:
        "空欄の品詞：breathtaking（形容詞）を修飾する → 副詞が必要。4択はすべて副詞なので品詞では絞れない。",
      step2:
        "極限形容詞の確認：breathtaking は「程度が絶対的」な極限形容詞 → very/fairly は使用不可。utterly/absolutely/completely が適切。",
      step3:
        "逆接の文脈チェック：Though 節（曇り・雨）→ メイン節はプラス評価のはず。disappointingly（マイナス）は文脈矛盾 → utterly が確定。",
    },
    explanation:
      "breathtaking（息をのむような）は「程度の上限」を表す極限形容詞。very や fairly などの段階的副詞では修飾できません。utterly / absolutely / completely などを使います。また、Though（逆接）の後はプラス評価の語彙が来るという「譲歩のシソーラス」も重要な判断基準です。",
    tips: [
      {
        title: "極限形容詞と修飾副詞の組み合わせ",
        body: "breathtaking / stunning / perfect / unique → utterly / absolutely / truly / completely で修飾。very は不可。",
      },
      {
        title: "譲歩のプラス・マイナス法則",
        body: "Though/Although/Despite + ネガティブ節 → メイン節はポジティブ。逆も然り。シソーラス（正負）を意識して副詞を選ぶ。",
      },
    ],
  },
  {
    id: "q005",
    sentence:
      "The marketing of dietary supplements _____ regulated by the government agency.",
    chunks: [
      { text: "The marketing", tag: "S" },
      { text: "of dietary supplements", tag: "M" },
      { text: "_____", tag: "V", isBlank: true },
      { text: "regulated", tag: "C" },
      { text: "by the government agency", tag: "M" },
    ],
    slashGroups: [
      "The marketing",
      "of dietary supplements",
      "_____ regulated",
      "by the government agency",
    ],
    correctAnswer: "B",
    choices: [
      {
        id: "A",
        text: "are",
        errorCategory: "E003",
        errorReason:
          "近接トラップ：直前の supplements（複数）に引きずられる典型的なミス。真の主語は The marketing（単数）なので are は不一致。",
      },
      {
        id: "B",
        text: "is",
        errorCategory: undefined,
        errorReason: "",
      },
      {
        id: "C",
        text: "were",
        errorCategory: "E003",
        errorReason:
          "2つの誤り：①主語 marketing（単数）に対して were（複数）は不一致。②文全体が現在の規制を述べており、過去形は文脈的に不適切。",
      },
      {
        id: "D",
        text: "have been",
        errorCategory: "E003",
        errorReason:
          "have been は複数主語に使う現在完了の助動詞。The marketing（単数）には has been が必要。数の不一致（E003）。",
      },
    ],
    grammarCategory: "subject-verb-agreement",
    grammarLabel: "A of B 構文の数の一致",
    solutionSteps: {
      step1:
        "主語を特定：The marketing of dietary supplements → 「A of B」構文。真の主語は A = The marketing（単数）。",
      step2:
        "近接トラップを回避：直前の supplements（複数）に惑わされない。of B（= of dietary supplements）は修飾語句 [M] であり主語ではない。",
      step3:
        "動詞の形を決定：主語 The marketing（単数・三人称）→ is regulated（単数受動態）が正解。",
    },
    explanation:
      "「A of B」構文では A が主語の核。The marketing（単数）が主語なので is が正解。直前の supplements（複数）は修飾語句に過ぎず、動詞の数に影響しません。これが「近接トラップ（Proximity Trap）」と呼ばれる典型的な誤答パターンです。",
    tips: [
      {
        title: "A of B の数の一致ルール",
        body: "The number of / The quality of / The marketing of → 主語は常に A（単数名詞）。直前の B（複数）に惑わされない。",
      },
      {
        title: "近接トラップの見破り方",
        body: "空欄の直前にある名詞が必ずしも主語とは限らない。S を特定してから V の数を決める習慣をつける。",
      },
    ],
  },
  {
    id: "q006",
    sentence:
      "An urgent order for additional supplies _____ to the warehouse last night.",
    chunks: [
      { text: "An urgent order", tag: "S" },
      { text: "for additional supplies", tag: "M" },
      { text: "_____", tag: "V", isBlank: true },
      { text: "to the warehouse", tag: "M" },
      { text: "last night", tag: "M" },
    ],
    slashGroups: [
      "An urgent order",
      "for additional supplies",
      "_____ to the warehouse",
      "last night",
    ],
    correctAnswer: "C",
    choices: [
      {
        id: "A",
        text: "was placing",
        errorCategory: "E003",
        errorReason:
          "order（注文）は「発注される・送られる」客体。能動態 was placing は「注文が何かを置いている」となり意味的に矛盾。態の誤り（E003）。",
      },
      {
        id: "B",
        text: "has been sent",
        errorCategory: "E003",
        errorReason:
          "has been sent は現在完了受動態。last night（過去を示す時間表現）と現在完了は共存できません。時制の誤り。",
      },
      {
        id: "C",
        text: "was sent",
        errorCategory: undefined,
        errorReason: "",
      },
      {
        id: "D",
        text: "were sending",
        errorCategory: "E003",
        errorReason:
          "2つの誤り：①主語 An urgent order（単数）に were（複数）は不一致。②order は送られる客体なので能動態 sending は不適切。",
      },
    ],
    grammarCategory: "voice",
    grammarLabel: "態（能動 vs 受動）と時制",
    solutionSteps: {
      step1:
        "主語の性質を確認：An urgent order（注文）= 物。物は「行動を行う主体」ではなく「行動を受ける客体」→ 受動態が必要。",
      step2:
        "時制を確認：last night（昨夜）は過去を示す副詞 → 現在完了（has been）は不可。過去形の受動態 was sent が候補。",
      step3:
        "数の確認：主語 An urgent order（単数）→ was sent（単数受動態）が正解。",
    },
    explanation:
      "「物 + 受動態」の客体論理：order（注文）は送られる対象なので受動態 was sent が正解。last night という過去の時間表現があるため現在完了は使えません。能動態 was placing や were sending は order が動作主体になってしまい意味が破綻します。",
    tips: [
      {
        title: "客体論理：物 + 過去分詞",
        body: "attached document / revised plan / urgent order など「物」が主語なら受動態（-ed）を疑う。物は行動を「受ける」側。",
      },
      {
        title: "現在完了 NG の時間表現",
        body: "last night / yesterday / in 2020 など「完結した過去」を示す副詞があれば現在完了は使えない。過去形（did/was done）を選ぶ。",
      },
    ],
  },
  {
    id: "q007",
    sentence:
      "Jackson City and its vicinity _____ expected to see record tourism numbers this summer.",
    chunks: [
      { text: "Jackson City and its vicinity", tag: "S" },
      { text: "_____", tag: "V", isBlank: true },
      { text: "expected to see", tag: "V" },
      { text: "record tourism numbers", tag: "O" },
      { text: "this summer", tag: "M" },
    ],
    slashGroups: [
      "Jackson City and its vicinity",
      "_____ expected to see",
      "record tourism numbers",
      "this summer",
    ],
    correctAnswer: "B",
    choices: [
      {
        id: "A",
        text: "is",
        errorCategory: "E003",
        errorReason:
          "Jackson City and its vicinity は「A and B」構造で複数扱い。is（単数）は数の不一致（E003）。",
      },
      {
        id: "B",
        text: "are",
        errorCategory: undefined,
        errorReason: "",
      },
      {
        id: "C",
        text: "was",
        errorCategory: "E003",
        errorReason:
          "2つの誤り：①A and B（複数）に was（単数）は不一致。②this summer（今後の出来事）に過去形は文脈不一致。",
      },
      {
        id: "D",
        text: "has",
        errorCategory: "E003",
        errorReason:
          "has は単数用の助動詞。複数主語（A and B）には have が必要。さらに has expected では意味が変わります。",
      },
    ],
    grammarCategory: "subject-verb-agreement",
    grammarLabel: "A and B 構文の数の一致",
    solutionSteps: {
      step1:
        "主語の構造を確認：Jackson City and its vicinity = 「A and B」構造。原則として複数扱い（are/were）。",
      step2:
        "時制を確認：this summer（今後）を示す表現があり、expected to see（〜すると予想される）は現在の予測 → 現在形が適切。",
      step3:
        "結論：複数主語 + 現在形 + 受動態 → are expected が正解。",
    },
    explanation:
      "「A and B」は2つの要素を結ぶので複数扱いが原則。are expected to ～ で「〜すると予想されている」という現在の予測・見通しを表します。vicinity（近郊）という単数形の名詞に引きずられないよう注意。",
    tips: [
      {
        title: "A and B は複数",
        body: "The CEO and the manager are / Jackson City and its vicinity are — 2つを and で結んだ主語は原則複数動詞。",
      },
      {
        title: "be expected to の使い方",
        body: "be expected to ～ = 「〜すると予想される」。TOEIC 頻出の受動態表現。be supposed to / be scheduled to と同じパターン。",
      },
    ],
  },
  {
    id: "q008",
    sentence:
      "Please _____ the attached document for the details of the revised schedule.",
    chunks: [
      { text: "Please", tag: "M" },
      { text: "_____", tag: "V", isBlank: true },
      { text: "the attached document", tag: "O" },
      { text: "for the details", tag: "M" },
      { text: "of the revised schedule", tag: "M" },
    ],
    slashGroups: [
      "Please _____",
      "the attached document",
      "for the details",
      "of the revised schedule",
    ],
    correctAnswer: "A",
    choices: [
      {
        id: "A",
        text: "refer to",
        errorCategory: undefined,
        errorReason: "",
      },
      {
        id: "B",
        text: "address",
        errorCategory: "E002",
        errorReason:
          "address は「対処する・演説する」の意味。document を目的語にとる場合は「文書に宛てる」となり、この文脈（詳細を確認してほしい）と意味が合いません。",
      },
      {
        id: "C",
        text: "submit",
        errorCategory: "E002",
        errorReason:
          "submit（提出する）は「提出する側が主語」。受信者に確認を促す文脈で submit the attached document は意味的に矛盾します。",
      },
      {
        id: "D",
        text: "notify",
        errorCategory: "E002",
        errorReason:
          "notify は「人に通知する」。notify the document は「文書に通知する」となり目的語が人でなければならないという語法に反します（notify + 人 + of）。",
      },
    ],
    grammarCategory: "collocation",
    grammarLabel: "語法・コロケーション",
    solutionSteps: {
      step1:
        "文の意図を確認：添付ファイルを「見てください・参照してください」という依頼文。",
      step2:
        "語法の確認：refer to ～ = 「〜を参照する」。the attached document を目的語にとれる動詞として最適。",
      step3:
        "他の選択肢を排除：address（対処/演説）、submit（提出）、notify（通知）はいずれも文脈または語法が不一致（E002）。",
    },
    explanation:
      "refer to ～ は「〜を参照する・参照してください」という依頼表現で、TOEIC のメール・文書問題に頻出。attached document（添付書類）と組み合わせた refer to the attached document は定型表現として覚えておきましょう。",
    tips: [
      {
        title: "address の多義性",
        body: "address = (1)対処する (2)演説する (3)宛てる/送付する — 文脈によって意味が大きく変わる多義語。目的語が「人か物か問題か」で判断。",
      },
      {
        title: "attached の客体論理",
        body: "attached document = 「文書が添付された」→ 物が他動詞 attach の客体。-ed 形が形容詞として機能する典型例。",
      },
    ],
  },
];
