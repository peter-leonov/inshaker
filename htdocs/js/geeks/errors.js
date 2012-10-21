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
	
	findDateVar: function (content)
	{
		var parser = /<!--\#\s*config\s+timefmt="(%Y.%m)"\s*-->/
		
		var timefnt = parser.exec(content)
		
		if (!timefnt)
			return content
		
		var format = timefnt[1],
			date = new Date()
		
		var dateLocal = format.replace(/(\%\w)/g, function(str)
		{
			var res
			switch (str)
			{
				case '%Y':
					res = date.getFullYear()
					break;
				
				case '%m':
					res = '09' //res = ('0' + (date.getMonth()+1)).slice(-2) // not set branding 10 month
					break;
				
				default:
					res = str
			}
			
			return res
		})
		
		content = content.replace(/<!--\#\s*include\s+virtual="(.*?)(\$date_local)(.*?)"\s*-->/g,
			'<!--' + String.fromCharCode(35) + ' include virtual="$1' + dateLocal + '$3" -->')
		
		return content
	},
	
	parseFile: function (file)
	{
		if (this.index[file])
			return
		
		var content = Request.get('/ssioff' + file, null, null, true).responseText
		
		content = this.findDateVar(content)
		
		var parser = /<!--\#\s*include\s+virtual="(.*?)"\s*-->/g
		
		var currentIndex = this.index[file] = {includes:[]}
		
		var include
		while (include = parser.exec(content))
		{
			var includeFile = include[1]
			
			if (includeFile.indexOf('/') == -1)
				includeFile = file.substring(0, file.lastIndexOf("/")+1) + includeFile
			
			currentIndex.includes.push(
				{
					include: includeFile,
					line: this.getOccurrencesCount(content.substr(0, include.index), '\n')
				})
			
			this.parseFile(includeFile)
		}
		
		currentIndex.content = content
		var fileByLines = currentIndex.fileByLines = content.split('\n')
		currentIndex.lines = fileByLines.length
		
		this.getRecursiveNumLines(file)
		this.calcEdgesIncludes(file)
	},
	
	getRecursiveNumLines: function (path)
	{
		var file = this.index[path],
			includes = file.includes,
			lines = 0
		
		if (includes.length)
		{
			for (var i = 0, il = includes.length; i < il; i++)
			{
				lines += this.getRecursiveNumLines(includes[i].include) - 1
			}
		}
		
		lines += file.lines
		
		return file.fullLines = lines
	},
	
	calcEdgesIncludes: function (path)
	{
		var file = this.index[path],
			includes = file.includes,
			prevEnd = 0,
			prevLine = 0
		
		if (includes.length)
		{
			for (var i = 0, il = includes.length; i < il; i++)
			{
				var include = includes[i]
				
				include.startFull = prevEnd + include.line - prevLine
				prevEnd = include.endFull = include.startFull + this.index[include.include].fullLines - 1
				
				prevLine = include.line
				
				this.calcEdgesIncludes(include.include)
			}
		}
	},
	
	getFileLine: function (path, line)
	{
		this.parseFile(path)
		
		line--
		
		var file = this.index[path],
			collectLine = 0
		
		if (!file.includes.length)
			return { path: path, line: line }
		
		for (var i = 0, il = file.includes.length; i < il; i++)
		{
			var include = file.includes[i]
			
			if (line < include.startFull)
				return { path: path, line: line - collectLine }
			
			if (line <= include.endFull)
				return this.getFileLine(include.include, line - include.startFull + 1)
			
			collectLine += this.index[include.include].fullLines - 1
		}
		
		return { path: path, line: line - collectLine }
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
	
	getLinesFile: function (file, line)
	{
		var source = this.index[file].fileByLines
		
		var linesBefore = source.slice(line - 4, line),
			linesAfter = source.slice(line+1, line + 5),
			lineError = source[line]
		
		return [
			linesBefore.join('\n'),
			lineError,
			linesAfter.join('\n')
		]
	},
	
	patterns:
	{
		commonKeywords:
		{
			pattern: /\b(?:as|break|case|catch|continue|delete|do|else|eval|finally|for|if|in|is|item|instanceof|return|switch|this|throw|try|typeof|void|while|write|with)\b/g,
			alias: 'kw1'
		},
		langKeywords:
		{
			pattern: /\b(?:class|const|default|debugger|export|extends|false|function|import|namespace|new|null|package|private|protected|public|super|true|use|var)\b/g,
			alias: 'kw2'
		},
		windowKeywords:
		{
			pattern: /\b(?:alert|back|blur|close|confirm|focus|forward|home|navigate|onblur|onerror|onfocus|onload|onmove|onresize|onunload|open|print|prompt|scroll|status|stop)\b/g,
			alias: 'kw3'
		},
	
		'slashComments':
		{
			pattern: /(?:^|[^\\])\/\/.*$/gm,
			alias: 'co1'
		},
		'multiComments':
		{
			pattern: /\/\*[\s\S]*?\*\//gm,
			alias: 'co2'
		},
		'strings':
		{
			pattern: /'[^'\\\r\n]*(?:\\.[^'\\\r\n]*)*'|"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/gm,
			alias: 'st0'
		},
		'methodCalls':
		{
			pattern: /\.([\w]+)\s*\(/gm,
			alias: 'me0'
		},
		'brackets':
		{
			pattern: /\{|\}|\(|\)|\[|\]/g,
			alias: 'br0'
		},
		'numbers':
		{
			pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][-+]?[0-9]+)?|0x[A-F0-9]+)\b/gi,
			alias: 'nu0'
		},
		'regex':
		{
			alias: 're0'
		},
		'symbols':
		{
			pattern: /\+|-|\*|\/|%|!|@|&|\||\^|\<|\>|=|,|\.|;|\?|:/g,
			alias: 'sy0'
		}
	},
	
	delimToRegExp: function(beg, esc, end, mod, suffix)
	{
		beg = this.escapeRegExp(beg)
		if (esc) { esc = this.escapeRegExp(esc) }
		end = (end) ? this.escapeRegExp(end) : beg
		
		var pat = (esc) ? beg+"[^"+end+esc+'\\n]*(?:'+esc+'.[^'+end+esc+'\\n]*)*'+end : beg+"[^"+end+'\\n]*'+end
		
		return new RegExp(pat+(suffix || ''), mod || '')
	},
	
	escapeRegExp: function(str){
		return String(str).replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1')
	}
}

Me.className = 'TopErrors'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/stats/errors.json" -->)

})();