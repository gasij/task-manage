"use client";

import { useEffect, useRef, useState } from "react";
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
  onEdit: (id: string, text: string) => void;
};

export default function TaskCard({
  task,
  index,
  compact = false,
  onToggle,
  onDelete,
  onEdit,
}: TaskCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const tag = TAGS[index % TAGS.length];

  useEffect(() => {
    if (!editing) setDraft(task.text);
  }, [task.text, editing]);

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing]);

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(task.text);
      setEditing(false);
      return;
    }
    if (trimmed !== task.text) onEdit(task.id, trimmed);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(task.text);
    setEditing(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editing || window.matchMedia("(pointer: coarse)").matches) return;
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
      className={`task-card${task.done ? " done" : ""}${compact ? " task-card--compact" : ""}${editing ? " editing" : ""}`}
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

        {editing ? (
          <input
            ref={editRef}
            className="card-edit-input"
            value={draft}
            maxLength={200}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveEdit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            onBlur={saveEdit}
          />
        ) : (
          <div
            className="card-text"
            onDoubleClick={() => !task.done && setEditing(true)}
            title="Двойной клик для редактирования"
          >
            {task.text}
          </div>
        )}

        <div className="card-actions">
          {!editing && !task.done && (
            <button
              type="button"
              className="card-edit"
              title="Редактировать"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
            >
              ✎
            </button>
          )}
          <button
            type="button"
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
