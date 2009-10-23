<?xml version="1.0" encoding="utf-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:dxp='http://schemas.google.com/analytics/2009' xmlns:a='http://www.w3.org/2005/Atom'>
<xsl:output method="xml" encoding="utf-8" indent="yes"/>
<xsl:template match="/">
<pie>
	<xsl:variable name="opera" select="a:feed/a:entry[dxp:dimension[@name='ga:browser']/@value = 'Opera']"/>
	<xsl:for-each select="$opera">
		<xsl:sort lang="ru" select="dxp:dimension[@name='ga:region']/@value"/>
		
		<slice title="Opera" color="#ff4422">
			<xsl:value-of select="dxp:metric[@name='ga:visits']/@value"/>
		</slice>
	</xsl:for-each>
	
	<slice title="остальные">
		<xsl:variable name="total" select="a:feed/dxp:aggregates/dxp:metric[@name='ga:visits']/@value"/>
		<xsl:value-of select="$total - sum($opera/dxp:metric[@name='ga:visits']/@value)"/>
	</slice>
</pie>
</xsl:template>
</xsl:stylesheet>