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
		this.controller.addMorePosts()
		
		var me = this
		nodes.more.addEventListener('click', function (e) { me.controller.addMorePosts() }, false)
					
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
		this.controller.updateTag(UrlEncode.parse(this.lh.get()).tag)
	},
	
	switchTag: function (key)
	{
		if (!key)
			key = 'all'
		
		var root = this.nodes.root
		
		root.removeClassName('show-' + this.lastTag)
		root.addClassName('show-' + key)
		this.lastTag = key
	},
	
	showMoreButton: function ()
	{
		var more = this.nodes.more
		
		if (more.hasClassName('hidden'))
			more.removeClassName('hidden')
	},
	
	hideMoreButton: function ()
	{
		var more = this.nodes.more
		
		if (!more.hasClassName('hidden'))
			more.addClassName('hidden')
	},
	
	renameMoreButton: function (count)
	{
		var more = this.nodes.more
		
		more.value = "еще " + count + " постов!"
		this.showMoreButton()
	},
	
	renderMoreButton: function (count)
	{
		if (count < 1)
			this.hideMoreButton()
		else
			this.renameMoreButton(count)
	}
}

Papa.View = Me

})();