#!/usr/bin/ruby
$stdout.sync = true
system("cd /www/inshaker/barman && ./deployer.rb 2>&1")
