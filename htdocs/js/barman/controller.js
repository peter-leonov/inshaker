;(function(){

var Papa = BarmanPage
var Me = Papa.Controller

var myProto =
{
	initialize: function () { },
	
	bind: function () {},
	
	barmanNameFound: function (name)
	{
		this.model.setBarmanByName(name)
	}
}

Object.extend(Me.prototype, myProto)

})();
