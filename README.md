# MonoLogger Dashboard

Frontendová aplikace pro vizualizaci logů a statistik z projektu [MonoLogger](https://github.com/Grimhandy321/MonoLogger). Dashboard zobrazuje přehled chyb, aktivitu v čase a nejaktivnější uživatele pomocí interaktivních grafů.

## Použité technologie

* **Vite** + **React** (TypeScript)
* **Mantine UI** (Komponenty a stylování)
* **Mantine Charts** (Recharts wrapper pro grafy)
* **Tabler Icons** (Ikony)

## Jak spustit projekt

1.  **Nainstaluj závislosti:**
    ```bash
    npm install
    ```

2.  **Spusť vývojový server:**
    ```bash
    npm run dev
    ```

3.  Otevři prohlížeč na adrese, kterou ti vypíše terminál (obvykle `http://localhost:5173`).

## Konfigurace

Aby aplikace správně komunikovala s backendem:

1.  Ujisti se, že běží **MonoLogger API**.
2.  V souboru `src/App.tsx` zkontroluj proměnnou `API_BASE_URL`:
    ```typescript
    const API_BASE_URL = 'http://localhost:5151'; // Změň podle portu tvého backendu
    ```
3.  **Důležité:** Na straně backendu (C#) musí být povoleno **CORS** pro adresu frontendu.

## Funkce

* **Statistiky:** Celkový počet zpráv, chyby, varování, unikátní uživatelé.
* **Graf aktivity:** Časová osa zobrazující poměr zpráv a chyb.
* **Top Users:** Graf nejaktivnějších uživatelů.
* **Detailní tabulka:** Seznam uživatelů a jejich poslední aktivita.
