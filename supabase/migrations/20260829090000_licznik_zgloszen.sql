-- ===========================================================================
-- LICZNIK ZGŁOSZEŃ Z JEDNEGO ADRESU
--
-- Do tej pory limit zgłoszeń liczyła zwykła mapa w pamięci funkcji. Wyglądał
-- poprawnie i miał nawet komentarz przyznający, że „nie zastąpi licznika
-- w bazie" — ale rzeczywistość okazała się gorsza od tego zastrzeżenia.
--
-- Próba: dwadzieścia cztery zgłoszenia z jednego adresu w ciągu minuty, przy
-- limicie ustawionym na trzy na godzinę. Odrzuconych: ZERO. Każde zapytanie
-- trafia w świeżą instancję funkcji, więc mapa za każdym razem jest pusta.
-- Limit nie działał ani trochę — nie „słabiej", tylko wcale.
--
-- Bez działającego limitu ktoś może wysłać przez formularz dowolną liczbę
-- poprawnie wypełnionych zgłoszeń i zapchać skrzynkę, na którą czekają
-- prawdziwi rodzice. Pułapka na roboty i pułapka czasowa zatrzymują automat
-- przypadkowy, nie kogoś, kto raz obejrzy formularz.
--
-- ADRESU NIE ZAPISUJEMY JAWNIE. Do tabeli trafia skrót SHA-256 z solą, liczony
-- już w funkcji. Do liczenia zgłoszeń z tego samego źródła to wystarcza,
-- a w bazie nie leży adres IP odwiedzającego — czyli dana osobowa, której nie
-- potrzebujemy do niczego innego.
-- ===========================================================================

create table if not exists public.licznik_zgloszen (
  skrot_adresu text        not null,
  o            timestamptz not null default now()
);

comment on table public.licznik_zgloszen is
  'Ślady zgłoszeń z formularza do liczenia limitu na godzinę. Adres wyłącznie '
  'jako skrót z solą. Wpisy starsze niż dwie godziny są kasowane przy zapisie.';

create index if not exists licznik_zgloszen_szukanie
  on public.licznik_zgloszen (skrot_adresu, o desc);

-- Tabela jest wyłącznie do użytku funkcji przyjmującej zgłoszenia. Włączamy
-- ochronę na poziomie wierszy i NIE dodajemy żadnej reguły dostępu — dzięki
-- temu klucz publiczny strony nie sięgnie tu w ogóle, a funkcja działa,
-- bo klucz usługowy ochronę pomija.
alter table public.licznik_zgloszen enable row level security;

-- Zapis i zliczenie w jednym wywołaniu. Dwa osobne zapytania z funkcji brzegowej
-- to dwie podróże do bazy przy każdym zgłoszeniu i okno, w którym dwa zgłoszenia
-- naraz policzą się nawzajem błędnie.
create or replace function public.zglos_i_policz(p_skrot text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  ile integer;
begin
  -- Sprzątanie przy okazji zapisu — tabela nie ma prawa rosnąć w nieskończoność,
  -- a osobne zadanie cykliczne byłoby tu przerostem formy.
  delete from licznik_zgloszen where o < now() - interval '2 hours';

  insert into licznik_zgloszen (skrot_adresu) values (p_skrot);

  select count(*) into ile
    from licznik_zgloszen
   where skrot_adresu = p_skrot
     and o > now() - interval '1 hour';

  return ile;
end;
$$;

comment on function public.zglos_i_policz(text) is
  'Zapisuje ślad zgłoszenia i zwraca liczbę zgłoszeń z tego samego skrótu '
  'adresu w ostatniej godzinie.';

-- Wywoływać może wyłącznie funkcja brzegowa, czyli klucz usługowy.
revoke execute on function public.zglos_i_policz(text) from public;
revoke execute on function public.zglos_i_policz(text) from anon, authenticated;
