;(function(){

function Me () {}

Me.prototype =
{
	addMorePosts: function ()
	{
		this.model.addMorePosts()
	},
	
	hashUpdated: function (hash)
	{
		this.model.setHash(hash)
	},
	
	askForTagsList: function ()
	{
		this.model.sendTags()
	}
}

Papa.Controller = Me

})();
