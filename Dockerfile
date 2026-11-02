FROM node:20-alpine

WORKDIR /app

# Chỉ copy file mô tả dependency để tận dụng Docker cache
COPY package*.json ./

# Cài đặt dependency production (bỏ qua playwright-core để giảm 500MB+ dung lượng)
RUN npm ci --omit=dev

# Copy toàn bộ mã nguồn và assets game
COPY . .

# Mở cổng 3000
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]

