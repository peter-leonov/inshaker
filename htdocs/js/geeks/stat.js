BrowsersStats = 
{
	init: function (data)
	{
		this.data = data
		
		var browsers = this.browsers = 
		{
			'Opera':
			{
				rawData: [],
				colorStart: [0xcc, 0x00, 0x00],
				colorEnd: [0xcc, 0x77, 0x33]
			},
			'Firefox':
			{
				rawData: [],
				colorStart: [0xff, 0x99, 0x00],
				colorEnd: [0xff, 0xee, 0x44]
			},
			'Chrome':
			{
				rawData: [],
				colorStart: [0x00, 0xcc, 0x00],
				colorEnd: [0x88, 0xcc, 0x66]
			},
			'Internet Explorer':
			{
				rawData: [],
				colorStart: [0x44, 0x99, 0xff],
				colorEnd: [0x66, 0xbb, 0xff]
			},
			'Safari':
			{
				rawData: [],
				color: [0x00, 0x55, 0xbb]
			},
			'Opera Mini':
			{
				rawData: [],
				color: [0x77, 0x77, 0x77]
			},
			'Android Browser':
			{
				rawData: [],
				color: [0x88, 0x88, 0x88]
			}
		}
		
		this.groupBrowsers()
		
		this.groupStat(browsers.Opera)
		this.sealTail(browsers.Opera.byVersion)
		
		this.groupStat(browsers.Firefox)
		this.sealTail(browsers.Firefox.byVersion)
		
		this.groupStat(browsers.Chrome)
		this.sealTail(browsers.Chrome.byVersion)
		
		this.groupStat(browsers['Internet Explorer'])
		
		this.calcSum(browsers.Safari)
		
		this.calcSum(browsers['Opera Mini'])
		
		this.calcSum(browsers['Android Browser'])
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
				browsers[name].rawData.push([stat[1], stat[2]])
		}
	},
	
	groupStat: function (browser)
	{
		var statsPointer = {},
			statsArray = [],
			versionTemplate = /^\d+\.\d/
		
		for (var i = 0, il = browser.rawData.length; i < il; i++)
		{
			var fullVersion = browser.rawData[i][0],
				stat = +browser.rawData[i][1],
				//version = +fullVersion.match(versionTemplate)
				version = +versionTemplate.exec(fullVersion)
			
			if (version)
				if (!(version in statsPointer))
					statsPointer[version] = statsArray.push({version: version, stat: stat}) - 1
				else
					statsArray[statsPointer[version]].stat += stat
		}
		
		browser.byVersion = statsArray.sort(function(a, b){ return b.version - a.version })
	},
	
	calcSum: function (browser)
	{
		var sum = 0
		
		for (var i = 0, il = browser.rawData.length; i < il; i++)
		{
			sum += +browser.rawData[i][1]
		}
		
		browser.sum = sum
	},
	
	sealTail: function (stats)
	{
		var tail = 0,
			halfPercent = this.total * 0.005,
			length = stats.length-1
		
		while (tail + stats[length].stat < halfPercent)
		{
			tail += stats[length].stat
			stats.pop()
			length--
		}
		stats.push({version: 'other', stat: tail})
	},
	
	getChartsData: function ()
	{
		var browsers = this.browsers,
			data = [],
			colors = []
		
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
				
				this.genColors(browser.colorStart, browser.colorEnd, length, colors)
			}
			else
			{
				data.push([browserName, browser.sum])
				colors.push(this.rgbToCode(browser.color[0], browser.color[1], browser.color[2]))
			}
		}
		
		return {data: data, colors: colors}
	},
	
	toHEX: function  (d) { return ( 0 | ( 1 << 8 ) + d ).toString(16).substr(1) },
	rgbToCode: function (r, g, b) { return '#' + this.toHEX(r) + this.toHEX(g) + this.toHEX(b) },
	
	genColors: function (start, end, count, colors)
	{
		var rd = (end[0] - start[0]) / (count-1),
			gd = (end[1] - start[1]) / (count-1),
			bd = (end[2] - start[2]) / (count-1),
			toHEX = this.toHEX
		
		for (var i = 0; i < count-1; i++)
		{
			var red = toHEX(start[0] + (rd*i)),
				green = toHEX(start[1] + (gd*i)),
				blue = toHEX(start[2] + (bd*i))
			
			colors.push('#' + red + green + blue)
		}
		
		var red = toHEX(end[0]),
			green = toHEX(end[1]),
			blue = toHEX(end[2])
		
		colors.push('#' + red + green + blue)
	}
}
