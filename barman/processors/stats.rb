#!/usr/bin/env ruby1.9
# encoding: utf-8

require "config"

$stdout.sync = true

Dir.chdir("#{Inshaker::ROOT_DIR}/analytic")

exit system("./login.sh && ./update.sh")