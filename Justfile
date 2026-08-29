docker-compose-api-run := "docker compose run"

start:
    {{docker-compose-api-run}} --rm --service-ports emulator bun --watch src/main.ts

# Keeps connected clients alive across code changes, unlike `start` which restarts.
hot:
    {{docker-compose-api-run}} --rm --service-ports emulator bun --hot src/main.ts

bun *args:
    {{docker-compose-api-run}} --rm emulator bun {{args}}

logs:
    docker logs $(docker ps -aqf "name=cube-emulator-node-emulator-.*") -f

bunx *args:
    {{docker-compose-api-run}} --rm emulator bunx {{args}}

typecheck:
    {{docker-compose-api-run}} --rm emulator bunx tsc --noEmit

# Writes a new migration from the diff between the entities and the schema
# snapshot in src/migrations. Pass --name Something to name the file, or
# --blank for an empty migration to fill in by hand.
database-migrate *args:
    {{docker-compose-api-run}} --rm emulator bunx mikro-orm migration:create {{args}}

database-migrate-up:
    {{docker-compose-api-run}} --rm emulator bunx mikro-orm migration:up