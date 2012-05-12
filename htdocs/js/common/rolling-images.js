function RollingImagesLite (node, conf)
{
	this.conf = {duration: 1, animationType: 'easeOutBack'}
	Object.extend(this.conf, conf)
	this.current = null
	this.mainNode = node
	this.mainNode.RollingImagesLite = this
	
	
	var t = this
	function mouseup (e)
	{
		e.preventDefault()
		clearInterval(t.svInt)
		document.removeEventListener('mouseup', mouseup, false)
	}
	
	this.prevmousedown = function (e)
	{
		e.preventDefault()
		clearInterval(t.svInt)
		t.goPrev()
		t.svInt = setInterval(function () { t.goPrev() }, t.conf.duration * 1000 * 0.5 + 150)
		document.addEventListener('mouseup', mouseup, false)
	}
	
	this.nextmousedown = function (e)
	{
		e.preventDefault()
		clearInterval(t.svInt)
		t.goNext()
		t.svInt = setInterval(function () { t.goNext() }, t.conf.duration * 1000 * 0.5 + 150)
		document.addEventListener('mouseup', mouseup, false)
	}
	
	this.sync()
	if (this.conf.goInit !== false)
		this.goInit()
}

RollingImagesLite.prototype =
{
	sync: function ()
	{
		this.viewport = this.my('.viewport')
		if (!this.viewport)
			throw new Error('Can`t find viewport for ' + this.mainNode)
		if (!this.viewport.animate)
			throw new Error('Viewport can`t be animated!')
		
		this.points = this.myAll('.point')
		this.buttons = this.myAll('.button')
		this.aPrev = this.my('.prev')
		this.aNext = this.my('.next')
		
		// if syncing when pushed
		clearInterval(this.svInt)
		
		var t = this
		if (this.aPrev)
			this.aPrev.addEventListener('mousedown', this.prevmousedown, false)
		
		if (this.aNext)
			this.aNext.addEventListener('mousedown', this.nextmousedown, false)
		
		for (var i = 0, il = this.buttons.length; i < il; i++)
			this.buttons[i].onmousedown = function (fi) { return function () { t.goToFrame(fi) } } (i)
		
		this.updateNavigation()
	},
	
	goPrev: function () { if (this.current > 0) this.goToFrame(this.current - 1) },
	goNext: function () { if (this.current < this.points.length - 1) this.goToFrame(this.current + 1) },
	my: function (q) { return $(q, this.mainNode) },
	myAll: function (q) { return $$(q, this.mainNode) },
	
	goInit: function ()
	{
		return this.goToFrame(0, 'directJump')
	},
	
	goToFrame: function (n, anim, dur) { return this.points ? this.goToNode(this.points[n || 0], anim, dur) : null },
	
	goToNode: function (node, anim, dur)
	{
		if (!node)
			return null
		
		if (this.mainNode.onjump)
			if (this.mainNode.onjump(node) === false)
				return null
		
		// change number of current node
		for (var i = 0, il = this.points.length; i < il; i++)
			if (this.points[i] == node)
				this.setCurrent(i)
		
		return this.animateTo(node.offsetLeft, node.offsetTop, anim, dur)
	},
	
	animateTo: function (left, top, anim, dur)
	{
		if (this.animation)
			this.animation.stop()
		return this.animation = this.viewport.animate(anim || this.conf.animationType, {scrollLeft: left, scrollTop: top}, dur || this.conf.duration)
	},
	
	jumpTo: function (left, top) { this.viewport.scrollLeft = left; this.viewport.scrollTop = top },
	jumpToFrame: function (n)
	{
		var node = this.points[n]
		if (node)
		{
			this.setCurrent(n)
			this.jumpTo(node.offsetLeft, node.offsetTop)
		}
	},
	
	updateNavigation: function ()
	{
		for (var i = 0, il = this.buttons.length; i < il; i++)
			this.buttons[i].removeClassName('selected-button')
		
		var button = this.buttons[this.current]
		if (button)
			button.addClassName('selected-button')
		
		if (this.aPrev)
		{
			if (this.current > 0)
				this.aPrev.removeClassName('disabled')
			else
				this.aPrev.addClassName('disabled')
		}
		
		if (this.aNext)
		{
			if (this.current < this.points.length - 1)
				this.aNext.removeClassName('disabled')
			else
				this.aNext.addClassName('disabled')
		}
	},
	
	setCurrent: function (num)
	{
    // if (num == this.current)
		//	return
		
		this.current = num
		this.updateNavigation()
		
		var cp = this.points[this.current]
		if (this.onselect)
			this.onselect(cp, this.current)
		
		if (cp && cp.onselect)
			cp.onselect()
	}
}
