;(function(){

var Me =
{
	initialize: function (detailed, plain)
	{
		this.detailed = detailed
		this.plain = plain
		
		var browsers = this.browsers =
		{
			'Opera':
			{
				rawData: [],
				sum: 0,
				color: "#cc2200",
				colorMiddle: "#cc4422",
				colorEnd: "#cc6644"
			},
			'Opera Mini':
			{
				rawData: [],
				sum: 0,
				color: "#cc4422"
			},
			'Firefox':
			{
				rawData: [],
				sum: 0,
				color: "#ff9900",
				colorMiddle: "#ffbb22",
				colorEnd: "#ffdd44"
			},
			'Chrome':
			{
				rawData: [],
				sum: 0,
				color: "#66cc22",
				colorMiddle: "#88cc44",
				colorEnd: "#aacc66"
			},
			'YaBrowser':
			{
				rawData: [],
				sum: 0,
				color: "#88cc44"
			},
			'Android Browser':
			{
				rawData: [],
				sum: 0,
				color: "#88cc44"
			},
			'Internet Explorer':
			{
				rawData: [],
				sum: 0,
				color: "#4499ff",
				colorMiddle: "#55aaff",
				colorEnd: "#66bbff"
			},
			'Safari':
			{
				rawData: [],
				sum: 0,
				color: "#2255bb"
			}
		}
	},
	
	groupBrowsers: function ()
	{
		var stats = this.detailed.slice(),
			browsers = this.browsers
		
		var sum = stats.pop()
		this.total = sum.total.visits
		
		for (var i = 0, il = stats.length; i < il; i++)
		{
			var stat = stats[i],
				name = stat[0]
			
			if (browsers[name])
			{
				browsers[name].rawData.push([stat[1], stat[2]])
				browsers[name].sum += stat[2]
			}
		}
	},
	
	groupStat: function (browser)
	{
		var statsPointer = {},
			statsArray = [],
			other = 0
		
		for (var i = 0, il = browser.rawData.length; i < il; i++)
		{
			var fullVersion = browser.rawData[i][0],
				stat = browser.rawData[i][1]
			
			var version = +/^\d+\.\d/.exec(fullVersion)
			if (!version)
			{
				other += stat
				continue
			}
			
			if (version in statsPointer)
				statsArray[statsPointer[version]].stat += stat
			else
				statsPointer[version] = statsArray.push({version: version, stat: stat}) - 1
		}
		
		browser.other = other
		browser.byVersion = statsArray.sort(this.sort)
	},
	
	sort: function(a, b){ return b.version - a.version },
	
	sealTail: function (browser)
	{
		var stats = browser.byVersion,
			tail = browser.other,
			total = this.total
		
		function filt (barriere, threshold)
		{
			barriere *= total
			threshold *= total
			
			for (var i = stats.length - 1; i >= 0; i--)
			{
				var stat = stats[i].stat
				if (stat > threshold)
					continue
				
				if (tail + stat > barriere)
					break
				
				tail += stat
				stats.splice(i, 1)
			}
		}
		
		// instead of sorting and cutting the tail
		// try to collect the 1% tail step by step
		filt(0.01, 0.001)
		filt(0.01, 0.0011)
		filt(0.01, 0.0012)
		filt(0.01, 0.0013)
		filt(0.01, 0.0014)
		filt(0.01, 0.0015)
		
		stats.push({version: 'other', stat: tail})
	},
	
	genColors: function (browser, colors)
	{
		var sum = browser.sum,
			colorMiddle = browser.colorMiddle,
			colorEnd = browser.colorEnd,
			color = browser.color,
			stats = browser.byVersion
		
		var statPercent = sum * 0.01,
			length = stats.length,
			i = 0
		
		do
		{
			var howPercent = stats[i].stat / statPercent
			colors.push(color)
		} while (howPercent < 2 && i++ < length-1)
		
		for (i++; i < length-1; i++)
		{
			colors.push(colorMiddle)
		}
		
		colors.push(colorEnd)
	},
	
	getChartDataPlain: function ()
	{
		var plain = this.plain,
			browsers = {},
			total = plain.pop().total.visits,
			infoBrowsers = this.browsers
		
		for (var i = 0, il = plain.length; i < il; i++)
		{
			var name = plain[i][0],
				stat = plain[i][1]
			browsers[name] = stat
		}
		
		var other =
			  total
			- browsers.Opera
			- browsers['Opera Mini']
			- browsers.Firefox
			- browsers.Chrome
			- browsers.YaBrowser
			- browsers['Android Browser']
			- browsers['Internet Explorer']
			- browsers.Safari
		
		var data =
		[
			['Opera', browsers.Opera + browsers['Opera Mini']],
			['Firefox', browsers.Firefox],
			['Chorme', browsers.Chrome + browsers.YaBrowser + browsers['Android Browser']],
			['Internet Explorer', browsers['Internet Explorer']],
			['Safari', browsers.Safari],
			['Other', other]
		]
		
		var colors =
		[
			infoBrowsers.Opera.color,
			infoBrowsers.Firefox.color,
			infoBrowsers.Chrome.color,
			infoBrowsers['Internet Explorer'].color,
			infoBrowsers.Safari.color,
			'#555555'
		]
		
		return {data: data, colors: colors}
	},
	
	getChartData: function ()
	{
		var browsers = this.browsers,
			data = [],
			colors = [],
			known = 0
		
		this.groupBrowsers()
		
		this.groupStat(browsers.Opera)
		this.groupStat(browsers.Firefox)
		this.groupStat(browsers.Chrome)
		this.groupStat(browsers['Internet Explorer'])
		
		this.sealTail(browsers.Opera)
		this.sealTail(browsers.Firefox)
		this.sealTail(browsers.Chrome)
		
		
		for (var browserName in browsers)
		{
			var browser = browsers[browserName],
				stats = browser.byVersion
			
			if (stats)
			{
				var length = stats.length
				for (var i = 0, il = length-1; i < il; i++)
				{
					var stat = stats[i]
					data.push([browserName + ' ' + stat.version, stat.stat])
				}
				
				var stat = stats[length-1]
				data.push([stat.version + ' ' + browserName, stat.stat])
				
				this.genColors(browser, colors)
			}
			else
			{
				data.push([browserName, browser.sum])
				colors.push(browser.color)
			}
			
			known += browser.sum
		}
		
		data.push(['Unknown', this.total - known])
		colors.push('#555555')
		
		return {data: data, colors: colors}
	},
	
	getTopChart: function ()
	{
		var detailed = this.detailed.slice()
		
		var tableTotal = detailed.pop().total.visits
		var countedTotal = 0
		
		var groupedByVersion = {}
		for (var i = 0, il = detailed.length; i < il; i++)
		{
			var row = detailed[i]
			
			var browserName = row[0],
				fullVersion = row[1],
				hits = row[2]
			
			// calculate subtotal to check the match with the table total
			countedTotal += hits
			
			// take first one or two digits
			var meaningfulVersion = +(/^\d+(?:\.\d)?/.exec(fullVersion)) || 0
			
			var signature = meaningfulVersion ? browserName + ' ' + meaningfulVersion : browserName
			if (signature in groupedByVersion)
				groupedByVersion[signature].hits += hits
			else
				groupedByVersion[signature] =
				{
					signature: signature, // preserve for next step
					name: browserName,
					version: meaningfulVersion,
					hits: hits
				}
		}
		
		// convert hash values to array
		var listOfVersions = []
		for (var k in groupedByVersion)
			listOfVersions.push(groupedByVersion[k])
		
		// sort by hist ASC
		listOfVersions.sort(function (a, b) { return b.hits - a.hits })
		
		// cut the tail
		var tail = 0,
			barriere = tableTotal * 0.0005
		for (var i = listOfVersions.length - 1; i >= 0; i--)
		{
			var hits = listOfVersions[i].hits
			if (hits >= barriere)
				break
			
			tail += hits
		}
		listOfVersions.length = i + 1 // i is the last OK index
		
		// add the browsers not count to match the table total
		listOfVersions.push
		({
			signature: 'The Rest',
			name: 'The Rest',
			version: 0.0,
			hits: tableTotal - (countedTotal - tail)
		})
		
		// prepare for charts and paint with color
		var colorByName =
		{
			'Opera': "#cc2200",
			'Firefox': "#ff9900",
			'Chrome': "#66cc22",
			'Internet Explorer': "#4499ff",
			'Safari': "#2255bb",
			'Safari (in-app)': "#2255bb",
			'YaBrowser': "#88cc44",
			'Opera Mini': "#cc6644",
			'Android Browser': "#aacc66",
			'The Rest': '#555555'
		}
		
		var data = [],
			colors = []
		
		for (var i = 0, il = listOfVersions.length; i < il; i++)
		{
			var browser = listOfVersions[i]
			
			data.push([browser.signature, browser.hits])
			colors.push(colorByName[browser.name] || '#000000')
		}
		
		return {data: data, colors: colors}
	}
}

Me.className = 'BrowsersStats'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/stats/browsers.json" -->, <!--# include virtual="/db/stats/browsers-plain.json" -->)

})();