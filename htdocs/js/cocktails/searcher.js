;(function(){

var myName = 'IngredientsSearcher'

function Me (ingredients, names)
{
	this.ingredients = ingredients || []
	this.names = names || {}
	this.cache = {}
	this.withouts = {}
}

eval(NodesShortcut.include())

Me.prototype =
{
	search: function (substr, count)
	{
		var cache = this.cache
		
		substr = substr.trim()
		if (substr === '')
			return []
		
		var res
		if (!(res = cache[substr]))
		{
			var matches = this.searchInSet(this.ingredients, substr)
			res = cache[substr] = this.renderMatches(matches, this.names, substr, count)
		}
		
		var withouts = this.withouts,
			filtered = []
		
		for (var i = 0, il = res.length; i < il; i ++)
		{
			var row = res[i]
			if (!withouts[row[0]])
				filtered.push(row)
		}
		
		return filtered
	},
	
	searchInSet: function (set, substr)
	{
		var rex = new RegExp('(^|.*[ \\-])((' + RegExp.escape(substr) + ')(.*?))([ \\-].*|$)', 'i'),
			matches = []
		
		for (var i = 0, il = set.length; i < il; i++)
		{
			var m, v = set[i]
			if (m = rex.exec(v))
			{
				// log(m)
				// matches.push([(10000 * m[2].length) + (100 * m[1].length) + v.length, v, m])
				// matches.push([1000 * m[2].length + v.length, v, m])
				matches.push([m[2].length, v, m])
			}
		}
		
		matches.sort(this.sortByWeight)
		
		return matches
	},
	
	renderMatches: function (matches, names, substr, count)
	{
		var res = []
		
		for (var i = 0, il = matches.length; i < il && count-- > 0; i++)
		{
			var v = matches[i], m = v[2]
			
			var text = N('span')
			if (m[1])
				text.appendChild(T(m[1]))
			// m[2] is used instead of substr because m[2] != substr when searching with "i"
			text.appendChild(Nct('span', 'substr', m[3]))
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
}

Me.className = myName
self[Me.className] = Me

})();