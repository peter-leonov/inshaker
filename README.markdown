# Run in Docker

Dev:

    echo '127.0.0.1 inshaker' >> /etc/hosts
    docker-compose -f docker-compose.yml -f dev.yml up
    open http://inshaker/

Deploy:

    docker-compose push
    eval $(docker-machine env inshaker)
    docker-compose pull
    docker-compose up -d


# run on MacOS

	sudo nginx -q -p "." -c "nginx.developer.conf" -g "user $USER staff;"
	127.0.0.1 dev.inshaker.ru

	set -x RUBYLIB './'
	ln -s /usr/local/Cellar/ruby/2.2.3/bin/ruby ~/bin/ruby1.9
	gem install ...

	sudo ln -s /Users/peter/www/inshaker.ru/ /www/inshaker
	set -x INSHAKER_BASE_DIR ~/inshaker/

# License

For the code license is MIT (both inshaker and liby).
Data is proprietary, think of it as if you've found it on public web site.
