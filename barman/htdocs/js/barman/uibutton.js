function UIButton (node, disabledStyle, enabledText, disabledText, clickListener)
{
	this.node = node
	this.conf =
	{
		disabledStyle: disabledStyle,
		enabledText: enabledText,
		disabledText: disabledText,
		clickListener: clickListener
	}
	
	this.setEnabled(true)
}

UIButton.prototype =
{
	setEnabled: function (enabled)
	{
		var node = this.node,
			conf = this.conf
		
		this.enabled = enabled
		if (enabled)
		{
			node.innerHTML = conf.enabledText
			node.removeClassName(conf.disabledStyle)
			node.addEventListener('click', conf.clickListener, false)
		}
		else
		{
			node.innerHTML = conf.disabledText
			node.addClassName(conf.disabledStyle)
			node.removeEventListener('click', conf.clickListener, false)
		}
	}
}
