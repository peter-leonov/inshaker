;(function(){

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		this.fixedStartY = nodes.holder.offsetTop
		
		var me = this
		document.addEventListener('inshaker-box-changed', function(e){ me.onBoxChanged() }, false)
		this.onBoxChanged()
	},
	
	onceAddEventListenerBoxChanged: function()
	{
		var me = this
		window.addEventListener('scroll', function (e) { me.onscroll() }, false)
		this.onscroll()
		
		this.onceAddEventListenerBoxChanged = this.onscroll
	},
	
	onBoxChanged: function ()
	{
		var nodes = this.nodes,
			fixedEndY = nodes.page.scrollHeight
		
		if (fixedEndY == this.fixedEndY)
			return
		
		if (nodes.holder.offsetHeight >= fixedEndY - this.fixedStartY)
			return
		
		this.fixedEndY = fixedEndY
		this.onceAddEventListenerBoxChanged()
	},
	
	onscroll: function ()
	{
		var nodes = this.nodes,
			holder = nodes.holder,
			page = nodes.page
		
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
			page.classList.remove('float-fixed')
			page.classList.remove('stick-bottom')
			break
			
			case 'float-fixed':
			page.classList.remove('stick-top')
			page.classList.remove('stick-bottom')
			break
			
			case 'stick-bottom':
			page.classList.remove('stick-top')
			page.classList.remove('float-fixed')
			break
		}
		
		// log(state)
		page.classList.add(state)
	}
}

Me.className = 'BrandingScroller'
self[Me.className] = Me

})();
