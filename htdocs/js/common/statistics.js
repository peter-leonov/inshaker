;(function(){

var myName = 'Statistics'

var Me =
{
	ingredientPopupOpened: function (ingredient)
	{
		this.track('ingredient-popup', ingredient.name)
	},
	
	track: function (action, label, value)
	{
		setTimeout(function () { Tracker.track('statistics', action, label, value) }, 500)
	}
}

Me.className = myName
self[myName] = Me

})();