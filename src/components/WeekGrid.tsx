"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import TaskCard from "@/components/TaskCard";
import type { Task, WeekDay } from "@/lib/types";
import {
  WEEK_DAYS,
  getDayFull,
  getDayShort,
  getTodayWeekDay,
  getWeekDates,
} from "@/lib/week";

type WeekGridProps = {
  tasks: Task[];
  selectedDay: WeekDay;
  onSelectDay: (day: WeekDay) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAddTask: () => void;
  onToggleTask: (id: string, card: HTMLDivElement) => void;
  onDeleteTask: (id: string, card: HTMLDivElement) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  btnAddRef: React.RefObject<HTMLButtonElement | null>;
  gridRef: React.RefObject<HTMLDivElement | null>;
};

export default function WeekGrid({
  tasks,
  selectedDay,
  onSelectDay,
  inputValue,
  onInputChange,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  inputRef,
  btnAddRef,
  gridRef,
}: WeekGridProps) {
  const dates = getWeekDates();
  const today = getTodayWeekDay();
  const prevDayRef = useRef(selectedDay);

  useEffect(() => {
    if (prevDayRef.current === selectedDay) return;
    prevDayRef.current = selectedDay;

    const expanded = document.querySelector(".week-cell.expanded");
    if (expanded) {
      gsap.fromTo(
        expanded,
        { scale: 0.96, opacity: 0.85 },
        { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.6)" }
      );
    }
  }, [selectedDay]);

  return (
    <div className="week-grid" ref={gridRef}>
      {WEEK_DAYS.map((day) => {
        const expanded = day === selectedDay;
        const date = dates[day];
        const dayTasks = tasks.filter((t) => t.day === day);
        const done = dayTasks.filter((t) => t.done).length;
        const total = dayTasks.length;
        const isToday = day === today;

        return (
          <div
            key={day}
            className={`week-cell${expanded ? " expanded" : " collapsed"}${isToday ? " today" : ""}`}
            onClick={() => {
              if (!expanded) onSelectDay(day);
            }}
          >
            <div className="week-cell-header">
              <span className="week-cell-name">{getDayShort(day)}</span>
              <span className="week-cell-date">{date.getDate()}</span>
              {!expanded && total > 0 && (
                <span className="week-cell-badge">
                  {done}/{total}
                </span>
              )}
              {isToday && <span className="week-cell-dot" aria-hidden="true" />}
            </div>

            {expanded ? (
              <div
                className="week-cell-body"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="week-cell-input-row">
                  <input
                    ref={inputRef}
                    type="text"
                    className="week-cell-input"
                    placeholder={`Задача на ${getDayFull(day)}...`}
                    maxLength={200}
                    autoComplete="off"
                    spellCheck={false}
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    onFocus={() => {
                      if (inputRef.current) {
                        gsap.to(inputRef.current, {
                          boxShadow:
                            "0 0 0 1px rgba(0,245,255,.4), 0 0 40px rgba(0,245,255,.15)",
                          duration: 0.4,
                        });
                      }
                    }}
                    onBlur={() => {
                      if (inputRef.current) {
                        gsap.to(inputRef.current, {
                          boxShadow: "none",
                          duration: 0.4,
                        });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onAddTask();
                    }}
                  />
                  <button
                    ref={btnAddRef}
                    type="button"
                    className="week-cell-add"
                    onClick={onAddTask}
                  >
                    ＋
                  </button>
                </div>

                <div className="week-cell-tasks">
                  {dayTasks.length === 0 ? (
                    <div className="week-cell-empty">
                      <span className="week-cell-empty-icon">✦</span>
                      <span>Добавьте первую задачу</span>
                    </div>
                  ) : (
                    dayTasks.map((task, i) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={i}
                        compact
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="week-cell-preview">
                {total === 0 ? (
                  <span className="week-cell-preview-empty">—</span>
                ) : (
                  <ul className="week-cell-preview-list">
                    {dayTasks.slice(0, 3).map((t) => (
                      <li
                        key={t.id}
                        className={t.done ? "done" : ""}
                        title={t.text}
                      >
                        {t.text}
                      </li>
                    ))}
                    {total > 3 && (
                      <li className="week-cell-preview-more">
                        +{total - 3} ещё
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
