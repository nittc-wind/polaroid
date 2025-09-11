import type {
  Question,
  QuestionLevel,
  QuestionPool,
  QuestionSet,
  QuestionSelectionOptions,
} from "@/types/game";

/**
 * レベル別質問データ（50問）
 */
const QUESTIONS_POOL: QuestionPool = {
  1: [
    { id: "l1_q1", level: 1, text: "出身地はどこですか？" },
    { id: "l1_q2", level: 1, text: "好きな食べ物は何ですか？" },
    { id: "l1_q3", level: 1, text: "朝型？夜型？" },
    { id: "l1_q4", level: 1, text: "犬派？猫派？" },
    { id: "l1_q5", level: 1, text: "甘いもの好き？辛いもの好き？" },
    { id: "l1_q6", level: 1, text: "今日の朝ごはんは何を食べましたか？" },
    { id: "l1_q7", level: 1, text: "好きな季節は？" },
    { id: "l1_q8", level: 1, text: "血液型は？" },
    { id: "l1_q9", level: 1, text: "兄弟は何人？" },
    { id: "l1_q10", level: 1, text: "コーヒー派？紅茶派？" },
  ],
  2: [
    { id: "l2_q11", level: 2, text: "最近ハマっていることは？" },
    { id: "l2_q12", level: 2, text: "好きな音楽のジャンルは？" },
    { id: "l2_q13", level: 2, text: "よく見るYouTubeのジャンルは？" },
    { id: "l2_q14", level: 2, text: "休日は何をして過ごすことが多い？" },
    { id: "l2_q15", level: 2, text: "好きなアニメや漫画は？" },
    { id: "l2_q16", level: 2, text: "スポーツは何かやってる？" },
    { id: "l2_q17", level: 2, text: "料理は得意？" },
    { id: "l2_q18", level: 2, text: "最後に読んだ本は？" },
    { id: "l2_q19", level: 2, text: "ゲームはする？どんなゲーム？" },
    { id: "l2_q20", level: 2, text: "映画は好き？最近見た映画は？" },
  ],
  3: [
    { id: "l3_q21", level: 3, text: "最近感動したことは？" },
    { id: "l3_q22", level: 3, text: "学生時代に頑張ったことは？" },
    { id: "l3_q23", level: 3, text: "今一番欲しいものは？" },
    { id: "l3_q24", level: 3, text: "ストレス発散方法は？" },
    { id: "l3_q25", level: 3, text: "子供の頃の夢は何でしたか？" },
    { id: "l3_q26", level: 3, text: "旅行するなら国内？海外？" },
    { id: "l3_q27", level: 3, text: "人生で影響を受けた人は？" },
    { id: "l3_q28", level: 3, text: "最近笑ったエピソードは？" },
    { id: "l3_q29", level: 3, text: "苦手なものは？" },
    { id: "l3_q30", level: 3, text: "集中したい時はどこに行く？" },
  ],
  4: [
    { id: "l4_q31", level: 4, text: "将来の夢や目標は？" },
    { id: "l4_q32", level: 4, text: "5年後の自分はどうなっていたい？" },
    { id: "l4_q33", level: 4, text: "今年中に達成したいことは？" },
    { id: "l4_q34", level: 4, text: "挑戦してみたいことは？" },
    { id: "l4_q35", level: 4, text: "理想の働き方は？" },
    { id: "l4_q36", level: 4, text: "もし宝くじが当たったら何をする？" },
    { id: "l4_q37", level: 4, text: "人生で大切にしていることは？" },
    { id: "l4_q38", level: 4, text: "今の自分に足りないと思うものは？" },
    { id: "l4_q39", level: 4, text: "尊敬する人の特徴は？" },
    { id: "l4_q40", level: 4, text: "死ぬまでに絶対やりたいことは？" },
  ],
  5: [
    { id: "l5_q41", level: 5, text: "もし魔法が使えるなら何をしたい？" },
    { id: "l5_q42", level: 5, text: "無人島に一つだけ持っていくなら？" },
    { id: "l5_q43", level: 5, text: "動物に生まれ変われるなら何になりたい？" },
    { id: "l5_q44", level: 5, text: "過去の自分にアドバイスするなら？" },
    { id: "l5_q45", level: 5, text: "今までで一番恥ずかしかった体験は？" },
    { id: "l5_q46", level: 5, text: "もしタイムマシンがあったら過去？未来？" },
    { id: "l5_q47", level: 5, text: "自分を色で例えると？その理由は？" },
    { id: "l5_q48", level: 5, text: "もし透明人間になれたら最初に何をする？" },
    { id: "l5_q49", level: 5, text: "人生が映画になるなら、タイトルは何？" },
    {
      id: "l5_q50",
      level: 5,
      text: "今日知り合った人（目の前の相手）の第一印象は？",
    },
  ],
};

/**
 * レベル説明マップ
 */
export const LEVEL_DESCRIPTIONS: Record<QuestionLevel, string> = {
  1: "アイスブレイク",
  2: "趣味・興味",
  3: "価値観・体験",
  4: "未来・目標",
  5: "ユニーク質問",
};

/**
 * 指定されたレベルからランダムに質問を1つ選択する
 */
function selectRandomQuestionFromLevel(
  level: QuestionLevel,
  options: QuestionSelectionOptions = {},
): Question {
  const { excludeQuestionIds = [] } = options;
  const availableQuestions = QUESTIONS_POOL[level].filter(
    (question) => !excludeQuestionIds.includes(question.id),
  );

  if (availableQuestions.length === 0) {
    throw new Error(`No available questions for level ${level}`);
  }

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
}

/**
 * 5つのレベルから各1問ずつランダムに選択して質問セットを作成する
 */
export function generateQuestionSet(
  options: QuestionSelectionOptions = {},
): QuestionSet {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const selectedQuestions: Question[] = [];
  const usedQuestionIds: string[] = [...(options.excludeQuestionIds || [])];

  // レベル1から5まで、各レベルから1問ずつ選択
  for (let level = 1; level <= 5; level++) {
    const question = selectRandomQuestionFromLevel(level as QuestionLevel, {
      ...options,
      excludeQuestionIds: usedQuestionIds,
    });

    // レベル説明を追加
    const questionWithDescription: Question = {
      ...question,
      levelDescription: LEVEL_DESCRIPTIONS[question.level],
    };

    selectedQuestions.push(questionWithDescription);
    usedQuestionIds.push(question.id);
  }

  return {
    sessionId,
    questions: selectedQuestions as [
      Question,
      Question,
      Question,
      Question,
      Question,
    ],
    createdAt: new Date(),
  };
}

/**
 * 質問プールの統計情報を取得する
 */
export function getQuestionPoolStats() {
  return {
    totalQuestions: Object.values(QUESTIONS_POOL).reduce(
      (total, questions) => total + questions.length,
      0,
    ),
    questionsByLevel: Object.entries(QUESTIONS_POOL).reduce(
      (acc, [level, questions]) => {
        acc[level as unknown as QuestionLevel] = questions.length;
        return acc;
      },
      {} as Record<QuestionLevel, number>,
    ),
  };
}

/**
 * 特定のレベルの質問を全て取得する（デバッグ用）
 */
export function getQuestionsByLevel(level: QuestionLevel): Question[] {
  return [...QUESTIONS_POOL[level]];
}

/**
 * 質問IDから質問を検索する
 */
export function findQuestionById(questionId: string): Question | undefined {
  for (const questions of Object.values(QUESTIONS_POOL)) {
    const found = questions.find((q) => q.id === questionId);
    if (found) {
      return found;
    }
  }
  return undefined;
}

/**
 * 質問セットの妥当性を検証する
 */
export function validateQuestionSet(questionSet: QuestionSet): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 質問数の検証
  if (questionSet.questions.length !== 5) {
    errors.push(`Expected 5 questions, got ${questionSet.questions.length}`);
  }

  // レベルの検証
  const levels = questionSet.questions.map((q) => q.level);
  const expectedLevels = [1, 2, 3, 4, 5] as const;

  for (const expectedLevel of expectedLevels) {
    if (!levels.includes(expectedLevel)) {
      errors.push(`Missing question for level ${expectedLevel}`);
    }
  }

  // 重複質問の検証
  const questionIds = questionSet.questions.map((q) => q.id);
  const uniqueIds = new Set(questionIds);
  if (uniqueIds.size !== questionIds.length) {
    errors.push("Duplicate questions found");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
