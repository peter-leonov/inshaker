;(function(){

function Me () {}

Me.prototype =
{
	addMorePosts: function (hash)
	{
		this.model.addMorePosts(hash)
	},
	
	updateTag: function (tag)
	{
		this.model.updateTag(tag)
	}
}

Papa.Controller = Me

})();
