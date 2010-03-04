;(function(){

var myName = 'Statistics'

var Me =
{
	track: function (action, label, value)
	{
		setTimeout(function () { Tracker.track('statistics', action, label, value) }, 500)
	}
}

Me.className = myName
self[myName] = Me

})();