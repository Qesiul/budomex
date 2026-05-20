import Icon from "../../_components/Icon";
import type { CurrentOrder } from "./_data";

export default function OrderHeader({ order }: { order: CurrentOrder }) {
  const parts = order.id.split("-");
  const prefix = parts.slice(0, parts.length - 1).join("-") + "-";
  const main = parts[parts.length - 1];

  return (
    <header className="order-header">
      <div>
        <h1>
          <span className="order-num-prefix">{prefix}</span>
          <span className="order-num-main">{main}</span>
          <span className="badges">
            <span className={`badge ${order.status.cls}`}>
              <span className="b-dot" />
              {order.status.label}
            </span>
            {order.priority && (
              <span className="badge terracotta">
                <Icon name="flag" size={11} />
                Pilne
              </span>
            )}
          </span>
        </h1>
        <div className="meta">
          <span>
            Przypisane <strong>{order.assignedAt}</strong>
          </span>
          <span className="sep">·</span>
          <span>
            przez <strong>{order.assignedBy}</strong>
          </span>
          <span className="sep">·</span>
          <span>
            Klient: <strong>{order.client}</strong>
          </span>
        </div>
      </div>

      <div className={`countdown-card ${order.urgency}`}>
        <div className="cd-icon">
          <Icon name="clock" size={18} strokeWidth={2} />
        </div>
        <div className="cd-content">
          <div className="cd-label">Termin montażu</div>
          <div className="cd-date">{order.deadline}</div>
          <div className="cd-rel">{order.rel}</div>
        </div>
      </div>
    </header>
  );
}
