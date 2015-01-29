;(function(){

function info () { /*noop*/ }
// function info () { try { console.info.apply(console, arguments) } catch (ex) {} }

// As far as Tracker could be used as an error reporter
// wrap everything in try/catch blocks to avoid
// infinite reporting on error in Tracker itself.

var Tracker =
{
	event: function (category, action, label, value)
	{
		try // to track an event
		{
			info('Tracker:', category + '.' + action, label, value)

			var args = ['send', 'event']
			for (var i = 0, il = arguments.length; i < il; i++)
				args.push(arguments[i])
			ga.apply(window, args)
			return true
		}
		catch (e)
		{
			// to warn the developer
			window.setTimeout(function () { throw e }, 0)
		}
	},
	
	path: function (path)
	{
		try // to track an event
		{
			info('Tracker:', path)

			var args = ['send', 'pageview']
			for (var i = 0, il = arguments.length; i < il; i++)
				args.push(arguments[i])
			ga.apply(window, args)
			return true
		}
		catch (e)
		{
			// to warn the developer
			window.setTimeout(function () { throw e }, 0)
		}
	}
}

window.Tracker = Tracker

})();
