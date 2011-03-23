;(function(){

var myName = 'PurchasePlan',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind: function ()
	{
		this.view.bind()
		this.model.bind()
		this.controller.bind()
	}
}

Object.extend(Me.prototype, myProto)

})();


/*View*/

;(function(){

var Me = PurchasePlan.View

var myProto =
{
	bind : function ()
	{
		
	}
}

Object.extend(Me.prototype, myProto)

})();


/*Model*/

;(function(){

var Me = PurchasePlan.Model

var myProto =
{
	bind : function ()
	{

	}
}

Object.extend(Me.prototype, myProto)

})();


/*Controller*/

;(function(){

var Me = PurchasePlan.Controller

var myProto =
{
	bind : function()
	{
		
	}
}

Object.extend(Me.prototype, myProto)

})();
