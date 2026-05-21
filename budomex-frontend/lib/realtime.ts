"use client";

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

/** Wyprowadza URL WebSocket z NEXT_PUBLIC_API_URL (http→ws, https→wss). */
function wsUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  return base.replace(/^http/, "ws") + "/ws";
}

export type StompSubscription = {
  topic: string;
  onMessage: () => void;
};

/**
 * Otwiera połączenie STOMP-over-WebSocket i subskrybuje podane topiki.
 * Backend wysyła minimalny payload {type, ts} — traktujemy każdą wiadomość
 * jako sygnał „odśwież dane" i wołamy onMessage (zwykle mutate z SWR).
 *
 * - Reconnect automatyczny co 4s przy zerwaniu.
 * - token (JWT) idzie w nagłówku CONNECT dla topików wymagających auth
 *   (manager/worker). Topiki publiczne (track) nie wymagają tokenu.
 */
export function useStomp(
  subscriptions: StompSubscription[],
  options: { token?: string | null; enabled?: boolean } = {},
) {
  const { token = null, enabled = true } = options;
  const subsRef = useRef<StompSubscription[]>(subscriptions);
  subsRef.current = subscriptions;
  const topicsKey = subscriptions.map((s) => s.topic).join("|");

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const client = new Client({
      brokerURL: wsUrl(),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    client.onConnect = () => {
      subsRef.current.forEach((s) => {
        client.subscribe(s.topic, () => {
          const latest = subsRef.current.find((x) => x.topic === s.topic);
          latest?.onMessage();
        });
      });
    };

    client.activate();
    return () => {
      void client.deactivate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, token, topicsKey]);
}
