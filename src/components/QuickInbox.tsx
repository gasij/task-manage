"use client";

import TaskCard from "@/components/TaskCard";
import type { Task } from "@/lib/types";

type QuickInboxProps = {
  tasks: Task[];
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onToggle: (id: string, card: HTMLDivElement) => void;
  onDelete: (id: string, card: HTMLDivElement) => void;
  onEdit: (id: string, text: string) => void;
};

export default function QuickInbox({
  tasks,
  value,
  onChange,
  onAdd,
  onToggle,
  onDelete,
  onEdit,
}: QuickInboxProps) {
  return (
    <section className="quick-inbox">
      <div className="quick-inbox-header">
        <span className="quick-inbox-title">БЫСТРЫЕ ЗАМЕТКИ</span>
        <span className="quick-inbox-hint">без привязки к дню</span>
      </div>

      <div className="quick-inbox-input-row">
        <input
          type="text"
          className="quick-inbox-input"
          placeholder="Оставьте задачу или мысль здесь..."
          maxLength={200}
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAdd();
          }}
        />
        <button type="button" className="quick-inbox-add" onClick={onAdd}>
          ＋
        </button>
      </div>

      {tasks.length > 0 && (
        <div className="quick-inbox-list">
          {tasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              index={i}
              compact
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </section>
  );
}
