;(function(){

var Me =
{
	bakePrepare: function (name, prepare)
	{
		var real = this[name]
		this[name] = function ()
		{
			this[name] = real
			prepare.apply(this, arguments)
			return real.apply(this, arguments)
		}
	},
	
	findAndBakePrepares: function ()
	{
		for (var k in this)
		{
			var prepare = this[k + 'Prepare']
			if (!prepare)
				continue
			this.bakePrepare(k, prepare)
		}
	}
}

Me.className = 'DB'
self[Me.className] = Me

})();