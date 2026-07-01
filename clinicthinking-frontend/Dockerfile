FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Sediakan dummy values saat build time agar Next.js tidak error
# Runtime values akan di-inject oleh docker-compose.yml environment section
ENV LIVEKIT_API_KEY=build-placeholder
ENV LIVEKIT_API_SECRET=build-placeholder
ENV NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]