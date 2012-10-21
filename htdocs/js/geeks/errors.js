;(function(){

eval(NodesShortcut.include())

var Me =
{
	initialize: function (data)
	{
		this.data = data
		this.files = {}
		this.index = {}
	},
	
	getOccurrencesCount: function (string, sub)
	{
		var count = 0,
			pos = string.indexOf(sub)
		
		while ( pos != -1 ) {
			count++
			pos = string.indexOf(sub, pos+1)
		}
		
		return count
	},
	
	indexedErrors: function ()
	{
		var data = this.data,
			groups = {},
			groupsArr = []
		
		var total = data.pop().total.uniqueEvents
		
		for (var i = 0, il = data.length; i < il; i++)
		{
			var msg = data[i][0],
				tmp2 = msg.split(' at '),
				type = tmp2[0],
				fileWithLine = tmp2[1],
				tmp = fileWithLine.split(':'),
				file = tmp[0],
				line = tmp[1]
			
			if (!file || !file.indexOf('/') == 0)
				continue
			
			if (file.split('.').pop() == "html")
				continue
			
			var error =
			{
				file: file,
				line: line,
				browsers: [[data[i][1], data[i][2]]],
				uniqueEvents: data[i][3],
				eventVale: data[i][4]
			}
			
			if (!groups[type])
			{
				var group =
				{
					type: type,
					errors: [],
					sumUniqueEvents: 0
				}
				var index = groupsArr.push(group) - 1
				groups[type] = index
			}
			
			var index = groups[type],
				errors = groupsArr[index].errors
			
			if (errors.length)
			{
				for (var j = 0, jl = errors.length; j < jl; j++)
				{
					var item = errors[j]
					
					if (item.file == error.file && item.line == error.line)
					{
						item.browsers.push([error.browsers[0][0], error.browsers[0][1]])
						item.uniqueEvents += error.uniqueEvents
						item.eventVale += error.eventVale
						error = 0
						break
					}
				}
			}
			
			if (error != 0)
				errors.push(error)
			
			groupsArr[index].sumUniqueEvents += data[i][3]
		}
		
		this.groups = groupsArr.sort(function(a, b){ return b.sumUniqueEvents - a.sumUniqueEvents })
	},
	
	drawGroups: function (node)
	{
		this.indexedErrors()
		
		var groups = this.groups,
			me = this
		
		for (var i = 0, il = groups.length; i < il; i++)
		{
			var group = groups[i]
			
			var div = Nc('div', 'type')
			node.appendChild(div)
			
			var p = Nct('p', '', group.type + ' (' + group.sumUniqueEvents + ')')
			p.setAttribute('data-index', i)
			div.appendChild(p)
			
			p.addEventListener('click', function(e){ me.drawErrors(e.target) })
			
			var ul = N('ul')
			ul.classList.add('hidden')
			div.appendChild(ul)
			
			group.ul = ul
		}
	},
}

Me.className = 'TopErrors'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/stats/errors.json" -->)

})();