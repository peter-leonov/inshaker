;(function(){

var myName = 'IngredientsSearcher'

function Me (ingredients, names, favorites)
{
	this.ingredients = ingredients || []
	this.names = names || {}
	this.cache = {}
	this.duplicates = {}
	this.favorites = favorites || {}
}

eval(NodesShortcut.include())

Me.prototype =
{
	search: function (substr, count)
	{
		substr = ('' + substr).trim()
		if (substr === '')
			return []
		
		var parts = substr.split(/ +/)
		
		var cache = this.cache
		var rows = cache[substr]
		if (!rows)
			rows = cache[substr] = this.searchInSet(this.ingredients, parts)
		
		var duplicates = this.duplicates, favorites = this.favorites,
			filtered = []
		
		for (var i = 0, il = rows.length; i < il; i ++)
		{
			var row = rows[i]
			if (duplicates[row[1]])
				row[0] *= 100000
			else if (favorites[row[1]])
				row[0] *= 0.000001
		}
		
		rows.sort(this.sortByWeight)
		
		var res = []
		for (var i = 0, il = rows.length; i < il && i < count; i++)
			res[i] = rows[i][1]
		
		return this.renderRows(res, parts, this.names, this.duplicates)
	},
	
	searchInSet: function (set, parts)
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
		
		return rows
	},
	
	renderRows: function (values, parts, names, duplicates)
	{
		var res = []
		
		var rexes = []
		for (var i = 0, il = parts.length; i < il; i++)
		{
			var p = parts[i]
			var rex = rexes[i] = new RegExp('(?:^|.*[ \\-])(' + RegExp.escape(p) + '[^ \\-]*)', 'gi')
			rex.part = p
		}
		
		for (var i = 0, il = values.length; i < il; i++)
		{
			var v = values[i]
			
			
			// find all sun-matches
			var matches = []
			for (var j = 0, jl = rexes.length; j < jl; j++)
			{
				var rex = rexes[j]
				
				rex.lastIndex = 0
				var m = rex.exec(v)
				if (!m)
					continue
				
				var begin = rex.lastIndex - m[1].length
				matches.push([begin, begin + rex.part.length])
			}
			
			
			// sort sub-matches so as the nearest left and biggest will be first
			function byPositionAndLength (a, b)
			{
				return a[0] - b[0] || (b[1] - b[0]) - (a[1] - a[0])
			}
			
			matches.sort(byPositionAndLength)
			
			
			// filt-out overlays
			var last = 0, filtered = []
			for (var j = 0, jl = matches.length; j < jl; j++)
			{
				var m = matches[j]
				if (m[0] < last)
					continue
				
				filtered.push(m)
				last = m[1]
			}
			matches = filtered
			
			
			// split value into row of nodes
			var text = N('span')
			
			var pos = 0
			for (var j = 0, jl = matches.length; j < jl; j++)
			{
				var m = matches[j],
					begin = m[0],
					end = m[1]
				
				if (pos != begin)
					text.appendChild(T(v.substring(pos, begin)))
				
				text.appendChild(Nct('span', 'substr', v.substring(begin, end)))
				
				pos = end
			}
			
			if (pos < v.length)
				text.appendChild(T(v.substring(pos)))
			
			var value = v
			
			var name = names[v]
			if (name)
			{
				text.appendChild(T(' — это «' + name + '»'))
				value = name
			}
			
			var duplicate = duplicates[v]
			if (duplicate)
			{
				if (duplicate === true)
					text.appendChild(Nct('span', 'hint', ' (уже выбрано)'))
				else
					text.appendChild(Nct('span', 'hint', ' (уже в группе «' + duplicate + '»)'))
				
				text.className += ' duplicate'
			}
			
			res[i] = [value, text]
		}
		
		return res
	},
	
	setDuplicates: function (duplicates)
	{
		this.duplicates = duplicates
	},
	
	sortByWeight: function (a, b) { return a[0] - b[0] },
	sortByLength: function (a, b) { return b.length - a.length }
}

Me.className = myName
self[Me.className] = Me

})();