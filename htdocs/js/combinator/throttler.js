;(function(){

var myName = 'Throttler'

function Me (callback, delay, timeout)
{
	this.callback = callback
	this.delay = delay
	this.timeout = timeout
	this.delayTimer = 0
	this.timeoutTimer = 0
	
	var me = this
	this.timeoutCallback = function () { me.fire() }
	this.timerCallback = function () { me.fire() }
}

Me.prototype =
{
	call: function ()
	{
		clearTimeout(this.delayTimer)
		this.delayTimer = setTimeout(this.timerCallback, this.delay)
		
		if (!this.timeoutTimer)
			this.timeoutTimer = setTimeout(this.timeoutCallback, this.timeout)
	},
	
	fire: function ()
	{
		var delayTimer = this.delayTimer
		if (delayTimer)
		{
			clearTimeout(delayTimer)
			this.delayTimer = 0
		}
		
		var timeoutTimer = this.timeoutTimer
		if (timeoutTimer)
		{
			clearTimeout(timeoutTimer)
			this.timeoutTimer = 0
		}
		
		// trick to avoid this.callback.call(window)
		var callback = this.callback
		callback()
	}
}

Me.className = myName
self[myName] = Me

})();
