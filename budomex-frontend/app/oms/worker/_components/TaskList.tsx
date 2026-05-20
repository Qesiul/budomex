"use client";

import { useState } from "react";
import Icon from "../../_components/Icon";
import type { Task, TaskSection } from "./_data";

export type Filter = "all" | "active" | "done";

type Props = {
  sections: TaskSection[];
  onToggle: (sectionId: string, taskId: string) => void;
  onAddTask: (sectionId: string, name: string) => void;
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  doneSection: string | null;
  bumpingId: string | null;
  glowingId: string | null;
};

function visibleTasks(tasks: Task[], filter: Filter): Task[] {
  if (filter === "done") return tasks.filter((t) => t.done);
  if (filter === "active") return tasks.filter((t) => !t.done);
  return tasks;
}

export default function TaskList({
  sections,
  onToggle,
  onAddTask,
  filter,
  onFilterChange,
  doneSection,
  bumpingId,
  glowingId,
}: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const totalDone = sections.reduce(
    (a, s) => a + s.tasks.filter((t) => t.done).length,
    0,
  );
  const totalAll = sections.reduce((a, s) => a + s.tasks.length, 0);

  const startAdd = (sectionId: string) => {
    setAdding(sectionId);
    setDraft("");
    setTimeout(() => {
      document.querySelector<HTMLInputElement>(".add-task-row input")?.focus();
    }, 50);
  };

  const saveAdd = () => {
    if (!draft.trim() || !adding) return;
    onAddTask(adding, draft.trim());
    setAdding(null);
    setDraft("");
  };

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-left">
          <h3 className="card-title">Zadania produkcyjne</h3>
          <span className="card-sub">
            {totalDone} / {totalAll}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="seg" role="tablist">
            <button
              type="button"
              role="tab"
              className={`seg-btn ${filter === "all" ? "active" : ""}`}
              aria-selected={filter === "all"}
              onClick={() => onFilterChange("all")}
            >
              Wszystkie
            </button>
            <button
              type="button"
              role="tab"
              className={`seg-btn ${filter === "active" ? "active" : ""}`}
              aria-selected={filter === "active"}
              onClick={() => onFilterChange("active")}
            >
              Aktywne
            </button>
            <button
              type="button"
              role="tab"
              className={`seg-btn ${filter === "done" ? "active" : ""}`}
              aria-selected={filter === "done"}
              onClick={() => onFilterChange("done")}
            >
              Ukończone
            </button>
          </div>
        </div>
      </div>

      {sections.map((section, sIdx) => {
        const sectionDone = section.tasks.filter((t) => t.done).length;
        const sectionTotal = section.tasks.length;
        const allDone = sectionDone === sectionTotal && sectionTotal > 0;
        const sectionPct = sectionTotal > 0 ? (sectionDone / sectionTotal) * 100 : 0;
        const isCollapsed = !!collapsed[section.id];
        const tasks = visibleTasks(section.tasks, filter);
        const isLast = sIdx === sections.length - 1;

        return (
          <div
            key={section.id}
            className={`task-section ${isCollapsed ? "collapsed" : ""} ${allDone ? "task-section-done" : ""} ${isLast ? "last-of" : ""}`}
          >
            <button
              type="button"
              className="task-section-head"
              onClick={() =>
                setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))
              }
              aria-expanded={!isCollapsed}
            >
              <span className="chev">
                <Icon name="chevron-down" size={15} />
              </span>
              <h4>{section.title}</h4>
              <div className="task-section-progress">
                {allDone && (
                  <span className="section-done-badge">
                    <Icon name="check" size={11} strokeWidth={3} />
                    Sekcja ukończona
                  </span>
                )}
                <div className="task-section-bar">
                  <div
                    className={`task-section-bar-fill ${allDone ? "" : "partial"}`}
                    style={{ width: `${sectionPct}%` }}
                  />
                </div>
                <span className="task-section-count">
                  {sectionDone} / {sectionTotal}
                </span>
              </div>
            </button>

            {doneSection === section.id && (
              <div className="section-done-banner">
                <Icon name="check-circle" size={14} />
                <span>Sekcja &bdquo;{section.title}&rdquo; ukończona. Świetna robota.</span>
              </div>
            )}

            <div className="task-section-body">
              {tasks.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  data-task-id={t.id}
                  className={`task-row ${t.done ? "done" : ""} ${t.active ? "active-task" : ""} ${glowingId === t.id ? "glow" : ""}`}
                  onClick={() => onToggle(section.id, t.id)}
                  aria-pressed={t.done}
                >
                  <span
                    className={`task-check ${bumpingId === t.id ? "bumping" : ""} ${t.active && !t.done ? "active-target" : ""}`}
                    aria-hidden="true"
                  >
                    {t.done && <Icon name="check" size={14} strokeWidth={3} />}
                  </span>
                  <div className="task-body">
                    <div className="task-name">
                      {t.name}
                      {t.active && !t.done && (
                        <span className="active-tag">aktywne</span>
                      )}
                    </div>
                    {t.desc && <div className="task-desc">{t.desc}</div>}
                  </div>
                  <div className="task-meta">
                    {t.done ? (
                      <>
                        Ukończone
                        <br />
                        <span className="meta-strong">{t.doneTime}</span>
                      </>
                    ) : (
                      <>
                        Szac. czas
                        <br />
                        <span className="meta-strong">{t.est}</span>
                      </>
                    )}
                  </div>
                </button>
              ))}

              {tasks.length === 0 && (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--text-dim)",
                    fontSize: 13.5,
                    fontStyle: "italic",
                  }}
                >
                  Brak zadań w tym filtrze.
                </div>
              )}

              {adding === section.id ? (
                <div className="add-task-row">
                  <input
                    type="text"
                    placeholder="Nazwa nowego zadania…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveAdd();
                      if (e.key === "Escape") {
                        setAdding(null);
                        setDraft("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn sm"
                    onClick={saveAdd}
                    disabled={!draft.trim()}
                  >
                    Zapisz
                  </button>
                  <button
                    type="button"
                    className="btn ghost sm"
                    onClick={() => {
                      setAdding(null);
                      setDraft("");
                    }}
                  >
                    Anuluj
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="add-task-trigger"
                  onClick={() => startAdd(section.id)}
                >
                  <Icon name="plus" size={13} />
                  <span>Dodaj zadanie do sekcji</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
