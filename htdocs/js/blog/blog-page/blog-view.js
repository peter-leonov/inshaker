<!--# include virtual="/liby/modules/rus-date.js" -->
<!--# include virtual="/liby/core/fixes/onhashchange.js" -->
<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->

;(function(){

function Me ()
{
	this.nodes = {}
	this.lastTag = 'all'
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		this.controller.renderPosts()
		
		var me = this
		nodes.more.addEventListener('click', function (e) { me.controller.renderPosts() }, false)
		
		var lh = this.lh = new LocationHash().bind()
		lh.addEventListener('change', function (e) { me.updateHash(lh.get()) }, false)
	},
	
	renderPosts: function (posts)
	{
		for (var i = 0, pi = posts.length; i < pi; i++)
		{
			var div = N('div')
			div.innerHTML = posts[i].html
			this.nodes.postsLoop.appendChild(div.childNodes[0])
		}
	},
	
	updateHash: function ()
	{
		this.nodes.postsLoop.empty()
		this.controller.updateHash(this.lh.get())
	},
	
	switchTag: function (key)
	{
		if (!key)
			key = 'all'
		
		var root = this.nodes.root
		
		root.removeClassName('show-' + this.lastTag)
		root.addClassName('show-' + key)
		this.lastTag = key
	}
}

Papa.View = Me

})();