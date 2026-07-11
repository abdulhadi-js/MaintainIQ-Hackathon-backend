# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

# Add AWS Lambda Web Adapter so NestJS can run natively on Lambda
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

# Lambda web adapter needs to know what port the app is listening on
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
