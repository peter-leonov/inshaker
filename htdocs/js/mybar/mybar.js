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
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();


<!--# include file="/lib-0.3/modules/json.js" -->
<!--# include file="/lib/Programica/UA.js" -->
<!--# include file="/js/common/storage.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


;(function(){

function onready ()
{
	var nodes = {
		cocktailsList : $$('#output .cocktails-block .list')[0],
		ingredientsList : $$('#output .ingredients-block .list')[0],
		searchForm : $$('#search-box form')[0],
		queryInput : $$('#search-box form .query')[0]
	}
	
	var widget = new MyBar()
	widget.bind(nodes)
	
	document.documentElement.removeClassName('loading')
}

$.onready(onready)

})();