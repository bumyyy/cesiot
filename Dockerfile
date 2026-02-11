FROM node:20-alpine

# Dossier de travail
WORKDIR /app

# Dépendances
COPY package*.json ./
RUN npm ci --only=production

# Code source
COPY . .

# Port exposé (documentation, pas ouverture réseau)
EXPOSE 8080

# Lancement
CMD ["node", "app.js"]
