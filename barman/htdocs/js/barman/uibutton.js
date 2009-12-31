function UIButton (e, disabledStyle, enabledText, disabledText, clickListener)
{
	this.e = e
	
	this.setEnabled = function (enabled)
	{
		this.enabled = enabled
		if (!enabled)
		{
			this.e.innerHTML = disabledText
			this.e.addClassName(disabledStyle)
			this.e.removeEventListener('click', clickListener, false)
		}
		else
		{
			this.e.innerHTML = enabledText
			this.e.remClassName(disabledStyle)
			this.e.addEventListener('click', clickListener, false)
		}
	}
	
	this.setEnabled(true)
}
