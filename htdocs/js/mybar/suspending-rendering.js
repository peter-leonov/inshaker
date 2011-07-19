;(function(){

var myName = 'SuspendRenderFrame'

function Me(pNode, callback, supply, amount)
{
	this.pNode = pNode
	this.callback = callback
	this.amount = amount || 4
	this.supply = supply || 800
	
	this.finish = false
}

Me.prototype =
{
	checkout : function()
	{
		var me = this
		
		var t = function()
		{
			var a = me.pNode.offsetHeight + me.pNode.offsetPosition().top
			var b = window.screen.height + window.pageYOffset
			return a - b
		}
		
		while(t() < this.supply)
		{
			var amount = this.amount
			while(amount--)
			{
				this.callback()
			}
		}
	}
}

Me.className = myName
self[myName] = Me

})();