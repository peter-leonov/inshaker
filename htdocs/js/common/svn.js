var svn = {};
svn.revision = "$Revision$";
svn.getRevision = function(){
	return this.revision.match(/\$Revision:\ (\d+)\$/)[0];
}