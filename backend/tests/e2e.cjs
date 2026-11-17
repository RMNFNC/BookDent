// Test end-to-end delle API di BookDent-FlashCare.
// Richiede il backend in esecuzione su un DATABASE DI TEST (vedi README, sezione "Test"):
// lo script crea utenti, prestazioni e appuntamenti con nomi univoci a ogni esecuzione.
// Uso: npm run test:e2e   (API_URL di default: http://localhost:3999)
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const BASE = process.env.API_URL || 'http://localhost:3999';

// Protezione: lo script scrive dati, quindi rifiuta di girare su un database
// il cui nome non contiene "test" (es. quello di sviluppo letto da .env).
const dbName = (() => {
  try {
    return new URL(process.env.DATABASE_URL).pathname.slice(1);
  } catch {
    return '';
  }
})();
if (!/test/i.test(dbName)) {
  console.error(
    `DATABASE_URL punta a "${dbName || '?'}": usa un database di test (il nome deve contenere "test").`
  );
  process.exit(1);
}
const prisma = new PrismaClient();

let pass = 0,
  fail = 0;
const check = (name, cond, extra) => {
  if (cond) {
    pass++;
    console.log('  ok  ', name);
  } else {
    fail++;
    console.log('  FAIL', name, extra !== undefined ? JSON.stringify(extra).slice(0, 300) : '');
  }
};
const api = async (method, url, { token, body, raw, headers } = {}) => {
  const res = await fetch(BASE + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: raw ?? (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data, headers: res.headers };
};

const RUN = Date.now();
const localDay = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};
const at = (day, hhmm) => new Date(`${day}T${hhmm}:00`).toISOString();

(async () => {
  console.log('# health & misc');
  let r = await api('GET', '/api/health');
  check(
    'health returns new name',
    r.status === 200 && r.data.status === 'BookDent-FlashCare API running',
    r.data
  );
  r = await api('GET', '/api/nope');
  check('unknown route -> 404 JSON', r.status === 404 && typeof r.data === 'object', r);
  r = await api('POST', '/api/auth/login', { raw: '{bad json' });
  check('malformed JSON -> 400 JSON', r.status === 400 && typeof r.data === 'object', r);
  r = await api('GET', '/api/docs/');
  check('swagger docs served', r.status === 200 && String(r.data).includes('swagger'), r.status);

  const allowed = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')[0].trim();
  r = await api('OPTIONS', '/api/auth/login', {
    headers: { Origin: allowed, 'Access-Control-Request-Method': 'POST' },
  });
  check(
    'CORS: frontend origin allowed',
    r.headers.get('access-control-allow-origin') === allowed,
    r.headers.get('access-control-allow-origin')
  );
  r = await api('OPTIONS', '/api/auth/login', {
    headers: { Origin: 'https://evil.example.com', 'Access-Control-Request-Method': 'POST' },
  });
  check(
    'CORS: foreign origin not allowed',
    !r.headers.get('access-control-allow-origin'),
    r.headers.get('access-control-allow-origin')
  );

  console.log('# auth');
  const pw = 'Password123!';
  const adminEmail = `admin${RUN}@test.it`;
  await prisma.user.create({
    data: { email: adminEmail, passwordHash: await bcrypt.hash(pw, 10), role: 'ADMIN' },
  });
  const reg = (n) => ({
    email: `p${n}${RUN}@test.it`,
    password: pw,
    firstName: 'Paz',
    lastName: `N${n}`,
    codiceFiscale: `CF${n}${String(RUN).slice(-12)}`.slice(0, 16),
    dateOfBirth: '1990-05-10',
    phone: '3331234567',
  });
  r = await api('POST', '/api/auth/register', { body: reg(1) });
  check(
    'register patient',
    r.status === 201 && r.data.accessToken && r.data.user.role === 'PATIENT',
    r
  );
  const p1 = r.data.accessToken;
  const p1refresh = r.data.refreshToken;
  r = await api('POST', '/api/auth/register', { body: reg(2) });
  const p2 = r.data.accessToken;
  r = await api('POST', '/api/auth/register', { body: reg(3) });
  const p3 = r.data.accessToken;
  r = await api('POST', '/api/auth/register', { body: reg(1) });
  check('duplicate email rejected', r.status === 400, r);
  r = await api('POST', '/api/auth/register', { body: { ...reg(1), email: 'bad', password: '1' } });
  check(
    'invalid register payload -> 400 with errors',
    r.status === 400 && Array.isArray(r.data.errors),
    r
  );
  r = await api('POST', '/api/auth/register', { body: { ...reg(9), role: 'ADMIN' } });
  check('register ignores role escalation', r.status === 201 && r.data.user.role === 'PATIENT', r);
  r = await api('POST', '/api/auth/login', { body: { email: reg(1).email, password: 'wrong' } });
  check('wrong password rejected', r.status >= 400 && r.status < 500 && !r.data.accessToken, r);
  r = await api('POST', '/api/auth/login', { body: { email: adminEmail, password: pw } });
  check('admin login', r.status === 200 && r.data.user.role === 'ADMIN', r);
  const admin = r.data.accessToken;
  r = await api('POST', '/api/auth/refresh', { body: { refreshToken: p1refresh } });
  check('refresh token works', r.status === 200 && r.data.accessToken, r);
  r = await api('POST', '/api/auth/refresh', { body: { refreshToken: p1 } });
  check('access token not accepted as refresh', r.status >= 400, r);
  r = await api('GET', '/api/users/me', { token: 'garbage' });
  check('invalid token -> 401', r.status === 401, r);
  r = await api('GET', '/api/users/me');
  check('missing token -> 401', r.status === 401, r);
  r = await api('GET', '/api/users/me', { token: p1 });
  check('users/me returns patient profile', r.status === 200 && r.data.patient, r);

  // rate limit: 5 tentativi falliti per email, poi 429 anche con la password giusta
  const victim = reg(4);
  await api('POST', '/api/auth/register', { body: victim });
  const fails = [];
  for (let i = 0; i < 5; i++)
    fails.push(
      (await api('POST', '/api/auth/login', { body: { email: victim.email, password: 'wrong' } }))
        .status
    );
  check(
    'first 5 failed logins -> 401',
    fails.every((x) => x === 401),
    fails
  );
  r = await api('POST', '/api/auth/login', { body: { email: victim.email, password: 'wrong' } });
  check('6th failed login -> 429', r.status === 429 && r.data.message, r);
  r = await api('POST', '/api/auth/login', { body: { email: victim.email, password: pw } });
  check('locked account stays locked even with right password', r.status === 429, r.status);
  r = await api('POST', '/api/auth/login', { body: { email: reg(1).email, password: pw } });
  check('other accounts from same IP not locked', r.status === 200, r.status);

  console.log('# admin: services & doctors');
  r = await api('POST', '/api/services', { token: p1, body: { name: 'x' } });
  check('patient cannot create service (403)', r.status === 403, r);
  r = await api('POST', '/api/services', {
    token: admin,
    body: { name: `Igiene ${RUN}`, durationMin: 30, price: 60 },
  });
  check('admin creates service', r.status === 201, r);
  const svc = r.data.id;
  r = await api('POST', '/api/services', {
    token: admin,
    body: { name: `Impianto ${RUN}`, durationMin: 120, price: 900 },
  });
  const longSvc = r.data.id;
  r = await api('POST', '/api/services', { token: admin, body: { name: `Igiene ${RUN}` } });
  check('duplicate service name rejected', r.status >= 400 && r.status < 500, r);
  const mkDoc = (n) => ({
    email: `d${n}${RUN}@test.it`,
    password: pw,
    firstName: 'Doc',
    lastName: `D${n}`,
    specialization: 'Ortodonzia',
  });
  r = await api('POST', '/api/doctors', { token: admin, body: mkDoc(1) });
  check('admin creates doctor', r.status === 201 && r.data.doctor, r);
  const d1id = r.data.doctor.id;
  r = await api('POST', '/api/doctors', { token: admin, body: mkDoc(2) });
  const d2id = r.data.doctor.id;
  r = await api('POST', '/api/doctors', { token: p1, body: mkDoc(3) });
  check('patient cannot create doctor (403)', r.status === 403, r);
  const d1 = (
    await api('POST', '/api/auth/login', { body: { email: mkDoc(1).email, password: pw } })
  ).data.accessToken;
  const d2 = (
    await api('POST', '/api/auth/login', { body: { email: mkDoc(2).email, password: pw } })
  ).data.accessToken;
  check('doctors can log in', d1 && d2);

  console.log('# slots');
  // primo giorno futuro senza slot nel database: ogni esecuzione parte da un calendario vuoto
  let offset = 3;
  while (await prisma.availabilitySlot.count({ where: { date: new Date(localDay(offset)) } }))
    offset++;
  const day = localDay(offset);
  r = await api('POST', `/api/doctors/${d1id}/slots`, {
    token: d1,
    body: { date: day, startTime: at(day, '10:00'), endTime: at(day, '11:00') },
  });
  check('doctor creates slot', r.status === 201, r);
  const slotA = r.data.id;
  r = await api('POST', `/api/doctors/${d1id}/slots`, {
    token: d1,
    body: { date: day, startTime: at(day, '10:30'), endTime: at(day, '11:30') },
  });
  check('overlapping slot rejected', r.status === 400, r);
  r = await api('POST', `/api/doctors/${d1id}/slots`, {
    token: d1,
    body: { date: day, startTime: at(day, '11:00'), endTime: at(day, '10:00') },
  });
  check('end before start rejected', r.status === 400, r);
  const past = localDay(-1);
  r = await api('POST', `/api/doctors/${d1id}/slots`, {
    token: d1,
    body: { date: past, startTime: at(past, '10:00'), endTime: at(past, '11:00') },
  });
  check('past slot rejected', r.status === 400, r);
  r = await api('POST', `/api/doctors/${d2id}/slots`, {
    token: d1,
    body: { date: day, startTime: at(day, '15:00'), endTime: at(day, '16:00') },
  });
  check("doctor can't edit another doctor's calendar", r.status === 400 || r.status === 403, r);
  r = await api('POST', `/api/doctors/${d2id}/slots`, {
    token: d2,
    body: { date: day, startTime: at(day, '10:00'), endTime: at(day, '11:00') },
  });
  check('second doctor creates same-time slot', r.status === 201, r);
  r = await api('POST', `/api/doctors/${d2id}/slots`, {
    token: d2,
    body: { date: day, startTime: at(day, '14:00'), endTime: at(day, '14:30') },
  });
  const shortSlot = r.data.id;

  console.log('# availability');
  r = await api('GET', `/api/appointments/availability?serviceId=${svc}&date=${day}`);
  check(
    'availability lists both doctors at 10:00 + 14:00',
    r.status === 200 && r.data.length === 3,
    r.data
  );
  r = await api('GET', `/api/appointments/availability?serviceId=${longSvc}&date=${day}`);
  check(
    'slots too short for 120min service excluded',
    r.status === 200 && r.data.length === 0,
    r.data
  );
  r = await api('GET', `/api/appointments/availability?serviceId=abc&date=${day}`);
  check('availability bad serviceId -> 400', r.status === 400, r);

  console.log('# booking');
  r = await api('POST', '/api/appointments', {
    token: d1,
    body: { serviceId: svc, date: day, startTime: at(day, '10:00') },
  });
  check('doctor cannot book (403)', r.status === 403, r);
  r = await api('POST', '/api/appointments', {
    token: p1,
    body: { serviceId: svc, date: past, startTime: at(past, '10:00') },
  });
  check('booking in the past rejected', r.status === 400, r);
  // concurrency: 3 patients race for 2 slots at 10:00
  const race = await Promise.all(
    [p1, p2, p3].map((t) =>
      api('POST', '/api/appointments', {
        token: t,
        body: { serviceId: svc, date: day, startTime: at(day, '10:00') },
      })
    )
  );
  const ok = race.filter((x) => x.status === 201);
  check(
    'concurrent booking: exactly 2 of 3 succeed',
    ok.length === 2,
    race.map((x) => x.status)
  );
  check(
    'concurrent booking: different doctors assigned',
    ok.length === 2 && ok[0].data.doctorId !== ok[1].data.doctorId,
    ok.map((x) => x.data.doctorId)
  );
  const appt = ok[0].data;
  const apptToken = [p1, p2, p3][race.indexOf(ok[0])];
  const otherPatient = [p1, p2, p3][race.findIndex((x) => x.status !== 201)];
  r = await api('GET', `/api/appointments/${appt.id}`, { token: apptToken });
  check('owner reads appointment', r.status === 200, r);
  r = await api('GET', `/api/appointments/${appt.id}`, { token: otherPatient });
  check('other patient cannot read appointment (403)', r.status === 403, r);
  r = await api('GET', '/api/appointments/abc', { token: apptToken });
  check('bad appointment id -> 400', r.status === 400, r);
  r = await api('GET', '/api/appointments/99999999', { token: admin });
  check('missing appointment -> 404', r.status === 404, r);
  r = await api('GET', '/api/appointments', { token: p1 });
  check('patient cannot list all appointments (403)', r.status === 403, r);
  r = await api('GET', '/api/appointments', { token: admin });
  check('admin lists all appointments', r.status === 200 && r.data.length >= 2, r.status);
  const apptDocToken = appt.doctorId === d1id ? d1 : d2;
  const otherDocToken = appt.doctorId === d1id ? d2 : d1;
  r = await api('GET', '/api/appointments/me', { token: apptDocToken });
  check(
    'doctor sees own appointment',
    r.status === 200 && r.data.some((a) => a.id === appt.id),
    r.status
  );
  r = await api('DELETE', `/api/doctors/${appt.doctorId}/slots/${appt.slotId}`, {
    token: apptDocToken,
  });
  check('booked slot cannot be deleted', r.status === 400, r);

  console.log('# status transitions');
  r = await api('PUT', `/api/appointments/${appt.id}/status`, {
    token: apptToken,
    body: { status: 'CONFIRMED' },
  });
  check('patient cannot confirm', r.status === 400, r);
  r = await api('PUT', `/api/appointments/${appt.id}/status`, {
    token: otherDocToken,
    body: { status: 'CONFIRMED' },
  });
  check('non-assigned doctor cannot confirm', r.status === 400, r);
  r = await api('PUT', `/api/appointments/${appt.id}/status`, {
    token: apptDocToken,
    body: { status: 'PENDING' },
  });
  check('invalid status value rejected', r.status === 400, r);
  r = await api('PUT', `/api/appointments/${appt.id}/status`, {
    token: apptDocToken,
    body: { status: 'COMPLETED' },
  });
  check('PENDING -> COMPLETED not allowed', r.status === 400, r);
  r = await api('POST', '/api/records', {
    token: apptDocToken,
    body: { appointmentId: appt.id, diagnosis: 'x', treatment: 'y' },
  });
  check('record on non-completed appointment rejected', r.status === 400, r);
  r = await api('PUT', `/api/appointments/${appt.id}/status`, {
    token: apptDocToken,
    body: { status: 'CONFIRMED' },
  });
  check('doctor confirms', r.status === 200 && r.data.status === 'CONFIRMED', r);
  r = await api('PUT', `/api/appointments/${appt.id}/status`, {
    token: apptDocToken,
    body: { status: 'COMPLETED' },
  });
  check('doctor completes', r.status === 200 && r.data.status === 'COMPLETED', r);
  r = await api('PUT', `/api/appointments/${appt.id}/status`, {
    token: apptToken,
    body: { status: 'CANCELLED' },
  });
  check('cannot cancel completed', r.status === 400, r);

  console.log('# medical records');
  r = await api('POST', '/api/records', {
    token: otherDocToken,
    body: { appointmentId: appt.id, diagnosis: 'x', treatment: 'y' },
  });
  check('other doctor cannot write record', r.status === 400 || r.status === 403, r);
  r = await api('POST', '/api/records', {
    token: apptDocToken,
    body: { appointmentId: appt.id, diagnosis: 'Carie', treatment: 'Otturazione', notes: 'ok' },
  });
  check('doctor writes record', r.status === 201, r);
  const recId = r.data.id;
  r = await api('POST', '/api/records', {
    token: apptDocToken,
    body: { appointmentId: appt.id, diagnosis: 'x', treatment: 'y' },
  });
  check('duplicate record rejected', r.status === 400, r);
  r = await api('PUT', `/api/records/${recId}`, {
    token: apptDocToken,
    body: { notes: 'aggiornato' },
  });
  check('doctor updates record', r.status === 200 && r.data.notes === 'aggiornato', r);
  r = await api('PUT', `/api/records/${recId}`, { token: otherDocToken, body: { notes: 'hack' } });
  check('other doctor cannot update record', r.status >= 400, r);
  r = await api('GET', '/api/records/me', { token: apptToken });
  check('patient sees own record', r.status === 200 && r.data.some((x) => x.id === recId), r);
  r = await api('GET', `/api/records/${recId}`, { token: otherPatient });
  check('other patient cannot read record (403)', r.status === 403, r);
  r = await api('GET', `/api/records/${recId}`, { token: otherDocToken });
  check('other doctor cannot read record (403)', r.status === 403, r);
  r = await api('GET', `/api/records/${recId}`, { token: admin });
  check('admin reads record', r.status === 200, r);

  console.log('# cancellation & rebooking');
  const appt2 = ok[1].data;
  const appt2Token = [p1, p2, p3][race.indexOf(ok[1])];
  const cancels = await Promise.all(
    [1, 2].map(() =>
      api('PUT', `/api/appointments/${appt2.id}/status`, {
        token: appt2Token,
        body: { status: 'CANCELLED' },
      })
    )
  );
  check(
    'concurrent double cancel: exactly one succeeds',
    cancels.filter((x) => x.status === 200).length === 1,
    cancels.map((x) => x.status)
  );
  const freeSlots = await prisma.availabilitySlot.count({
    where: { doctorId: appt2.doctorId, startTime: new Date(at(day, '10:00')), isBooked: false },
  });
  check('exactly one replacement slot created', freeSlots === 1, freeSlots);
  r = await api('POST', '/api/appointments', {
    token: otherPatient,
    body: { serviceId: svc, date: day, startTime: at(day, '10:00') },
  });
  check('cancelled time can be rebooked', r.status === 201, r);

  console.log('# deactivation');
  // il dentista che ha l'appuntamento riprenotato alle 10:00 ha una visita futura attiva
  const busyDoc = appt2.doctorId;
  r = await api('PATCH', `/api/doctors/${busyDoc}`, { token: admin, body: { isActive: false } });
  check(
    'doctor with upcoming appointments cannot be deactivated',
    r.status === 400 && /appuntament/.test(r.data.message),
    r
  );
  const freeDoc = busyDoc === d1id ? d2id : d1id;
  const freeDocToken = freeDoc === d1id ? d1 : d2;
  r = await api('POST', `/api/doctors/${freeDoc}/slots`, {
    token: freeDocToken,
    body: { date: day, startTime: at(day, '17:00'), endTime: at(day, '18:00') },
  });
  const freeDocSlot = r.data.id;
  r = await api('PATCH', `/api/doctors/${freeDoc}`, { token: admin, body: { isActive: false } });
  check(
    'doctor without upcoming appointments deactivated',
    r.status === 200 && r.data.isActive === false,
    r
  );
  r = await api('GET', `/api/appointments/availability?serviceId=${svc}&date=${day}`);
  check(
    "inactive doctor's slots hidden",
    r.status === 200 && !r.data.some((s) => s.id === freeDocSlot),
    r.data
  );
  r = await api('GET', '/api/doctors');
  check(
    'inactive doctor hidden from public list',
    !r.data.some((d) => d.id === freeDoc),
    r.data.length
  );
  r = await api('GET', '/api/doctors', { token: admin });
  check(
    'admin sees inactive doctor',
    r.data.some((d) => d.id === freeDoc),
    r.data.length
  );
  await api('PATCH', `/api/doctors/${freeDoc}`, { token: admin, body: { isActive: true } });
  const rebooked = await prisma.appointment.findFirst({
    where: { doctorId: busyDoc, status: 'PENDING' },
    orderBy: { id: 'desc' },
  });
  r = await api('PUT', `/api/appointments/${rebooked.id}/status`, {
    token: admin,
    body: { status: 'CANCELLED' },
  });
  check(
    'admin cancels the upcoming appointment',
    r.status === 200 && r.data.status === 'CANCELLED',
    r
  );
  r = await api('PATCH', `/api/doctors/${busyDoc}`, { token: admin, body: { isActive: false } });
  check('...then the doctor can be deactivated', r.status === 200 && r.data.isActive === false, r);
  await api('PATCH', `/api/doctors/${busyDoc}`, { token: admin, body: { isActive: true } });
  r = await api('PATCH', `/api/services/${svc}`, { token: admin, body: { isActive: false } });
  check('admin deactivates service', r.status === 200, r);
  r = await api('POST', '/api/appointments', {
    token: p1,
    body: { serviceId: svc, date: day, startTime: at(day, '14:00') },
  });
  check('booking inactive service rejected', r.status === 400, r);
  r = await api('GET', '/api/services');
  check('inactive service hidden publicly', !r.data.some((s) => s.id === svc), r.data.length);

  console.log('# slot deletion');
  r = await api('DELETE', `/api/doctors/${d2id}/slots/${shortSlot}`, { token: d1 });
  check("doctor can't delete other's slot", r.status >= 400, r);
  r = await api('DELETE', `/api/doctors/${d2id}/slots/${shortSlot}`, { token: d2 });
  check('doctor deletes own free slot', r.status === 200 || r.status === 204, r);

  console.log(`\n${pass} passed, ${fail} failed`);
  await prisma.$disconnect();
  process.exit(fail ? 1 : 0);
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(2);
});
