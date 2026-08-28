docker-compose-api-run := "docker compose run"

start:
    {{docker-compose-api-run}} --rm --service-ports emulator bun --watch src/main.ts

bun *args:
    {{docker-compose-api-run}} --rm emulator bun {{args}}

logs:
    docker logs $(docker ps -aqf "name=cube-emulator-node-emulator-.*") -f

bunx *args:
    {{docker-compose-api-run}} --rm emulator bunx {{args}}

typecheck:
    {{docker-compose-api-run}} --rm emulator bunx tsc --noEmit

database-migrate-up:
    {{docker-compose-api-run}} --rm emulator bunx mikro-orm migration:up