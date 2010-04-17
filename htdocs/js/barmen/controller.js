;(function(){

var Papa = AllBarmensPage
var Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	bind: function (state) {},
	
	loadBarmen: function ()
	{
		this.model.loadBarmen()
	}
}

Object.extend(Me.prototype, myProto)

})();
