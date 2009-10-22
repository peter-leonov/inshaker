#!/bin/bash

PERIOD=90

PROFILE_ID=9038802

TEMPLATES_DIR=/www/inshaker/barman/templates
VIEWS_XSL=$TEMPLATES_DIR/views.xml
CITIES_XSL=$TEMPLATES_DIR/cities.xml


STAT_DIR=/www/inshaker/htdocs/stat
VIEWS_XML=$STAT_DIR/visitors/data.xml
CITIES_XML=$STAT_DIR/cities/data.xml

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
START=$(($END - $PERIOD * $DAY))

START_DATE=$(stamp2date $START)
END_DATE=$(stamp2date $END)

# echo from $START_DATE to $END_DATE




AUTH_TOKEN=$(cat auth_token.txt)



VISITS_URI="https://www.google.com/analytics/feeds/data?ids=ga:$PROFILE_ID&dimensions=ga:date&metrics=ga:visits,ga:pageviews&start-date=$START_DATE&end-date=$END_DATE&max-results=$PERIOD"

rm -f visits.xml
curl "$VISITS_URI" -s --header "Authorization: GoogleLogin Auth=$AUTH_TOKEN" > visits.xml
if ! cat visits.xml | grep "<?xml" >/dev/null; then
	echo "ERROR: Can't get visits.xml" 1>&2
	exit 1
fi



CITIES_URI="https://www.google.com/analytics/feeds/data?ids=ga:$PROFILE_ID&dimensions=ga:region&metrics=ga:visits&sort=-ga:visits&start-date=$START_DATE&end-date=$END_DATE&max-results=4"

rm -f cities.xml
curl "$CITIES_URI" -s --header "Authorization: GoogleLogin Auth=$AUTH_TOKEN" > cities.xml
if ! cat cities.xml | grep "<?xml" >/dev/null; then
	echo "ERROR: Can't get cities.xml" 1>&2
	exit 1
fi

