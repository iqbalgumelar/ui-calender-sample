# Stage 1: Build
FROM node:22-buster AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production Image
FROM node:22-buster

WORKDIR /app

COPY --from=builder /app ./

# Set environment variables (overridden by ECS task definition)
ENV API_CALENDAR_URL=https://uat-mysiloam-api-01.siloamhospitals.com/next-appointment

# Start the application
CMD ["npm", "run", "start"]
