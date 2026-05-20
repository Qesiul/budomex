package com.pbs.BudomexWebApp.config;

import com.pbs.BudomexWebApp.entity.InventoryItem;
import com.pbs.BudomexWebApp.entity.ProductType;
import com.pbs.BudomexWebApp.entity.User;
import com.pbs.BudomexWebApp.entity.UserRole;
import com.pbs.BudomexWebApp.repository.InventoryItemRepository;
import com.pbs.BudomexWebApp.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final InventoryItemRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        fixEnumCheckConstraints();
        createUserIfNotExists("manager", "manager@budomex.pl", "manager123", UserRole.MANAGER, "Jan", "Mistrz");
        createUserIfNotExists("worker", "worker@budomex.pl", "worker123", UserRole.WORKER, "Piotr", "Mongol");
        createUserIfNotExists("worker2", "worker2@budomex.pl", "worker123", UserRole.WORKER, "Adam", "Nowak");
        createUserIfNotExists("worker3", "worker3@budomex.pl", "worker123", UserRole.WORKER, "Tomasz", "Kowalski");
        initializeInventoryIfEmpty();
    }

    private void initializeInventoryIfEmpty() {
        if (inventoryRepository.count() > 0) return;

        log.info("Inicjalizacja przykładowych pozycji magazynowych...");
        createItem("Profil PCV biały", ProductType.OKNO, "mb", 250, 50);
        createItem("Szyba zespolona 4-16-4", ProductType.OKNO, "m²", 80, 30);
        createItem("Okucie obwiedniowe", ProductType.OKNO, "kpl.", 45, 20);
        createItem("Brama segmentowa - panel", ProductType.BRAMA, "szt.", 12, 5);
        createItem("Napęd elektryczny", ProductType.BRAMA, "szt.", 8, 3);
        createItem("Skrzydło drzwi antywłamaniowych", ProductType.DRZWI, "szt.", 15, 5);
        createItem("Zamek wielopunktowy", ProductType.DRZWI, "szt.", 22, 10);
        createItem("Pancerz rolety aluminiowy", ProductType.ROLETA_ZEWNETRZNA, "m²", 60, 20);
        createItem("Silnik rolety", ProductType.ROLETA_ZEWNETRZNA, "szt.", 30, 10);
        createItem("Tkanina rolety wewnętrznej", ProductType.ROLETA_WEWNETRZNA, "m²", 100, 30);
        createItem("Parapet konglomeratowy biały", ProductType.PARAPET, "mb", 40, 15);
        createItem("Parapet drewniany dębowy", ProductType.PARAPET, "mb", 8, 10);
        createItem("Moskitiera", ProductType.INNE, "szt.", 25, 10);
    }

    private void createItem(String name, ProductType category, String unit, Integer qty, Integer threshold) {
        InventoryItem item = InventoryItem.builder()
                .name(name)
                .category(category)
                .unit(unit)
                .currentQuantity(qty)
                .minimumThreshold(threshold)
                .build();
        inventoryRepository.save(item);
    }

    private void fixEnumCheckConstraints() {
        try {
            // Drop old check constraints that don't include MONTAZ
            String[] tables = {"orders", "order_history"};
            String[] columns = {"status", "new_status", "previous_status"};

            for (String table : tables) {
                for (String column : columns) {
                    String constraintName = table + "_" + column + "_check";
                    try {
                        entityManager.createNativeQuery(
                                "ALTER TABLE " + table + " DROP CONSTRAINT IF EXISTS " + constraintName
                        ).executeUpdate();
                    } catch (Exception ignored) {}
                }
            }
            log.info("Enum check constraints zaktualizowane (usunięte stare, Hibernate odtworzy z nowymi wartościami)");
        } catch (Exception e) {
            log.warn("Nie udało się zaktualizować check constraints: {}", e.getMessage());
        }
    }

    private void createUserIfNotExists(String username, String email, String password,
                                        UserRole role, String firstName, String lastName) {
        if (!userRepository.existsByUsername(username)) {
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .firstName(firstName)
                    .lastName(lastName)
                    .build();
            userRepository.save(user);
            log.info("Utworzono domyślne konto: {} ({})", username, role);
        }
    }
}
