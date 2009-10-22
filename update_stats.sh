#!/bin/bash

PERIOD=90

# preparing date strings

if date --date "1970-01-01" >/dev/null 2>&1; then
	# based on http://www.unix.com/tips-tutorials/31944-simple-date-time-calulation-bash.html
	stamp2date (){
		date --date "1970-01-01 $1 sec" "+%Y-%m-%d"
	}
elif date -r 0 >/dev/null 2>&1; then
	stamp2date (){
		date -r $1 "+%Y-%m-%d"
	}
fi

NOW=$(date "+%s")
DAY=$((3600 * 24))
END=$(($NOW - 2 * $DAY))
BEGIN=$(($END - $PERIOD * $DAY))

BEGIN_DATE=$(stamp2date $BEGIN)
END_DATE=$(stamp2date $END)

# echo from $BEGIN_DATE to $END_DATE

