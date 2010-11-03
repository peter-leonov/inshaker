;(function(){

var myName = 'Tokenizer'

function Me (input)
{
	this.input = input
}

Me.prototype =
{
	setCurrentValue: function (value)
	{
		var tokens = this.getTokens(),
			input = this.input
		
		// make the value a string
		// to be able to ask it for a length
		value = '' + value
		
		if (!tokens.active)
			return
		
		tokens.active.value = value
		input.value = QueryParser.stringify(tokens)
		input.selectionStart = input.selectionEnd = tokens.active.begin + tokens.active.before.length + value.length
	},
	
	getCurrentValue: function ()
	{
		var tokens = this.getTokens()
		return tokens.active ? tokens.active.value : ''
	},
	
	getCurrentNum: function ()
	{
		var tokens = this.getTokens()
		return tokens.active ? tokens.active.num : -1
	},
	
	getTokens: function ()
	{
		var input = this.input,
			value = input.value,
			cursor = input.selectionEnd
		
		var tokens = this.tokens = QueryParser.parse(value)
		
		var active = -1
		for (var i = 0, il = tokens.length; i < il; i++)
		{
			var t = tokens[i]
			
			if (t.begin <= cursor && cursor <= t.end)
				active = i
		}
		
		tokens.active = tokens[active]
		
		return tokens
	},
	
	getParts: function (tokens, exceptActive)
	{
		return QueryParser.getParts(this.getTokens(), {exceptActive: exceptActive})
	}
}

Me.className = myName
self[myName] = Me

})();
