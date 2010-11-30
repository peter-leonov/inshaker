;(function(){

function indexOf (a, v, i)
{
	var len = a.length,
		i = +i || 0
	i = (i < 0) ? (Math.ceil(i) + len) : Math.floor(i)

	for (; i < len; i++)
		if (i in a && a[i] === v)
			return i
	return -1
}


;(function(){

var myName = 'Tool'

function Me (parent)
{
	this.parent = parent
}

var proxyList = ['wait', 'done', 'test', 'async', 'expect', 'failing', 'mayFail', 'pass', 'fail']

var prototype =
{
	log: function (m) { return this.parent.reporter.log(m) },
	info: function (m) { return this.parent.reporter.info(m) },
	warn: function (m) { return this.parent.reporter.warn(m) },
	mayFail: function (v) { return this.parent.mayFail(v) },
	parallel: function (v) { return this.parent.parallel = v },
	
	finished: function () { return this.parent.finished },
	
	ok: function (v, d)
	{
		if (v)
			this.pass([v, new Label('is true')], d)
		else
			this.fail([v, new Label('is not true')], d)
	},
	
	no: function (v, d)
	{
		if (!v)
			this.pass([v, new Label('is false')], d)
		else
			this.fail([v, new Label('is not false')], d)
	},
	
	eq: function (a, b, d)
	{
		if (a === b)
			this.pass([a, new Label('===', 'label middle'), b], d)
		else
			this.fail([a, new Label('!==', 'label middle'), b], d)
	},
	
	ne: function (a, b, d)
	{
		if (a !== b)
			this.pass([a, new Label('!==', 'label middle'), b], d)
		else
			this.fail([a, new Label('===', 'label middle'), b], d)
	},
	
	peq: function (a, b, p, d)
	{
		if (Math.abs(a - b) <= p)
			this.pass([a, new Label('≈', 'label middle'), b], d)
		else
			this.fail([a, new Label('!≈', 'label middle'), b], d)
	},
	
	match: function (a, b, d)
	{
		if (b.test(a))
			this.pass([a, new Label('matches', 'label middle'), b], d)
		else
			this.fail([a, new Label('does not match', 'label middle'), b], d)
	},
	
	ina: function (a, b, d)
	{
		if (indexOf(b, a) != -1)
			this.pass([a, new Label('in', 'label middle'), b], d)
		else
			this.fail([a, new Label('is not in', 'label middle'), b], d)
	},
	
	isin: function (a, b, d)
	{
		if (a in b)
			this.pass([a, new Label('is in', 'label middle'), b], d)
		else
			this.fail([a, new Label('is not in', 'label middle'), b], d)
	},
	
	isntin: function (a, b, d)
	{
		if (!(a in b))
			this.pass([a, new Label('is not in', 'label middle'), b], d)
		else
			this.fail([a, new Label('is in', 'label middle'), b], d)
	},
	
	like: function (a, b, d)
	{
		var same = false
		try
		{
			same = this.inspect(a, 10, true) === this.inspect(b, 10, true)
		}
		catch (ex) {}
		
		if (same)
			this.pass([a, new Label('is like', 'label middle'), b], d)
		else
			this.fail([a, new Label('is unlike', 'label middle'), b], d)
	},
	
	unlike: function (a, b, d)
	{
		var same = false
		try
		{
			same = this.inspect(a, 10, true) === this.inspect(b, 10, true)
		}
		catch (ex) {}
		
		if (!same)
			this.pass([a, new Label('is unlike', 'label middle'), b], d)
		else
			this.fail([a, new Label('is like', 'label middle'), b], d)
	},
	
	lt: function (a, b, d)
	{
		if (a < b)
			this.pass([a, new Label('<', 'label middle'), b], d)
		else
			this.fail([a, new Label('>=', 'label middle'), b], d)
	},
	lte: function (a, b, d)
	{
		if (a <= b)
			this.pass([a, new Label('<=', 'label middle'), b], d)
		else
			this.fail([a, new Label('>', 'label middle'), b], d)
	},
	gte: function (a, b, d)
	{
		if (a >= b)
			this.pass([a, new Label('>=', 'label middle'), b], d)
		else
			this.fail([a, new Label('<', 'label middle'), b], d)
	},
	gt: function (a, b, d)
	{
		if (a > b)
			this.pass([a, new Label('>', 'label middle'), b], d)
		else
			this.fail([a, new Label('<=', 'label middle'), b], d)
	},
	
	instance: function (a, b, d)
	{
		if (a instanceof b)
			this.pass([a, new Label('is an instance of', 'label middle'), b], d)
		else
			this.fail([a, new Label('is not an instance of', 'label middle'), b], d)
	},
	notinstance: function (a, b, d)
	{
		if (!(a instanceof b))
			this.pass([a, new Label('is not instanceof', 'label middle'), b], d)
		else
			this.fail([a, new Label('instanceof', 'label middle'), b], d)
	},
	
	type: function (a, b, d)
	{
		if (typeof a === b)
			this.pass([a, new Label('typeof', 'label middle'), b], d)
		else
			this.fail([a, new Label('is not typeof', 'label middle'), b], d)
	},
	nottype: function (a, b, d)
	{
		if (!(typeof a === b))
			this.pass([a, new Label('is not typeof', 'label middle'), b], d)
		else
			this.fail([a, new Label('typeof', 'label middle'), b], d)
	},
	
	exception: function (f, c, d)
	{
		if (typeof c !== 'function')
			d = c,
			c = null
		
		try
		{
			f(this)
		}
		catch (ex)
		{
			this.pass([new Label('exception was thrown:'), ex], d)
			if (c)
				c(this, ex)
			return
		}
		
		this.fail(new Label('no exception was thrown'), d)
	},
	noexception: function (f, d)
	{
		try
		{
			f(this)
		}
		catch (ex)
		{
			this.fail([new Label('exception was thrown:'), ex], d)
			return
		}
		
		this.pass(new Label('no exception was thrown'), d)
	},
	
	_times: {},
	time: function (name)
	{
		var times = this._times
		times[name] = new Date()
	},
	
	timeEnd: function (name)
	{
		var diff = new Date() - this._times[name]
		this.info(new Label((name || 'time') + ': ' + diff + 'ms'))
		return diff
	},
	
	_lags: {},
	lag: function (name, delay)
	{
		var lag = this._lags[name] = {}
		
		if (delay === undefined)
			delay = 10
		
		lag.delay = delay
		
		var times = lag.times = []
		function shot ()
		{
			times.push(new Date())
		}
		
		lag.timer = setInterval(shot, delay)
		shot()
	},
	
	lagEnd: function (name)
	{
		var lag = this._lags[name]
		if (!lag)
			return
		
		clearInterval(lag.timer)
		
		var times = lag.times
		if (times.length < 2)
			return NaN
		
		var delay = lag.delay, max = 0
		for (var i = 0, il = times.length - 1; i < il; i++)
		{
			var a = times[i + 1] - times[i] - delay
			if (a > max)
				max = a
		}
		
		this.info(new Label((name || 'lag') + ': ' + max + 'ms'))
	},
	
	speed: function (f)
	{
		var count = 1
		do
		{
			count *= 5
			var begin = new Date()
			for (var i = 0; i < count; i++)
				f()
			var diff = new Date() - begin
		}
		while (diff < 25)
		
		var speed = count * 1000 / diff
		return speed
	},
	
	indexOf: indexOf
}

function Label (text, cn) { this.text = text; this.className = cn }
self.Test.Label = Label

function proxyParent (name) { return function () { return this.parent[name].apply(this.parent, arguments) } }

for (var i = 0; i < proxyList.length; i++)
{
	var name = proxyList[i]
	prototype[name] = proxyParent(name)
}

Me.prototype = prototype
self.Test[myName] = Me

})();

;(function(){

var escapeChars = {'"': '\\"', '\\': '\\\\', '\n': '\\n', '\r': '\\r', '\t': '\\t'}
function escapeString (str)
{
	return str.replace(/(["\\\n\r\t])/g, function (v) { return escapeChars[v] })
}

var myName = 'Inspector'
function Me ()
{
	this.seen = []
}

Me.prototype =
{
	deep: 1,
	hard: false,
	level: 0,
	maxElements: 8,
	indc: '	',
	sep: '\n\r',
	
	inspect: function (val, deep, hard, maxElements)
	{
		if (deep !== undefined)
			this.deep = deep
		if (hard !== undefined)
			this.hard = hard
		if (maxElements !== undefined)
			this.maxElements = maxElements
		
		try
		{
			return this.walk(val)
		}
		catch (ex)
		{
			throw new Error('error inspecting "' + val + '":' + ex)
		}
	},
	
	walk: function (val)
	{
		if (++this.level > this.deep)
			if (this.hard)
				throw new Error('inspecting too deep: ' + this.level)
			else
				this.deepest = true
		
		var res, ind = new Array(this.level).join(this.indc), sep = this.sep
		switch (typeof val)
		{
			case 'string':
				res = '"' + escapeString(val) + '"'
				break
			
			case 'object':
				if (val === null)
				{
					res = 'null'
					break
				}
				
				if (val === window)
				{
					res = 'window'
					break
				}
				
				if (val === document)
				{
					res = 'document'
					break
				}
				
				if (val.constructor === Date)
				{
					res = val.toString() + ' (' + (+val) + ')'
					break
				}
				
				if (val.constructor === RegExp)
				{
					res = val.toString()
					break
				}
				
				if (val instanceof Error)
				{
					res = val.message + ' at ' + (val.fileName || val.sourceURL) + ':' + (val.line || val.lineNumber)
					break
				}
				
				// remember complex objects
				var seen = this.seen,
					maxElements = this.maxElements,
					num = indexOf(seen, val)
				if (num >= 0)
					return '#' + num
				seen.push(val)
				
				if (val.constructor === Array)
				{
					if (this.deepest)
					{
						res = '[…]'
						break
					}
					
					var elements = []
					for (var i = 0, il = val.length; i < il; i++)
					{
						if (i >= maxElements)
						{
							elements.push('…')
							break
						}
						
						elements.push(this.walk(val[i]))
					}
					res = (this.level > 1 ? sep : '') + ind + '[' + sep + ind + this.indc + elements.join(',' + sep + ind + this.indc) + sep + ind + ']'
					break
				}
				
				// any other Object
				{
					if (this.deepest)
					{
						res = '{…}'
						break
					}
					
					var keys = []
					for (var k in val)
						keys.push(k)
					keys.sort()
					
					var elements = []
					for (var i = 0, il = keys.length; i < il; i++)
					{
						if (i >= maxElements)
						{
							elements.push('…')
							break
						}
						
						var k = keys[i]
						try
						{
							elements.push(this.walk(k) + ': ' + this.walk(val[k]))
						}
						catch (ex)
						{
							elements.push(this.walk(k) + ': [exception ' + ex.message + ']')
						}
					}
					res = (this.level > 1 ? sep : '') + ind + '{' + sep + ind + this.indc + elements.join(',' + sep + ind + this.indc) + sep + ind + '}'
					break
				}
			
			case 'function':
				// Safari treats rexes as a function
				if (val.constructor === RegExp)
				{
					res = val.toString()
					break
				}
				
				if (res = val.className)
					res = '[class ' + res + ']'
				else
				{
					if (res = /^(.*?)\s*\{/.exec(val))
						res = res[1]
					else
						res = 'function ? (?)'
				}
				break
			
			default:
				res = String(val)
		}
		
		this.level--
		return res
	}
}

Test[myName] = Me

Test.Tool.prototype.inspect = function (val)
{
	var me = new Me()
	return me.inspect.apply(me, arguments)
}


})();

})();