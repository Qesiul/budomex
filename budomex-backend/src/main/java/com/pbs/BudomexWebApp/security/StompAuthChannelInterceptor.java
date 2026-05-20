package com.pbs.BudomexWebApp.security;

import com.pbs.BudomexWebApp.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Autoryzacja STOMP na poziomie ramki (a nie handshake HTTP).
 *
 * CONNECT: jeśli przyszedł nagłówek "Authorization: Bearer <jwt>" i token jest
 * poprawny — ustawiamy uwierzytelnionego użytkownika na sesji WS. Brak tokena
 * (np. publiczna strona śledzenia zamówienia) = połączenie anonimowe.
 *
 * SUBSCRIBE: tematy /topic/track/** są publiczne (śledzenie po tokenie
 * zamówienia). Pozostałe tematy (panel managera/pracownika/magazyn/HR)
 * wymagają uwierzytelnienia.
 */
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtUtils.validateJwtToken(token)) {
                    String username = jwtUtils.getUserNameFromJwtToken(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    accessor.setUser(auth);
                }
            }
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            String destination = accessor.getDestination();
            boolean isPublic = destination != null && destination.startsWith("/topic/track/");
            if (!isPublic && accessor.getUser() == null) {
                throw new IllegalArgumentException(
                        "Brak autoryzacji do subskrypcji tematu: " + destination);
            }
        }

        return message;
    }
}
