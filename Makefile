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

barman.pull:
	ssh www@barman 'cd /www/inshaker; git pull'

GIT_USER="$(git config user.name) <$(git config user.email)>"
barman.deploy:
	ssh www@barman "cd /www/inshaker; export INSHAKER_USER_AUTHOR='${GIT_USER}'; ./barman/deployer.rb"

mix: barman.pull
	ssh www@barman 'cd /www/inshaker; ./barman/processors/cocktails.rb'
	make barman.deploy