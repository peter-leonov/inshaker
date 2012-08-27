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
			
			var query = group.getAttribute('data-query')
			if (!query)
				continue
			
			var cocktails = Cocktail.getByQuery(query.split(/\s+/))
			if (cocktails.length < 1)
				continue
			
			var cocktail = cocktails.random(1)[0]
			
			var groupName = group.firstChild.nodeValue
			group.empty()
			
			var imageBox = group.add('div', 'image-box')
			
			var image = imageBox.add('img', 'image')
			image.src = cocktail.getBigImageSrc()
			
			var name = group.add('span', 'name')
			name.text(groupName)
			
			var count = name.add('span', 'count')
			count.text(cocktails.length)
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
