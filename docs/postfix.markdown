
	sudo echo "smtp.gmail.com:587 event@inshaker.ru:******" >> /etc/postfix/sasl_passwd
	sudo postmap /etc/postfix/sasl_passwd

edit /etc/postfix/main.cf

	# Minimum Postfix-specific configurations.
	# mydomain_fallback = localhost
	# mail_owner = _postfix
	# setgid_group = _postdrop
	relayhost=smtp.gmail.com:587
	# Enable SASL authentication in the Postfix SMTP client.
	smtp_sasl_auth_enable = yes
	smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
	smtp_sasl_security_options =
	smtp_tls_CAfile = /etc/postfix/cacert.pem
	
	# Enable Transport Layer Security (TLS), i.e. SSL.
	smtp_use_tls = yes
	smtp_tls_security_level = encrypt
	tls_random_source = dev:/dev/urandom


	sudo mv thawte.pem /etc/postfix/cacert.pem


	sudo postfix start
	sudo postfix reload


test

	date | mail -s test gojpeg@mail.ru


http://www.riverturn.com/blog/?p=239
http://www.felipe-alfaro.org/blog/2009/05/10/have-postfix-relay-e-mail-to-gmail/
