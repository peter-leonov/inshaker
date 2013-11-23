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
