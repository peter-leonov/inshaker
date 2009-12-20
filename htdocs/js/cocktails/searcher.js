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
		var rex = new RegExp('(^|.*\\s)((' + substr + ')(.*?))(\\s.*|$)', 'i'),
			matches = [], res = []
		
		for (var i = 0, il = set.length; i < il; i++)
		{
			var m, v = set[i]
			if (m = rex.exec(v))
			{
				// log(m)
				// matches.push([(10000 * m[2].length) + (100 * m[1].length) + v.length, v, m])
				matches.push([m[2].length, v, m])
			}
		}
		
		matches = matches.sort(this.sortByWeight)
		
		for (var i = 0, il = matches.length; i < il && count-- > 0; i++)
		{
			var v = matches[i], m = v[2]
			
			var text = N('span')
			if (m[1])
				text.appendChild(T(m[1]))
			// m[2] is used instead of substr because m[2] != substr when searching with "i"
			text.appendChild(N('span', 'substr', m[3]))
			if (m[3])
				text.appendChild(T(m[4] + m[5]))
			
			v = v[1]
			var name = names[v]
			if (name)
			{
				text.appendChild(T(' — это «' + name + '»'))
				v = name
			}
			
			res[i] = [v, text]
		}
		
		return res
	},
	
	sortByWeight: function (a, b) { return a[0] - b[0] }
})

})();