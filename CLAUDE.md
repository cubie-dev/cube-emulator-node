# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run in development (direct)
npm run dev        # tsx src/main.ts
npm run watch      # tsx watch src/main.ts (file watching)

# Run via Docker (preferred — includes PostgreSQL)
just start         # docker compose run with file watching
just npm <args>    # run any npm command inside container
just logs          # tail logs from running container
```

The project uses `just` as a task runner. Docker Compose brings up both the emulator and a PostgreSQL 18 container. The emulator binds to port 3333.

## Configuration

Runtime config lives in `src/config.json`. The file is read at startup by `core/config/Repository.ts` using lodash `get()` for nested key access. There is no `.env` file — all config (database credentials, host, port, debug flag) goes in `config.json`. The `database.host` defaults to `"db"` (the Docker Compose service name).

## Architecture

This is a Habbo Hotel emulator (game server) built on WebSockets with a custom binary protocol.

### Dependency Injection

Inversify IoC container is central to the architecture. The `Emulator` class (created in `main.ts`) instantiates the container with `autobind: true`. All services are resolved through the container via `@inject()` decorators. The `api/` directory holds interfaces and tokens; `core/` holds implementations.

Pattern: every injectable service has a corresponding interface + symbol token in `src/api/`, e.g.:
- `src/api/core/communication/SocketServer.ts` → `ISocketServer` + `SOCKET_SERVER_TOKEN`
- `src/core/communication/SocketServer.ts` → concrete implementation

### Bootstrap Sequence

`EmulatorBootstrapper` runs bootstrappers in order:
1. `LoggingBootstrapper` — Winston logger
2. `ConfigBootstrapper` — loads `config.json`
3. `NetworkBootstrapper` — registers socket server, codec, message handler, event handlers
4. `DatabaseBootstrapper` — initializes MikroORM + PostgreSQL

Each `Bootstrapper` can implement `registerBindings()` (IoC setup), `boot()` (startup logic), `stop()` (shutdown), and `bootstraps()` (returns dependent bootstrappers to chain).

### Message Handling Pipeline

Incoming WebSocket binary frames flow:
1. `SocketServer` receives raw `Buffer`, passes to `SocketMessageHandler`
2. `Codec.decode()` reads 4-byte length prefix + 2-byte header → `Event`
3. `Pipeline` runs `EventContext` through pipes: `EventLoggerPipe` → `FlushPipe`
4. `EventHandlerRegistry.getByHeader()` resolves the handler class for the message header
5. Handler is resolved from the IoC container and `.handle(eventContext)` called
6. `Codec.encode()` serializes the `Response` (2-byte header + typed data fields) with length prefix
7. Response buffer sent back to client

### Binary Protocol

- `BinaryReader` / `BinaryWriter` in `src/core/communication/messages/` handle the wire format
- `Response` subclasses expose a `data` getter returning an array of primitives; `Codec` type-switches on `typeof` to pick the right write method
- Message headers map event IDs (shorts) to handler classes in `src/core/communication/messages/events/eventHandlerMap.ts`

### Database

MikroORM with PostgreSQL driver. `DatabaseManager.newEntityManager` always returns a **forked** `EntityManager` — one fork per request, injected into `EventContext`. Entities are in `src/core/database/entities/`.

### Game Layer

`src/game/` is the game logic layer (currently early-stage). A `Client` (WebSocket wrapper) gains a `Player` after successful SSO handshake. `Player` wraps the `User` entity.
