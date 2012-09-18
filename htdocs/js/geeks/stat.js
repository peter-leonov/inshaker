;(function(){

var Me =
{
	initialize: function (data, plain)
	{
		this.data = data
		this.plain = plain
		
		var browsers = this.browsers =
		{
			'Opera':
			{
				rawData: [],
				sum: 0,
				color: "#cc0000",
				colorMiddle: "#cc5926",
				colorEnd: "#cc7733"
			},
			'Firefox':
			{
				rawData: [],
				sum: 0,
				color: "#ff9900",
				colorMiddle: "#ffad10",
				colorEnd: "#ffee44"
			},
			'Chrome':
			{
				rawData: [],
				sum: 0,
				color: "#00cc00",
				colorMiddle: "#44cc33",
				colorEnd: "#88cc66"
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
				color: "#0055bb"
			},
			'Opera Mini':
			{
				rawData: [],
				sum: 0,
				color: "#777777"
			},
			'Android Browser':
			{
				rawData: [],
				sum: 0,
				color: "#888888"
			}
		}
		
		this.groupBrowsers()
		
		this.groupStat(browsers.Opera)
		this.groupStat(browsers.Firefox)
		this.groupStat(browsers.Chrome)
		this.groupStat(browsers['Internet Explorer'])
		
		this.sealTail(browsers.Opera)
		this.sealTail(browsers.Firefox)
		this.sealTail(browsers.Chrome)
	},
	
	groupBrowsers: function ()
	{
		var stats = this.data,
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
			versionTemplate = /^\d+\.\d/,
			other = 0
		
		for (var i = 0, il = browser.rawData.length; i < il; i++)
		{
			var fullVersion = browser.rawData[i][0],
				stat = browser.rawData[i][1],
				version = +versionTemplate.exec(fullVersion)
			
			if (version)
				if (!(version in statsPointer))
					statsPointer[version] = statsArray.push({version: version, stat: stat}) - 1
				else
					statsArray[statsPointer[version]].stat += stat
			else
				other += stat
		}
		
		browser.other = other
		browser.byVersion = statsArray.sort(this.sort)
	},
	
	sort: function(a, b){ return b.version - a.version },
	
	sealTail: function (browser)
	{
		var stats = browser.byVersion,
			tail = 0,
			halfPercent = this.total * 0.005,
			length = stats.length-1
		
		while (tail + stats[length].stat < halfPercent)
		{
			tail += stats[length].stat
			stats.pop()
			length--
		}
		
		browser.other += tail
		stats.push({version: 'other', stat: browser.other})
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
		
		var other = total - browsers.Opera - browsers.Firefox - browsers['Internet Explorer'] - browsers.Safari - browsers.Chrome
		
		var data =
		[
			['Opera', browsers.Opera],
			['Firefox', browsers.Firefox],
			['Chorme', browsers.Chrome],
			['Internet Explorer', browsers['Internet Explorer']],
			['Safari', browsers.Safari],
			['Other', other]
		],
		
		colors =
		[
			infoBrowsers.Opera.color,
			infoBrowsers.Firefox.color,
			infoBrowsers.Chrome.color,
			infoBrowsers['Internet Explorer'].color,
			infoBrowsers.Safari.color,
			'#999999'
		]
		
		return {data: data, colors: colors}
	},
	
	getChartData: function ()
	{
		var browsers = this.browsers,
			data = [],
			colors = [],
			known = 0
		
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
		colors.push('#999999')
		
		return {data: data, colors: colors}
	}
}

Me.className = 'BrowsersStats'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/stats/browsers.json" -->, <!--# include virtual="/db/stats/browsers-plain.json" -->)

})();