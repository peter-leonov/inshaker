<?xml version="1.0" encoding="utf-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:dxp='http://schemas.google.com/analytics/2009' xmlns:a='http://www.w3.org/2005/Atom'>
<xsl:output method="xml" encoding="utf-8" indent="yes"/>
<xsl:template match="/">
<pie>
	<xsl:for-each select="a:feed/a:entry">
	<slice title="{dxp:dimension[@name='ga:eventLabel']/@value}">
		<xsl:value-of select="dxp:metric[@name='ga:uniqueEvents']/@value"/>
	</slice>
	</xsl:for-each>
</pie>
</xsl:template>
</xsl:stylesheet>