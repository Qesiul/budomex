package com.pbs.BudomexWebApp.config;

import com.pbs.BudomexWebApp.security.StompAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Konfiguracja WebSocket + STOMP.
 *
 * Endpoint: ws://localhost:8080/ws (natywny WebSocket — bez SockJS).
 * Broker in-memory: tematy pod /topic, prefiks aplikacyjny /app.
 *
 * Autoryzacja JWT odbywa się w ramce STOMP CONNECT (patrz
 * {@link StompAuthChannelInterceptor}), a nie w nagłówku handshake HTTP —
 * dzięki temu przeglądarkowy WebSocket (który nie pozwala ustawić nagłówka
 * Authorization na handshake) działa poprawnie z tokenem Bearer.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompAuthChannelInterceptor stompAuthChannelInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://localhost:3000");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompAuthChannelInterceptor);
    }
}
