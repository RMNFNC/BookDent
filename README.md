# DentalCare

Applicazione full-stack API-based per la gestione digitale di uno studio dentistico: prenotazione visite con assegnazione automatica del dentista, gestione referti medici e pannello amministrativo per dottori, prestazioni e appuntamenti.

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
- [Documentazione API](#documentazione-api)
- [Limiti noti e possibili sviluppi](#limiti-noti-e-possibili-sviluppi)

## Come la traccia è stata soddisfatta

| Requisito della traccia | Come è implementato |
| --- | --- |
| Impresa del settore sanitario | Studio dentistico (DentalCare), con pazienti, dentisti e personale amministrativo |
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
- Redazione del referto medico per una visita completata

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
- CORS configurato esplicitamente sul backend

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

**Prerequisiti**: Node.js 20+, PostgreSQL in esecuzione in locale.

```bash
# 1. Installa le dipendenze di backend e frontend
npm run install:all

# 2. Configura le variabili d'ambiente
#    backend/.env  -> copia da backend/.env.example e imposta DATABASE_URL e JWT_SECRET
#    frontend/.env -> copia da frontend/.env.example (VITE_API_URL)

# 3. Applica le migrazioni Prisma al database
cd backend && npx prisma migrate deploy && cd ..

# 4. Avvia backend (:3000) e frontend (:5173) insieme
npm run dev
```

Lo script `db:ensure` (eseguito automaticamente da `npm run dev`) verifica che PostgreSQL sia raggiungibile su `localhost:5432` e, su Windows, prova ad avviare il servizio se risulta fermo.

Build di produzione: `npm run build` (compila TypeScript del backend e genera il bundle statico del frontend).

## Documentazione API

Con il backend in esecuzione, la documentazione interattiva Swagger/OpenAPI di tutti gli endpoint è disponibile su:

```
http://localhost:3000/api/docs
```

## Limiti noti e possibili sviluppi

- Non sono presenti test automatici (unit/integration); la verifica del progetto è stata fatta manualmente end-to-end (build, lint, flusso di registrazione/prenotazione in browser).
- Le fasce orarie di disponibilità dei dentisti vanno mantenute aggiornate periodicamente dall'admin/dentista tramite la pagina "Disponibilità" (come avviene realmente in uno studio professionale, che pianifica l'agenda mese per mese).
- Possibili estensioni: notifiche email/SMS di conferma appuntamento, esportazione referti in PDF, dashboard economica con andamento incassi per l'admin.
