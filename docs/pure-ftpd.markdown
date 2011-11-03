Собираем:

	./configure --with-everything && make && sudo make install
	chmod a+x 
	chmod a+x configuration-file/pure-config.pl
	sudo cp configuration-file/pure-config.pl /usr/bin/
	sudo cp configuration-file/pure-ftpd.conf /etc/

Конфигурируем и запускаем:

	/usr/bin/pure-config.pl /etc/pure-ftpd.conf
	launchctl start pureftpd

Добавляем пользователей (в /etc/pureftpd.passwd):

	pure-pw useradd trinity -u barman -d /Volumes/ACIE/...
	pure-pw mkdb

ru.programica.pureftpd.plist

	<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
	<plist version="1.0">
	<dict>
	    <key>RunAtLoad</key>
	    <true/>
	    <key>KeepAlive</key>
	    <dict>
	        <key>SuccessfulExit</key>
	        <false/>
	    </dict>
	    <key>Label</key>
	    <string>pureftpd</string>
	    <key>ProgramArguments</key>
	    <array>
	        <string>/usr/bin/pure-config.pl</string>
	        <string>/etc/pure-ftpd.conf</string>
	    </array>
	    <key>Nice</key>
	    <integer>3</integer>
	    <key>UserName</key>
	    <string>root</string>
	    <key>GroupName</key>
	    <string>wheel</string>
	</dict>
	</plist>