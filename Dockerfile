FROM nginx:1.11

CMD mkdir -p /app
WORKDIR /app

COPY . .

CMD ["nginx", "-p", ".", "-c", "nginx.production.conf", "-g", "daemon off;"]
