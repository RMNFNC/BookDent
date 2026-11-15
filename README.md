# Smart Dental Care

Applicazione full-stack API-based per la gestione digitale di uno studio dentistico: prenotazione visite con assegnazione automatica del dentista, gestione referti medici e pannello amministrativo per dottori, prestazioni e appuntamenti.

> *Il tuo sorriso digitale.*

Progetto sviluppato come esame per il corso di sviluppo full-stack, sulla traccia:

> Sviluppo di una applicazione full-stack API-based per un'organizzazione del settore sanitario, che fornisca un servizio significativo (es. prenotazione visite, gestione referti, dashboard economico/finanziarie) tramite un backend RESTful e un'interfaccia utente intuitiva.

## Indice

- [Come la traccia è stata soddisfatta](#come-la-traccia-è-stata-soddisfatta)
- [Funzionalità per ruolo](#funzionalità-per-ruolo)
- [Stack tecnologico](#stack-tecnologico)
- [Architettura](#architettura)
- [Modello dati](#modello-dati)
- [Sicurezza](#sicurezza)
- [Struttura del repository](#struttura-del-repository)
- [Avvio del progetto](#avvio-del-progetto)
- [Test](#test)
- [Documentazione API](#documentazione-api)
- [Limiti noti e possibili sviluppi](#limiti-noti-e-possibili-sviluppi)

## Come la traccia è stata soddisfatta

| Requisito della traccia | Come è implementato |
| --- | --- |
| Impresa del settore sanitario | Studio dentistico (Smart Dental Care), con pazienti, dentisti e personale amministrativo |
| Servizio significativo | **Prenotazione visite** con assegnazione automatica del dentista disponibile + **gestione referti medici** post-visita |
| Backend RESTful | API Express + TypeScript su risorse (`/auth`, `/users`, `/doctors`, `/services`, `/appointments`, `/records`), con verbi HTTP e status code coerenti, documentata in OpenAPI/Swagger |
| Architettura moderna | Backend Node/Express + Prisma ORM su PostgreSQL, frontend Vue 3 + Pinia + Vue Router in TypeScript, comunicazione via API JSON, autenticazione stateless JWT |
| Interfaccia utente intuitiva | SPA responsive con viste dedicate per ciascun ruolo (paziente, dentista, admin), form validati, dashboard riassuntiva all'accesso |

## Funzionalità per ruolo

Il sistema distingue tre ruoli (`PATIENT`, `DOCTOR`, `ADMIN`), ciascuno con le proprie viste e permessi lato API (vedi [dentalcare-usecase-uml.png](./dentalcare-usecase-uml.png)).

**Paziente**
- Registrazione e login
- Consultazione prestazioni offerte
- Prenotazione di una visita: sceglie **prestazione + data + orario**, il sistema assegna automaticamente un dentista attivo con uno slot libero compatibile con la durata del servizio (il paziente non seleziona il dentista)
- Consultazione e cancellazione dei propri appuntamenti
- Consultazione dei propri referti medici

**Dentista**
- Login
- Gestione della propria disponibilità (creazione/cancellazione fasce orarie, con controllo anti-sovrapposizione)
- Visualizzazione dei propri appuntamenti
- Conferma, completamento o annullamento di un appuntamento
- Redazione e modifica del referto medico per una visita completata

**Amministratore**
- Dashboard con statistiche generali (dentisti attivi, prestazioni attive, appuntamenti totali, in attesa di conferma)
- Gestione anagrafica dentisti (creazione account, attivazione/disattivazione)
- Gestione catalogo prestazioni (nome, durata, prezzo, attivazione/disattivazione)
- Visualizzazione di tutti gli appuntamenti dello studio

## Stack tecnologico

**Backend** (`/backend`)
- Node.js + Express 5, TypeScript
- Prisma ORM su PostgreSQL
- Autenticazione JWT (access + refresh token) con `jsonwebtoken` e `bcryptjs`
- Validazione input con `zod`
- Documentazione API con `swagger-jsdoc` + `swagger-ui-express`
- ESLint + Prettier

**Frontend** (`/frontend`)
- Vue 3 (Composition API, `<script setup>`) + TypeScript
- Vite come build tool
- Pinia per lo stato applicativo (sessione utente)
- Vue Router con guardie di navigazione basate su autenticazione e ruolo
- Axios per le chiamate API
- Componenti UI riutilizzabili (button, input, select, modal, badge, card, ecc.)

## Architettura

Monorepo con due applicazioni indipendenti che comunicano via REST:

```
Frontend (Vue 3 SPA, :5173)  --->  Backend REST API (Express, :3000/api)  --->  PostgreSQL
```

- Il backend espone esclusivamente API JSON sotto `/api`, senza rendering server-side: è consumabile allo stesso modo da un client web, mobile o da terzi (requisito di architettura API-based).
- Ogni endpoint applica middleware di **autenticazione** (verifica JWT), **autorizzazione** (controllo ruolo) e **validazione** (schema Zod) prima di raggiungere il controller.
- Il dominio è organizzato in `routes → controllers → services → Prisma`, separando la logica HTTP da quella di business.
- La logica più delicata (assegnazione automatica del dentista, prenotazione di uno slot) è eseguita in una transazione Prisma per evitare doppie prenotazioni concorrenti sullo stesso slot.

## Modello dati

Vedi [dentalcare-er-diagram.png](./dentalcare-er-diagram.png) per lo schema entità-relazione completo (definito in [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma)).

Entità principali:
- **User** — account di autenticazione (email, password hash, ruolo)
- **Patient** / **Doctor** — profili collegati 1:1 a uno User
- **DentalService** — catalogo prestazioni offerte (durata, prezzo)
- **AvailabilitySlot** — fasce orarie che un dentista rende disponibili
- **Appointment** — prenotazione che collega paziente, dentista, prestazione e slot, con stato (`PENDING → CONFIRMED → COMPLETED`, oppure `CANCELLED`)
- **MedicalRecord** — referto 1:1 su un appuntamento completato (diagnosi, trattamento, note)

## Sicurezza

- Password mai salvate in chiaro: hashing con bcrypt
- Autenticazione stateless tramite access token JWT a breve scadenza + refresh token per il rinnovo
- Autorizzazione basata sul ruolo su ogni singola rotta (es. solo un `DOCTOR` può scrivere un referto, solo il paziente proprietario o il dentista assegnato possono vedere un appuntamento)
- Validazione di tutti i payload in ingresso con Zod, con messaggi di errore in italiano
- CORS ristretto alle sole origini del frontend indicate in `CORS_ORIGIN`
- Limite ai tentativi di login: dopo 5 tentativi falliti in 15 minuti per la stessa email (o 50 dallo stesso IP) le API rispondono `429` fino allo scadere della finestra; limite anche sulle registrazioni (20 l'ora per IP)
- Il server non si avvia se `JWT_SECRET` è mancante, più corto di 32 caratteri o ancora uguale al segnaposto di `.env.example`
- Errori sempre restituiti in JSON, senza stack trace verso il client

## Struttura del repository

```
DentalCare/
├── backend/                  # API REST (Express + Prisma)
│   ├── src/
│   │   ├── routes/           # definizione endpoint + documentazione OpenAPI inline
│   │   ├── controllers/      # gestione richiesta/risposta HTTP
│   │   ├── services/         # logica di business e accesso al DB
│   │   ├── middleware/       # auth, authorize, validate
│   │   └── config/           # Prisma client, configurazione Swagger
│   └── prisma/schema.prisma  # modello dati
├── docs/DOCUMENTAZIONE_TECNICA.md  # spiegazione dettagliata di architettura e codice
├── frontend/                 # SPA Vue 3 + TypeScript
│   └── src/
│       ├── views/            # pagine per paziente / dentista / admin
│       ├── components/       # componenti UI riutilizzabili
│       ├── stores/           # stato Pinia (sessione utente)
│       ├── router/           # rotte e guardie per ruolo
│       └── api/              # client Axios verso il backend
├── scripts/ensure-db.js      # verifica/avvio di PostgreSQL locale prima del dev server
├── dentalcare-er-diagram.png
├── dentalcare-usecase-uml.png
└── package.json              # script root per avviare backend + frontend insieme
```

## Avvio del progetto

Tutti i comandi vanno lanciati dalla root del repository (`DentalCare/`), salvo dove indicato diversamente.

### Prerequisiti

- **Node.js 20.19+ o 22.12+** (richiesto da Vite 8) e npm
- **PostgreSQL** (sviluppato con la versione 17). In alternativa a un'installazione locale si può usare Docker, vedi [Solo il database](#solo-il-database).

### 1. Installazione (solo la prima volta)

```bash
# dipendenze della root (concurrently, usato da npm run dev)
npm install

# dipendenze di backend e frontend
npm run install:all
```

### 2. Variabili d'ambiente (solo la prima volta)

Copia i file di esempio e adatta i valori:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| File | Variabile | Descrizione |
| --- | --- | --- |
| `backend/.env` | `DATABASE_URL` | Stringa di connessione PostgreSQL, es. `postgresql://postgres:<password>@localhost:5432/dentalcare` |
| | `JWT_SECRET` | Chiave di firma dei token: stringa casuale di almeno 32 caratteri. Generala con `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| | `JWT_EXPIRES_IN` | Durata dell'access token (default `15m`) |
| | `JWT_REFRESH_EXPIRES_IN` | Durata del refresh token (default `7d`) |
| | `PORT` | Porta del backend (default `3000`) |
| | `CORS_ORIGIN` | Origini del frontend autorizzate, separate da virgola (default `http://localhost:5173`) |
| | `SWAGGER_ENABLED` | `false` per disattivare la documentazione su `/api/docs` (default attiva) |
| `frontend/.env` | `VITE_API_URL` | URL base delle API (default `http://localhost:3000/api`) |

### 3. Database e migrazioni (solo la prima volta e dopo ogni nuova migrazione)

Con PostgreSQL avviato (vedi [Solo il database](#solo-il-database)), se il database `dentalcare` non esiste ancora crealo:

```bash
psql -U postgres -c "CREATE DATABASE dentalcare;"
```

Poi applica le migrazioni e genera il client Prisma:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
cd ..
```

### 4. Primo accesso: creare l'amministratore

La registrazione pubblica crea solo pazienti, e i dentisti vengono creati dall'admin. Per avere il primo amministratore:

1. Avvia l'applicazione (passo 5) e registra un account da http://localhost:5173/registrati
2. Apri Prisma Studio (`cd backend && npx prisma studio`), vai sulla tabella **User** e cambia il campo `role` di quell'account da `PATIENT` ad `ADMIN`, poi salva
3. Rifai il login: ora hai accesso al pannello admin, da cui puoi creare i dentisti e le prestazioni

### 5. Avvio in sviluppo

```bash
npm run dev
```

Il comando esegue prima `db:ensure` (verifica che PostgreSQL risponda sull'host/porta di `DATABASE_URL` e, su Windows, prova ad avviare il servizio `postgresql-x64-17` se è fermo), poi avvia backend e frontend insieme con hot reload:

| Servizio | URL |
| --- | --- |
| Frontend (SPA) | http://localhost:5173 |
| Backend (API) | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |
| Documentazione Swagger | http://localhost:3000/api/docs |

Per fermare tutto: `Ctrl + C` nel terminale.

Per avviare i due servizi separatamente (in due terminali):

```bash
npm run dev --prefix backend    # solo backend (nodemon + ts-node)
npm run dev --prefix frontend   # solo frontend (Vite)
```

### Build di produzione

```bash
npm run build                    # compila il backend in backend/dist e il frontend in frontend/dist
npm start --prefix backend       # avvia il backend compilato
npm run preview --prefix frontend   # serve il bundle del frontend (http://localhost:4173)
```

### Solo il database

**PostgreSQL installato su Windows** (servizio `postgresql-x64-17`; i comandi di avvio/arresto richiedono un terminale da amministratore):

```powershell
Get-Service postgresql*          # stato del servizio
net start postgresql-x64-17      # avvia
net stop postgresql-x64-17       # ferma
npm run db:ensure                # verifica che il DB risponda (e prova ad avviarlo se è fermo)
```

**In alternativa, con Docker** (qualsiasi sistema operativo, nessuna installazione di PostgreSQL necessaria):

```bash
# prima volta: crea e avvia il container
docker run --name dentalcare-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dentalcare -p 5432:5432 -d postgres:17

docker start dentalcare-db       # avvii successivi
docker stop dentalcare-db        # ferma
```

Con questa configurazione `DATABASE_URL` è quella di `backend/.env.example` (`postgresql://postgres:password@localhost:5432/dentalcare`).

**Consultare e gestire i dati** (dalla cartella `backend/`):

```bash
npx prisma studio                # interfaccia web sui dati: http://localhost:5555
npx prisma migrate status        # verifica che le migrazioni siano allineate
npx prisma migrate deploy        # applica le migrazioni mancanti
psql -U postgres -d dentalcare   # console SQL
```

`npx prisma migrate reset` cancella **tutti i dati** e ricrea lo schema da zero: usalo solo se vuoi ripartire da un database vuoto.

### Qualità del codice

```bash
npm run lint --prefix backend            # ESLint sul backend
npm run format:check --prefix backend    # Prettier sul backend
npm run format:check --prefix frontend   # Prettier sul frontend
# per correggere la formattazione: npm run format --prefix backend / --prefix frontend
```

### Problemi comuni

- **Il backend non si connette al database / `Can't reach database server`**: PostgreSQL non è avviato oppure `DATABASE_URL` non è corretta (password, porta, nome del database).
- **`npm run dev` dice che `concurrently` non è riconosciuto**: manca `npm install` nella root (passo 1).
- **Errori Prisma su tabelle o colonne mancanti**: esegui `npx prisma migrate deploy` in `backend/`.
- **Il frontend mostra errori di rete**: controlla che il backend sia in esecuzione e che `VITE_API_URL` punti al suo indirizzo.

## Test

Il test end-to-end (`backend/tests/e2e.cjs`) esercita tutte le API reali: autenticazione, permessi per ruolo, fasce orarie, prenotazioni concorrenti, transizioni di stato, referti, disattivazioni, CORS e limite ai login. Crea i propri dati con nomi univoci: va eseguito su un **database di test separato**, mai su quello con dati reali.

```bash
cd backend
# PowerShell: $env:DATABASE_URL="postgresql://postgres:<password>@localhost:5432/dentalcare_test"
export DATABASE_URL="postgresql://postgres:<password>@localhost:5432/dentalcare_test"
npx prisma migrate deploy          # crea/aggiorna il database di test
npm run build
PORT=3999 npm start                # in un secondo terminale, con lo stesso DATABASE_URL
npm run test:e2e                   # di default punta a http://localhost:3999
```

## Documentazione API

Con il backend in esecuzione, la documentazione interattiva Swagger/OpenAPI di tutti gli endpoint è disponibile su:

```
http://localhost:3000/api/docs
```

La documentazione è attiva di default; per un'installazione esposta all'esterno si può disattivare con `SWAGGER_ENABLED=false` in `backend/.env`.

Per una spiegazione dettagliata di come funzionano backend, frontend e database e di come sono collegati tra loro (architettura a livelli, flusso delle richieste, autenticazione, catalogo API, pagine e componenti), vedi la [documentazione tecnica](./docs/DOCUMENTAZIONE_TECNICA.md).

## Limiti noti e possibili sviluppi

- È presente un test end-to-end delle API (`backend/tests/e2e.cjs`, vedi [Test](#test)); non ci sono test unitari né test automatici dell'interfaccia, che è stata verificata manualmente in browser.
- Le fasce orarie di disponibilità vanno mantenute aggiornate periodicamente da ciascun dentista tramite la pagina "Disponibilità" (come avviene realmente in uno studio professionale, che pianifica l'agenda mese per mese). Le API permettono di gestirle anche all'admin, ma nell'interfaccia la pagina è riservata ai dentisti.
- Non esiste un seed iniziale: il primo account amministratore va creato manualmente (vedi [Primo accesso](#4-primo-accesso-creare-lamministratore)).
- Possibili estensioni: notifiche email/SMS di conferma appuntamento, esportazione referti in PDF, dashboard economica con andamento incassi per l'admin.
