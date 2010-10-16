;(function(){

var myName = 'QueryParser'

function Me () {}

Me.parse = function (string)
{
	var tokenizer = /([+-])([^+-]*)/g,
		beforeRex = /^\s*/g,
		afterRex = /\s*$/g
	
	var m, tokens = []
	while ((m = tokenizer.exec(string)))
	{
		var op = m[1], body = m[2]
		
		var end = tokenizer.lastIndex, begin = end - body.length
		
		beforeRex.lastIndex = 0
		m = beforeRex.exec(body)
		var before = m ? m[0] : ''
		
		afterRex.lastIndex = beforeRex.lastIndex
		m = afterRex.exec(body)
		var after = m ? m[0] : ''
		
		var value = body.substring(before.length, body.length - after.length)
		
		var token =
		{
			num: tokens.length,
			begin: begin,
			op: op,
			before: before,
			value: value,
			after: after,
			end: end
		}
		
		tokens.push(token)
	}
	
	return tokens
}

Me.stringify = function (tokens)
{
	var string = ''
	
	for (var i = 0, il = tokens.length; i < il; i++)
	{
		var t = tokens[i]
		string += t.op + t.before + t.value + t.after
	}
	
	return string
}

Me.getParts = function (tokens, opts)
{
	if (!opts)
		opts = {}
	
	var active = opts.exceptActive ? tokens.active : null,
		add = [], remove = []
	for (var i = 0, il = tokens.length; i < il; i++)
	{
		var t = tokens[i]
		
		if (t == active)
			continue
		
		if (!t.value)
			continue
		
		var op = t.op
		if (op == '+')
			add.push(t.value)
		else if (op == '-')
			remove.push(t.value)
	}
	
	return {add: add, remove: remove}
}

Me.debug = function (tokens)
{
	var string = ''
	
	for (var i = 0, il = tokens.length; i < il; i++)
	{
		var t = tokens[i]
		string += t.op + '[' + t.begin + ']' + t.before + '{' + t.value + '}' + t.after + '[' + t.end + ']'
	}
	
	return string
}


Me.className = myName
self[myName] = Me

})();