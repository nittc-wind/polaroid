"use client";

import { memo } from "react";
import type { Question } from "@/types/game";

interface QuestionDisplayProps {
  /** 表示する質問 */
  question: Question | null;
  /** 現在の質問番号（1ベース） */
  questionNumber: number;
  /** 全質問数 */
  totalQuestions: number;
  /** 遷移中かどうか */
  isTransitioning?: boolean;
  /** 追加のCSSクラス */
  className?: string;
}

/**
 * 質問を表示するコンポーネント
 * レベル情報とともに質問テキストを表示する
 */
export const QuestionDisplay = memo<QuestionDisplayProps>(
  ({
    question,
    questionNumber,
    totalQuestions,
    isTransitioning = false,
    className = "",
  }) => {
    if (!question) {
      return (
        <div className={`text-center p-4 ${className}`}>
          <div className="text-[#737373] text-sm">質問を読み込み中...</div>
        </div>
      );
    }

    const baseClasses = `
    transition-all duration-300 ease-in-out
    ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}
    ${className}
  `.trim();

    return (
      <div className={baseClasses}>
        {/* 質問番号とレベル情報 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[#603736] text-sm font-medium">
              質問 {questionNumber}/{totalQuestions}
            </span>
            {question.levelDescription && (
              <span className="text-xs px-2 py-1 bg-[#603736] text-white rounded-full">
                {question.levelDescription}
              </span>
            )}
          </div>

          {/* レベルインジケーター */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index < question.level ? "bg-[#603736]" : "bg-[#e5e5e5]"
                }`}
                aria-label={`レベル ${index + 1}${index < question.level ? " (達成)" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* 質問テキスト */}
        <div className="bg-gradient-to-r from-[#f8f6f6] to-[#f0eeee] rounded-xl p-4 border border-[#e5e5e5]">
          <h3 className="text-[#0a0a0a] text-base font-medium leading-relaxed text-center">
            {question.text}
          </h3>
        </div>

        {/* アクセシビリティ用の隠し情報 */}
        <div className="sr-only">
          レベル{question.level}の質問: {question.text}
        </div>
      </div>
    );
  },
);

QuestionDisplay.displayName = "QuestionDisplay";
