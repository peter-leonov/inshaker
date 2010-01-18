;(function(){

function Me ()
{
	this.nodes = {}
	this.constructor = Me
}

Me.className = 'CocktailList'

// eval(NodesShortcut())

Me.prototype =
{
	pageVelocity: 38,
	
	bind: function (nodes, cocktails, page)
	{
		this.nodes = nodes
		this.data = {cocktails: cocktails}
		this.page = page
		
		this.render()
		this.navigate()
		
		return this
	},
	
	render: function ()
	{
		var nodes = this.nodes, surface = nodes.surface, viewport = nodes.viewport,
			cocktails = this.data.cocktails
		surface.empty()
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var preview = cocktails[i].getPreviewNode()
			surface.appendChild(preview)
		}
		
		var page = this.page
		if (cocktails.length >= page)
		{
			for (var j = 0; j < page; j++)
			{
				var preview = cocktails[j].getPreviewNode()
				surface.appendChild(preview)
			}
			this.scroller = new InfiniteScroller().bind(viewport, preview.clientWidth * i, preview.clientWidth)
		}
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