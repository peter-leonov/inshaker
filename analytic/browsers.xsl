<?xml version="1.0" encoding="utf-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:dxp='http://schemas.google.com/analytics/2009' xmlns:a='http://www.w3.org/2005/Atom'>
<xsl:output method="xml" encoding="utf-8" indent="yes"/>
<xsl:template match="/">
<pie>
	<xsl:variable name="opera" select="a:feed/a:entry[dxp:dimension[@name='ga:browser']/@value = 'Opera']"/>
	<xsl:variable name="opera_10" select="$opera[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '9.8']"/>
	<xsl:variable name="opera_9_6" select="$opera[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '9.6']"/>
	<xsl:variable name="opera_9_5" select="$opera[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '9.5']"/>
	<xsl:variable name="opera_9_2" select="$opera[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '9.2']"/>
	
	<xsl:variable name="opera_sum" select="sum($opera/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="opera_10_sum" select="sum($opera_10/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="opera_9_6_sum" select="sum($opera_9_6/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="opera_9_5_sum" select="sum($opera_9_5/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="opera_9_2_sum" select="sum($opera_9_2/dxp:metric[@name='ga:visits']/@value)"/>
	
	<slice title="Opera 10" color="#cc2200">
		<xsl:value-of select="$opera_10_sum"/>
	</slice>
	<slice title="Opera 9.6" color="#cc4422">
		<xsl:value-of select="$opera_9_6_sum"/>
	</slice>
	<slice title="Opera 9.5" color="#cc5533">
		<xsl:value-of select="$opera_9_5_sum"/>
	</slice>
	<slice title="Opera 9.2" color="#cc6644">
		<xsl:value-of select="$opera_9_2_sum"/>
	</slice>
	<slice title="Opera остальная" color="#cc7755">
		<xsl:value-of select="$opera_sum - $opera_10_sum - $opera_9_6_sum - $opera_9_5_sum - $opera_9_2_sum"/>
	</slice>
	
	
	<xsl:variable name="firefox" select="a:feed/a:entry[dxp:dimension[@name='ga:browser']/@value = 'Firefox']"/>
	<xsl:variable name="firefox_3_5" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '3.5']"/>
	<xsl:variable name="firefox_3_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '3.0']"/>
	<xsl:variable name="firefox_2_0" select="$firefox[substring(dxp:dimension[@name='ga:browserVersion']/@value, 1, 3) = '2.0']"/>
	
	<xsl:variable name="firefox_sum" select="sum($firefox/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_3_5_sum" select="sum($firefox_3_5/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_3_0_sum" select="sum($firefox_3_0/dxp:metric[@name='ga:visits']/@value)"/>
	<xsl:variable name="firefox_2_0_sum" select="sum($firefox_2_0/dxp:metric[@name='ga:visits']/@value)"/>
	
	<slice title="Firefox 3.5" color="#ff9900">
		<xsl:value-of select="$firefox_3_5_sum"/>
	</slice>
	<slice title="Firefox 3.0" color="#ffaa11">
		<xsl:value-of select="$firefox_3_0_sum"/>
	</slice>
	<slice title="Firefox 2.0" color="#ffbb22">
		<xsl:value-of select="$firefox_2_0_sum"/>
	</slice>
	<slice title="Firefox остальной" color="#ffcc33">
		<xsl:value-of select="$firefox_sum - $firefox_3_5_sum - $firefox_3_0_sum - $firefox_2_0_sum"/>
	</slice>
	
	
	<slice title="остальные" color="#888888">
		<xsl:variable name="total" select="a:feed/dxp:aggregates/dxp:metric[@name='ga:visits']/@value"/>
		<xsl:value-of select="$total - $opera_sum - $firefox_sum"/>
	</slice>
</pie>
</xsl:template>
</xsl:stylesheet>