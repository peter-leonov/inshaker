default:
	@echo "usage: make TASK"

cache.purge:
	rm -r var/cache/*

remote:
	ssh inshaker.back

remote.update:
	ssh www@inshaker.back 'cd /www/inshaker; git pull'

remote.restart:
	ssh inshaker.back 'sudo restart inshaker/nginx'

remote.nginx.reload:
	ssh inshaker.back 'sudo reload inshaker/nginx'

remote.cache.purge:
	ssh www@inshaker.back 'cd /www/inshaker; rm -r var/cache/*'
remote.cache.warmup:
	wget -r --delete-after --accept-regex="ru/products/" http://www.inshaker.ru/shop/ 2>&1 | grep 'HTTP request sent'
