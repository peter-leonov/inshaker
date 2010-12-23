;(function(){

var myName = 'MyBar',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind : function (nodes)
	{
		this.view.bind(nodes)
		this.model.bind()
		this.controller.bind()

		return this
	},

	setIngredients : function()
	{
		this.model.setIngredients()
		return this
	},

	setRecommends : function()
	{
		this.model.setRecommends()
		return this
	},

	setBar : function()
	{
		return this.setIngredients().setRecommends()
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/lib-0.3/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/lib-0.3/modules/json.js" -->
<!--# include virtual="/lib-0.3/modules/motion.js" -->
<!--# include virtual="/lib-0.3/modules/motion-types.js" -->
<!--# include virtual="/lib-0.3/modules/animation.js" -->
//Sorry for old lib. It's needed for Storage (hard code in it)
<!--# include virtual="/lib/Programica/UA.js" -->
<!--# include virtual="/js/combinator/throttler.js" -->
<!--# include virtual="ingrediented-cocktail-list.js" -->
<!--# include virtual="/js/common/storage.js" -->

<!--# include virtual="/js/common/autocompleter-3.js" -->
<!--# include virtual="/js/common/plain-input-autocompleter.js" -->

<!--# include virtual="/js/cocktails/ingredients-searcher.js" -->
<!--# include virtual="/lib-0.3/modules/regexp-escape.js" -->

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


;(function(){

function onready ()
{
	var nodes = {
		ingrList : $$('#output .ingredients-block .list')[0],
		ingrSearchForm : $$('#output .ingredients-block .search-box form')[0],
		ingrSearchBox : $$('#output .ingredients-block .search-box')[0],
		ingrQueryInput : $$('#output .ingredients-block .search-box form .query')[0],
		ingrResetButton: $$('#output .ingredients-block .search-box .reset')[0],
		ingrComplete: $$('#output .ingredients-block .search-box .autocomplete')[0],
		ingrEmpty : $$('#output .ingredients-block .empty')[0],
		recommendsBlock : $$('#output .recommends-block')[0],
		recommendsWrapper : $$('#output .recommends-block .wrapper')[0],
		recommendsEmpty : $$('#output .recommends-block .empty')[0]
	}

	var widget = new MyBar()
	widget.bind(nodes)

	document.documentElement.removeClassName('loading')
}

$.onready(onready)

})();
