;(function(){

var Me =
{
	hashOfAryIndexBy: function (src, f)
	{
		var hash = {}
		for (var i = 0, il = src.length; i < il; i++)
		{
			var v = src[i]
			
			var key = f(v)
			var ary = hash[key]
			if (ary)
				ary.push(v)
			else
				hash[key] = [v]
		}
		return hash
	},
	
	hashIndex: function (src)
	{
		var hash = {}
		for (var i = 0, il = src.length; i < il; i++)
			hash[src[i]] = true
		return hash
	},
	
	hashIndexKey: function (src, key)
	{
		var hash = {}
		for (var i = 0, il = src.length; i < il; i++)
		{
			var v = src[i]
			hash[v[key]] = v
		}
		return hash
	}
}

Me.module = {}
Me.module.staticMethods =
{
	bakePrepare: function (name, prepare)
	{
		var real = this[name]
		this[name] = function ()
		{
			this[name] = real
			prepare.apply(this)
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
	},
	
	bake: function (data)
	{
		if (!data)
			return data
		
		var instance = data._instance
		if (!instance)
			instance = data._instance = new this(data)
		return instance
	},
	
	bakeAry: function (ary)
	{
		for (var i = 0, il = ary.length; i < il; i++)
		{
			var data = ary[i]
			
			var instance = data._instance
			if (!instance)
				instance = data._instance = new this(data)
			
			ary[i] = instance
		}
		
		return ary
	}
}

Me.className = 'DB'
self[Me.className] = Me

})();