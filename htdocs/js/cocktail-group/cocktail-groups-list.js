;(function(){

eval(NodesShortcut.include())

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
	},
	
	renderList: function ()
	{
		var groups = this.nodes.groups
		
		for (var i = 0, il = groups.length; i < il; i++)
		{
			var group = groups[i]
			
			var tag = group.getAttribute('data-tag')
			if (!tag)
				continue
			
			var cocktails = Cocktail.getByTag(tag)
			if (cocktails.length < 1)
				continue
			
			var cocktail = cocktails.random(1)[0]
			
			var image = group.add('img', 'cocktail-image')
			image.src = cocktail.getBigImageSrc()
		}
	}
}

Me.className = 'CocktailGroupsList'
self[Me.className] = Me

})();


;(function(){

function onready ()
{
	var nodes =
	{
		list: $('#groups-list'),
		groups: $$('#groups-list .item .group')
	}
	
	var widget = new CocktailGroupsList()
	widget.bind(nodes)
	widget.renderList()
}

$.onready(onready)

})();
