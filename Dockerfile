# ใช้ Node image
FROM node:20

# ตั้ง working directory
WORKDIR /app

# copy package ก่อนเพื่อ cache
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# copy ทั้งโปรเจกต์
COPY . .

# build โปรเจกต์
RUN npm run build

# ใช้ serve เปิดเว็บ
RUN npm install -g serve

# เปิดพอร์ต
EXPOSE 3000

# รันเว็บ
CMD ["serve", "-s", "dist", "-l", "3000"]