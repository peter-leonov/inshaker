;(function(){

function Me (nodes)
{
	this.nodes = nodes
}

eval(NodesShortcut.include())

Me.prototype =
{
	setTags: function (tags)
	{
		var index = this.tagIndexByTagName = {}
		
		for (var i = 0, il = tags.length; i < il; i++)
			index[tags[i]] = i
		
		this.tags = tags
	},
	
	getTagIndex: function (tag)
	{
		return this.tagIndexByTagName[tag]
	},
	
	render: function ()
	{
		var cloud = this.nodes.root
		var tags = this.tags
		for (var i = 0, il = tags.length; i < il; i++)
		{
			cloud.appendChild(this.renderItem(tags[i]))
			cloud.appendChild(T(' '))
		}
	},
	
	renderItem: function (tag)
	{
		var link = Nct('a', 'link', tag)
		link.href = '/blog/#tag=' + tag
		
		var item = Nc('li', 'tag tag-' + this.tagIndexByTagName[tag])
		item.appendChild(link)
		
		return item
	}
}

Me.className = 'TagCloud'
self[Me.className] = Me

})();
