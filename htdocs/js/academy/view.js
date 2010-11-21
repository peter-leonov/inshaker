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
		
		var me = this
		
		this.bindBrandingScroller()
		
		for (var i = 0; i < nodes.entries.length; i++)
			RoundedCorners.round(nodes.entries[i].firstChild)
		
		return this
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
