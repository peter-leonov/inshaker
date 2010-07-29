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
			var parts = substr.split(/ +/)
			
			var values = this.searchInSet(this.ingredients, parts, count)
			res = cache[substr] = this.renderRows(values, parts, this.names)
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
	
	searchInSet: function (set, parts, count)
	{
		parts = parts.slice()
		// first search for the most lengthy part
		parts.sort(this.sortByLength)
		
		// lightweight rex for initial filtering
		var filter = new RegExp('(?:^|[ \\-])' + RegExp.escape(parts[0]), 'i')
		
		var rexes = []
		for (var i = 0, il = parts.length; i < il; i++)
			rexes[i] = new RegExp('(^|.*[ \\-])(' + RegExp.escape(parts[i]) + '[^ \\-]*)', 'i')
		
		
		var rows = [], rl = rexes.length
		set: for (var i = 0, il = set.length; i < il; i++)
		{
			var v = set[i]
			
			if (!filter.test(v))
				continue set
			
			var weight = 0
			for (var j = 0; j < rl; j++)
			{
				var m = rexes[j].exec(v)
				if (!m)
					continue set
				
				// weight += (10000 * m[2].length) + (100 * m[1].length) + v.length
				weight += (10000 * m[2].length) + m[1].length
			}
			
			rows.push([weight, v])
		}
		
		rows.sort(this.sortByWeight)
		
		var res = []
		for (var i = 0, il = rows.length; i < il && i < count; i++)
			res[i] = rows[i][1]
		
		return res
	},
	
	renderRows: function (values, parts, names)
	{
		var res = []
		
		for (var i = 0, il = values.length; i < il; i++)
		{
			var v = values[i]
			
			var text = N('span')
			// if (m[1])
			// 	text.appendChild(T(m[1]))
			// // m[2] is used instead of substr because m[2] != substr when searching with "i"
			// text.appendChild(Nct('span', 'substr', m[3]))
			// if (m[3])
			// 	text.appendChild(T(m[4] + m[5]))
			
			text.appendChild(T(v))
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
	
	sortByWeight: function (a, b) { return a[0] - b[0] },
	sortByLength: function (a, b) { return b.length - a.length }
}

Me.className = myName
self[Me.className] = Me

})();