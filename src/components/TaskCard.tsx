"use client";

import { useRef } from "react";
import gsap from "gsap";
import type { Task } from "@/lib/types";

const TAGS = [
  { label: "PRIORITY", color: "#f43f8e" },
  { label: "TASK", color: "#a855f7" },
  { label: "GOAL", color: "#00f5ff" },
  { label: "FOCUS", color: "#ffd700" },
  { label: "ACTION", color: "#00ff88" },
];

type TaskCardProps = {
  task: Task;
  index: number;
  compact?: boolean;
  onToggle: (id: string, card: HTMLDivElement) => void;
  onDelete: (id: string, card: HTMLDivElement) => void;
};

export default function TaskCard({
  task,
  index,
  compact = false,
  onToggle,
  onDelete,
}: TaskCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tag = TAGS[index % TAGS.length];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    gsap.set(card, {
      rotateY: nx * 18,
      rotateX: -ny * 12,
      boxShadow: `${-nx * 20}px ${-ny * 20}px 40px rgba(0,245,255,.12)`,
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      boxShadow: "none",
      duration: 0.8,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <div
      ref={cardRef}
      className={`task-card${task.done ? " done" : ""}${compact ? " task-card--compact" : ""}`}
      data-id={task.id}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-top">
        <label
          className="container card-check"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (cardRef.current) onToggle(task.id, cardRef.current);
          }}
        >
          <input type="checkbox" checked={task.done} readOnly tabIndex={-1} />
          <div className="checkmark" />
        </label>
        <div className="card-text">{task.text}</div>
        <button
          className="card-delete"
          title="Удалить"
          onClick={(e) => {
            e.stopPropagation();
            if (cardRef.current) onDelete(task.id, cardRef.current);
          }}
        >
          ✕
        </button>
      </div>
      <div className="card-footer">
        <span className="card-tag" style={{ color: tag.color }}>
          {tag.label}
        </span>
        <span className="card-time">{task.time}</span>
      </div>
    </div>
  );
}
