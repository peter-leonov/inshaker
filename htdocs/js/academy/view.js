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
		this.fixedEndY = nodes.pageFooter.offsetTop
		
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
		
		holder.removeClassName('stick-top')
		holder.removeClassName('stick-bottom')
		holder.removeClassName('float-fixed')
		
		if (stickBottom)
		{
			// log('stick-bottom')
			holder.addClassName('stick-bottom')
		}
		else if (stickTop)
			holder.addClassName('stick-top')
		else
			holder.addClassName('float-fixed')
	}
}

Object.extend(Me.prototype, myProto)

})();
