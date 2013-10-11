default:
	@echo "usage: make TASK"

remote:
	ssh inshaker.back

remote.restart:
	ssh inshaker.back 'sudo restart inshaker/nginx'
