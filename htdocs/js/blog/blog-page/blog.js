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
		this.view.checkHash()
	},
	
	setPostsPerPage: function (count)
	{
		this.view.setPostsPerPage(count)
		this.model.setPostsPerPage(count)
	}
}

Me.className = 'BlogPage'
self[Me.className] = Papa = Me

})();


<!--# include virtual="blog-model.js" -->
<!--# include virtual="blog-view.js" -->
<!--# include virtual="blog-controller.js" -->

})();
