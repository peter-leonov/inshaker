<?xml version="1.0" encoding="utf-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:dxp='http://schemas.google.com/analytics/2009' xmlns:a='http://www.w3.org/2005/Atom'>
<xsl:output method="xml" encoding="utf-8" indent="yes"/>
<xsl:template match="/">
<chart>
	<series>
		<xsl:for-each select="a:feed/a:entry">
		<value xid="{position()-1}"><xsl:value-of select="dxp:dimension[@name='ga:date']/@value"/></value>
		</xsl:for-each>
	</series>
	<graphs>
		<graph gid="pageviews">
			<xsl:for-each select="a:feed/a:entry">
			<value xid="{position()-1}"><xsl:value-of select="dxp:metric[@name='ga:pageviews']/@value"/></value>
			</xsl:for-each>
		</graph>
		<graph gid="visits">
			<xsl:for-each select="a:feed/a:entry">
			<value xid="{position()-1}"><xsl:value-of select="dxp:metric[@name='ga:visits']/@value"/></value>
			</xsl:for-each>
		</graph>
	</graphs>
</chart>
</xsl:template>
</xsl:stylesheet>