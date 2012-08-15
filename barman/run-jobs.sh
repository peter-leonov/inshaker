#!/bin/bash

curl -s --user "worker:$BARMAN_PASS" --data "job=analytics" http://m.barman.inshaker.ru/act/job.cgi
curl -s --user "worker:$BARMAN_PASS" --data "job=stats"     http://m.barman.inshaker.ru/act/job.cgi

