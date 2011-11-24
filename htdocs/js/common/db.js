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
	
	hashOfAryIndexByKey: function (src, p)
	{
		var hash = {}
		for (var i = 0, il = src.length; i < il; i++)
		{
			var v = src[i]
			
			var key = v[p]
			var ary = hash[key]
			if (ary)
				ary.push(v)
			else
				hash[key] = [v]
		}
		return hash
	},
	
	hashOfAryIndexAryBy: function (src, f)
	{
		var hash = {}
		for (var i = 0, il = src.length; i < il; i++)
		{
			var v = src[i]
			
			var keys = f(v)
			
			for (var j = 0, jl = keys.length; j < jl; j++)
			{
				var key = keys[j]
				
				var ary = hash[key]
				if (ary)
					ary.push(v)
				else
					hash[key] = [v]
			}
		}
		return hash
	},
	
	hashOfAryIndexByAryKey: function (src, key)
	{
		var hash = {}
		for (var i = 0, il = src.length; i < il; i++)
		{
			var item = src[i]
			
			var ary = item[key]
			for (var j = 0, jl = ary.length; j < jl; j++)
			{
				var v = ary[j]
				var a = hash[v]
				if (a)
					a.push(item)
				else
					hash[v] = [item]
			}
		}
		return hash
	},
	
	hashIndexByAryKey: function (src, key)
	{
		var hash = {}
		for (var i = 0, il = src.length; i < il; i++)
		{
			var item = src[i]
			
			var ary = item[key]
			for (var j = 0, jl = ary.length; j < jl; j++)
				hash[ary[j]] = item
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
	},
	
	hashIndexBy: function (src, f)
	{
		var hash = {}
		for (var i = 0, il = src.length; i < il; i++)
		{
			var v = src[i]
			hash[f(v)] = v
		}
		return hash
	},
	
	conjunction: function (arys)
	{
		var length = arys.length
		if (length == 0)
			return []
		else if (length == 1)
			return arys[0].slice()
		
		var seen = []
		for (var i = 0; i < length; i++)
		{
			var items = arys[i]
			for (var j = 0, jl = items.length; j < jl; j++)
			{
				var id = items[j]._oid
				var times = seen[id]
				if (times)
					seen[id] = times + 1
				else
					seen[id] = 1
			}
		}
		
		var first = arys[0], res = []
		for (var i = 0, il = first.length; i < il; i++)
		{
			var item = first[i]
			// if seen in all the arys
			if (seen[item._oid] == length)
				res.push(item)
		}
		
		return res
	},
	
	disjunction: function (arys)
	{
		var length = arys.length
		if (length == 0)
			return []
		else if (length == 1)
			return arys[0].slice()
		
		var res = [], seen = []
		for (var i = 0; i < length; i++)
		{
			var items = arys[i]
			for (var j = 0, jl = items.length; j < jl; j++)
			{
				var item = items[j],
					id = item._oid
				if (seen[id])
					continue
				seen[id] = true
				res.push(item)
			}
		}
		
		// res.sort(function (a, b) { return a._oid - b._oid })
		
		return res
	}
}

Me.module = {}
Me.module.staticMethods =
{
	bindPrepare: function (name, prepare)
	{
		var real = this[name]
		this[name] = function ()
		{
			this[name] = real
			prepare.apply(this)
			return real.apply(this, arguments)
		}
	},
	
	findAndBindPrepares: function ()
	{
		for (var k in this)
		{
			var prepare = this[k + 'Prepare']
			if (!prepare)
				continue
			this.bindPrepare(k, prepare)
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