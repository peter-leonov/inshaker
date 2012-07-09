;(function(){

var Papa

;(function(){

function Me ()
{
	var m = this.model = new Me.Model(),
		v = this.view = new Me.View(),
		c = this.controller = new Me.Controller()
	
	m.view = v
	v.controller = c
	c.model = m
	
	m.parent = v.parent = c.parent = this
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
		
		return this
	},
	
	guessState: function ()
	{
		this.model.setRandomCocktail()
		this.view.hashUpdated()
	},
	
	setCocktailsPerPage: function (count)
	{
		this.view.setCocktailsPerPage(count)
		this.model.setCocktailsPerPage(count)
	}
}

Me.className = 'CocktailsPage'
self[Me.className] = Papa = Me

})();


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


})();