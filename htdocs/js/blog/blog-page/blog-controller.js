;(function(){

function Me () {}

Me.prototype =
{
	addMorePosts: function (hash, count)
	{
		this.model.addMorePosts(hash, count)
	},
	
	updateTag: function (tag)
	{
		this.model.updateTag(tag)
	}
}

Papa.Controller = Me

})();
