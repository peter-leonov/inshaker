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
		
		var begin = tokenizer.lastIndex, end = begin + body.length
		
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

Me.stringify = function (tokens)
{
	var string = ''
	
	for (var i = 0, il = tokens.length; i < il; i++)
	{
		var token = tokens[i]
		string += token.op + token.before + '{' + token.value + '}' + token.after
	}
	
	return string
}


Me.className = myName
self[myName] = Me

})();