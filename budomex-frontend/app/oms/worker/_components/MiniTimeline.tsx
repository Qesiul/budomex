import Icon from "../../_components/Icon";
import type { TimelineStep } from "./_data";

export default function MiniTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-left">
          <h3 className="card-title">Status produkcji</h3>
        </div>
        <span className="card-sub">u klienta wkrótce</span>
      </div>
      <div className="mini-timeline">
        {steps.map((s, i) => (
          <div key={i} className={`mini-step ${s.state}`}>
            <div className="ms-dot">
              {s.state === "done" && (
                <Icon name="check" size={12} strokeWidth={3} />
              )}
              {s.state === "current" && (
                <Icon name="rotate-cw" size={11} strokeWidth={2.5} />
              )}
            </div>
            <span className="ms-label">{s.label}</span>
            <span className="ms-date">{s.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
