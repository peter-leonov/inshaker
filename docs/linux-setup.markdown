
Система
=======

Первым делом ключи в `/root/.ssh/authorized_keys`.

Репозитории `/etc/apt/sources.list`:

	deb http://ru.archive.ubuntu.com/ubuntu lucid main restricted universe
	deb http://ru.archive.ubuntu.com/ubuntu lucid-updates main restricted universe
	deb http://ru.archive.ubuntu.com/ubuntu lucid-security main restricted universe


Обновляем систему:

	apt-get update
	apt-get upgrade

на вопросы отвечаем `y` то есть “install the package maintainer's version”.

Создаем пользователя, под которым будем работать дальше:

	useradd www -m -d /home/www -s /bin/bash

На тестовой машине позволим ему все:

	echo 'www ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

Далее работаем под пользователем `www`:

	su www
