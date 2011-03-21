
Синхронизируемся с Либи
=======================

Подключим репу и создадим ветку ветку:

	git remote add liby ssh://git@toaster/www/liby.git
	git fetch liby
	git branch --track liby-master liby/master

Переносим коммиты из Иншейкера в Либу.

	git co liby-master
	git pull
	git format-patch -k --relative=htdocs/lib-0.3/ --stdout toaster/last-liby-master..master -- htdocs/lib-0.3/ | git am -3 -k
	git push toaster master:last-liby-master
	git co master
