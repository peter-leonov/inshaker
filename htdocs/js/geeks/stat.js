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
	}
}

Me.className = 'BrowsersStats'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/stat/browsers.json" -->)

})();