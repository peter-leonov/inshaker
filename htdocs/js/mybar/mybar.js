;(function(){

var myName = 'MyBar',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
		//this.model.bind()
		this.controller.bind()
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();


<!--# include virtual="/lib-0.3/modules/json.js" -->
<!--# include virtual="/lib-0.3/modules/motion.js" -->
<!--# include virtual="/lib-0.3/modules/motion-types.js" -->
<!--# include virtual="/lib-0.3/modules/animation.js" -->
//Sorry for old lib. It's needed for Storage (hard code in it)
<!--# include virtual="/lib/Programica/UA.js" -->
<!--# include virtual="/js/common/storage.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


;(function(){

function onready ()
{
	var nodes = {
		cocktailsList : $$('#output .cocktails-block .list')[0],
		ingredientsList : $$('#output .ingredients-block .list')[0],
		cocktailSearchForm : $$('#output .cocktails-block .search-box form')[0],
		cocktailQueryInput : $$('#output .cocktails-block .search-box form .query')[0],
		ingrSearchForm : $$('#output .ingredients-block .search-box form')[0],
		ingrQueryInput : $$('#output .ingredients-block .search-box form .query')[0],
		recommendsBlock : $$('#output .recommends-block')[0],
		recommendsWrapper : $$('#output .recommends-block .wrapper')[0]
	}
	
	var widget = new MyBar()
	widget.bind(nodes)
	
	document.documentElement.removeClassName('loading')
}

$.onready(onready)

})();