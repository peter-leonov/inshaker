
Система
=======

APT
---

В репозиториях `/etc/apt/sources.list` меняем сервер на `ru.archive.ubuntu.com`.
Результат выглядит примерно так:

	deb http://ru.archive.ubuntu.com/ubuntu/ lucid main universe multiverse
	deb http://ru.archive.ubuntu.com/ubuntu/ lucid-security main universe multiverse

Обновляем систему:

	apt-get update && apt-get upgrade

на вопросы отвечаем `y` то есть “install the package maintainer's version”.

Перезагружаемся:

	reboot

Пользователи
------------

Кладем свои ключи в `/root/.ssh/authorized_keys`:

	mkdir -p /root/.ssh/
	touch /root/.ssh/authorized_keys

Создаем пользователя, под которым будем работать дальше:

	useradd www -m -d /home/www -s /bin/bash

На тестовой машине позволим ему все:

	echo 'www ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

Далее работаем под пользователем `www`:

	su www
	cd

Протестим могущество:

	sudo id

Кладем свои ключи в `/home/www/.ssh/authorized_keys`:

	mkdir -p /home/www/.ssh/
	touch /home/www/.ssh/authorized_keys


Софт
====

Ставим среду разработки и курл (как же без него):

	sudo apt-get install build-essential curl


Энджин Икс
----------


Нужности (регулярки и MD5):

	sudo apt-get install libpcre3-dev libssl-dev


И сам nginx:

	curl -O http://nginx.org/download/nginx-0.8.54.tar.gz
	tar xzf nginx-0.8.54.tar.gz
	cd nginx-0.8.54
	./configure && make && sudo make install
	sudo ln -s /usr/local/nginx/sbin/nginx /usr/local/sbin/nginx

и сразу дебажную версию:

	make clean && ./configure --with-debug && make
	sudo cp ./objs/nginx /usr/local/nginx/sbin/nginx-debug
	sudo ln -s /usr/local/nginx/sbin/nginx-debug /usr/local/sbin/nginx-debug

Тестим:

	nginx -V
	sudo nginx
	curl http://localhost/
	sudo nginx -s quit

Чтобы не ругался при запуске не от рута:

	sudo chmod a+w /usr/local/nginx/logs/error.log
	sudo chmod a+w /usr/local/nginx/logs/access.log
