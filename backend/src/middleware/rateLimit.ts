import rateLimit from 'express-rate-limit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const tooMany = (message: string) => ({ message });

// Tentativi di login falliti per coppia IP + email: blocca il brute force su un
// account senza bloccare i colleghi dello studio che escono dallo stesso IP.
// I login riusciti non vengono conteggiati.
export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) =>
    `${req.ip}:${String(req.body?.email ?? '')
      .trim()
      .toLowerCase()}`,
  message: tooMany('Troppi tentativi di accesso falliti. Riprova tra 15 minuti.'),
});

// Limite complessivo per IP: frena chi prova molte email diverse dallo stesso indirizzo.
export const loginIpLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 50,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: tooMany('Troppi tentativi di accesso da questo indirizzo. Riprova tra 15 minuti.'),
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: tooMany('Troppe registrazioni da questo indirizzo. Riprova più tardi.'),
});
