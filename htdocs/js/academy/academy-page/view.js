;(function(){

eval(NodesShortcut.include())

function Me ()
{
	this.nodes = {}
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		return this
	},
	
	renderVideos: function (videos)
	{
		var root = this.nodes.videoBlocks
		
		root.empty()
		
		for (var i = 0, il = videos.length; i < il; i++)
		{
			var v = videos[i]
			
			var item = Nc('li', 'item')
			
			var head = Nct('h2', 'head', v.name)
			item.appendChild(head)
			
			var example = v.example
			if (example)
				head.appendChild(Nct('span', 'example', example))
			
			var video = Nc('div', 'video')
			item.appendChild(video)
			
			RoundedCorners.round(video)
			
			var player = Nc('iframe', 'player')
			video.appendChild(player)
			player.src = v.movie + '?title=0&byline=0&portrait=0&color=ffffff'
			player.frameBorder = 0
			
			var cocktailList = Nc('ul', 'cocktail-list')
			item.appendChild(cocktailList)
			
			var cocktails = v.cocktails
			for (var j = 0, jl = cocktails.length; j < jl; j++)
				cocktailList.appendChild(cocktails[j].getPreviewNode())
			
			root.appendChild(item)
		}
	}
}

Papa.View = Me

})();
