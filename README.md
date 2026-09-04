# learn-ci-cd

A small Express + TypeScript API, built to be the thing a CI/CD pipeline builds,
tests, containerises and deploys. The app is deliberately boring; the pipeline is
the interesting part.

## Endpoints

| Method | Path             | What it does                                              |
| ------ | ---------------- | --------------------------------------------------------- |
| GET    | `/`              | Lists the available endpoints                             |
| GET    | `/health`        | **Liveness** — is the process up? Cheap, no dependencies  |
| GET    | `/health/ready`  | **Readiness** — can it serve traffic? Checks dependencies |
| GET    | `/api/todos`     | List todos                                                |
| GET    | `/api/todos/:id` | Get one todo                                              |
| POST   | `/api/todos`     | Create a todo — body: `{ "title": "..." }`                |
| PATCH  | `/api/todos/:id` | Update — body: `{ "title"?: "...", "done"?: true }`       |
| DELETE | `/api/todos/:id` | Delete a todo                                             |

Todos live in memory and reset on restart — no database to provision.

### Liveness vs readiness

Two probes, two different questions:

```
                 ┌──────────────┐
   /health  ───► │ Is it ALIVE? │ ──► No  ──► restart the container
                 └──────────────┘
                 ┌──────────────┐
/health/ready ─► │ Is it READY? │ ──► No  ──► keep it out of the load balancer
                 └──────────────┘          (DB still connecting, cache warming…)
```

`/health` must never call the database. If a slow database made liveness fail, the
orchestrator would restart a perfectly healthy process — a restart loop.

## Scripts

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Run with hot reload                      |
| `npm run build`        | Compile TypeScript into `dist/`          |
| `npm start`            | Run the compiled build                   |
| `npm run lint`         | ESLint                                   |
| `npm run format:check` | Prettier check (no writes) — CI-friendly |
| `npm run typecheck`    | `tsc --noEmit`                           |
| `npm test`             | Jest + Supertest                         |
| `npm run test:ci`      | Tests with coverage, CI mode             |

## Run it locally

```bash
npm install
npm run dev
curl localhost:3000/health
```

## Docker

```bash
docker build -t learn-ci-cd .
docker run --rm -p 3000:3000 learn-ci-cd
curl localhost:3000/health
```

The Dockerfile is multi-stage: stage one compiles with dev dependencies, stage two
ships only `dist/` plus production dependencies, running as a non-root user. That
keeps the image small and is the shape a real deploy stage expects.

## Where the pipeline plugs in

Every stage of a typical pipeline already has something here to run:

```
push ──► install ──► lint ──► typecheck ──► test ──► build ──► docker build ──► deploy
          npm ci    npm run   npm run     npm run   npm run     Dockerfile      (your
                     lint     typecheck   test:ci    build                      target)
                                                                    │
                                                              smoke test:
                                                          curl /health ──► 200 ?
```

Two build-time variables are wired up already: set `APP_VERSION` and `GIT_COMMIT`
in the pipeline and `/health` will report which build is running — the quickest way
to confirm a deploy actually landed.
