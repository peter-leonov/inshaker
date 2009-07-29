;(function(){

var myName = 'IngredientsSearcher', Me = self[myName] = Class(myName)

eval(NodesShortcut())

Me.prototype.extend
({
	initialize: function ()
	{
		this.ingredients = []
		this.names = []
		this.cache = {}
	},
	
	search: function (substr, count)
	{
		var cache = this.cache, res
		
		substr = substr.replace(/^\s+|\s+$/g, '') // trim
		if (substr === '')
			res = []
		else
		{
			if (!(res = cache[substr]))
				res = cache[substr] = this.searchInSet(this.ingredients, substr, count)
		}
		
		return res
	},
	
	searchInSet: function (set, substr, count)
	{
		var rex = new RegExp('(^|.*\\s)(' + substr + ')(.*)', 'i'),
			res = []
		
		for (var i = 0, il = set.length; i < il && count > 0; i++)
		{
			var m, v = set[i]
			if (m = rex.exec(v))
			{
				var text = N('span')
				text.appendChild(T(m[1]))
				// m[2] is used instead of substr because m[2] != substr when searching with "i"
				text.appendChild(N('span', 'substr', m[2]))
				text.appendChild(T(m[3]))
				res.push([v, text])
				count--
			}
		}
		
		return res
	}
})

})();