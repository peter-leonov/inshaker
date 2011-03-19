;(function(){

var myName = 'SuspendRenderFrame'

function Me(pNode, arr, render, supply, amount)
{
	this.pNode = pNode
	this.arr = arr.slice().reverse()
	this.render = render
	this.amount = amount || 4
	this.supply = supply || 800
	
	this.finish = false
}

Me.prototype =
{
	checkout : function()
	{
		if(this.finish)
			return false
		
		var me = this

		var t = function()
		{
			var a = me.pNode.offsetHeight + me.pNode.offsetPosition().top
			var b = window.screen.height + window.pageYOffset
			return a - b
		}
		
		while(!this.finish && t() < this.supply)
		{
			var df = document.createDocumentFragment()
			var amount = this.amount
			while(amount--)
			{
				var el = this.arr.pop()
				if(!el)
				{
					this.finish = true
					break
				}
				df.appendChild(this.render(el))
			}
			this.pNode.appendChild(df)
		}
		
		if(this.arr.length)
		{
			this.pNode.addClassName('loading')
		}
		else
		{
			this.pNode.removeClassName('loading')
			this.finish = true
			return false
			
		}
		
		return true
	}
}

Me.className = myName
self[myName] = Me

})();