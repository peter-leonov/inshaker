#!/bin/bash

PERIOD=90

PROFILE_ID=9038802
STAT_DIR=/www/inshaker/htdocs/stat
VISITS_XML=$STAT_DIR/visitors/data.xml
CITIES_XML=$STAT_DIR/cities/data.xml

# preparing date strings

if date --date "1970-01-01" >/dev/null 2>&1; then
	# GNU date
	stamp2date (){
		# based on http://www.unix.com/tips-tutorials/31944-simple-date-time-calulation-bash.html
		date --date "1970-01-01 $1 sec" "+%Y-%m-%d"
	}
elif date -r 0 >/dev/null 2>&1; then
	# FreeBSD date
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

echo Getting stats from $START_DATE to $END_DATE


if [ ! -f data/auth_token.txt ]; then
	echo "ERROR: data/auth_token.txt file is missing" 1>&2
fi
AUTH_TOKEN=$(cat data/auth_token.txt)

mkdir -p data


echo downloading visits...
VISITS_URI="https://www.google.com/analytics/feeds/data?ids=ga:$PROFILE_ID&dimensions=ga:date&metrics=ga:visits,ga:pageviews&start-date=$START_DATE&end-date=$END_DATE&max-results=$PERIOD"
rm -f visits.xml
curl "$VISITS_URI" -s --header "Authorization: GoogleLogin Auth=$AUTH_TOKEN" > data/visits.xml
if cat data/visits.xml | grep "<?xml" >/dev/null; then
	echo "  processing visits"
	xsltproc visits.xsl data/visits.xml > $VISITS_XML
else
	echo "ERROR: Can't download visits.xml" 1>&2
fi


echo downloading cities...
CITIES_URI="https://www.google.com/analytics/feeds/data?ids=ga:$PROFILE_ID&dimensions=ga:region&metrics=ga:visits&sort=-ga:visits&start-date=$START_DATE&end-date=$END_DATE&max-results=4"
rm -f cities.xml
curl "$CITIES_URI" -s --header "Authorization: GoogleLogin Auth=$AUTH_TOKEN" > data/cities.xml
if cat data/cities.xml | grep "<?xml" >/dev/null; then
	echo "  processing cities"
	xsltproc cities.xsl data/cities.xml > $CITIES_XML
else
	echo "ERROR: Can't get cities.xml" 1>&2
	exit 1
fi
