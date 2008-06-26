var svn = {};
svn.text = "$Revision$";
svn.getRevision = function(){
	return this.text.match(/\$Revision:\ (\d+)\ \$/)[1];
}