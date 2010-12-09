;(function(){

var myName = 'MyBar',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
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
	var nodes = {
		cocktailsList : $$('#output .cocktails-block .list')[0]
	}
	
	var widget = new MyBar()
	widget.bind(nodes)
	
	document.documentElement.removeClassName('loading')
}

$.onready(onready)

})();