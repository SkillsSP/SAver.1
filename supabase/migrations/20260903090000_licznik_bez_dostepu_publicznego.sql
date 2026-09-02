-- ===========================================================================
-- TABELA LICZNIKA NIEWIDOCZNA DLA KLUCZA PUBLICZNEGO
--
-- Ochrona na poziomie wierszy działa i to zostało zmierzone, a nie założone:
-- przy tym samym wierszu klucz usługowy zwraca jeden rekord, a klucz publiczny
-- pustą tablicę. Danych stamtąd nie da się odczytać z zewnątrz.
--
-- Zostaje jednak drobna rzecz: zapytanie kluczem publicznym dostaje odpowiedź
-- 200 z pustą tablicą, a nie odmowę. To potwierdza, że tabela o takiej nazwie
-- ISTNIEJE. Sama w sobie ta wiedza nikomu nic nie daje — w tabeli leżą wyłącznie
-- skróty adresów IP kasowane po dwóch godzinach — ale odbieranie uprawnień,
-- których nikt nie potrzebuje, jest tańsze niż tłumaczenie, dlaczego zostały.
--
-- Funkcja przyjmująca zgłoszenia korzysta z klucza usługowego, który uprawnienia
-- na poziomie ról pomija, więc ta zmiana nie dotyka jej działania.
-- ===========================================================================

revoke all on table public.licznik_zgloszen from anon, authenticated;

-- Nowe tabele w tym schemacie nie mają domyślnie dawać uprawnień tym rolom.
alter default privileges in schema public
  revoke all on tables from anon, authenticated;
