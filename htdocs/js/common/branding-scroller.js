;(function(){

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		this.fixedStartY = nodes.holder.offsetTop
		this.fixedEndY = nodes.page.scrollHeight
		
		if (nodes.holder.offsetHeight >= this.fixedEndY - this.fixedStartY)
			return
		
		var me = this
		window.addEventListener('scroll', function (e) { me.onscroll() }, false)
		this.onscroll()
	},
	
	onscroll: function ()
	{
		var nodes = this.nodes,
			holder = nodes.holder
		
		var pageYOffset = window.pageYOffset
		var stickTop = pageYOffset <= this.fixedStartY
		var stickBottom = pageYOffset + holder.offsetHeight >= this.fixedEndY
		
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

Me.className = 'BrandingScroller'
self[Me.className] = Me

})();
