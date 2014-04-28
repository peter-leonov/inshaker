default:
	@echo "usage: make TASK"

cache.purge:
	rm -r var/cache/*

r:
	ssh inshaker.back

r.update:
	ssh www@inshaker.back 'cd /www/inshaker; git pull'

r.restart:
	ssh inshaker.back 'sudo restart inshaker/nginx'

r.nginx.reload:
	ssh inshaker.back 'sudo reload inshaker/nginx'

r.cache.purge:
	ssh www@inshaker.back 'cd /www/inshaker; rm -r var/cache/*'
r.cache.warmup:
	wget -r --delete-after --accept-regex="ru/products/" http://www.inshaker.ru/shop/ 2>&1 | grep 'HTTP request sent'
r.cache: remote.cache.purge remote.cache.warmup