"use client";

import { useState } from "react";
import Icon from "../../_components/Icon";
import type { Note } from "./_data";

const MAX = 500;

type Props = {
  notes: Note[];
  freshIds: Set<string>;
  onAddNote: (body: string) => void;
};

function notesWord(n: number): string {
  if (n === 1) return "notatka";
  if (n < 5) return "notatki";
  return "notatek";
}

export default function NotesCard({ notes, freshIds, onAddNote }: Props) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    onAddNote(draft.trim());
    setDraft("");
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const counterClass =
    draft.length > MAX * 0.9 ? (draft.length > MAX ? "bad" : "warn") : "";

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-left">
          <h3 className="card-title">Notatki produkcyjne</h3>
          <span className="card-sub">
            {notes.length} {notesWord(notes.length)}
          </span>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="note-empty">Brak notatek. Dodaj pierwszą poniżej.</div>
      ) : (
        <div className="notes-list">
          {notes.map((n) => (
            <div className={`note ${freshIds.has(n.id) ? "fresh" : ""}`} key={n.id}>
              <div className="note-head">
                <span className={`note-avatar ${n.mine ? "mine" : ""}`}>
                  {n.initials}
                </span>
                <span className="note-author">{n.author}</span>
                <span className="note-time">{n.time}</span>
              </div>
              <div className="note-body">{n.body}</div>
            </div>
          ))}
        </div>
      )}

      <div className="note-form">
        <div className="note-textarea-wrap">
          <textarea
            className="note-textarea"
            placeholder="Dodaj notatkę produkcyjną…"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX + 50))}
            maxLength={MAX + 50}
            aria-label="Treść notatki"
          />
          <div className={`note-counter ${counterClass}`}>
            {draft.length} / {MAX}
          </div>
        </div>
        <div className="note-form-foot">
          <div className="visibility-note">
            <Icon name="eye" size={12} />
            <span>Notatka będzie widoczna dla managera</span>
          </div>
          <button
            type="button"
            className={`btn ${justSaved ? "success-flash" : ""}`}
            onClick={handleSave}
            disabled={!draft.trim() || saving || draft.length > MAX}
          >
            {saving ? (
              <>
                <Icon name="refresh-cw" size={13} />
                Zapisywanie…
              </>
            ) : justSaved ? (
              <>
                <Icon name="check" size={13} strokeWidth={3} />
                Zapisano
              </>
            ) : (
              <>
                <Icon name="save" size={13} />
                Zapisz notatkę
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
