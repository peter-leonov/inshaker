#!/usr/bin/ruby
$stdout.sync = true
puts "Content-type: text/plain; charset=utf-8\n\n"
system("/www/inshaker/barman/deployer.rb 2>&1")
