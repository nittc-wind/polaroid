"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";

interface NextQuestionButtonProps {
  /** ボタンクリック時のハンドラー */
  onClick: () => void;
  /** 次の質問が利用可能かどうか */
  hasNextQuestion: boolean;
  /** ボタンが無効かどうか */
  disabled?: boolean;
  /** 遷移中かどうか */
  isTransitioning?: boolean;
  /** ゲームが完了したかどうか */
  isGameCompleted?: boolean;
  /** 追加のCSSクラス */
  className?: string;
}

/**
 * 次の質問に進むボタンコンポーネント
 * ゲーム状態に応じて適切なテキストとスタイルを表示する
 */
export const NextQuestionButton = memo<NextQuestionButtonProps>(
  ({
    onClick,
    hasNextQuestion,
    disabled = false,
    isTransitioning = false,
    isGameCompleted = false,
    className = "",
  }) => {
    // ボタンテキストを状態に応じて決定
    const getButtonText = () => {
      if (isGameCompleted) {
        return "質問終了";
      }
      if (isTransitioning) {
        return "切り替え中...";
      }
      if (hasNextQuestion) {
        return "次の質問";
      }
      return "質問を完了";
    };

    // ボタンの有効性を判定
    const isButtonDisabled = disabled || isTransitioning || isGameCompleted;

    // スタイルクラスを構築
    const buttonClasses = `
    w-full transition-all duration-200
    ${isTransitioning ? "opacity-75 scale-95" : "opacity-100 scale-100"}
    ${className}
  `.trim();

    return (
      <div className="space-y-2">
        {/* メインボタン */}
        <Button
          onClick={onClick}
          disabled={isButtonDisabled}
          className={buttonClasses}
          size="default"
          aria-label={hasNextQuestion ? "次の質問に進む" : "質問を完了する"}
        >
          {/* ボタンアイコン（遷移中はスピナー） */}
          {isTransitioning ? (
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{getButtonText()}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {hasNextQuestion && !isGameCompleted && (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              <span>{getButtonText()}</span>
            </div>
          )}
        </Button>

        {/* ヘルプテキスト */}
        {!isGameCompleted && (
          <div className="text-center">
            <p className="text-xs text-[#737373]">
              {hasNextQuestion
                ? "お互いに答え合った後、次の質問に進みましょう"
                : "お疲れ様でした！全ての質問が完了します"}
            </p>
          </div>
        )}
      </div>
    );
  },
);

NextQuestionButton.displayName = "NextQuestionButton";
