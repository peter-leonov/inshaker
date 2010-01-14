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
	bind: function (viewport, surface, cocktails, page)
	{
		this.nodes = {viewport: viewport, surface: surface}
		this.data = {cocktails: cocktails}
		this.page = page
		
		this.render()
		
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
			var is = new InfiniteScroller().bind(viewport, preview.clientWidth * i, preview.clientWidth)
		}
	}
}

// Me.mixIn(EventDriven)
self[Me.className] = Me

})();