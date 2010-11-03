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
		
		tokens.active.value = value
		input.value = QueryParser.stringify(tokens)
		input.selectionStart = input.selectionEnd = tokens.active.begin + tokens.active.before.length + value.length
	},
	
	getCurrentValue: function ()
	{
		return this.getTokens().active.value
	},
	
	getCurrentNum: function ()
	{
		return this.getTokens().active.num
	},
	
	getTokens: function ()
	{
		var input = this.input,
			value = input.value,
			cursor = input.selectionEnd
		
		var tokens = this.tokens = QueryParser.parse(value)
		
		var active = 0
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
