;(function(){

var myName = 'IngredientsSearcher', Me = self[myName] = Class(myName)

eval(NodesShortcut())

Me.prototype.extend
({
	initialize: function (ingredients, names)
	{
		this.ingredients = ingredients || []
		this.names = names || {}
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
				res = cache[substr] = this.searchInSet(this.ingredients, this.names, substr, count)
		}
		
		return res
	},
	
	searchInSet: function (set, names, substr, count)
	{
		var rex = new RegExp('(^|.*\\s)(' + substr + ')(.*)', 'i'),
			res = []
		
		for (var i = 0, il = set.length; i < il && count > 0; i++)
		{
			var m, name, v = set[i]
			if (m = rex.exec(v))
			{
				var text = N('span')
				text.appendChild(T(m[1]))
				// m[2] is used instead of substr because m[2] != substr when searching with "i"
				text.appendChild(N('span', 'substr', m[2]))
				text.appendChild(T(m[3]))
				var name = names[v]
				if (name)
				{
					text.appendChild(T(' — это «' + name + '»'))
					v = name
				}
				res.push([v, text])
				count--
			}
		}
		
		return res
	}
})

})();