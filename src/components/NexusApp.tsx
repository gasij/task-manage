"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import Strands from "@/components/Strands";
import WeekGrid from "@/components/WeekGrid";
import type { Task, WeekDay } from "@/lib/types";
import { formatSelectedDay, getTodayWeekDay } from "@/lib/week";

gsap.registerPlugin(Flip);

const STORAGE_KEY = "nexus-tasks";

function migrateTasks(raw: unknown[]): Task[] {
  const today = getTodayWeekDay();
  return raw.map((item) => {
    const t = item as Partial<Task>;
    const day =
      typeof t.day === "number" && t.day >= 0 && t.day <= 6
        ? (t.day as WeekDay)
        : today;
    return {
      id: String(t.id ?? Date.now()),
      text: String(t.text ?? ""),
      done: Boolean(t.done),
      time: String(t.time ?? ""),
      day,
    };
  });
}

function formatTime() {
  return new Date().toLocaleTimeString("ru", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NexusApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDay, setSelectedDay] = useState<WeekDay>(0);
  const [inputValue, setInputValue] = useState("");
  const [ringPercent, setRingPercent] = useState(0);
  const [ringCount, setRingCount] = useState("0 / 0 задач");
  const [mounted, setMounted] = useState(false);

  const entranceDoneRef = useRef(false);
  const fireworksLaunchedRef = useRef(false);

  const progressFillRef = useRef<HTMLDivElement>(null);
  const weekGridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const btnAddRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const nebulaWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setTasks(migrateTasks(JSON.parse(stored)));
    setSelectedDay(getTodayWeekDay());
    setMounted(true);
  }, []);

  const showSaveToast = useCallback(() => {
    gsap.killTweensOf("#save-toast");
    gsap.fromTo(
      "#save-toast",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "back.out(2)",
        yoyo: true,
        hold: 1.5,
        onComplete: () =>
          gsap.to("#save-toast", { opacity: 0, y: 10, duration: 0.3 }),
      }
    );
  }, []);

  const saveTasks = useCallback(
    (next: Task[]) => {
      setTasks(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      showSaveToast();
    },
    [showSaveToast]
  );

  const launchFireworks = useCallback(() => {
    const wrap = nebulaWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const colors = [
      "#00f5ff",
      "#a855f7",
      "#f43f8e",
      "#ffd700",
      "#00ff88",
      "#ff6b6b",
    ];

    for (let b = 0; b < 5; b++) {
      setTimeout(() => {
        const bx = originX + gsap.utils.random(-80, 80);
        const by = originY + gsap.utils.random(-60, 60);
        for (let i = 0; i < 20; i++) {
          const p = document.createElement("div");
          p.className = "firework";
          const color = colors[Math.floor(Math.random() * colors.length)];
          p.style.background = color;
          p.style.boxShadow = `0 0 6px ${color}`;
          document.body.appendChild(p);
          gsap.set(p, { x: bx, y: by });
          gsap.to(p, {
            x: bx + gsap.utils.random(-120, 120),
            y: by + gsap.utils.random(-120, 120),
            opacity: 0,
            scale: gsap.utils.random(0.5, 2),
            duration: gsap.utils.random(0.7, 1.4),
            ease: "power2.out",
            onComplete: () => p.remove(),
          });
        }
      }, b * 180);
    }
  }, []);

  const updateProgress = useCallback(
    (list: Task[], day: WeekDay) => {
      const dayList = list.filter((t) => t.day === day);
      const total = dayList.length;
      const done = dayList.filter((t) => t.done).length;
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);

      if (progressFillRef.current) {
        gsap.to(progressFillRef.current, {
          width: `${pct}%`,
          duration: 0.8,
          ease: "power2.out",
        });
      }

      gsap.to(
        { val: ringPercent },
        {
          val: pct,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: function () {
            setRingPercent(Math.round(this.targets()[0].val));
          },
        }
      );

      setRingCount(`${done} / ${total} задач`);

      if (pct === 100 && total > 0 && !fireworksLaunchedRef.current) {
        fireworksLaunchedRef.current = true;
        setTimeout(launchFireworks, 400);
      }
      if (pct < 100) fireworksLaunchedRef.current = false;
    },
    [launchFireworks, ringPercent]
  );

  useEffect(() => {
    if (!mounted) return;
    updateProgress(tasks, selectedDay);
  }, [tasks, selectedDay, mounted, updateProgress]);

  const spawnParticles = (target: HTMLElement, count = 30) => {
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = [
      "#00f5ff",
      "#a855f7",
      "#f43f8e",
      "#ffd700",
      "#00ff88",
      "#ffffff",
    ];

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      const size = gsap.utils.random(3, 7);
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      document.body.appendChild(p);
      gsap.set(p, { x: cx, y: cy });
      gsap.to(p, {
        x: cx + gsap.utils.random(-180, 180),
        y: cy + gsap.utils.random(-180, 180),
        scale: gsap.utils.random(0.3, 2),
        opacity: 0,
        duration: gsap.utils.random(0.5, 1.1),
        ease: "power3.out",
        onComplete: () => p.remove(),
      });
    }
  };

  const shatterCard = (rect: DOMRect, card: HTMLDivElement, onDone: () => void) => {
    const cols = 4;
    const rows = 3;
    const cw = rect.width / cols;
    const ch = rect.height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const shard = document.createElement("div");
        const ox = rect.left + c * cw + gsap.utils.random(-cw * 0.2, cw * 0.2);
        const oy = rect.top + r * ch + gsap.utils.random(-ch * 0.2, ch * 0.2);
        const sw = cw + gsap.utils.random(-cw * 0.1, cw * 0.1);
        const sh = ch + gsap.utils.random(-ch * 0.1, ch * 0.1);

        shard.className = "shatter-piece";
        shard.style.cssText = `
          position:fixed; left:${ox}px; top:${oy}px;
          width:${sw}px; height:${sh}px;
          border-radius:${gsap.utils.random(2, 6)}px;
          clip-path: polygon(${gsap.utils.random(0, 20)}% ${gsap.utils.random(0, 20)}%, ${gsap.utils.random(80, 100)}% ${gsap.utils.random(0, 20)}%, ${gsap.utils.random(80, 100)}% ${gsap.utils.random(80, 100)}%, ${gsap.utils.random(0, 20)}% ${gsap.utils.random(80, 100)}%);
        `;
        document.body.appendChild(shard);
        gsap.to(shard, {
          x: gsap.utils.random(-250, 250),
          y: gsap.utils.random(-200, 200),
          rotation: gsap.utils.random(-360, 360),
          scale: gsap.utils.random(0.2, 0.8),
          opacity: 0,
          duration: gsap.utils.random(0.6, 1.0),
          ease: "power4.out",
          onComplete: () => shard.remove(),
        });
      }
    }

    gsap.to(card, {
      opacity: 0,
      scale: 0.95,
      duration: 0.15,
      onComplete: onDone,
    });
  };

  const addTask = () => {
    const text = inputValue.trim();
    const input = inputRef.current;
    if (!text) {
      if (input) {
        gsap.to(input, {
          x: -8,
          duration: 0.05,
          yoyo: true,
          repeat: 5,
          ease: "none",
          clearProps: "x",
        });
      }
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      text,
      done: false,
      time: formatTime(),
      day: selectedDay,
    };

    const next = [task, ...tasks];
    saveTasks(next);
    setInputValue("");

    if (input) {
      gsap.to(input, {
        opacity: 0.5,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
    }
    if (btnAddRef.current) spawnParticles(btnAddRef.current, 30);
  };

  const toggleTask = (id: string, card: HTMLDivElement) => {
    const next = tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    const task = next.find((t) => t.id === id);
    if (!task) return;

    saveTasks(next);

    const checkInput = card.querySelector<HTMLInputElement>(".card-check input");
    const checkmark = card.querySelector(".checkmark");
    if (task.done) {
      const tl = gsap.timeline();
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position:absolute; top:50%; left:50%; width:20px; height:20px;
        border-radius:50%; border:2px solid rgba(0,255,136,.6);
        transform:translate(-50%,-50%); pointer-events:none; z-index:10;
      `;
      card.appendChild(ripple);

      tl.to(ripple, {
        scale: 8,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => ripple.remove(),
      });
      tl.to(
        card,
        {
          boxShadow:
            "0 0 40px rgba(255,215,0,.4), 0 0 80px rgba(0,255,136,.2), inset 0 0 40px rgba(255,215,0,.05)",
          duration: 0.4,
        },
        "<"
      );
      tl.add(() => {
        if (checkInput) checkInput.checked = true;
        card.classList.add("done");
        if (checkmark) {
          gsap.from(checkmark, {
            scale: 0,
            duration: 0.3,
            ease: "back.out(3)",
          });
        }
      }, "-=0.2");
      tl.to(card, {
        scale: 1.02,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      });
      tl.to(card, {
        boxShadow:
          "0 0 20px rgba(0,255,136,.07), inset 0 0 30px rgba(0,255,136,.02)",
        duration: 0.6,
      });
    } else {
      if (checkInput) checkInput.checked = false;
      card.classList.remove("done");
      gsap.to(card, { boxShadow: "none", duration: 0.4 });
      gsap.from(card, { scale: 0.98, duration: 0.2, ease: "power2.out" });
    }
  };

  const deleteTask = (id: string, card: HTMLDivElement) => {
    const state = Flip.getState(".task-card");
    const rect = card.getBoundingClientRect();

    shatterCard(rect, card, () => {
      const next = tasks.filter((t) => t.id !== id);
      saveTasks(next);

      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.5,
          ease: "power2.inOut",
          stagger: 0.04,
          absolute: true,
        });
      });
    });
  };

  // Entrance animation
  useEffect(() => {
    if (!mounted || entranceDoneRef.current) return;
    entranceDoneRef.current = true;

    const timer = setTimeout(() => {
      const tl = gsap.timeline();

      tl.to("#loader-text", { opacity: 1, duration: 0.5 })
        .to("#loader-bar", { width: "100%", duration: 1.2, ease: "power2.inOut" }, "<")
        .to(".strands-bg", { opacity: 1, duration: 0.8 }, "-=0.4")
        .to("#loader", { opacity: 0, duration: 0.6, ease: "power2.in" }, "+=0.2")
        .set("#loader", { display: "none" })
        .to("#app", { opacity: 1, duration: 0.1 })
        .from(
          "#crystal-panel",
          {
            scale: 0.05,
            rotationY: 180,
            opacity: 0,
            duration: 1.5,
            ease: "elastic.out(1, 0.5)",
          },
          "<"
        )
        .from("#header", { y: -40, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=1.0")
        .from("#progress-wrap", { scale: 0, opacity: 0, duration: 0.8, ease: "back.out(2)" }, "-=0.7")
        .from(".week-cell", {
          y: 24,
          opacity: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: "back.out(2)",
        }, "-=0.4");
    }, 200);

    return () => clearTimeout(timer);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      <div className="strands-bg">
        <Strands
          colors={["#F97316", "#7C3AED", "#06B6D4"]}
          count={3}
          speed={0.5}
          amplitude={1}
          waviness={1}
          thickness={0.7}
          glow={2.1}
          taper={3}
          spread={1}
          intensity={0.38}
          saturation={1.35}
          opacity={0.55}
          scale={1.5}
          glass={false}
        />
      </div>

      <div id="loader">
        <div id="loader-text">NEXUS INITIALIZING</div>
        <div id="loader-bar-wrap">
          <div id="loader-bar" />
        </div>
      </div>

      <div id="save-toast">✦ СОХРАНЕНО</div>

      <div id="app">
        <header id="header">
          <div className="logo">
            NEXUS
            <span>QUANTUM TASK MATRIX</span>
          </div>
        </header>

        <div id="progress-wrap" ref={nebulaWrapRef}>
          <div className="progress-header">
            <div className="progress-header-left">
              <span id="ring-label">ПРОГРЕСС ДНЯ</span>
              <span className="progress-week-range">{formatSelectedDay(selectedDay)}</span>
            </div>
            <span id="ring-percent">{ringPercent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" ref={progressFillRef} />
          </div>
          <div id="ring-count">{ringCount}</div>
        </div>

        <section id="crystal-panel" ref={panelRef}>
          <div className="glass-form-bg" aria-hidden="true" />
          <div className="panel-glow panel-glow-1" />
          <div className="panel-glow panel-glow-2" />

          <div className="glass-form-content">
            <WeekGrid
              tasks={tasks}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              inputRef={inputRef}
              btnAddRef={btnAddRef}
              gridRef={weekGridRef}
            />
          </div>
        </section>
      </div>
    </>
  );
}
