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

	/*
	setRecommends : function()
	{
		this.model.setRecommends()
		return this
	},
	*/
	
	setCocktails : function()
	{
		this.model.setCocktails()
		return this
	},

	setBarName : function()
	{
		this.model.setBarName()
		return this
	},
	
	setRecommIngr : function()
	{
		this.model.setRecommIngr()
		return this
	},

	setBottomOutput : function()
	{
		this.model.setBottomOutput()
	},

	setBar : function()
	{
		return this.
				setBarName().
				setIngredients().
				setCocktails().
				setRecommIngr().
				setBottomOutput()
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/lib-0.3/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/lib-0.3/modules/json.js" -->
<!--# include virtual="/lib-0.3/modules/motion.js" -->
<!--# include virtual="/lib-0.3/modules/motion-types.js" -->
<!--# include virtual="/lib-0.3/modules/animation.js" -->
<!--# include virtual="/lib-0.3/modules/user-agent.js" -->

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
	UserAgent.setupDocumentElementClassNames()
	
	var nodes = {
		
		barName : {
			wrapper : $('bar-name'),
			tip : $$('#bar-name .tip')[0],
			title : $$('#bar-name h2')[0],
			help : $$('#bar-name h2 .help')[0],
			bName : $$('#bar-name h2 .name')[0],
			form : $$('#bar-name .change-name')[0],
			input : $$('#bar-name .change-name .new-bar-name')[0]
		},
		
		ingrList : $$('#output .ingredients-block .list')[0],
		ingrSearchForm : $$('#output .ingredients-block .search-box form')[0],
		ingrSearchBox : $$('#output .ingredients-block .search-box')[0],
		ingrQueryInput : $$('#output .ingredients-block .search-box form .query')[0],
		ingrResetButton: $$('#output .ingredients-block .search-box .reset')[0],
		ingrComplete: $$('#output .ingredients-block .search-box .autocomplete')[0],
		ingrEmpty : $$('#output .ingredients-block .empty')[0],
		
		cocktails : {
			block : $$('#output .cocktails-block')[0],
			amount : $$('#output .cocktails-block .title .amount')[0],
			switcher : $$('#output .cocktails-block .switcher')[0],
			swPhotos : $$('#output .cocktails-block .switcher .photos')[0],
			swCombs : $$('#output .cocktails-block .switcher .combs')[0],
			wrapper : $$('#output .cocktails-block .wrapper')[0],
			empty : $$('#output .cocktails-block .empty')[0]
		},
		
		recommBlocks : {
			wrapper : $$('#output .recommend-blocks')[0],
			inYourBar : $$('#output .recommend-blocks .ingr-in-your-bar')[0],
			inGoodBar : $$('#output .recommend-blocks .ingr-in-good-bar')[0],
			ingrOfMonth : $$('#output .recommend-blocks .ingr-of-month')[0],
			inYourBarList : $$('#output .recommend-blocks .ingr-in-your-bar .list')[0],
			inGoodBarList : $$('#output .recommend-blocks .ingr-in-good-bar .list')[0],
			ingrOfMonthList : $$('#output .recommend-blocks .ingr-of-month .list')[0]
		},
		
		bottomOutput : {
			output : $$('#output .bottom-output')[0],
			title : $$('#output .bottom-output .title')[0],
			wrapper : $$('#output .bottom-output .wrapper')[0],
			empty : $$('#output .bottom-output .empty')[0],
			swCocktails : $$('#output .bottom-output .number-of-cocktails')[0],
			swIngreds : $$('#output .bottom-output .easy-to-make')[0]
		}
		/*,
		recommendsBlock : $$('#output .recommends-block')[0],
		recommendsWrapper : $$('#output .recommends-block .wrapper')[0],
		recommendsEmpty : $$('#output .recommends-block .empty')[0]
		*/
	}

	var widget = new MyBar()
	widget.bind(nodes)

	document.documentElement.removeClassName('loading')
}

$.onready(onready)

})();
