;(function(){

var Papa = GoodPage, Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		
	},
	
	selectGoodByName: function (name)
	{
		this.model.selectGoodByName(name)
	},
	
	bind: function () {}
}

Object.extend(Me.prototype, myProto)

})();
