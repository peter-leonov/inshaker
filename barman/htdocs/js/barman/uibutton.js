function UIButton (node, onclick)
{
	this.node = node
	
	var me = this
	this.conf =
	{
		onclick: function (e) { me.onclick(e) }
	}
	
	this.setState(true)
}

UIButton.prototype =
{
	onaction: function () {},
	
	onclick: function (e)
	{
		this.onaction(e)
	},
	
	setState: function (enabled)
	{
		enabled = !!enabled
		if (this.enabled == enabled)
			return
		this.enabled = enabled
		
		var node = this.node,
			conf = this.conf
		
		if (enabled)
		{
			node.classList.remove('active')
			node.addEventListener('click', conf.onclick, false)
		}
		else
		{
			node.classList.add('active')
			node.removeEventListener('click', conf.onclick, false)
		}
	},
	
	enable: function () { this.setState(true) },
	disable: function () { this.setState(false) }
}
