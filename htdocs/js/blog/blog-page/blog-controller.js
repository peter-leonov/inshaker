;(function(){

function Me () {}

Me.prototype =
{
	addMorePosts: function ()
	{
		this.model.addMorePosts()
	},
	
	updateTag: function (tag)
	{
		this.model.updateTag(tag)
	}
}

Papa.Controller = Me

})();
