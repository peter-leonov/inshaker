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
}

Me.className = 'IngredientedCocktailList'
self[Me.className] = Papa = Me

})();


;(function(){

function Me () {}

Me.prototype =
{
}

Papa.View = Me

})();

;(function(){

function Me () {}

Me.prototype =
{
}

Papa.Controller = Me

})();

;(function(){

function Me () {}

Me.prototype =
{
}

Papa.Model = Me

})();


})();
