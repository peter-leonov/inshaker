;(function(){

var Papa = BarmensPage
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
