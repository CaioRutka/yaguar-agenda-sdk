# @yaguar/agenda

SDK **proprietário**, framework-agnostic e isomórfico (zero dependências de runtime) que concentra toda a lógica de negócio de uma agenda pessoal/profissional + tarefas: eventos, tarefas, filtros, visões (dia/semana/mês/kanban), provider de calendário e geração de links Yaguar Meet.

---

## Propriedade intelectual

> **Código proprietário da Yaguar.** Pacote fechado (`UNLICENSED`). Não pode ser
> compartilhado, distribuído, revendido, sublicenciado ou usado em projeto de
> terceiros sem autorização expressa por escrito da Yaguar.

---

## Instalação

O pacote **não está no npm registry**. Use uma das formas abaixo.

### Produção — via tag GitHub (recomendado)

```bash
npm install "github:CaioRutka/yaguar-agenda-sdk#v0.1.0"
```

No `package.json`:

```json
"@yaguar/agenda": "github:CaioRutka/yaguar-agenda-sdk#v0.1.0"
```

### Desenvolvimento — workspace ou file

Dentro de um monorepo:

```json
"@yaguar/agenda": "workspace:*"
```

Ou apontando para a pasta local:

```json
"@yaguar/agenda": "file:../sdk"
```

---

## Subpath exports

```ts
// Backend (Node) — tudo: engine, services, providers, utils, tipos
import { AgendaEngine, DeterministicMeetProvider } from "@yaguar/agenda";

// Frontend — só os tipos do domínio (type-only) + STATUS_ORDER
import type { CalendarEvent, Task, WeekView } from "@yaguar/agenda/shared";
import { STATUS_ORDER } from "@yaguar/agenda/shared";
```

Use `@yaguar/agenda/shared` em consumidores que só precisam dos tipos — evita
carregar qualquer lógica.

---

## Uso

### Criar a engine e adicionar eventos/tarefas

```ts
import { AgendaEngine, DeterministicMeetProvider } from "@yaguar/agenda";

const engine = new AgendaEngine({
  meetProvider: new DeterministicMeetProvider("https://yaguarmeet.famlly.com.br"),
});

// Evento online → ganha meetingLink automaticamente
const event = engine.createEvent({
  title: "Reunião de alinhamento",
  category: "professional",
  startAt: new Date("2024-05-15T09:00:00"),
  endAt: new Date("2024-05-15T10:00:00"),
  online: true,
});
console.log(event.meetingLink); // https://yaguarmeet.famlly.com.br/agenda-<id>

engine.createTask({ title: "Preparar pauta", priority: "high" });
```

### Listar e filtrar

```ts
engine.getEvents();                 // CalendarEvent[]
engine.getFiltered("professional"); // só profissionais
engine.getCounts();                 // { all, personal, professional, tasks }
```

### Construir visões

```ts
import type { WeekView, MonthView, KanbanColumn } from "@yaguar/agenda/shared";

const week = engine.getView("week", new Date()) as WeekView;   // 7 colunas Seg..Dom
const month = engine.getView("month", new Date()) as MonthView; // grade 6x7
const board = engine.getView("kanban", new Date()) as KanbanColumn[]; // por status
```

### Gerar um link de reunião manualmente

```ts
import { DeterministicMeetProvider, MeetingService } from "@yaguar/agenda";

const meeting = new MeetingService(
  new DeterministicMeetProvider("https://yaguarmeet.famlly.com.br"),
);
const withLink = meeting.attachLink(event); // imutável: retorna nova cópia
```

### Sincronizar com um provider de calendário

```ts
import { SyncService, MockGoogleProvider, rangeForView } from "@yaguar/agenda";

const sync = new SyncService(new MockGoogleProvider());
const { events, result } = await sync.sync(
  engine.getEvents(),
  rangeForView("month", new Date()),
  "bidirectional",
);
console.log(result); // { pulled, pushed, conflicts }
```

`MockGoogleProvider` usa eventos sintéticos em memória — troque por uma
implementação real de `CalendarProvider` em produção.

---

## Convites por email

Envia um convite (com anexo `.ics`, `METHOD:REQUEST`) para cada participante de um
evento — agnóstico de provedor. A lógica vive na SDK; o transporte é plugável via
`EmailProvider` (a demo usa Resend; troque por SMTP/SES/etc. sem tocar na lógica).

```ts
import { InvitationService, type EmailProvider } from "@yaguar/agenda";

// Implemente o transporte (ex.: Resend, SMTP). Recebe a mensagem pronta:
const provider: EmailProvider = {
  async sendEmail({ from, to, subject, html, text, attachments }) {
    // ...envie via seu serviço de email...
  },
};

const invites = new InvitationService(provider, {
  from: { email: "meet@seu-dominio.com", name: "Yaguar Meet" },
  timezone: "America/Sao_Paulo", // opcional
});

// Um email por convidado, cada um com o .ics (Aceitar/Recusar no cliente).
const { sent, failed } = await invites.sendInvites(event);
```

`buildEventIcs(event, organizer)` gera o iCalendar puro (RFC 5545) caso você precise
do `.ics` isolado. `sendInvites` é best-effort: a falha de um convidado não
interrompe os demais.

---

## Imutabilidade

Todas as operações são imutáveis: nenhum array/objeto de entrada é mutado.
`getEvents()`/`getTasks()` retornam snapshots; mutações posteriores na engine
não afetam snapshots já capturados.

---

## Régua de qualidade

```bash
pnpm install
pnpm build          # tsup → dist (.js/.cjs/.d.ts para index e shared)
pnpm typecheck
pnpm lint           # tsc --noEmit --strict
pnpm test
pnpm test:coverage  # cobertura de linha >= 80%
```

`package.json#files` inclui apenas `dist/`. Os scripts `prepare`/`prepack`
rodam o build automaticamente ao instalar via Git — não é necessário commitar
`dist/`.
