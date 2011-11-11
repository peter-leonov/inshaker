;(function(){

function Me (parts)
{
	this.parts = parts || {}
}

Me.prototype =
{
	add: function (b)
	{
		var mys = this.parts,
			yours = b.parts
		
		for (var k in yours)
		{
			var your = yours[k]
			
			var my = mys[k]
			if (my)
			{
				my.amount += your.amount
				continue
			}
			
			// “deep copy” your part
			mys[k] =
			{
				good: your.good,
				amount: your.amount
			}
		}
	},
	
	toArray: function () { return Object.values(this.parts) }
}

Me.className = 'Parts'
Cocktail[Me.className] = Me

})();
