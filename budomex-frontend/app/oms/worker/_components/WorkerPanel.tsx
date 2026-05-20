"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import OrderHeader from "./OrderHeader";
import ProgressCard from "./ProgressCard";
import TaskList, { type Filter } from "./TaskList";
import OrderInfo from "./OrderInfo";
import NotesCard from "./NotesCard";
import MiniTimeline from "./MiniTimeline";
import ToastStack, { type Toast } from "./ToastStack";
import {
  CURRENT_ORDER,
  INITIAL_NOTES,
  INITIAL_SECTIONS,
  TIMELINE,
  WORKER_INITIALS,
  WORKER_NAME,
  formatNow,
  type Note,
  type TaskSection,
} from "./_data";

type UndoInfo = {
  sectionId: string;
  taskId: string;
  prevDoneTime: string | undefined;
  prevActive: boolean | undefined;
};

export default function WorkerPanel() {
  const [sections, setSections] = useState<TaskSection[]>(() =>
    INITIAL_SECTIONS.map((s) => ({ ...s, tasks: s.tasks.map((t) => ({ ...t })) })),
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [doneSection, setDoneSection] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [bumpingId, setBumpingId] = useState<string | null>(null);
  const [glowingId, setGlowingId] = useState<string | null>(null);

  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [freshNoteIds, setFreshNoteIds] = useState<Set<string>>(new Set());

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const undoMapRef = useRef<Record<string, UndoInfo>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(
      () => setToasts((ts) => ts.filter((t) => t.id !== id)),
      200,
    );
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id]);
      delete toastTimers.current[id];
    }
    delete undoMapRef.current[id];
  }, []);

  const pushToast = useCallback(
    (
      t: Omit<Toast, "id">,
      autoDismiss = 5000,
      undoInfo?: UndoInfo,
    ): string => {
      const id = `tst-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const toast: Toast = { id, ...t };
      setToasts((ts) => [toast, ...ts].slice(0, 3));
      if (undoInfo) undoMapRef.current[id] = undoInfo;
      if (autoDismiss) {
        toastTimers.current[id] = setTimeout(() => dismissToast(id), autoDismiss);
      }
      return id;
    },
    [dismissToast],
  );

  const toggleTask = useCallback(
    (sectionId: string, taskId: string) => {
      let becameDone = false;
      let prevDoneTime: string | undefined;
      let prevActive: boolean | undefined;
      let taskName = "";

      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            tasks: s.tasks.map((t) => {
              if (t.id !== taskId) return t;
              becameDone = !t.done;
              prevDoneTime = t.doneTime;
              prevActive = t.active;
              taskName = t.name;
              return {
                ...t,
                done: becameDone,
                doneTime: becameDone ? formatNow() : undefined,
                active: becameDone ? false : t.active,
              };
            }),
          };
        }),
      );

      setBumpingId(taskId);
      setTimeout(() => setBumpingId(null), 360);

      if (becameDone) {
        setGlowingId(taskId);
        setTimeout(() => setGlowingId(null), 360);

        setTimeout(() => {
          setSections((curr) => {
            const s = curr.find((ss) => ss.id === sectionId);
            if (s && s.tasks.every((t) => t.done)) {
              setDoneSection(sectionId);
              setTimeout(() => setDoneSection(null), 2200);
            }
            return curr;
          });
        }, 100);

        setSyncing(true);
        setTimeout(() => setSyncing(false), 700);

        pushToast(
          {
            variant: "success",
            icon: "check",
            title: "Zadanie ukończone",
            desc: taskName,
            undo: true,
          },
          5000,
          { sectionId, taskId, prevDoneTime, prevActive },
        );
      }
    },
    [pushToast],
  );

  const undoToast = useCallback(
    (toastId: string) => {
      const info = undoMapRef.current[toastId];
      if (!info) return;
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== info.sectionId) return s;
          return {
            ...s,
            tasks: s.tasks.map((t) =>
              t.id === info.taskId
                ? { ...t, done: false, doneTime: info.prevDoneTime, active: info.prevActive }
                : t,
            ),
          };
        }),
      );
      dismissToast(toastId);
    },
    [dismissToast],
  );

  const addTask = useCallback(
    (sectionId: string, name: string) => {
      const id = `t-${Date.now()}`;
      setSections((prev) =>
        prev.map((s) =>
          s.id !== sectionId
            ? s
            : {
                ...s,
                tasks: [...s.tasks, { id, name, est: "— min", done: false }],
              },
        ),
      );
      pushToast(
        { variant: "info", icon: "plus", title: "Zadanie dodane", desc: name },
        3000,
      );
    },
    [pushToast],
  );

  const addNote = useCallback((body: string) => {
    const id = `n-${Date.now()}`;
    const note: Note = {
      id,
      author: WORKER_NAME,
      initials: WORKER_INITIALS,
      mine: true,
      time: formatNow(),
      body,
    };
    setNotes((prev) => [...prev, note]);
    setFreshNoteIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setFreshNoteIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 800);
  }, []);

  const totals = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const s of sections) {
      total += s.tasks.length;
      done += s.tasks.filter((t) => t.done).length;
    }
    return { done, total };
  }, [sections]);

  return (
    <div className="content-max">
      <OrderHeader order={CURRENT_ORDER} />

      <div className="work-grid">
        <div className="col-stack">
          <ProgressCard done={totals.done} total={totals.total} syncing={syncing} />
          <TaskList
            sections={sections}
            onToggle={toggleTask}
            onAddTask={addTask}
            filter={filter}
            onFilterChange={setFilter}
            doneSection={doneSection}
            bumpingId={bumpingId}
            glowingId={glowingId}
          />
        </div>
        <div className="col-stack">
          <OrderInfo order={CURRENT_ORDER} />
          <NotesCard notes={notes} freshIds={freshNoteIds} onAddNote={addNote} />
          <MiniTimeline steps={TIMELINE} />
        </div>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} onUndo={undoToast} />
    </div>
  );
}
