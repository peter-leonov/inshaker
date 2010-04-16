;(function(){

var Papa = AllBarmensPage
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
	
	setBarmenPhoto: function ()
	{
		this.view.renderBarmenPhoto(this.model.sources.barmens)
	}
}

Object.extend(Me.prototype, myProto)

})();
