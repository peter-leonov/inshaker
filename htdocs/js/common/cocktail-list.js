;(function(){

function Me ()
{
	this.nodes = {}
	this.constructor = Me
	this.data = {cocktails:[]}
}

Me.className = 'CocktailList'

// eval(NodesShortcut())

Me.prototype =
{
	pageVelocity: 38,
	pageLength: 3,
	
	bind: function (nodes, cocktails)
	{
		this.nodes = nodes
		
		this.navigate()
		
		return this
	},
	
	setCocktails: function (cocktails)
	{
		this.data.cocktails = cocktails
		this.render()
	},
	
	render: function ()
	{
		var nodes = this.nodes, surface = nodes.surface, viewport = nodes.viewport,
			cocktails = this.data.cocktails
		
		nodes.root.show()
		
		surface.empty()
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var preview = cocktails[i].getPreviewNode()
			surface.appendChild(preview)
		}
		
		var page = this.pageLength
		if (cocktails.length >= page)
		{
			for (var j = 0; j < page; j++)
			{
				var preview = cocktails[j].getPreviewNode()
				surface.appendChild(preview)
			}
			this.scroller = new InfiniteScroller().bind(viewport, preview.clientWidth * i, preview.clientWidth)
			nodes.root.removeClassName('single')
		}
		else if (cocktails.length)
			nodes.root.addClassName('single')
	},
	
	navigate: function ()
	{
		var nodes = this.nodes
		
		var me = this
		nodes.prev.addEventListener('click', function (e) { me.goPrev() }, false)
		nodes.next.addEventListener('click', function (e) { me.goNext() }, false)
	},
	
	goPrev: function ()
	{
		this.scroller.setVelocity(-this.pageVelocity, 0)
		this.scroller.run()
	},
	
	goNext: function ()
	{
		this.scroller.setVelocity(this.pageVelocity, 0)
		this.scroller.run()
	}
}

// Me.mixIn(EventDriven)
self[Me.className] = Me

})();