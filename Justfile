docker-compose-api-run := "docker compose run"

start:
    {{docker-compose-api-run}} --rm --service-ports emulator npm run watch

npm *args:
    {{docker-compose-api-run}} --rm emulator npm {{args}}

logs:
    docker logs $(docker ps -aqf "name=cube-emulator-node-emulator-run-.*") -f

npx *args:
    {{docker-compose-api-run}} --rm emulator npx {{args}}
