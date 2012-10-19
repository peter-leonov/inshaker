
Система
=======


APT
---

Меняем пароль рута.

	passwd

В репозиториях `/etc/apt/sources.list` меняем сервер на `*.ru.*`.
Результат выглядит примерно так:

	deb http://ru.archive.ubuntu.com/ubuntu/ lucid main universe multiverse
	deb http://ru.archive.ubuntu.com/ubuntu/ lucid-security main universe multiverse

Или так:

	deb http://ftp.ru.debian.org/debian squeeze main contrib

Обновляем систему:

	apt-get update && apt-get upgrade

на вопросы отвечаем `y` то есть “install the package maintainer's version”.

При необходимости ищем лишние пакеты:

	dpkg --get-selections

и удаляем:

	apt-get remove apache2 apache2-*
	apt-get remove samba samba-*
	apt-get remove bind9
	apt-get autoremove

ставим nano:

	apt-get install nano

Перезагружаемся:

	reboot



Пользователи
------------

Кладем свои ключи в `/root/.ssh/authorized_keys`:

	mkdir -p /root/.ssh/
	nano /root/.ssh/authorized_keys

Или для одного себя:

	ssh-copy-id root@server

Создаем пользователя, под которым будем работать дальше:

	useradd po -m -d /home/po -s /bin/bash

и позволим ему всё:

	apt-get install sudo
	echo 'po ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

Далее работаем под пользователем `po`:

	su po
	cd

Протестим могущество:

	sudo id

Ключи:

	mkdir -p ~/.ssh/
	touch ~/.ssh/authorized_keys
	sudo cat /root/.ssh/authorized_keys > ~/.ssh/authorized_keys

Сгенерим пользователю собственный ключ:

	ssh-keygen



Hostname
--------

Либо просто:

	sudo hostname hosto.namo.com

Либо сложно:

	sudo nano /etc/rc.local

и там:

	echo hosto > /etc/hostname
	hostname hosto.namo.ru

а потом:

	sudo chmod +x /etc/rc.local
	echo "127.0.1.1 hosto" >> /etc/hosts

SSH
---

Тюним:

	sudo nano /etc/ssh/sshd_config

и там:

	Port 22333
	ClientAliveCountMax 10
	ClientAliveInterval 6000
	
	PasswordAuthentication no
	PermitRootLogin no
	
	

а потом:

	sudo restart ssh

И добавляем сервер на свой комп в ~/.ssh/config

	mate ~/.ssh/config

и там:

	Host hosto
	HostName hosto.namo.com
	Port 22333
	User po

Тестим:

	ssh hosto

Изоляция по группе:

	addgroup sftp

/etc/ssh/sshd_config:

	#Subsystem sftp /usr/lib/openssh/sftp-server
	Subsystem sftp internal-sftp
	Match Group sftp
	    ChrootDirectory %h
	    AllowTCPForwarding no
	    ForceCommand internal-sftp

И пользователя в группе sftp:

	adduser contentmanager
	adduser contentmanager sftp
	usermod -d /Dropbox/base/ contentmanager

Локаль
------

	apt-get install language-pack-en-base
	
	export LANGUAGE=en_US.UTF-8
	export LANG=en_US.UTF-8
	export LC_ALL=en_US.UTF-8
	sudo locale-gen en_US.UTF-8
	sudo dpkg-reconfigure locales

	sudo reboot



www
----

	sudo useradd www -m -d /home/www -s /bin/bash
	sudo mkdir /www
	sudo chown www:www /www

	echo 'alias www="sudo su -l www"' >> ~/.profile

Ключи:

	export AUTHORIZED_KEYS=$(cat ~/.ssh/authorized_keys)
	sudo -E su www
	mkdir -p ~/.ssh/
	printenv AUTHORIZED_KEYS >> ~/.ssh/authorized_keys
	exit




Софт
====

Ставим среду разработки и курл (как же без него):

	sudo apt-get install build-essential curl

Спец. папка для исходников:

	cd && mkdir src && cd src



Upstart
-------

В Debian 6+ и Ubuntu 6.10+ он уже есть.
Проверим, есть ли он у нас:

	dpkg --get-selections | grep upstart
	#>>> upstart      hold
	# или
	#>>> upstart      install

Если его нет, то ставим дестрибутив посвежей.

Конфиги лежат в папочке files.

Проверяем работоспособность на примере энжин икса:

	sudo initctl list | grep nginx
	#>>> nginx stop/waiting
	
	sudo initctl start nginx
	#>>> nginx start/running, process 23577
	sudo initctl start nginx
	#>>> initctl: Job is already running: nginx
	sudo initctl list | grep nginx
	nginx start/running, process 23577
	
	curl http://localhost/
	
	sudo initctl stop nginx
	#>>> nginx stop/waiting

Номер процесса должен быть один и тот же (здесь `23577`). Если номер меняется, значит nginx либо не может запуститься, либо запустился, но отключился от консоли (демонизировался). В таком случае апстарт будет пытаться его запускать снова и снова. Отсюда и разные номера процессов.

С версии 1.3 доступны пользовательские задачи.

	init --version
	#>>> init (upstart 1.5)


Включаем:

	sudo nano /etc/dbus-1/system.d/Upstart.conf

После `<policy user="roor">…</policy>` вставим:

	<policy user="www">
	  <allow send_destination="com.ubuntu.Upstart"
	         send_interface="org.freedesktop.DBus.Properties" />
	  <allow send_destination="com.ubuntu.Upstart"
	         send_interface="com.ubuntu.Upstart0_6" />
	  <allow send_destination="com.ubuntu.Upstart"
	         send_interface="com.ubuntu.Upstart0_6.Job" />
	  <allow send_destination="com.ubuntu.Upstart"
	         send_interface="com.ubuntu.Upstart0_6.Instance" />
	</policy>

Добавляем:

	mkdir -p ~/.init/
	nano ~/.init/www-task.conf
	
и туда:

	task
	
	script
	    sleep 5
	end script

Стартуем:

	/sbin/start www-task

Должно потупить 5 секунд.

Отсюда: http://bradleyayers.blogspot.com/2011/10/upstart-user-jobs-on-ubuntu-1110.html



Энджин Икс
----------


Нужности (регулярки и MD5):

	sudo apt-get install libpcre3-dev libssl-dev


И сам nginx:

	curl http://nginx.org/download/nginx-1.2.4.tar.gz | tar xzf -
	cd nginx-1.2.4
	./configure --error-log-path=stderr && make && sudo make install
	sudo ln -s /usr/local/nginx/sbin/nginx /usr/local/bin/nginx

и сразу дебажную версию:

	make clean && ./configure --error-log-path=stderr --with-debug && make
	sudo cp ./objs/nginx /usr/local/nginx/sbin/nginx-debug
	sudo ln -s /usr/local/nginx/sbin/nginx-debug /usr/local/bin/nginx-debug

Тестим:

	nginx -V
	sudo nginx
	curl http://localhost/
	sudo nginx -s quit

Чтобы не ругался при запуске не от рута:

	sudo chmod a+w /usr/local/nginx/logs/error.log
	sudo chmod a+w /usr/local/nginx/logs/access.log

Не удаляем исходники на случай корок.


Git
---

Проверяем, какая версия в репозитории:

	apt-cache showpkg git

если всё в порядке (>= 1.7), то ставим из репозитория:

	sudo apt-get install git

иначе ставим руками:

	curl http://git-core.googlecode.com/files/git-1.7.12.1.tar.gz | tar -xzf -

или

	curl http://git-core.googlecode.com/files/git-1.7.9.1.tar.gz | tar -xzf -

или

	curl -L https://github.com/git/git/tarball/master | tar -xzf -

а потом:

	cd git-...
	./configure --without-tcltk --prefix=/opt/git/ && make && sudo make install
	sudo ln -s /opt/git/bin/git /usr/bin/git
	sudo ln -s /opt/git/bin/git-upload-pack /usr/bin/git-upload-pack
	sudo ln -s /opt/git/bin/git-receive-pack /usr/bin/git-receive-pack

Тестим:

	git --version
	#>>> git version 1.7.12.1


Git repo
--------

Тут всё делаем из-под рабочего юзера `www`:

	sudo su www

Тюн им:

	git config --global gc.auto 0
	git config --global user.name "server"
	git config --global user.email "admin@server.net"
	git config --global core.packedGitLimit 16m


Создадим пустой репозиторий на сервере:

	mkdir -p /www/inshaker
	cd /www/inshaker
	git init

Если это просто хранилище, то:

	git config core.bare true

Если нужна рабочая копия:

	git config receive.denyCurrentBranch ignore

Настроим автоматический чекаут по обновлении:

	nano .git/hooks/post-receive

и туда:

	#!/bin/sh
	GIT_DIR=$(pwd)
	cd ..
	git checkout -f

а потом:

	chmod +x .git/hooks/post-receive

Переходим на локальную машину и заливаем `master` на сервер:

	git remote add server ssh://www@server/www/inshaker
	git push server master:master
	#>>> * [new branch]      master -> master



Git server
----------


	touch hooks/post-receive && chmod +x hooks/post-receive
	nano hooks/post-receive

и там:

	#!/bin/bash
	
	while read oldrev newrev refname
	do
		[[ $refname =~ /master$ ]] || continue
		echo "GITHUB"
		echo "git push inshaker master:master" | at -M now 2>/dev/null
		
		echo "SHAKER"
		curl -s http://shaker.inshaker.ru:34543/
		echo "MUDDLER"
		curl -s http://muddler.inshaker.ru:34543/
	done

На клиенте:

	apt-get install netcat-openbsd

и в update-callback-job:

	git reset --hard
	git clean -df
	git pull
	git checkout -f

upstart скрипт лежит в `files/inshaker-update-callback.conf`



Apache
------

Чисто для надёжного сиджиая.
Ставим тупо префорк:

	sudo apt-get install apache2-mpm-prefork

Проверяем установленные модули:

	apache2 -l
	#>>>  Compiled in modules:
	#>>>    core.c
	#>>>    mod_log_config.c
	#>>>    mod_logio.c
	#>>>    prefork.c
	#>>>    http_core.c
	#>>>    mod_so.c

Останавливаем:

	sudo /etc/init.d/apache2 stop
	ps -A | grep apache2

Вырубаем автостарт:

	sudo update-rc.d -f apache2 remove


Ruby
----

Ставим `zlib` и `libyaml`, чтобы работал и не ворчал `gem install`:

	sudo apt-get install zlib1g-dev libyaml-dev

Ставим:

	curl http://ftp.ruby-lang.org/pub/ruby/ruby-1.9-stable.tar.gz | tar xzf -
	cd ruby-...
	./configure --prefix=/opt/ruby-1.9 --disable-install-doc && make && sudo make install

Претест:

	./ruby -e 'puts RUBY_VERSION'
	#>>> 1.9.3

Линкуем:

	sudo ln -s /opt/ruby-1.9/bin/ruby /usr/bin/ruby1.9
	sudo ln -s /usr/bin/ruby1.9 /usr/bin/ruby
	sudo ln -s /opt/ruby-1.9/bin/gem /usr/bin/gem
	sudo ln -s /opt/ruby-1.9/bin/irb /usr/bin/irb
	sudo ln -s /opt/ruby-1.9/bin/rake /usr/bin/rake

Тестим:

	ruby -v
	#>>> ruby 1.9.3p194 (2012-04-20 revision 35410) [i686-linux]
	
	ruby -e 'require "fileutils"; puts FileUtils.pwd'
	#>>> /home/po/src/ruby-1.9.3-p194
	
	
	rake --version
	#>>> rake, version 0.9.2.2
	
	
	gem -v
	#>>> 1.8.23
	
	gem list --local
	#>>> *** LOCAL GEMS ***
	#>>> 
	#>>> bigdecimal (1.1.0)
	#>>> io-console (0.3)
	#>>> json (1.5.4)
	#>>> minitest (2.5.1)
	#>>> rake (0.9.2.2)
	#>>> rdoc (3.9.4)
	
	
	irb -v
	#>>> irb 0.9.6(09/06/30)
	
	irb
	#>>> irb(main):001:0>
	exit
	#>>> irb(main):001:0> exit



RMagick
-------

	sudo apt-get install libmagickwand-dev imagemagick
	sudo gem install rmagick
	#>>> Fetching: rmagick-2.13.1.gem (100%)
	#>>> Building native extensions.  This could take a while...
	#>>> Successfully installed rmagick-2.13.1
	#>>> 1 gem installed

потестим:

	ruby -e 'require "RMagick"'



Thin
----

Ставим:

	sudo gem install thin
	#>>> Fetching: rack-1.4.1.gem (100%)
	#>>> Fetching: eventmachine-1.0.0.gem (100%)
	#>>> Building native extensions.  This could take a while...
	#>>> Fetching: daemons-1.1.9.gem (100%)
	#>>> Fetching: thin-1.5.0.gem (100%)
	#>>> Building native extensions.  This could take a while...
	#>>> Successfully installed rack-1.4.1
	#>>> Successfully installed eventmachine-1.0.0
	#>>> Successfully installed daemons-1.1.9
	#>>> Successfully installed thin-1.5.0
	#>>> 4 gems installed
	

Линкуем:

	sudo ln -s /opt/ruby-1.9/bin/thin /usr/bin/thin

Тестим:

	thin --help | grep daemonize
	#>>> -d, --daemonize                  Run daemonized in the background



Postfix
-------

	sudo apt-get install postfix

И не забыть поправить в его конфиге

	sudo nano /etc/postfix/main.cf

эту строку

	inet_interfaces = all

на эту

	inet_interfaces = 127.0.0.1

Если нет первой строки, то просто дописать в конец конфига.

Перезапускаем (увы, пока по старинке):

	sudo /etc/init.d/postfix restart

Тестим:

	nc 127.0.0.1 25
	#>>> 220 server ESMTP Postfix (Ubuntu)
	
	nc X.X.X.X 25
	#>>>

Тестанём:

	sudo apt-get install mailutils
	date | mail -s test pl@inshaker.ru



Postfix через Gmail
-------------------

	sudo nano /etc/postfix/main.cf

и там добавим в самый конец:

	relayhost=smtp.gmail.com:587
	# Enable SASL authentication in the Postfix SMTP client.
	smtp_sasl_auth_enable = yes
	smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
	smtp_sasl_security_options =
	smtp_tls_CAfile = /etc/postfix/thawte.pem
	
	# Enable Transport Layer Security (TLS), i.e. SSL.
	smtp_use_tls = yes
	smtp_tls_security_level = encrypt
	tls_random_source = dev:/dev/urandom

Скопируем сертификат:

	scp files/thawte.pem hosto:~/

а потом:

	sudo mv thawte.pem /etc/postfix/thawte.pem

Добавим креденшиалс:

	echo "smtp.gmail.com:587 user@inshaker.ru:123456" | sudo tee -a /etc/postfix/sasl_passwd
	sudo nano /etc/postfix/sasl_passwd
	sudo postmap /etc/postfix/sasl_passwd

Рестартанём:

	sudo postfix start
	sudo postfix reload

Тестанём:

	sudo apt-get install mailutils
	date | mail -s test pl@inshaker.ru

Подробнее: [Gmail Email Relay using Postfix on Mac OS X 10.5 Leopard](http://www.riverturn.com/blog/?p=239).



Redmine
-------

	sudo gem install bundle
	sudo ln -s /opt/ruby-1.9/bin/bundle /usr/bin/bundle

	sudo apt-get install libsqlite3-dev
	sudo bundle install --without development test postgresql mysql



Для логов
---------

Диск на два гигабайта:

	dd bs=1M count=2048 if=/dev/zero of=disk-image
	mkfs.ext3 -b 1024 -i 1024 -m 0 disk-image

Проверим:

	tune2fs -l disk-image
	fsck.ext3 -f disk-image

Смонтируем:

	mkdir fs
	mount -o loop=/dev/loop0 disk-image fs



Прикроемся
==========

	sudo apt-get install nmap

Поищем, что видно снаружи:

	ifconfig
	eth0      blablabla 127.0.0.1
	lo        blablabla X.X.X.X
	
	nmap 127.0.0.1 -p 0-65535
	#>>> Not shown: 65533 closed ports
	#>>> PORT      STATE SERVICE
	#>>> 25/tcp    open  smtp
	#>>> 80/tcp    open  http
	#>>> 22333/tcp open  unknown
	
	nmap X.X.X.X -p 1-65535
	#>>> Not shown: 65534 closed ports
	#>>> PORT      STATE SERVICE
	#>>> 80/tcp    open  http
	#>>> 22333/tcp open  unknown

Наружу торчат только http и ssh на нестандартном порту.
