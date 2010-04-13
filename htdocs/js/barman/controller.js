;(function(){

var Papa = BarmensPage
var Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	bind: function (state)
	{
		this.model.setState(state)
	},
	
	setCocktails: function ()
	{
		this.view.renderBarmanCocktails(this.model.sources.barman.cocktails)
	},
	
	setNextAndPrevBarmens: function ()
	{
		this.view.renderNextAndPrevBarmensLinks(this.model.sources.barman)
	}
}

Object.extend(Me.prototype, myProto)

})();
