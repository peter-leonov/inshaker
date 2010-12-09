;(function(){

var myName = 'MyBar',
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


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


;(function(){

function onready ()
{
	var widget = new Widget()
	widget.bind(nodes)
}

$.onready(onready)

})();