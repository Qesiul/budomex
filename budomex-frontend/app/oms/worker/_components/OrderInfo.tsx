import Icon from "../../_components/Icon";
import type { CurrentOrder } from "./_data";

export default function OrderInfo({ order }: { order: CurrentOrder }) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-left">
          <h3 className="card-title">Szczegóły zamówienia</h3>
        </div>
        <span className="card-sub">{order.id}</span>
      </div>

      <div className="rbac-banner" aria-label="Informacja o widoczności danych">
        <Icon name="eye-off" size={13} />
        <span>
          Widzisz dane techniczne potrzebne do produkcji. Pełne dane klienta widzi
          tylko manager.
        </span>
      </div>

      <div className="info-list">
        <div className="info-row">
          <div className="k">Klient</div>
          <div className="v">{order.client}</div>
        </div>
        <div className="info-row">
          <div className="k">Typ produktu</div>
          <div className="v">{order.details.product}</div>
        </div>
        <div className="info-row">
          <div className="k">Ilość</div>
          <div className="v mono">{order.details.quantity}</div>
        </div>
        <div className="info-row">
          <div className="k">Wymiary</div>
          <div className="v mono">{order.details.dimensions}</div>
        </div>
        <div className="info-row">
          <div className="k">Kolor</div>
          <div className="v">
            <span
              className="color-swatch"
              style={{ background: "#FFFFFF", borderColor: "#D8D2C4" }}
              aria-hidden="true"
            />
            {order.details.color}
          </div>
        </div>
        <div className="info-row">
          <div className="k">Materiał</div>
          <div className="v note">{order.details.material}</div>
        </div>
        <div className="info-row">
          <div className="k">Szkło</div>
          <div className="v mono" style={{ fontSize: 13 }}>
            {order.details.glass}
          </div>
        </div>
        <div className="info-row">
          <div className="k">Uwagi</div>
          <div className="v note">{order.details.notes}</div>
        </div>
      </div>
    </div>
  );
}
