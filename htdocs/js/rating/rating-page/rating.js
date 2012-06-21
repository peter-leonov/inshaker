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
	},
	
	checkState: function (nodes)
	{
		this.view.hashChanged()
	}
}

Me.className = 'RatingPage'
self[Me.className] = Papa = Me

})();


<!--# include virtual="rating-model.js" -->
<!--# include virtual="rating-view.js" -->
<!--# include virtual="rating-controller.js" -->


})();
