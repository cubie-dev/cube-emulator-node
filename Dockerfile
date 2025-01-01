FROM node:22-alpine

WORKDIR /emulator

CMD ["npm", "run", "watch"]
