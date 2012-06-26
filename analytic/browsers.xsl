<?xml version="1.0" encoding="utf-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:dxp='http://schemas.google.com/analytics/2009' xmlns:a='http://www.w3.org/2005/Atom'>
<xsl:output method="xml" encoding="utf-8" indent="yes"/>
<xsl:template match="/">
<pie>
	<xsl:variable name="opera" select="a:feed/a:entry[dxp:dimension[@name='ga:browser']/@value = 'Opera']"/>
	<xsl:variable name="opera_12_1" select="$opera[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '12.1']"/>
	<xsl:variable name="opera_12_0" select="$opera[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '12.0']"/>
	<xsl:variable name="opera_11_6" select="$opera[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '11.6']"/>
	<xsl:variable name="opera_11_5" select="$opera[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '11.5']"/>
	<xsl:variable name="opera_11_1" select="$opera[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '11.1']"/>
	<xsl:variable name="opera_11_0" select="$opera[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '11.0']"/>
	
	<xsl:variable name="opera_sum" select="sum($opera/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="opera_12_1_sum" select="sum($opera_12_1/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="opera_12_0_sum" select="sum($opera_12_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="opera_11_6_sum" select="sum($opera_11_6/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="opera_11_5_sum" select="sum($opera_11_5/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="opera_11_1_sum" select="sum($opera_11_1/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="opera_11_0_sum" select="sum($opera_11_0/dxp:metric[@name='ga:visits']/@value)"/>
	
	<slice title="Opera 12.1" color="#cc0000">
		<xsl:value-of select="$opera_12_1_sum"/>
	</slice>
	<slice title="Opera 12.0" color="#cc0000">
		<xsl:value-of select="$opera_12_0_sum"/>
	</slice>
	<slice title="Opera 11.6" color="#cc4422">
		<xsl:value-of select="$opera_11_6_sum"/>
	</slice>
	<slice title="Opera 11.5" color="#cc8844">
		<xsl:value-of select="$opera_11_5_sum"/>
	</slice>
	<slice title="Opera 11.1" color="#cc8844">
		<xsl:value-of select="$opera_11_1_sum"/>
	</slice>
	<slice title="Opera 11.0" color="#cc8844">
		<xsl:value-of select="$opera_11_0_sum"/>
	</slice>
	<slice title="other Opera" color="#ccaa66">
		<xsl:value-of select="$opera_sum - $opera_12_1_sum - $opera_12_0_sum - $opera_11_6_sum - $opera_11_5_sum - $opera_11_1_sum - $opera_11_0_sum"/>
	</slice>
	
	
	<xsl:variable name="firefox" select="a:feed/a:entry[dxp:dimension[@name='ga:browser']/@value = 'Firefox']"/>
	<xsl:variable name="firefox_14_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '14.0']"/>
	<xsl:variable name="firefox_13_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '13.0']"/>
	<xsl:variable name="firefox_12_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '12.0']"/>
	<xsl:variable name="firefox_11_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '11.0']"/>
	<xsl:variable name="firefox_10_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '10.0']"/>
	<xsl:variable name="firefox_9_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '9.0']"/>
	<xsl:variable name="firefox_8_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '8.0']"/>
	<xsl:variable name="firefox_7_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '7.0']"/>
	<xsl:variable name="firefox_6_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '6.0']"/>
	<xsl:variable name="firefox_5_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '5.0']"/>
	<xsl:variable name="firefox_4_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '4.0']"/>
	<xsl:variable name="firefox_3_6" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '3.6']"/>
	
	<xsl:variable name="firefox_sum" select="sum($firefox/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_14_0_sum" select="sum($firefox_14_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_13_0_sum" select="sum($firefox_13_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_12_0_sum" select="sum($firefox_12_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_11_0_sum" select="sum($firefox_11_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_10_0_sum" select="sum($firefox_10_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_9_0_sum" select="sum($firefox_9_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_8_0_sum" select="sum($firefox_8_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_7_0_sum" select="sum($firefox_7_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_6_0_sum" select="sum($firefox_6_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_5_0_sum" select="sum($firefox_5_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_4_0_sum" select="sum($firefox_4_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_3_6_sum" select="sum($firefox_3_6/dxp:metric[@name='ga:visits']/@value)"/>
	
	<slice title="Firefox 14.0" color="#ff9900">
		<xsl:value-of select="$firefox_14_0_sum"/>
	</slice>
	<slice title="Firefox 13.0" color="#ff9900">
		<xsl:value-of select="$firefox_13_0_sum"/>
	</slice>
	<slice title="Firefox 12.0" color="#ffaa11">
		<xsl:value-of select="$firefox_12_0_sum"/>
	</slice>
	<slice title="Firefox 11.0" color="#ffbb22">
		<xsl:value-of select="$firefox_11_0_sum"/>
	</slice>
	<slice title="Firefox 10.0" color="#ffbb22">
		<xsl:value-of select="$firefox_10_0_sum"/>
	</slice>
	<slice title="Firefox 9.0" color="#ffbb22">
		<xsl:value-of select="$firefox_9_0_sum"/>
	</slice>
	<slice title="Firefox 8.0" color="#ffbb22">
		<xsl:value-of select="$firefox_8_0_sum"/>
	</slice>
	<slice title="Firefox 7.0" color="#ffbb22">
		<xsl:value-of select="$firefox_7_0_sum"/>
	</slice>
	<slice title="Firefox 6.0" color="#ffbb22">
		<xsl:value-of select="$firefox_6_0_sum"/>
	</slice>
	<slice title="Firefox 5.0" color="#ffbb22">
		<xsl:value-of select="$firefox_5_0_sum"/>
	</slice>
	<slice title="Firefox 4.0" color="#ffbb22">
		<xsl:value-of select="$firefox_4_0_sum"/>
	</slice>
	<slice title="Firefox 3.6" color="#ffcc33">
		<xsl:value-of select="$firefox_3_6_sum"/>
	</slice>
	<slice title="other Firefox" color="#ffee44">
		<xsl:value-of select="$firefox_sum - $firefox_14_0_sum - $firefox_13_0_sum - $firefox_12_0_sum - $firefox_11_0_sum - $firefox_10_0_sum - $firefox_9_0_sum - $firefox_8_0_sum - $firefox_7_0_sum - $firefox_6_0_sum - $firefox_5_0_sum - $firefox_4_0_sum - $firefox_3_6_sum"/>
	</slice>
	
	
	<xsl:variable name="chrome" select="a:feed/a:entry[dxp:dimension[@name='ga:browser']/@value = 'Chrome']"/>
	<xsl:variable name="chrome_21" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '21.0']"/>
	<xsl:variable name="chrome_20" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '20.0']"/>
	<xsl:variable name="chrome_19" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '19.0']"/>
	<xsl:variable name="chrome_18" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '18.0']"/>
	<xsl:variable name="chrome_17" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '17.0']"/>
	<xsl:variable name="chrome_16" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '16.0']"/>
	<xsl:variable name="chrome_15" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '15.0']"/>
	<xsl:variable name="chrome_14" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '14.0']"/>
	<xsl:variable name="chrome_13" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '13.0']"/>
	<xsl:variable name="chrome_12" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '12.0']"/>
	<xsl:variable name="chrome_11" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '11.0']"/>
	<xsl:variable name="chrome_10" select="$chrome[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '10.0']"/>
	
	<xsl:variable name="chrome_sum" select="sum($chrome/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_21_sum" select="sum($chrome_21/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_20_sum" select="sum($chrome_20/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_19_sum" select="sum($chrome_19/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_18_sum" select="sum($chrome_18/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_17_sum" select="sum($chrome_17/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_16_sum" select="sum($chrome_16/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_15_sum" select="sum($chrome_15/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_14_sum" select="sum($chrome_14/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_13_sum" select="sum($chrome_13/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_12_sum" select="sum($chrome_12/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_11_sum" select="sum($chrome_11/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="chrome_10_sum" select="sum($chrome_10/dxp:metric[@name='ga:visits']/@value)"/>
	
	<slice title="Chrome 21" color="#00cc00">
		<xsl:value-of select="$chrome_21_sum"/>
	</slice>
	<slice title="Chrome 20" color="#00cc00">
		<xsl:value-of select="$chrome_20_sum"/>
	</slice>
	<slice title="Chrome 19" color="#00cc00">
		<xsl:value-of select="$chrome_19_sum"/>
	</slice>
	<slice title="Chrome 18" color="#44cc22">
		<xsl:value-of select="$chrome_18_sum"/>
	</slice>
	<slice title="Chrome 17" color="#66cc44">
		<xsl:value-of select="$chrome_17_sum"/>
	</slice>
	<slice title="Chrome 16" color="#66cc44">
		<xsl:value-of select="$chrome_16_sum"/>
	</slice>
	<slice title="Chrome 15" color="#66cc44">
		<xsl:value-of select="$chrome_15_sum"/>
	</slice>
	<slice title="Chrome 14" color="#66cc44">
		<xsl:value-of select="$chrome_14_sum"/>
	</slice>
	<slice title="other Chrome" color="#88cc66">
		<xsl:value-of select="$chrome_sum - $chrome_21_sum - $chrome_20_sum - $chrome_19_sum - $chrome_18_sum - $chrome_17_sum - $chrome_16_sum - $chrome_15_sum - $chrome_14_sum"/>
	</slice>
	
	
	<xsl:variable name="explorer" select="a:feed/a:entry[dxp:dimension[@name='ga:browser']/@value = 'Internet Explorer']"/>
	<xsl:variable name="explorer_10" select="$explorer[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 4) = '10.0']"/>
	<xsl:variable name="explorer_9" select="$explorer[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '9.0']"/>
	<xsl:variable name="explorer_8" select="$explorer[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '8.0']"/>
	<xsl:variable name="explorer_7" select="$explorer[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '7.0']"/>
	<xsl:variable name="explorer_6" select="$explorer[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '6.0']"/>
	
	<xsl:variable name="explorer_sum" select="sum($explorer/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="explorer_10_sum" select="sum($explorer_10/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="explorer_9_sum" select="sum($explorer_9/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="explorer_8_sum" select="sum($explorer_8/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="explorer_7_sum" select="sum($explorer_7/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="explorer_6_sum" select="sum($explorer_6/dxp:metric[@name='ga:visits']/@value)"/>
	
	<slice title="Explorer 10" color="#4499ff">
		<xsl:value-of select="$explorer_10_sum"/>
	</slice>
	<slice title="Explorer 9" color="#4499ff">
		<xsl:value-of select="$explorer_9_sum"/>
	</slice>
	<slice title="Explorer 8" color="#55aaff">
		<xsl:value-of select="$explorer_8_sum"/>
	</slice>
	<slice title="Explorer 7" color="#66bbff">
		<xsl:value-of select="$explorer_7_sum"/>
	</slice>
	<slice title="Explorer 6" color="#77ccff">
		<xsl:value-of select="$explorer_6_sum"/>
	</slice>
	<slice title="other Explorer" color="#88ddff">
		<xsl:value-of select="$explorer_sum - $explorer_10_sum - $explorer_9_sum - $explorer_8_sum - $explorer_7_sum - $explorer_6_sum"/>
	</slice>
	
	
	<xsl:variable name="safari" select="a:feed/a:entry[dxp:dimension[@name='ga:browser']/@value = 'Safari']"/>
	<xsl:variable name="safari_sum" select="sum($safari/dxp:metric[@name='ga:visits']/@value)"/>
	
	<slice title="Safari" color="#0055bb">
		<xsl:value-of select="$safari_sum"/>
	</slice>
	
	
	<xsl:variable name="opera_mini" select="a:feed/a:entry[dxp:dimension[@name='ga:browser']/@value = 'Opera Mini']"/>
	<xsl:variable name="opera_mini_sum" select="sum($opera_mini/dxp:metric[@name='ga:visits']/@value)"/>
	
	<slice title="Opera Mini" color="#777777">
		<xsl:value-of select="$opera_mini_sum"/>
	</slice>
	
	
	<xsl:variable name="android" select="a:feed/a:entry[dxp:dimension[@name='ga:browser']/@value = 'Android Browser']"/>
	<xsl:variable name="android_sum" select="sum($opera_mini/dxp:metric[@name='ga:visits']/@value)"/>
	
	<slice title="Android Browser" color="#888888">
		<xsl:value-of select="$android_sum"/>
	</slice>
	
	
	<slice title="Unknown" color="#999999">
		<xsl:variable name="total" select="a:feed/dxp:aggregates/dxp:metric[@name='ga:visits']/@value"/>
		<xsl:value-of select="$total - $opera_sum - $firefox_sum - $explorer_sum - $safari_sum - $chrome_sum - $opera_mini_sum - $android_sum"/>
	</slice>
</pie>
</xsl:template>
</xsl:stylesheet>