#!/bin/bash

PERIOD=90

PROFILE_ID=9038802
STAT_DIR=/www/inshaker/htdocs/stat
VISITS_XML=$STAT_DIR/visitors/data.xml
CITIES_XML=$STAT_DIR/cities/data.xml
BROWSERS_XML=$STAT_DIR/browsers/data.xml

# dates

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


# authorization

if [ ! -f data/auth_token.txt ]; then
	echo "ERROR: data/auth_token.txt file is missing" 1>&2
	exit
fi
AUTH_TOKEN=$(cat data/auth_token.txt)


# reports

report (){
	echo "reporting $1"
	FEED_URI="https://www.google.com/analytics/feeds/data?ids=ga:$PROFILE_ID&$2&start-date=$START_DATE&end-date=$END_DATE&max-results=$3&prettyprint=true"
	rm -f $1.xml
	echo "  downloading..."
	mkdir -p data
	curl "$FEED_URI" -s --header "Authorization: GoogleLogin Auth=$AUTH_TOKEN" > data/$1.xml
	if cat data/$1.xml | grep "<?xml" >/dev/null; then
		echo "  processing..."
		xsltproc $1.xsl data/$1.xml > $4
	else
		echo "ERROR: Failed downloading $1.xml" 1>&2
	fi
}

report "visits" "dimensions=ga:date&metrics=ga:visits,ga:pageviews" $PERIOD $VISITS_XML
report "cities" "dimensions=ga:region&metrics=ga:visits&sort=-ga:visits" 4 $CITIES_XML
report "browsers" "dimensions=ga:browser,ga:browserVersion&metrics=ga:visits&sort=-ga:visits" 2500 $BROWSERS_XML
