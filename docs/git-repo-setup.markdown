
Git repo
========

Создадим корень проектов:

	sudo mkdir /www
	sudo chown www:www /www

Создадим пустой репозиторий на сервере:

	mkdir -p /www/project
	cd /www/project
	git init

Разрешим затирать текущую ветку:

	git config receive.denyCurrentBranch ignore

Настроим автоматический чекаут по обновлении:

	echo '#!/bin/sh
	GIT_DIR=$(pwd)
	cd ..
	git checkout -f' > .git/hooks/post-receive
	chmod +x .git/hooks/post-receive
