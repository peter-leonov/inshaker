<!--# include virtual="/liby/modules/rus-date.js" -->

;(function(){

function Me ()
{
	this.nodes = {}
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		this.controller.renderPosts()
	},
	
	renderPosts: function (posts)
	{
		for (var i = 0, pi = posts.length; i < pi; i++)
		{
			var div = N('div')
			div.innerHTML = posts[i].html
			this.nodes.postsLoop.appendChild(div.childNodes[0])
		}
	}
}

Papa.View = Me

})();