# HexaHub — High-level Architecture

This document is a concise architecture reference for HexaHub (collaborative IDE). It describes components, realtime flow (Socket.IO + Yjs), durable event streaming (Kafka), persistence, security, and a short implementation checklist.

---

## Goals

- Low-latency collaborative editing for multiple users.
- Durable, replayable event stream for audit/history via Kafka.
- Scalable Socket.IO cluster with Redis adapter.
- Integration with existing backend (Node + Express) and frontend (React + Monaco).

---

## Components (one-line descriptions)

- Frontend (React)
  - Monaco Editor + `y-monaco` binding (Yjs CRDT client). Socket.IO client adapter for sync.
  - Auth via existing `src/lib/api.js` and `src/lib/auth.js`.
- Socket.IO cluster (Node)
  - Handles room join/leave, relays Yjs updates, authenticates handshake via JWT.
  - Produces update events to Kafka for durability.
- Redis
  - socket.io-redis adapter (pub/sub / presence / ephemeral state).
- Kafka
  - Durable event stream. Topics: `doc-updates`, `doc-snapshots`, `audit-log`.
- Workers / Consumers
  - Kafka consumers that persist snapshots/operations to MongoDB or S3 and perform analytics / replay.
- Persistence
  - MongoDB for users, projects, metadata, and snapshots (binary Yjs snapshots or compressed state).
  - S3-compatible object store for large snapshot backups (optional).

---

## High-level flow

1. Client opens a file (docId). Frontend loads file metadata via REST (`/api/files/:id`).
2. Client connects to Socket.IO server and authenticates with JWT during handshake.
3. Client joins room `doc:<docId>` and syncs Yjs state:
   - If server keeps in-memory Yjs doc, server sends latest snapshot to client.
   - Otherwise client requests latest snapshot via REST and applies it locally.
4. User edits → Yjs produces a binary update. Client sends update over Socket.IO (event `editor:update`).
5. Socket.IO server broadcasts update to room participants and publishes the update to Kafka (`doc-updates` topic) with metadata (docId, userId, opId, ts).
6. Kafka consumers persist updates/snapshots to MongoDB (and optionally to S3) and emit audit logs.
7. Periodically (or on user save), a snapshot message is produced to `doc-snapshots` and persisted for fast recovery.

---

## Message schemas (recommended)

Socket (binary over Socket.IO)

- Event: `editor:update`
- Payload (binary): Yjs update (Uint8Array)
- Metadata (sent alongside or in an envelope): { docId: string, userId: string, clientTs: ISO }

Kafka `doc-updates` (JSON envelope)

```json
{
  "docId": "<docId>",
  "userId": "<userId>",
  "opId": "<uuid>",
  "updateBase64": "<base64-of-binary>",
  "clientTs": "2025-10-07T...Z",
  "serverTs": "2025-10-07T...Z"
}
```

Kafka `doc-snapshots`

```json
{
  "docId": "<docId>",
  "snapshotBase64": "<base64-of-serialized-yjs-state>",
  "userId": "<userId>",
  "createdAt": "..."
}
```

Audit log (user actions): `{ userId, docId, action, meta, ts }`

---

## CRDT choice and rationale

- Recommended: **Yjs**
  - Compact binary updates, works with Monaco via `y-monaco`, supports offline editing.
  - Server can optionally maintain a Yjs document for each room for faster joins.
- Alternative: Automerge or OT libs — Yjs has better performance and smaller updates for collaborative code editing.

---

## Where to plug pieces in your repo

Frontend (repo path hints):

- `frontend/src/Editor/MonacoEditor.jsx` — add Yjs binding `y-monaco` and wire update application.
- Add `frontend/src/lib/socket.js` — Socket.IO client wrapper (include JWT on handshake: token from `auth.js`).
- Add `frontend/src/lib/yjs-provider.js` — provider that exposes a Yjs doc and awareness to components.
- `frontend/src/pages/CodeIDE.jsx` — instantiate provider per open file and pass to Monaco component.

Backend (repo path hints):

- `backend/src/realtime/socket.js` (new) — attach socket.io to existing HTTP server in `server.js`. Authenticate handshake (decode JWT), handle `join`, `leave`, `editor:update` events, broadcast to room, and produce to Kafka.
- `backend/src/services/kafka/producer.js` (new) — small wrapper using `kafkajs` or `node-rdkafka`.
- `backend/worker/consumer.js` (new) — Kafka consumer to persist `doc-updates` → MongoDB and optionally produce snapshots.
- Reuse existing `backend/src/config/redis.js` for Redis connection and set up `socket.io-redis` adapter.

---

## Deployment / infra notes (short)

- Development: docker-compose with Redis, single-broker Kafka, Zookeeper (or use `kafka:latest` with KRaft), MongoDB.
- Production: Kubernetes
  - Deploy Kafka (3 brokers), Zookeeper or KRaft, Redis (cluster or managed), MongoDB (replica set), S3-compatible storage.
  - Socket.IO service: Deploy multiple replicas behind LB, use `socket.io-redis` adapter.
  - Workers: autoscaled consumer group reading from Kafka.

---

## Security essentials

- WebSocket handshake must authenticate with JWT; reject unauthenticated sockets.
- Validate user permissions when joining a document room (owner/collaborator/readonly).
- Rate limit edit events per user or per room; monitor for abusive patterns.
- Secure Kafka and Redis behind VPC and enforce ACLs.

---

## Implementation checklist (practical, ordered)

Short-term prototype (1–2 days):

1. Add Socket.IO server to `backend` and simple client in `frontend`.
2. Implement auth-on-handshake (JWT check using existing user model/middleware).
3. Implement join/leave and broadcast updates between two browser windows (no Kafka yet). (Est: 0.5–1 day)
4. Add Yjs on client side with Monaco binding; send/receive Yjs updates over Socket.IO. (Est: 0.5–1 day)

Durable pipeline & scaling (next week): 5. Add Kafka producer in Socket handler to publish `doc-updates`. (Est: 0.5 day) 6. Implement Kafka consumer worker to persist snapshots/updates to MongoDB and S3. (Est: 0.5–1 day) 7. Add Redis adapter to Socket.IO; run multiple Socket.IO replicas and test cross-instance sync. (Est: 0.5 day) 8. Add monitoring (Prometheus/Grafana) and alerts for consumer lag and socket metrics. (Est: 1 day)

---

## Dev bootstrap (quick docker-compose suggestion)

Add a small `docker-compose.dev.yml` for local testing with:

- zookeeper (or KRaft mode Kafka), kafka, redis, mongo
- Start backend and frontend containers pointing to these services

Commands (example):

```powershell
# from repo root
cd frontend
npm run dev
# start backend separately
cd ../backend
npm run dev
# or use docker-compose.dev.yml to spin infra
```

---

## Next deliverables I can create for you

- Socket.IO server boilerplate (`backend/src/realtime/socket.js`) + sample handshake auth.
- Frontend Yjs provider + Socket.IO client (`frontend/src/lib/socket.js`, `frontend/src/lib/yjs-provider.js`) and Monaco binding example.
- Kafka producer/consumer snippets using `kafkajs` and a worker to persist snapshots.
- A `docker-compose.dev.yml` to run Redis, single Kafka broker, and MongoDB locally.

Tell me which of the above code artifacts you want first and I will implement it in the repo (I can create files and run quick checks).
