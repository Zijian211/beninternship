# 1. Use Node.js 20 (Required for Next.js 15+)
FROM node:20-alpine

# 2. Set the working directory inside the server
WORKDIR /app

# 3. Copy package files first (better for caching)
COPY package*.json ./
RUN npm install

# 4. Copy the rest of your code
COPY . .

# 5. Build the Next.js app for production
RUN npm run build

# 6. Open port 3000
EXPOSE 3000

# 7. Start the app
CMD ["npm", "start"]