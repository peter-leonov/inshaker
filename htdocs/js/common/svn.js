var _svnReg = new RegExp("\$Revision:\ (\d+)\ \$")

var svn = {};
svn.text = "$Revision$";
svn.getRevision = function(){
	return this.text.match(_svnReg)[1];
}