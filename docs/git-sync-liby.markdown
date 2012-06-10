
Синхронизируемся с Либи
=======================

Подключим репу и создадим ветку:

	git remote add liby git@github.com:kung-fu-tzu/liby.git
	git fetch liby
	git branch --track liby-master liby/master

Переносим коммиты из Иншейкера в Либу.

	git co liby-master
	git hr
	git pull
	git fetch git
	git format-patch -k --relative=htdocs/liby/ --stdout git/last-liby-master..master -- htdocs/liby/ | git am -3 -k
	git push liby liby-master:master
	git push git master:last-liby-master
	git co master
