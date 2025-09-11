"use client";

import { useCallback, useReducer, useMemo } from "react";
import type { GameState, GameAction, GameStats } from "@/types/game";
import { generateQuestionSet, validateQuestionSet } from "@/lib/questions";

/**
 * ゲーム状態の初期値
 */
const initialGameState: GameState = {
  currentQuestionIndex: 0,
  currentQuestion: null,
  isGameStarted: false,
  isGameCompleted: false,
  questionSet: null,
  isTransitioning: false,
};

/**
 * ゲーム状態のreducer
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const { questionSet } = action.payload;

      // 質問セットの妥当性を検証
      const validation = validateQuestionSet(questionSet);
      if (!validation.isValid) {
        console.error("Invalid question set:", validation.errors);
        return state;
      }

      return {
        ...state,
        questionSet,
        currentQuestionIndex: 0,
        currentQuestion: questionSet.questions[0],
        isGameStarted: true,
        isGameCompleted: false,
        isTransitioning: false,
      };
    }

    case "NEXT_QUESTION": {
      if (!state.questionSet || state.isGameCompleted) {
        return state;
      }

      const nextIndex = state.currentQuestionIndex + 1;

      // 最後の質問を超えた場合はゲーム完了
      if (nextIndex >= state.questionSet.questions.length) {
        return {
          ...state,
          isGameCompleted: true,
          currentQuestion:
            state.questionSet.questions[state.currentQuestionIndex],
          isTransitioning: false,
        };
      }

      return {
        ...state,
        currentQuestionIndex: nextIndex,
        currentQuestion: state.questionSet.questions[nextIndex],
        isTransitioning: false,
      };
    }

    case "COMPLETE_GAME": {
      return {
        ...state,
        isGameCompleted: true,
        isTransitioning: false,
      };
    }

    case "RESET_GAME": {
      return {
        ...initialGameState,
      };
    }

    case "SET_TRANSITIONING": {
      return {
        ...state,
        isTransitioning: action.payload.isTransitioning,
      };
    }

    default:
      return state;
  }
}

/**
 * プロフィール交換ゲームの進行を管理するカスタムhook
 */
export function useProfileGame() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  /**
   * ゲームを開始する
   */
  const startGame = useCallback(() => {
    try {
      const questionSet = generateQuestionSet();
      dispatch({ type: "START_GAME", payload: { questionSet } });
    } catch (error) {
      console.error("Failed to start game:", error);
      throw new Error(`ゲームの開始に失敗しました: ${error}`);
    }
  }, []);

  /**
   * 次の質問に進む（遷移アニメーション付き）
   */
  const goToNextQuestion = useCallback(() => {
    if (gameState.isTransitioning || gameState.isGameCompleted) {
      return;
    }

    // 遷移開始
    dispatch({ type: "SET_TRANSITIONING", payload: { isTransitioning: true } });

    // 短い遅延後に次の質問に進む（アニメーション効果のため）
    setTimeout(() => {
      dispatch({ type: "NEXT_QUESTION" });
    }, 300);
  }, [gameState.isTransitioning, gameState.isGameCompleted]);

  /**
   * ゲームを完了する
   */
  const completeGame = useCallback(() => {
    dispatch({ type: "COMPLETE_GAME" });
  }, []);

  /**
   * ゲームをリセットする
   */
  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  /**
   * 現像進行に基づいて自動的に質問を進める
   */
  const syncWithDevelopProgress = useCallback(
    (progressPercentage: number, isDeveloping: boolean) => {
      if (
        !isDeveloping ||
        !gameState.isGameStarted ||
        gameState.isGameCompleted
      ) {
        return;
      }

      // 30秒の現像時間を5等分して、各段階で質問を進める
      // 0-20%: 1問目, 20-40%: 2問目, 40-60%: 3問目, 60-80%: 4問目, 80-100%: 5問目
      const questionThresholds = [0, 20, 40, 60, 80];
      const targetQuestionIndex = questionThresholds.findIndex(
        (threshold, index) => {
          const nextThreshold = questionThresholds[index + 1] ?? 100;
          return (
            progressPercentage >= threshold &&
            progressPercentage < nextThreshold
          );
        },
      );

      // 自動進行が必要な場合
      if (
        targetQuestionIndex > gameState.currentQuestionIndex &&
        !gameState.isTransitioning
      ) {
        goToNextQuestion();
      }
    },
    [gameState, goToNextQuestion],
  );

  /**
   * ゲーム統計を計算
   */
  const gameStats = useMemo((): GameStats => {
    const questionsDisplayed = gameState.isGameStarted
      ? gameState.currentQuestionIndex + 1
      : 0;

    // 実際の統計計算は実装状況に応じて調整
    return {
      questionsDisplayed,
      gameStartTime: gameState.isGameStarted ? new Date() : null,
      gameEndTime: gameState.isGameCompleted ? new Date() : null,
      gameDuration: null, // 実際の計算は後で実装
    };
  }, [gameState]);

  /**
   * プログレス情報
   */
  const progressInfo = useMemo(() => {
    if (!gameState.questionSet) {
      return { current: 0, total: 0, percentage: 0 };
    }

    const current = gameState.currentQuestionIndex + 1;
    const total = gameState.questionSet.questions.length;
    const percentage = (current / total) * 100;

    return { current, total, percentage };
  }, [gameState]);

  /**
   * 次の質問が利用可能かどうか
   */
  const hasNextQuestion = useMemo(() => {
    if (!gameState.questionSet) return false;
    return (
      gameState.currentQuestionIndex <
      gameState.questionSet.questions.length - 1
    );
  }, [gameState]);

  /**
   * 現在の質問レベルの説明
   */
  const currentLevelDescription = useMemo(() => {
    return gameState.currentQuestion?.levelDescription || "";
  }, [gameState.currentQuestion]);

  return {
    // 状態
    gameState,
    gameStats,
    progressInfo,
    hasNextQuestion,
    currentLevelDescription,

    // アクション
    startGame,
    goToNextQuestion,
    completeGame,
    resetGame,
    syncWithDevelopProgress,

    // 便利なプロパティ
    isGameActive: gameState.isGameStarted && !gameState.isGameCompleted,
    canAdvanceQuestion: !gameState.isTransitioning && hasNextQuestion,
    currentQuestion: gameState.currentQuestion,
    isTransitioning: gameState.isTransitioning,
  };
}
