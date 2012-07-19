
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

И добавляем сервер в ~/.ssh/config

	Host server
	HostName server.project.name
	Port 22333
	User www

Тестим:

	ssh server


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

	make clean && ./configure --with-debug && make
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
	#>>> git version 1.7.4.1

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

Если его нет, то ставим:

	sudo apt-get install upstart
	rebooot

Если удалось перезагрузиться: то:

	sudo initctl list
	#>>> rc stop/waiting
	#>>> openvz stop/waiting
	#>>> ssh start/running, process 30215
	#>>> rcS stop/waiting
	#>>> rc-sysinit stop/waiting
	#>>> hostname stop/waiting
	#>>> network-interface stop/waiting
	#>>> network-interface-security (networking) start/running
	#>>> networking stop/waiting

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


Ruby
----

Ставим `zlib` и `libyaml`, чтобы работал `gem install`:

	sudo apt-get install zlib1g-dev libyaml-dev

Ставим:

	curl http://ftp.ruby-lang.org/pub/ruby/ruby-1.9-stable.tar.gz | tar xzf -
	cd ruby-1.9.3-p194
	./configure --prefix=/opt/ruby-1.9 --disable-install-doc && make && sudo make install
	./ruby -e 'puts RUBY_VERSION'

Линкуем:

	sudo ln -s /opt/ruby-1.9/bin/ruby /usr/bin/ruby1.9
	sudo ln -s /usr/bin/ruby1.9 /usr/bin/ruby
	sudo ln -s /opt/ruby-1.9/bin/gem /usr/bin/gem
	sudo ln -s /opt/ruby-1.9/bin/irb /usr/bin/irb

Тестим:

	ruby -v
	#>>> ruby 1.9.3p194 (2012-04-20 revision 35410) [i686-linux]
	
	ruby -e 'require "fileutils"; puts FileUtils.class'
	#>>> Module
	
	
	gem -v
	#>>> 1.3.7
	
	gem list --local
	#>>> *** LOCAL GEMS ***
	#>>> 
	#>>> daemons (1.1.4)
	#>>> eventmachine (0.12.10)
	#>>> minitest (1.6.0)
	#>>> rack (1.3.1)
	#>>> rake (0.8.7)
	#>>> rdoc (2.5.8)
	
	
	irb -v
	#>>> irb 0.9.6(09/06/30)
	
	irb
	#>>> irb(main):001:0>
	exit
	#>>> irb(main):001:0> exit

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

	cd /usr/bin/
	sudo ln -s /opt/ruby-1.9.2/bin/thin thin

Тестим:

	thin --help | grep daemonize
	#>>> -d, --daemonize                  Run daemonized in the background


Postfix
-------

	apt-get install postfix

И не забыть поправить в его конфиге (/etc/postfix/master.cf):

	inet_interfaces = all

на

	inet_interfaces = 127.0.0.1

Если нет первой строки, то просто дописать в конец конфига.