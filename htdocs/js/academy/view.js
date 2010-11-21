;(function(){

var Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
	},
	
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
			
			var video = Nc('div', 'video')
			item.appendChild(video)
			
			RoundedCorners.round(video)
			
			var player = Nc('iframe', 'player')
			video.appendChild(player)
			player.src = v.movie
			player.frameBorder = 0
			
			var cocktailList = Nc('ul', 'cocktail-list')
			item.appendChild(cocktailList)
			
			var cocktails = v.cocktails
			for (var j = 0, jl = cocktails.length; j < jl; j++)
				cocktailList.appendChild(cocktails[j].getPreviewNode())
			
			root.appendChild(item)
		}
	},
	
	bindBrandingScroller: function ()
	{
		var nodes = this.nodes
		
		this.fixedStartY = nodes.brandedImageHolder.offsetTop
		this.fixedEndY = nodes.page.offsetHeight
		
		if (nodes.brandedImageHolder.offsetHeight >= this.fixedEndY - this.fixedStartY)
			return
		
		var me = this
		window.addEventListener('scroll', function (e) { me.onBrandingScroll() }, false)
		this.onBrandingScroll()
	},
	
	onBrandingScroll: function ()
	{
		var nodes = this.nodes,
			holder = nodes.brandedImageHolder
		
		var stickTop = window.pageYOffset <= this.fixedStartY
		var stickBottom = window.pageYOffset + holder.offsetHeight >= this.fixedEndY
		
		var state
		if (stickBottom)
			state = 'stick-bottom'
		else if (stickTop)
			state = 'stick-top'
		else
			state = 'float-fixed'
		
		if (this.lastState == state)
			return
		this.lastState = state
		
		switch (state)
		{
			case 'stick-top':
			holder.removeClassName('float-fixed')
			holder.removeClassName('stick-bottom')
			break
			
			case 'float-fixed':
			holder.removeClassName('stick-top')
			holder.removeClassName('stick-bottom')
			break
			
			case 'stick-bottom':
			holder.removeClassName('stick-top')
			holder.removeClassName('float-fixed')
			break
		}
		
		// log(state)
		holder.addClassName(state)
	}
}

Object.extend(Me.prototype, myProto)

})();
