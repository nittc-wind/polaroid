/**
 * プロフィール交換ゲーム関連の型定義
 */

/**
 * 質問のレベル定義
 * レベル1: アイスブレイク（軽い質問）
 * レベル2: 趣味・興味（もう少し踏み込んだ内容）
 * レベル3: 価値観・体験（少し深い内容）
 * レベル4: 未来・目標（深い質問）
 * レベル5: ユニーク・面白い質問
 */
export type QuestionLevel = 1 | 2 | 3 | 4 | 5;

/**
 * 個別の質問を表すインターフェース
 */
export interface Question {
  /** 質問のユニークID */
  id: string;
  /** 質問レベル（1-5） */
  level: QuestionLevel;
  /** 質問テキスト */
  text: string;
  /** レベル説明（オプション） */
  levelDescription?: string;
}

/**
 * ゲームセッションで選択された質問セット
 */
export interface QuestionSet {
  /** セッションID */
  sessionId: string;
  /** レベル別に選択された質問（各レベル1問ずつ） */
  questions: [Question, Question, Question, Question, Question];
  /** セッション作成日時 */
  createdAt: Date;
}

/**
 * ゲームの進行状態
 */
export interface GameState {
  /** 現在の質問インデックス（0-4） */
  currentQuestionIndex: number;
  /** 現在表示中の質問 */
  currentQuestion: Question | null;
  /** ゲームが開始されているか */
  isGameStarted: boolean;
  /** ゲームが完了したか */
  isGameCompleted: boolean;
  /** 質問セット */
  questionSet: QuestionSet | null;
  /** 質問間の遷移中かどうか */
  isTransitioning: boolean;
}

/**
 * ゲームアクション型定義
 */
export type GameAction =
  | { type: "START_GAME"; payload: { questionSet: QuestionSet } }
  | { type: "NEXT_QUESTION" }
  | { type: "COMPLETE_GAME" }
  | { type: "RESET_GAME" }
  | { type: "SET_TRANSITIONING"; payload: { isTransitioning: boolean } };

/**
 * 質問選択の設定オプション
 */
export interface QuestionSelectionOptions {
  /** 除外する質問ID（重複を避けるため） */
  excludeQuestionIds?: string[];
  /** ランダムシード（テスト用） */
  randomSeed?: number;
}

/**
 * レベル別質問プール
 */
export type QuestionPool = {
  [K in QuestionLevel]: Question[];
};

/**
 * ゲーム統計情報
 */
export interface GameStats {
  /** 表示された質問数 */
  questionsDisplayed: number;
  /** ゲーム開始時刻 */
  gameStartTime: Date | null;
  /** ゲーム終了時刻 */
  gameEndTime: Date | null;
  /** ゲーム所要時間（ミリ秒） */
  gameDuration: number | null;
}

/**
 * エラー状態
 */
export interface GameError {
  /** エラーコード */
  code: string;
  /** エラーメッセージ */
  message: string;
  /** エラー詳細（オプション） */
  details?: unknown;
}
