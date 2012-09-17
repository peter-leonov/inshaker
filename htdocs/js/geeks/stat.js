;(function(){

var Me =
{
	initialize: function (data)
	{
		this.data = data
		
		var browsers = this.browsers =
		{
			'Opera':
			{
				rawData: [],
				sum: 0,
				color: [0xcc, 0x00, 0x00],
				colorMiddle: [0xcc, 0x59, 0x26],
				colorEnd: [0xcc, 0x77, 0x33]
			},
			'Firefox':
			{
				rawData: [],
				sum: 0,
				color: [0xff, 0x99, 0x00],
				colorMiddle: [0xff, 0xad, 0x10],
				colorEnd: [0xff, 0xee, 0x44]
			},
			'Chrome':
			{
				rawData: [],
				sum: 0,
				color: [0x00, 0xcc, 0x00],
				colorMiddle: [0x44, 0xcc, 0x33],
				colorEnd: [0x88, 0xcc, 0x66]
			},
			'Internet Explorer':
			{
				rawData: [],
				sum: 0,
				color: [0x44, 0x99, 0xff],
				colorMiddle: [0x55, 0xaa, 0xff],
				colorEnd: [0x66, 0xbb, 0xff]
			},
			'Safari':
			{
				rawData: [],
				sum: 0,
				color: [0x00, 0x55, 0xbb]
			},
			'Opera Mini':
			{
				rawData: [],
				sum: 0,
				color: [0x77, 0x77, 0x77]
			},
			'Android Browser':
			{
				rawData: [],
				sum: 0,
				color: [0x88, 0x88, 0x88]
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
		this.total = sum.total
		
		for (var i = 0, il = stats.length; i < il; i++)
		{
			var stat = stats[i],
				name = stat[0]
			
			if (browsers[name])
			{
				browsers[name].rawData.push([stat[1], stat[2]])
				browsers[name].sum += +stat[2]
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
				stat = +browser.rawData[i][1],
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
	
	toHEX: function  (d) { return ( 0 | ( 1 << 8 ) + d ).toString(16).substr(1) },
	rgbToCode: function (c) { return '#' + this.toHEX(c[0]) + this.toHEX(c[1]) + this.toHEX(c[2]) },
	
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
			colors.push(this.rgbToCode(color))
		} while (howPercent < 2 && i++ < length-1)
		
		for (i++; i < length-1; i++)
		{
			colors.push(this.rgbToCode(colorMiddle))
		}
		
		colors.push(this.rgbToCode(colorEnd))
	},
	
	getChartDataPlain: function ()
	{
		var browsers = this.browsers
		
		var other = this.total - browsers.Opera.sum - browsers.Firefox.sum - browsers['Internet Explorer'].sum - browsers.Safari.sum - browsers.Chrome.sum
		
		var data =
		[
			['Opera', browsers.Opera.sum],
			['Firefox', browsers.Firefox.sum],
			['Chorme', browsers.Chrome.sum],
			['Internet Explorer', browsers['Internet Explorer'].sum],
			['Safari', browsers.Safari.sum],
			['Other', other]
		],
		
		colors =
		[
			this.rgbToCode(browsers.Opera.color),
			this.rgbToCode(browsers.Firefox.color),
			this.rgbToCode(browsers.Chrome.color),
			this.rgbToCode(browsers['Internet Explorer'].color),
			this.rgbToCode(browsers.Safari.color),
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
				colors.push(this.rgbToCode(browser.color))
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

Me.initialize(<!--# include virtual="/stat/browsers.json" -->)

})();