;(function(){

var myName = 'QueryParser'

function Me () {}

Me.parse = function (string)
{
	var tokenizer = /([+-])([^+-]*)/g
	
	var m, tokens = []
	while ((m = tokenizer.exec(string)))
	{
		var op = m[1], body = m[2]
		
		var end = tokenizer.lastIndex, begin = end - body.length
		
		m = /^\s*/.exec(body)
		var before = m ? m[0] : ''
		
		m = /\s*$/.exec(body)
		var after = m ? m[0] : ''
		
		var value = body.substring(before.length, body.length - after.length)
		
		var token =
		{
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