FROM node:18-alpine

WORKDIR /

# Устанавливаем PostgreSQL клиент для инициализации
RUN apk add --no-cache postgresql-client

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Создаём директории для загрузок
RUN mkdir -p public/uploads/avatars public/uploads/cars

# Создаём скрипт инициализации
COPY scripts/init-admin.js /app/scripts/

EXPOSE 3000

# Запускаем приложение с инициализацией
CMD ["sh", "-c", "node scripts/init-admin.js && node server.js"]