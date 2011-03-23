
Git repo
========

Создадим корень проектов:

	sudo mkdir /www
	sudo chown www:www /www

Создадим пустой репозиторий на сервере:

	mkdir -p /www/project
	cd /www/project
	git init

Подтюним:

	git config receive.denyCurrentBranch ignore
	git config core.packedGitLimit 16m

Если это просто хранилище, то:

	git config core.bare true

Настроим автоматический чекаут по обновлении:

	echo '#!/bin/sh
	GIT_DIR=$(pwd)
	cd ..
	git checkout -f' > .git/hooks/post-receive
	chmod +x .git/hooks/post-receive

Переходим на локальную машину и заливаем `master` на сервер:

	git remote add server ssh://www@server/www/project
	git push server master:master
	#>>> * [new branch]      master -> master

