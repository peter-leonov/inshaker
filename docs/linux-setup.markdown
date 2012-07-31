
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

Меняем пароль рута.

	passwd


Создаем пользователя, под которым будем работать дальше:

	useradd www -m -d /home/www -s /bin/bash

На тестовой машине позволим ему все:

	apt-get install sudo
	echo 'www ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

Далее работаем под пользователем `www`:

	su www
	cd

Протестим могущество:

	sudo id

Кладем свои ключи в `/home/www/.ssh/authorized_keys`:

	mkdir -p ~/.ssh/
	touch ~/.ssh/authorized_keys
	sudo cat /root/.ssh/authorized_keys > ~/.ssh/authorized_keys

Сгенерим пользователю собственный ключ:

	ssh-keygen

SSH
---

Меняем порт в /etc/ssh/sshd_config на 22333.

	sudo nano /etc/ssh/sshd_config
	sudo restart ssh

И добавляем сервер на свой комп в ~/.ssh/config

	Host server
	HostName server.project.name
	Port 22333
	User www

Тестим:

	ssh server

/www
----

	sudo mkdir /www
	sudo chown www:www /www


Софт
====

Ставим среду разработки и курл (как же без него):

	sudo apt-get install build-essential curl


Энджин Икс
----------


Нужности (регулярки и MD5):

	sudo apt-get install libpcre3-dev libssl-dev


И сам nginx:

	curl http://nginx.org/download/nginx-1.2.2.tar.gz | tar xzf -
	cd nginx-1.2.2
	./configure && make && sudo make install
	sudo ln -s /usr/local/nginx/sbin/nginx /usr/local/bin/nginx

и сразу дебажную версию:

	make clean
	./configure --with-debug && make
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

	curl -O http://git-core.googlecode.com/files/git-1.7.9.1.tar.gz
	tar xzf git-1.7.9.1.tar.gz
	cd git-1.7.9.1
	./configure --without-tcltk && make && sudo make install

Тестим:

	git --version
	#>>> git version 1.7.9.5

Тюним:

	git config --global gc.auto 0
	git config --global user.name "server"
	git config --global user.email "admin@server.net"
	git config --global core.packedGitLimit 16m


UpStart
---

В Debian 6+ и Ubuntu 6.10+ он уже есть.
Проверим, есть ли он у нас:

	dpkg --get-selections | grep upstart
	#>>> upstart      hold
	# или
	#>>> upstart      install

Если его нет, то ставим дестрибутив посвежей.

Конфиг для энжинкса (кладем в `/etc/init/`):

	description "nginx http daemon"
	
	start on runlevel [2345]
	stop on runlevel [!2345]
	
	exec /usr/local/nginx/sbin/nginx -g "daemon off;" -c /path/to/nginx.conf
	
	respawn
	respawn limit 60000 1

Проверяем:

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


Конфиг для апача 2.2:

	description "apache 2.2 http daemon"
	
	start on runlevel [2345]
	stop on runlevel [!2345]
	
	exec apache2 -D FOREGROUND -f /path/to/apache.conf
	
	respawn
	respawn limit 60000 1

Проверять нужно точно так же, как и энжинкс.


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
	cd ruby-1.9.3-p194
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
	#>>> /home/www/ruby-1.9.3-p194
	
	
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

потестим:

	ruby -e 'require "RMagick"'

Thin
----

Ставим:

	sudo gem install thin
	#>>> Building native extensions.  This could take a while...
	#>>> Successfully installed thin-1.2.11
	#>>> 1 gem installed
	#>>> Installing ri documentation for thin-1.2.11...
	#>>> Installing RDoc documentation for thin-1.2.11...

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

Redmine
-------

	sudo gem install bundle
	sudo ln -s /opt/ruby-1.9/bin/bundle /usr/bin/bundle

	sudo apt-get install libsqlite3-dev
	sudo bundle install --without development test postgresql mysql

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


Удалим www из /etc/sudoers

	sudo nano /etc/sudoers

	sudo id
	#>>> [sudo] password for www:
