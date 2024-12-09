docker-compose-api-run := "docker compose run"

start:
    {{docker-compose-api-run}} --rm --service-ports emulator npm run watch

npm *args:
    {{docker-compose-api-run}} --rm emulator npm {{args}}
