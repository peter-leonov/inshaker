;(function(){

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		this.fixedStartY = nodes.holder.offsetTop
		
		this.onscrollListener = function (e) { me.onscroll() }
		
		var me = this
		document.addEventListener('inshaker-box-changed', function (e) { me.onBoxChanged() }, false)
		this.onBoxChanged()
	},
	
	toggleOnScroll: function (onscrollBint)
	{
		if (onscrollBint == this.onscrollBint)
			return
		
		if (onscrollBint)
			window.addEventListener('scroll', this.onscrollListener, false)
		else
			window.removeEventListener('scroll', this.onscrollListener, false)
		
		this.onscrollBint = onscrollBint
	},
	
	onBoxChanged: function ()
	{
		var nodes = this.nodes
		
		var fixedEndY = nodes.page.scrollHeight
		if (fixedEndY == this.fixedEndY)
			return
		
		var isLong = nodes.holder.offsetHeight >= fixedEndY - this.fixedStartY
		
		this.toggleOnScroll(!isLong)
		
		if (isLong)
			return
		
		this.fixedEndY = fixedEndY
		this.onscroll()
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
