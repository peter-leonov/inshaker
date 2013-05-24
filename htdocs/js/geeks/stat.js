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
				color: "#cc2200",
				colorMiddle: "#cc4422",
				colorEnd: "#cc6644"
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
		
		var other = total - browsers.Opera - browsers.Firefox - browsers.Chrome - browsers['Internet Explorer'] - browsers.Safari
		
		var data =
		[
			['Opera', browsers.Opera],
			['Firefox', browsers.Firefox],
			['Chorme', browsers.Chrome],
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
		colors.push('#999999')
		
		return {data: data, colors: colors}
	}
}

Me.className = 'BrowsersStats'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/stats/browsers.json" -->, <!--# include virtual="/db/stats/browsers-plain.json" -->)

})();