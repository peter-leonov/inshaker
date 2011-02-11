;(function(){

var Papa

;(function(){

var myName = 'PartyPage',
	Me = Papa = MVC.create(myName)

var myProto =
{
	initialize: function ()
	{
		this.model.initialize()
		this.view.initialize()
		this.controller.initialize()
	},

	bind: function (nodes, sources, state)
	{
		this.view.bind(nodes)
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

Me.className = myName
self[Me.className] = Me

})();


<!--# include virtual="party-model.js" -->
<!--# include virtual="party-view.js" -->
<!--# include virtual="party-controller.js" -->


})();
