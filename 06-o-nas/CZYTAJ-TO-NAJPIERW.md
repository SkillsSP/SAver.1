# Podstrona „O nas"

**Data:** 26 sierpnia 2026
**Dotyczy:** nowa podstrona `/o-nas`, odnośniki w pasku, stopce i na stronie głównej

---

## Dlaczego powstała

„O nas" była w pasku nawigacji i w stopce, ale prowadziła do zakotwiczenia
`#o-nas` na stronie głównej — czyli do sekcji „Metoda, nie intuicja". Dokładnie
ten sam problem, który miał kontakt: pozycja w menu bez własnej strony.

W kategorii edukacji premium to jedna z dwóch najczęściej odwiedzanych
podstron — rodzic szuka ludzi, zanim spojrzy na cenę.

## Struktura

    1. Nagłówek ze zdjęciem      (life-przyjaciele, kadr center 40%)
    2. Kto prowadzi zajęcia      trzy osoby, wiersze zamiast kart
    3. Metoda, nie intuicja      tekst przeniesiony ze strony głównej + 4 karty
    4. Czego jeszcze nie mamy    opinie, wyniki, własne zdjęcia — wprost
    5. CTA                       zajęcia próbne + telefon

### Sekcja „Kto prowadzi" — wiersze, nie karty

Trzy osoby to zła liczba dla siatki `auto-fit`: przy każdym minimum kolumny
istnieje szerokość, na której wychodzi 2+1 i trzecia osoba zostaje sama pod
spodem. Dlatego zespół jest listą wierszy w jednej karcie — nazwisko i rola
z lewej, przedmioty z prawej. Ten sam wzorzec co progi cenowe w cenniku.

| Osoba | Rola | Przedmioty |
|---|---|---|
| Karolina Dumała | odpowiada za standardy ochrony małoletnich | angielski i matematyka (podstawowe, E8, matura), fakultety Acting i Motion Skills, 1:1 |
| Kamil Dumała | prowadzący | angielski i matematyka (podstawowe, E8), historia rozszerzona, 1:1 |
| Natalia Marczewska | prowadząca | angielski (podstawowe, E8), fakultety Music i Art, 1:1 |

Pod każdą osobą jedno pole `[wykształcenie, lata doświadczenia, uprawnienia
egzaminacyjne]`. **To jedyny brak na tej stronie** i zarazem jej najważniejsze
zdanie — nazwisko bez kwalifikacji nie jest jeszcze dowodem.

Zamiast pól na portrety stoi zdanie: *„Zdjęć zespołu jeszcze nie publikujemy.
Wolimy pokazać własne twarze, gdy centrum ruszy, niż wstawić zdjęcia z banku,
które nie przedstawiają nikogo z nas."* To mocniejsze niż puste kółka.

### Sekcja „Czego jeszcze nie mamy" — celowo

Trzy rzeczy powiedziane wprost: brak opinii i wyników, zdjęcia ilustracyjne,
i co jest zamiast tego (jawne standardy, cennik bez haczyków, bezpłatne
pierwsze spotkanie). W kategorii premium przyznanie się do braku dowodu
wynikowego buduje więcej zaufania niż jego pozorowanie — a rodzic i tak zapyta.

## Wpięcie w nawigację

    pasek nawigacji     O nas  →  /o-nas    (było: /#o-nas)
    menu mobilne        O nas  →  /o-nas    (było: /#o-nas)
    stopka, O centrum   O nas  →  /o-nas    (było: /#o-nas)
    stopka, O centrum   Metoda →  /o-nas#metoda   (było: /podstawowe)
    strona główna       „Poznaj zespół i metodę" pod sekcją o metodzie

Sekcja metody na podstronie ma `id="metoda"` i `scroll-margin-top: 88px`, więc
odnośnik ze stopki ląduje pod przyklejoną nawigacją. „O nas" i „Metoda" nie
prowadzą pod ten sam adres — to byłaby ta sama wada, którą usuwaliśmy
w audycie.

Zakotwiczenie `#o-nas` na stronie głównej **zostaje** — sekcja o metodzie nadal
tam jest i stare odnośniki muszą działać. Treść jest teraz w dwóch miejscach
świadomie: skrót na stronie głównej, całość na podstronie.

## Czego brakuje — do napisania przez Was

**Historia założycielska.** Dlaczego powstało centrum, skąd pomysł na Useful
& Life Skills, co Was do tego doprowadziło. Nie wymyślę tego, bo to Wasza
historia — a w tej kategorii jest najmocniejszym elementem strony „O nas",
mocniejszym niż lista kwalifikacji.

Jeśli ją dostanę, wchodzi jako druga sekcja, zaraz pod nagłówkiem: jeden
akapit, maksymalnie trzy. Nie potrzebuje zdjęcia.

## Do sprawdzenia po wdrożeniu

0. **Kadr nagłówka to jedyne dwukrotne użycie zdjęcia w tle** — `life-przyjaciele`
   stoi też na fakultetach. Wybór świadomy: strona o ludziach dostaje
   najcieplejszy kadr, jaki mamy w folderze. Kadr czyta się jako świętowanie,
   nie jako praca w drużynie, więc stoi trochę pod prąd reguły z sekcji 5.5 —
   ale na tej jednej podstronie ciepło jest ważniejsze od działania. Do podmiany
   przy pierwszej własnej sesji.

1. **„Jedna z założycielek"** — na stronie głównej, w bloku o matematyce,
   Karolina Dumała jest tak opisana. Sprawdźcie, czy to prawda i czy Kamil
   również jest założycielem; jeśli tak, warto to nazwać na „O nas".
2. **Rola Natalii i Kamila** — na stronie stoi neutralne „prowadzący/prowadząca".
   Jeśli mają funkcje (metodyk, koordynator), lepiej je podać.
3. **Zdanie o zdjęciach zespołu** — zniknie razem z pierwszą własną sesją.
