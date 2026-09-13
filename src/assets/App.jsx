import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Home, ListChecks, MapPin, TrendingUp, Bell, User, LayoutDashboard,
  Building2, Users, BarChart3, ChevronRight, X, Play, Pause, ArrowRight,
  ShieldAlert, Clock, Stethoscope, Info, RefreshCw, QrCode, CheckCircle2,
  AlertTriangle, ChevronLeft, Radio, Globe2, Sparkles,
} from "lucide-react";

/* ============================================================
   TOKENS
============================================================ */
const C = {
  ink: "#0B2027",
  sub: "#4E6A70",
  primary: "#0E7C86",
  primaryDeep: "#0B5563",
  primaryTint: "#EAF6F6",
  blue: "#2A5C8A",
  good: "#189B4D",
  goodTint: "#E7F7EC",
  warn: "#C98400",
  warnTint: "#FDF3DF",
  bad: "#C13F3F",
  badTint: "#FBEAEA",
  border: "#DCE7E8",
  paper: "#FFFFFF",
  canvas: "#F5FAFA",
};

const FONT_HEAD = "'Space Grotesk', 'Inter', sans-serif";
const FONT_BODY = "'Inter', sans-serif";

/* ============================================================
   MOCK DATA
============================================================ */
const CLINICS = [
  { id: 1, name: "Поликлиника №1", district: "5-й мкр.", x: 32, y: 30, queueNow: 8, avgWait: 22, cabinets: 4, cabinetsTotal: 5, lambda: 22, mu: 5 },
  { id: 2, name: "Поликлиника №2", district: "9-й мкр.", x: 55, y: 22, queueNow: 21, avgWait: 46, cabinets: 4, cabinetsTotal: 4, lambda: 34, mu: 4.5 },
  { id: 3, name: "Поликлиника №3", district: "14-й мкр.", x: 68, y: 40, queueNow: 27, avgWait: 51, cabinets: 5, cabinetsTotal: 6, lambda: 38, mu: 4.8 },
  { id: 4, name: "Поликлиника №4", district: "3-й мкр.", x: 22, y: 55, queueNow: 6, avgWait: 14, cabinets: 3, cabinetsTotal: 4, lambda: 14, mu: 5.2 },
  { id: 5, name: "Поликлиника №5", district: "17-й мкр.", x: 46, y: 63, queueNow: 12, avgWait: 27, cabinets: 4, cabinetsTotal: 5, lambda: 24, mu: 5 },
  { id: 6, name: "Поликлиника №6", district: "27-й мкр.", x: 74, y: 68, queueNow: 4, avgWait: 11, cabinets: 3, cabinetsTotal: 3, lambda: 12, mu: 5.4 },
  { id: 7, name: "Поликлиника №7", district: "29-й мкр.", x: 60, y: 82, queueNow: 5, avgWait: 12, cabinets: 4, cabinetsTotal: 4, lambda: 15, mu: 5.6 },
  { id: 8, name: "Поликлиника №8", district: "12-й мкр.", x: 30, y: 78, queueNow: 15, avgWait: 33, cabinets: 3, cabinetsTotal: 4, lambda: 26, mu: 4.6 },
];

const PRIORITY_PATIENTS = [
  { id: 118, priority: "high", note: "Направление от кардиолога", waitTarget: "минимальное", arrived: "08:41" },
  { id: 125, priority: "high", note: "Повышенная температура, риск осложнений", waitTarget: "минимальное", arrived: "09:02" },
  { id: 131, priority: "elevated", note: "Хроническое заболевание, плановый приём", waitTarget: "сокращённое", arrived: "09:10" },
  { id: 139, priority: "normal", note: "Плановый осмотр", waitTarget: "стандартное", arrived: "09:14" },
  { id: 144, priority: "elevated", note: "Повторный приём после стационара", waitTarget: "сокращённое", arrived: "09:20" },
  { id: 151, priority: "normal", note: "Профилактический визит", waitTarget: "стандартное", arrived: "09:26" },
];

const DEMO_STEPS = [
  { title: "Сканирование QR-кода", text: "Пациент сканирует QR-код на входе в поликлинику и открывает SmartQ." },
  { title: "Электронная очередь", text: "Система регистрирует пациента и добавляет его в электронную очередь центра." },
  { title: "Определение позиции", text: "SmartQ вычисляет текущую позицию пациента среди всех ожидающих." },
  { title: "Расчёт ожидания", text: "На основе скорости обслуживания и числа кабинетов рассчитывается примерное время ожидания." },
  { title: "Прогноз очереди", text: "Модель прогнозирует, как изменится очередь через 30 и 60 минут." },
  { title: "Проверка загрузки центра", text: "Если центр перегружен, система находит ближайший менее загруженный центр." },
  { title: "Напоминание пациенту", text: "За 10–20 минут до приёма пациент получает уведомление о приближении очереди." },
  { title: "Мониторинг в центре", text: "Медицинский центр видит текущую загрузку, приоритеты и работу кабинетов в реальном времени." },
  { title: "Городской мониторинг", text: "Администратор города видит все центры на карте с цветовой индикацией загрузки." },
  { title: "Рекомендация перераспределения", text: "SmartQ автоматически предлагает перенаправить пациентов из перегруженных центров в свободные." },
];

/* ============================================================
   HELPERS
============================================================ */
function loadPct(c) {
  return Math.min(100, Math.round((c.queueNow / (c.cabinets * 6)) * 100));
}
function statusOf(pct) {
  if (pct >= 80) return "bad";
  if (pct >= 50) return "warn";
  return "good";
}
const STATUS_LABEL = { good: "Низкая загрузка", warn: "Средняя загрузка", bad: "Высокая загрузка" };
const STATUS_DOT = { good: C.good, warn: C.warn, bad: C.bad };
const STATUS_BG = { good: C.goodTint, warn: C.warnTint, bad: C.badTint };

function minutesToClock(mins) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + mins);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

// Simple statistical queue-forecast model (λ arrivals/hr, μ service rate per cabinet/hr, N cabinets)
// Architected as a standalone function so it can later be swapped for a trained ML model
// without touching any UI code — same signature, richer internals.
function computeForecast(clinic) {
  const { queueNow, lambda, mu, cabinets } = clinic;
  const capacity = mu * cabinets;
  const netPerMin = (lambda - capacity) / 60;
  const points = [];
  for (let t = 0; t <= 120; t += 15) {
    const peakFactor = 1 + 0.25 * Math.sin((t / 120) * Math.PI); // mild peak-hour bulge
    const raw = queueNow + netPerMin * t * peakFactor;
    points.push({ t, label: t === 0 ? "Сейчас" : `+${t} мин`, patients: Math.max(0, Math.round(raw)) });
  }
  return points;
}

function computeSchedule(clinic) {
  const base = [
    { time: "09:00", factor: 1.5 },
    { time: "11:00", factor: 1.0 },
    { time: "12:30", factor: 0.75 },
    { time: "14:30", factor: 0.4 },
    { time: "16:00", factor: 0.45 },
    { time: "17:30", factor: 0.9 },
  ];
  return base.map((b) => {
    const wait = Math.max(4, Math.round((clinic.avgWait || 20) * b.factor));
    const pct = Math.min(100, Math.round(loadPct(clinic) * b.factor));
    return { ...b, wait, status: statusOf(pct) };
  });
}

/* ============================================================
   SMALL UI PRIMITIVES
============================================================ */
function StatusPill({ status, children }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: STATUS_BG[status], color: STATUS_DOT[status] }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_DOT[status] }} />
      {children}
    </span>
  );
}

function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl bg-white p-5 ${className}`}
      style={{ border: `1px solid ${C.border}`, ...style }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <div className="text-xs font-medium mb-1" style={{ color: C.primary }}>{eyebrow}</div>}
        <h2 className="text-lg font-semibold" style={{ color: C.ink, fontFamily: FONT_HEAD }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-xl px-4 py-3 shadow-lg"
      style={{ background: C.primaryDeep, color: "white" }}
    >
      <div className="flex items-start gap-3">
        <Bell size={18} className="mt-0.5 shrink-0" />
        <div className="flex-1 text-sm leading-snug">
          <div className="font-medium">{toast.title}</div>
          <div className="opacity-90">{toast.message}</div>
        </div>
        <button onClick={onClose} className="opacity-70 hover:opacity-100"><X size={16} /></button>
      </div>
    </div>
  );
}

/* ============================================================
   MAP
============================================================ */
function MapView({ clinics, selectedId, onSelect, highlightId }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: "4 / 3", background: `linear-gradient(115deg, #DFF1F1 0%, ${C.canvas} 38%, #F7FBFB 100%)`, border: `1px solid ${C.border}` }}
    >
      {/* stylised coastline */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,0 C10,20 4,45 12,65 C18,80 8,92 0,100 L0,0 Z" fill="#CDEBEE" opacity="0.7" />
        <path d="M0,10 C8,28 6,50 14,68" stroke="#9FD3D8" strokeWidth="0.5" fill="none" opacity="0.8" />
        {[20, 40, 60, 80].map((p) => (
          <line key={p} x1={p} y1="0" x2={p} y2="100" stroke="#DCEEEF" strokeWidth="0.3" />
        ))}
        {[20, 40, 60, 80].map((p) => (
          <line key={"h" + p} x1="0" y1={p} x2="100" y2={p} stroke="#DCEEEF" strokeWidth="0.3" />
        ))}
      </svg>
      <div className="absolute left-3 top-3 rounded-md bg-white/85 px-2 py-1 text-[11px] font-medium backdrop-blur" style={{ color: C.sub }}>
        Актау · карта медицинских центров
      </div>
      {clinics.map((c) => {
        const pct = loadPct(c);
        const status = statusOf(pct);
        const active = selectedId === c.id;
        const pulsing = highlightId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            aria-label={c.name}
          >
            {pulsing && (
              <span
                className="absolute inset-0 -m-2 rounded-full animate-ping"
                style={{ background: STATUS_DOT[status], opacity: 0.4 }}
              />
            )}
            <span
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white shadow-md"
              style={{
                background: STATUS_DOT[status],
                outline: active ? `3px solid ${C.primaryDeep}` : "none",
                outlineOffset: "2px",
              }}
            >
              {c.id}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ClinicCard({ clinic, onSelect, compact }) {
  const pct = loadPct(clinic);
  const status = statusOf(pct);
  const sched = computeSchedule(clinic);
  const best = sched.reduce((a, b) => (b.wait < a.wait ? b : a), sched[0]);
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold" style={{ color: C.ink }}>{clinic.name}</div>
          <div className="text-xs" style={{ color: C.sub }}>{clinic.district}</div>
        </div>
        <StatusPill status={status}>{STATUS_LABEL[status]}</StatusPill>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Сейчас в очереди" value={`${clinic.queueNow} чел.`} />
        <Metric label="Среднее ожидание" value={`${clinic.avgWait} мин`} />
        <Metric label="Загруженность" value={`${pct}%`} />
        <Metric label="Кабинеты" value={`${clinic.cabinets} из ${clinic.cabinetsTotal}`} />
      </div>
      {!compact && (
        <div className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ background: C.primaryTint, color: C.primaryDeep }}>
          Рекомендуемое время: <b>{best.time}</b> · прогноз ожидания ~{best.wait} мин
        </div>
      )}
      {onSelect && (
        <button
          onClick={() => onSelect(clinic.id)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: C.primary }}
        >
          Выбрать этот центр <ArrowRight size={15} />
        </button>
      )}
    </Card>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div className="text-[11px]" style={{ color: C.sub }}>{label}</div>
      <div className="font-semibold" style={{ color: C.ink, fontFamily: FONT_HEAD }}>{value}</div>
    </div>
  );
}

/* ============================================================
   PATIENT PAGES
============================================================ */
function PatientHome({ patient, clinic, allClinics, onSwitchClinic, onGoMap, onGoForecast }) {
  const pct = loadPct(clinic);
  const status = statusOf(pct);
  const altClinic = useMemo(() => {
    return [...allClinics].filter((c) => c.id !== clinic.id).sort((a, b) => loadPct(a) - loadPct(b))[0];
  }, [clinic, allClinics]);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div
        className="rounded-3xl p-6 text-white shadow-sm"
        style={{ background: `linear-gradient(135deg, ${C.primaryDeep}, ${C.primary})` }}
      >
        <div className="flex items-center justify-between text-sm opacity-90">
          <span>{patient.name}</span>
          <span className="flex items-center gap-1"><MapPin size={14} /> {clinic.name}</span>
        </div>
        <div className="mt-5 flex items-end gap-8">
          <div>
            <div className="text-xs opacity-80 mb-1">Ваша очередь</div>
            <div className="text-5xl font-bold leading-none" style={{ fontFamily: FONT_HEAD }}>
              №{patient.position}<span className="text-2xl opacity-70"> из {clinic.queueNow}</span>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="opacity-80 text-xs">Примерное ожидание</div>
            <div className="text-xl font-semibold" style={{ fontFamily: FONT_HEAD }}>{patient.etaMinutes} мин</div>
          </div>
          <div>
            <div className="opacity-80 text-xs">Ожидаемый приём</div>
            <div className="text-xl font-semibold" style={{ fontFamily: FONT_HEAD }}>{patient.expectedCallTime}</div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs">
          <Radio size={13} className="animate-pulse" /> Статус очереди обновляется автоматически
        </div>
      </div>

      {pct >= 80 && !dismissedWarning && altClinic && (
        <Card style={{ borderColor: C.bad }}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} style={{ color: C.bad }} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: C.ink }}>Выбранный центр сейчас перегружен</div>
              <div className="text-sm mt-1" style={{ color: C.sub }}>
                Ожидание в «{clinic.name}»: ~{clinic.avgWait} мин. Рядом есть менее загруженный центр «{altClinic.name}» — ожидание ~{altClinic.avgWait} мин.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => onSwitchClinic(altClinic.id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                  style={{ background: C.primary }}
                >
                  Перейти в менее загруженный центр
                </button>
                <button
                  onClick={() => setDismissedWarning(true)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium"
                  style={{ background: C.canvas, color: C.ink, border: `1px solid ${C.border}` }}
                >
                  Остаться в текущем центре
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold" style={{ color: C.ink }}>Прогноз очереди</div>
            <TrendingUp size={16} style={{ color: C.primary }} />
          </div>
          <p className="mt-1 text-xs" style={{ color: C.sub }}>Через 30 мин ожидается {computeForecast(clinic)[2].patients} человек в очереди</p>
          <button onClick={onGoForecast} className="mt-3 flex items-center gap-1 text-xs font-medium" style={{ color: C.primary }}>
            Подробный прогноз <ChevronRight size={14} />
          </button>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold" style={{ color: C.ink }}>Карта центров</div>
            <MapPin size={16} style={{ color: C.primary }} />
          </div>
          <p className="mt-1 text-xs" style={{ color: C.sub }}>Сравните загруженность всех центров Актау в реальном времени</p>
          <button onClick={onGoMap} className="mt-3 flex items-center gap-1 text-xs font-medium" style={{ color: C.primary }}>
            Открыть карту <ChevronRight size={14} />
          </button>
        </Card>
      </div>
    </div>
  );
}

function PatientQueue({ patient, clinic, onTick }) {
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Моя очередь" title={`${clinic.name}`} />
      <Card>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Metric label="Ваш номер" value={`№${patient.position}`} />
          <Metric label="Всего в очереди" value={`${clinic.queueNow} чел.`} />
          <Metric label="Ожидание" value={`${patient.etaMinutes} мин`} />
          <Metric label="Приём в" value={patient.expectedCallTime} />
        </div>
        <button
          onClick={onTick}
          className="mt-5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
          style={{ background: C.primaryTint, color: C.primaryDeep }}
        >
          <RefreshCw size={15} /> Обновить статус очереди
        </button>
      </Card>
      <Card>
        <div className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Приоритет</div>
        <StatusPill status={patient.priority === "high" ? "bad" : patient.priority === "elevated" ? "warn" : "good"}>
          {patient.priority === "high" ? "Высокий приоритет" : patient.priority === "elevated" ? "Повышенный риск" : "Обычный"}
        </StatusPill>
        <p className="mt-2 text-xs" style={{ color: C.sub }}>
          Приоритет устанавливается медицинским работником по протоколу — SmartQ только отображает его.
        </p>
      </Card>
    </div>
  );
}

function PatientMap({ clinics, selectedId, onSelect }) {
  const [openId, setOpenId] = useState(null);
  const open = clinics.find((c) => c.id === openId);
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Карта" title="Медицинские центры Актау" />
      <MapView
        clinics={clinics}
        selectedId={selectedId}
        onSelect={(id) => setOpenId(id)}
      />
      <div className="flex flex-wrap gap-3 text-xs" style={{ color: C.sub }}>
        {["good", "warn", "bad"].map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_DOT[s] }} /> {STATUS_LABEL[s]}
          </span>
        ))}
      </div>
      {open ? (
        <ClinicCard clinic={open} onSelect={(id) => onSelect(id)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clinics.map((c) => (
            <button key={c.id} onClick={() => setOpenId(c.id)} className="text-left">
              <ClinicCard clinic={c} compact />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PatientForecast({ clinic }) {
  const data = computeForecast(clinic);
  const schedule = computeSchedule(clinic);
  const best = schedule.reduce((a, b) => (b.wait < a.wait ? b : a), schedule[0]);
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Прогноз" title={`Прогноз очереди — ${clinic.name}`} />
      <Card>
        <div className="grid grid-cols-3 gap-3 text-center mb-4">
          <div>
            <div className="text-xs" style={{ color: C.sub }}>Сейчас</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: FONT_HEAD, color: C.ink }}>{data[0].patients}</div>
          </div>
          <div>
            <div className="text-xs" style={{ color: C.sub }}>Через 30 мин</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: FONT_HEAD, color: C.ink }}>{data[2].patients}</div>
          </div>
          <div>
            <div className="text-xs" style={{ color: C.sub }}>Через 1 час</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: FONT_HEAD, color: C.ink }}>{data[4].patients}</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.primary} stopOpacity={0.35} />
                <stop offset="100%" stopColor={C.primary} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
            <Area type="monotone" dataKey="patients" name="Человек в очереди" stroke={C.primary} strokeWidth={2} fill="url(#fc)" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="mt-2 text-[11px]" style={{ color: C.sub }}>
          Это прогнозная статистическая модель на демонстрационных данных, а не гарантированное время ожидания.
        </p>
      </Card>

      <Card>
        <div className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Удобное время посещения</div>
        <div className="space-y-2">
          {schedule.map((s) => (
            <div key={s.time} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: C.canvas }}>
              <span className="text-sm font-medium" style={{ color: C.ink }}>{s.time}</span>
              <StatusPill status={s.status}>{STATUS_LABEL[s.status]}</StatusPill>
              <span className="text-xs" style={{ color: C.sub }}>~{s.wait} мин</span>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: C.primaryTint, color: C.primaryDeep }}>
          Рекомендуем посетить центр в <b>{best.time}</b>. Прогнозируемое время ожидания — {best.wait} мин.
        </div>
      </Card>
    </div>
  );
}

function PatientNotifications({ notifications }) {
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Уведомления" title="Все уведомления" />
      <div className="space-y-3">
        {notifications.length === 0 && (
          <Card><p className="text-sm" style={{ color: C.sub }}>Пока нет новых уведомлений.</p></Card>
        )}
        {notifications.map((n) => (
          <Card key={n.id} className="flex items-start gap-3">
            <span className="mt-0.5 rounded-full p-2" style={{ background: STATUS_BG[n.status || "good"] }}>
              <Bell size={14} style={{ color: STATUS_DOT[n.status || "good"] }} />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold" style={{ color: C.ink }}>{n.title}</div>
                <span className="text-[11px]" style={{ color: C.sub }}>{n.time}</span>
              </div>
              <div className="text-sm mt-0.5" style={{ color: C.sub }}>{n.message}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PatientProfile({ patient, clinic, onOpenDemo }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Профиль" title="Данные пациента" />
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white" style={{ background: C.primary, fontFamily: FONT_HEAD }}>
            {patient.name.split(" ").map((w) => w[0]).join("")}
          </div>
          <div>
            <div className="font-semibold" style={{ color: C.ink }}>{patient.name}</div>
            <div className="text-xs" style={{ color: C.sub }}>ИИН скрыт · Пациент №{patient.position + 100}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Metric label="Медцентр" value={clinic.name} />
          <Metric label="Приоритет" value={patient.priority === "high" ? "Высокий" : patient.priority === "elevated" ? "Повышенный" : "Обычный"} />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: C.ink }}>
          <QrCode size={16} style={{ color: C.primary }} /> Демонстрационный сценарий
        </div>
        <p className="mt-1 text-xs" style={{ color: C.sub }}>Пройдите путь пациента от сканирования QR-кода до рекомендации по перераспределению.</p>
        <button onClick={onOpenDemo} className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white" style={{ background: C.primary }}>
          <Play size={14} /> Запустить сценарий
        </button>
      </Card>

      <Card>
        <button onClick={() => setShowInfo((v) => !v)} className="flex w-full items-center justify-between text-sm font-semibold" style={{ color: C.ink }}>
          <span className="flex items-center gap-2"><Info size={16} style={{ color: C.primary }} /> О прототипе SmartQ</span>
          <ChevronRight size={16} className={`transition-transform ${showInfo ? "rotate-90" : ""}`} />
        </button>
        {showInfo && (
          <div className="mt-3 space-y-3 text-xs" style={{ color: C.sub }}>
            <div>
              <div className="font-semibold mb-1" style={{ color: C.ink }}>Демонстрационные данные</div>
              Имена, очереди, загруженность центров, прогнозы и приоритеты — сгенерированы для показа прототипа.
            </div>
            <div>
              <div className="font-semibold mb-1" style={{ color: C.ink }}>Можно подключить к реальной системе</div>
              Сканер QR-кодов, очередь из МИС поликлиник, геоданные карты, push-уведомления, статистическая модель → ML-прогноз, приоритеты из медицинского протокола.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================================================
   STAFF (CLINIC) PAGES
============================================================ */
function StaffDashboard({ clinic }) {
  const pct = loadPct(clinic);
  const status = statusOf(pct);
  const hourly = [9, 10, 11, 12, 13, 14, 15, 16, 17].map((h) => ({
    hour: `${h}:00`,
    patients: Math.round(20 + 25 * Math.sin(((h - 9) / 8) * Math.PI) + (h === 12 ? -6 : 0)),
  }));
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Dashboard" title={clinic.name} action={<StatusPill status={status}>{STATUS_LABEL[status]}</StatusPill>} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card><Metric label="Пациентов сегодня" value="1 250" /></Card>
        <Card><Metric label="Сейчас в очереди" value={`${clinic.queueNow}`} /></Card>
        <Card><Metric label="Среднее ожидание" value={`${clinic.avgWait} мин`} /></Card>
        <Card><Metric label="Кабинеты" value={`${clinic.cabinets}/${clinic.cabinetsTotal}`} /></Card>
      </div>
      <Card>
        <div className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Пациенты по часам</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourly}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
            <Bar dataKey="patients" name="Пациенты" fill={C.primary} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function StaffQueues({ clinic, onTickDown }) {
  const forecast = computeForecast(clinic);
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Очереди" title="Управление живой очередью" />
      <Card>
        <div className="flex items-center justify-between">
          <Metric label="В очереди сейчас" value={`${clinic.queueNow} чел.`} />
          <button onClick={onTickDown} className="rounded-lg px-3 py-2 text-sm font-medium text-white" style={{ background: C.primary }}>
            Вызвать следующего
          </button>
        </div>
      </Card>
      <Card>
        <div className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Прогноз изменения очереди</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
            <Line type="monotone" dataKey="patients" stroke={C.blue} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function StaffCenters({ clinics, focusId }) {
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Центры" title="Все центры сети" />
      <MapView clinics={clinics} selectedId={focusId} onSelect={() => {}} />
      <div className="grid gap-4 sm:grid-cols-2">
        {clinics.map((c) => (
          <ClinicCard key={c.id} clinic={c} compact />
        ))}
      </div>
    </div>
  );
}

const PRIORITY_LABEL = { high: "Высокий приоритет", elevated: "Повышенный риск", normal: "Обычный" };
const PRIORITY_STATUS = { high: "bad", elevated: "warn", normal: "good" };

function StaffPatients() {
  const [filter, setFilter] = useState("all");
  const list = PRIORITY_PATIENTS.filter((p) => filter === "all" || p.priority === filter);
  return (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="Пациенты"
        title="Приоритизация пациентов"
        action={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border px-2 py-1.5 text-xs"
            style={{ borderColor: C.border, color: C.ink }}
          >
            <option value="all">Все</option>
            <option value="high">Высокий приоритет</option>
            <option value="elevated">Повышенный риск</option>
            <option value="normal">Обычный</option>
          </select>
        }
      />
      <div className="space-y-3">
        {list.map((p) => (
          <Card key={p.id} className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold" style={{ color: C.ink }}>Пациент №{p.id}</div>
              <div className="text-xs mt-0.5" style={{ color: C.sub }}>{p.note}</div>
              <div className="text-[11px] mt-1" style={{ color: C.sub }}>Обратился в {p.arrived} · рекомендуемое ожидание: {p.waitTarget}</div>
            </div>
            <StatusPill status={PRIORITY_STATUS[p.priority]}>{PRIORITY_LABEL[p.priority]}</StatusPill>
          </Card>
        ))}
      </div>
      <p className="text-[11px]" style={{ color: C.sub }}>
        Приоритет устанавливается медицинским работником или протоколом. SmartQ не ставит диагноз и только отображает уровень.
      </p>
    </div>
  );
}

function StaffAnalytics({ clinic }) {
  const priorityData = [
    { name: "Обычный", value: 3, color: C.good },
    { name: "Повышенный", value: 2, color: C.warn },
    { name: "Высокий", value: 2, color: C.bad },
  ];
  const cabinetData = [
    { name: "Каб. 1", load: 82 }, { name: "Каб. 2", load: 64 },
    { name: "Каб. 3", load: 91 }, { name: "Каб. 4", load: 47 },
  ];
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Аналитика" title={clinic.name} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Загрузка кабинетов</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cabinetData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} width={55} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Bar dataKey="load" fill={C.primary} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="text-sm font-semibold mb-3" style={{ color: C.ink }}>Пациенты по приоритетам</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {priorityData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   CITY ADMIN PAGES
============================================================ */
function CityMonitoring({ clinics }) {
  const counts = { good: 0, warn: 0, bad: 0 };
  clinics.forEach((c) => counts[statusOf(loadPct(c))]++);
  const overloaded = [...clinics].sort((a, b) => loadPct(b) - loadPct(a))[0];
  const free = [...clinics].sort((a, b) => loadPct(a) - loadPct(b))[0];
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Мониторинг" title="Медицинские центры Актау" />
      <MapView clinics={clinics} onSelect={() => {}} highlightId={overloaded.id} />
      <div className="grid grid-cols-3 gap-3">
        <Card style={{ background: C.goodTint, border: "none" }}>
          <div className="text-xl font-semibold" style={{ color: C.good, fontFamily: FONT_HEAD }}>{counts.good}</div>
          <div className="text-xs" style={{ color: C.sub }}>центра — низкая загрузка</div>
        </Card>
        <Card style={{ background: C.warnTint, border: "none" }}>
          <div className="text-xl font-semibold" style={{ color: C.warn, fontFamily: FONT_HEAD }}>{counts.warn}</div>
          <div className="text-xs" style={{ color: C.sub }}>центров — средняя</div>
        </Card>
        <Card style={{ background: C.badTint, border: "none" }}>
          <div className="text-xl font-semibold" style={{ color: C.bad, fontFamily: FONT_HEAD }}>{counts.bad}</div>
          <div className="text-xs" style={{ color: C.sub }}>перегружены</div>
        </Card>
      </div>
      <Card>
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: C.ink }}>
          <Sparkles size={16} style={{ color: C.primary }} /> Рекомендация системы
        </div>
        <p className="mt-2 text-sm" style={{ color: C.sub }}>
          «{overloaded.name}» перегружена на {loadPct(overloaded)}%. «{free.name}» загружена на {loadPct(free)}%.
          Рекомендуется перенаправить часть пациентов в «{free.name}».
        </p>
      </Card>
    </div>
  );
}

function CityCenters({ clinics }) {
  const sorted = [...clinics].sort((a, b) => loadPct(b) - loadPct(a));
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Центры" title="Все центры — таблица загрузки" />
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.canvas }}>
              {["Центр", "Район", "Очередь", "Загрузка", "Кабинеты", "Статус"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: C.sub }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const pct = loadPct(c);
              const status = statusOf(pct);
              return (
                <tr key={c.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: C.ink }}>{c.name}</td>
                  <td className="px-4 py-2.5" style={{ color: C.sub }}>{c.district}</td>
                  <td className="px-4 py-2.5" style={{ color: C.sub }}>{c.queueNow}</td>
                  <td className="px-4 py-2.5" style={{ color: C.sub }}>{pct}%</td>
                  <td className="px-4 py-2.5" style={{ color: C.sub }}>{c.cabinets}/{c.cabinetsTotal}</td>
                  <td className="px-4 py-2.5"><StatusPill status={status}>{STATUS_LABEL[status]}</StatusPill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function CityRecommendations({ clinics }) {
  const sorted = [...clinics].sort((a, b) => loadPct(b) - loadPct(a));
  const overloaded = sorted.filter((c) => loadPct(c) >= 80);
  const free = [...clinics].sort((a, b) => loadPct(a) - loadPct(b)).slice(0, 2);
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Рекомендации" title="Перераспределение пациентов" />
      {overloaded.length === 0 && (
        <Card><p className="text-sm" style={{ color: C.sub }}>Перегруженных центров сейчас нет — перераспределение не требуется.</p></Card>
      )}
      {overloaded.map((c) => {
        const target = free.find((f) => f.id !== c.id) || free[0];
        return (
          <Card key={c.id}>
            <div className="flex items-start gap-3">
              <ShieldAlert size={20} style={{ color: C.bad }} className="mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold" style={{ color: C.ink }}>{c.name} перегружена на {loadPct(c)}%</div>
                <div className="text-sm mt-1" style={{ color: C.sub }}>
                  «{target.name}» загружена на {loadPct(target)}% — рекомендуется перенаправить часть пациентов туда.
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ============================================================
   DEMO MODAL
============================================================ */
function DemoModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!open) { setStep(0); setPlaying(false); }
  }, [open]);
  useEffect(() => {
    if (!playing) return;
    if (step >= DEMO_STEPS.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 2600);
    return () => clearTimeout(t);
  }, [playing, step]);
  if (!open) return null;
  const s = DEMO_STEPS[step];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-white p-6 md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: C.primary }}>Демонстрационный сценарий · шаг {step + 1} из {DEMO_STEPS.length}</span>
          <button onClick={onClose}><X size={18} style={{ color: C.sub }} /></button>
        </div>
        <h3 className="mt-2 text-xl font-semibold" style={{ color: C.ink, fontFamily: FONT_HEAD }}>{s.title}</h3>
        <p className="mt-2 text-sm" style={{ color: C.sub }}>{s.text}</p>
        <div className="mt-4 flex gap-1">
          {DEMO_STEPS.map((_, i) => (
            <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= step ? C.primary : C.border }} />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setStep((v) => Math.max(0, v - 1))}
              disabled={step === 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg disabled:opacity-30"
              style={{ border: `1px solid ${C.border}` }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
              style={{ background: C.primary }}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>
          </div>
          <button
            onClick={() => (step >= DEMO_STEPS.length - 1 ? onClose() : setStep((v) => v + 1))}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ background: C.primaryDeep }}
          >
            {step >= DEMO_STEPS.length - 1 ? "Готово" : "Далее"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   NAV CONFIG
============================================================ */
const PATIENT_NAV = [
  { key: "home", label: "Главная", icon: Home },
  { key: "queue", label: "Очередь", icon: ListChecks },
  { key: "map", label: "Карта", icon: MapPin },
  { key: "forecast", label: "Прогноз", icon: TrendingUp },
  { key: "notifications", label: "Уведомления", icon: Bell },
  { key: "profile", label: "Профиль", icon: User },
];
const STAFF_NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "queues", label: "Очереди", icon: ListChecks },
  { key: "centers", label: "Центры", icon: Building2 },
  { key: "patients", label: "Пациенты", icon: Users },
  { key: "analytics", label: "Аналитика", icon: BarChart3 },
];
const CITY_NAV = [
  { key: "monitoring", label: "Мониторинг", icon: Globe2 },
  { key: "centers", label: "Центры", icon: Building2 },
  { key: "recommendations", label: "Рекомендации", icon: Sparkles },
];

const ROLES = [
  { key: "patient", label: "Пациент", icon: User },
  { key: "staff", label: "Мед. центр", icon: Stethoscope },
  { key: "city", label: "Город", icon: Globe2 },
];

/* ============================================================
   APP
============================================================ */
export default function App() {
  const [role, setRole] = useState("patient");
  const [patientPage, setPatientPage] = useState("home");
  const [staffPage, setStaffPage] = useState("dashboard");
  const [cityPage, setCityPage] = useState("monitoring");

  const [clinics, setClinics] = useState(CLINICS);
  const [selectedClinicId, setSelectedClinicId] = useState(2); // start on an overloaded clinic to show recommendation flow
  const clinic = clinics.find((c) => c.id === selectedClinicId);

  const [patient, setPatient] = useState({ name: "Айгерим Сатпаева", position: 8, priority: "elevated" });
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Запись подтверждена", message: "Ваша запись в " + CLINICS[1].name + " подтверждена на сегодня.", time: "08:30", status: "good" },
  ]);
  const [demoOpen, setDemoOpen] = useState(false);

  const etaMinutes = useMemo(() => Math.max(2, Math.round(patient.position * (60 / clinic.cabinets / 4.6))), [patient.position, clinic]);
  const expectedCallTime = useMemo(() => minutesToClock(etaMinutes), [etaMinutes]);

  const pushNotification = useCallback((n) => {
    setNotifications((list) => [{ id: Date.now(), time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), ...n }, ...list]);
    setToast(n);
  }, []);

  // simulated live queue movement for the patient role
  useEffect(() => {
    if (role !== "patient") return;
    const interval = setInterval(() => {
      setPatient((p) => {
        if (p.position <= 1) return p;
        const next = p.position - 1;
        if (next === 3) {
          pushNotification({ title: "Ваша очередь приближается", message: "Пожалуйста, подойдите к кабинету через 10 минут.", status: "warn" });
        }
        if (next === 1) {
          pushNotification({ title: "Ваша очередь", message: "Пожалуйста, подойдите к кабинету сейчас.", status: "bad" });
        }
        return { ...p, position: next };
      });
      setClinics((cs) => cs.map((c) => (c.id === selectedClinicId ? { ...c, queueNow: Math.max(c.queueNow - 1, patient.position) } : c)));
    }, 8000);
    return () => clearInterval(interval);
  }, [role, selectedClinicId, pushNotification, patient.position]);

  const manualTick = () => {
    setPatient((p) => ({ ...p, position: Math.max(1, p.position - 1) }));
    setClinics((cs) => cs.map((c) => (c.id === selectedClinicId ? { ...c, queueNow: Math.max(1, c.queueNow - 1) } : c)));
  };

  const switchClinic = (id) => {
    setSelectedClinicId(id);
    const target = clinics.find((c) => c.id === id);
    setPatient((p) => ({ ...p, position: Math.min(p.position, Math.max(1, Math.round(target.queueNow / 2))) }));
    pushNotification({ title: "Центр изменён", message: `Вы перешли в ${target.name}.`, status: "good" });
  };

  const staffClinic = clinics.find((c) => c.id === 3); // a staff-side example clinic

  const nav = role === "patient" ? PATIENT_NAV : role === "staff" ? STAFF_NAV : CITY_NAV;
  const activePage = role === "patient" ? patientPage : role === "staff" ? staffPage : cityPage;
  const setActivePage = role === "patient" ? setPatientPage : role === "staff" ? setStaffPage : setCityPage;

  return (
    <div className="min-h-screen w-full" style={{ background: C.canvas, fontFamily: FONT_BODY, color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="mx-auto flex max-w-6xl">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-white p-5 md:flex" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: C.primary }}>
              <Stethoscope size={18} />
            </div>
            <div>
              <div className="font-semibold leading-tight" style={{ fontFamily: FONT_HEAD }}>SmartQ</div>
              <div className="text-[10px]" style={{ color: C.sub }}>умные медицинские очереди</div>
            </div>
          </div>

          <div className="mt-6 flex rounded-xl p-1" style={{ background: C.canvas }}>
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className="flex-1 rounded-lg py-1.5 text-[11px] font-medium transition"
                style={role === r.key ? { background: "white", color: C.primaryDeep, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" } : { color: C.sub }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <nav className="mt-6 flex-1 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActivePage(item.key)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition"
                  style={active ? { background: C.primaryTint, color: C.primaryDeep, fontWeight: 600 } : { color: C.sub }}
                >
                  <Icon size={16} /> {item.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => setDemoOpen(true)}
            className="mt-4 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium"
            style={{ background: C.primaryDeep, color: "white" }}
          >
            <Play size={13} /> Демо-сценарий
          </button>
        </aside>

        {/* Main */}
        <main className="min-h-screen flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10 md:pt-8">
          {/* Mobile header */}
          <div className="mb-5 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: C.primary }}>
                <Stethoscope size={15} />
              </div>
              <span className="font-semibold" style={{ fontFamily: FONT_HEAD }}>SmartQ</span>
            </div>
            <div className="flex gap-1.5">
              {ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.key}
                    onClick={() => setRole(r.key)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={role === r.key ? { background: C.primary, color: "white" } : { background: "white", color: C.sub, border: `1px solid ${C.border}` }}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          {role === "patient" && (
            <>
              {patientPage === "home" && (
                <PatientHome
                  patient={{ ...patient, etaMinutes, expectedCallTime }}
                  clinic={clinic}
                  allClinics={clinics}
                  onSwitchClinic={switchClinic}
                  onGoMap={() => setPatientPage("map")}
                  onGoForecast={() => setPatientPage("forecast")}
                />
              )}
              {patientPage === "queue" && (
                <PatientQueue patient={{ ...patient, etaMinutes, expectedCallTime }} clinic={clinic} onTick={manualTick} />
              )}
              {patientPage === "map" && (
                <PatientMap clinics={clinics} selectedId={selectedClinicId} onSelect={switchClinic} />
              )}
              {patientPage === "forecast" && <PatientForecast clinic={clinic} />}
              {patientPage === "notifications" && <PatientNotifications notifications={notifications} />}
              {patientPage === "profile" && (
                <PatientProfile patient={{ ...patient, etaMinutes, expectedCallTime }} clinic={clinic} onOpenDemo={() => setDemoOpen(true)} />
              )}
            </>
          )}

          {role === "staff" && (
            <>
              {staffPage === "dashboard" && <StaffDashboard clinic={staffClinic} />}
              {staffPage === "queues" && (
                <StaffQueues
                  clinic={staffClinic}
                  onTickDown={() =>
                    setClinics((cs) => cs.map((c) => (c.id === staffClinic.id ? { ...c, queueNow: Math.max(0, c.queueNow - 1) } : c)))
                  }
                />
              )}
              {staffPage === "centers" && <StaffCenters clinics={clinics} focusId={staffClinic.id} />}
              {staffPage === "patients" && <StaffPatients />}
              {staffPage === "analytics" && <StaffAnalytics clinic={staffClinic} />}
            </>
          )}

          {role === "city" && (
            <>
              {cityPage === "monitoring" && <CityMonitoring clinics={clinics} />}
              {cityPage === "centers" && <CityCenters clinics={clinics} />}
              {cityPage === "recommendations" && <CityRecommendations clinics={clinics} />}
            </>
          )}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t bg-white py-2 md:hidden" style={{ borderColor: C.border }}>
        {nav.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.key;
          return (
            <button key={item.key} onClick={() => setActivePage(item.key)} className="flex flex-col items-center gap-0.5 px-2 py-1">
              <Icon size={18} color={active ? C.primary : C.sub} />
              <span className="text-[10px]" style={{ color: active ? C.primary : C.sub, fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <Toast toast={toast} onClose={() => setToast(null)} />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
