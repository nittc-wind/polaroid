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
