#!/bin/bash

PORT=12345

while nc -l $PORT <<EOF > /dev/null
HTTP/1.0 200 OK
Content-Type: text/plain

pulling
EOF
do
	echo 123
done
