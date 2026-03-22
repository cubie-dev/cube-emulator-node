FROM oven/bun:alpine

WORKDIR /emulator

CMD ["bun", "--watch", "src/main.ts"]