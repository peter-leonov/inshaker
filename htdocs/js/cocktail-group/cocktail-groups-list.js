;(function(){

function compare (a, b)
{
	a = a[1]
	b = b[1]
	
	if (a < b)
		return -1
	if (a > b)
		return 1
	return 0
}

function sortBy (f)
{
	for (var i = 0, il = this.length; i < il; i++)
	{
		var v = this[i]
		this[i] = [v, f(v)]
	}
	
	this.sort(compare)
	
	for (var i = 0, il = this.length; i < il; i++)
		this[i] = this[i][0]
}

Array.prototype.sortBy = sortBy

})();


;(function(){

eval(NodesShortcut.include())

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
	},
	
	render: function ()
	{
		this.sortList()
		this.renderList()
	},
	
	sortList: function ()
	{
		var nodes = this.nodes
		
		var groups = nodes.groups.slice()
		groups.sortBy(function (e) { return e.firstChild.nodeValue })
		
		var list = nodes.list
		for (var i = 0, il = groups.length; i < il; i++)
			list.appendChild(groups[i].parentNode)
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
			
			query = query.split(/\s*([&|])\s*/)
			var cocktails = Cocktail.getByQuery(query)
			if (cocktails.length < 1)
				continue
			
			var cocktail = cocktails.random(1)[0]
			
			var groupName = group.firstChild.nodeValue
			group.empty()
			
			var imageBox = group.add('div', 'image-box')
			
			var image = imageBox.add('img', 'image')
			image.src = cocktail.getBigImageSrc()
			
			var name = group.add('span', 'name')
			name.txt(groupName)
			
			var count = name.add('span', 'count')
			count.txt(cocktails.length)
		}
	}
}

Me.className = 'CocktailGroupsList'
self[Me.className] = Me

})();


;(function(){

function onready ()
{
  UserAgent.setupDocumentElementClassNames()
  
	var nodes =
	{
		list: $('#groups-list'),
		groups: $$('#groups-list .item .group')
	}
	
	var widget = new CocktailGroupsList()
	widget.bind(nodes)
	widget.render()
}

$.onready(onready)

})();
