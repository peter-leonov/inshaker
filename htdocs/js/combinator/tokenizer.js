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
		
		if (!tokens.active)
			return
		
		tokens.active.value = value
		input.value = QueryParser.stringify(tokens).substr(1)
		input.selectionStart = input.selectionEnd = tokens.active.begin + tokens.active.before.length + value.length - 1
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
		
		cursor++
		
		var tokens
		if (this.lastValue === value)
		{
			tokens = this.tokens
		}
		else
		{
			tokens = this.tokens = QueryParser.parse(value)
			this.lastValue = value
		}
		
		if (this.lastCursor === cursor)
			return tokens
		this.lastCursor = cursor
		
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
