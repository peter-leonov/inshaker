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
		
		ingredients : {
			list : $$('#output .ingredients-block .list')[0],
			searchForm : $$('#output .ingredients-block .search-box form')[0],
			queryInput : $$('#output .ingredients-block .search-box form .query')[0],
			resetButton: $$('#output .ingredients-block .search-box .reset')[0],
			complete: $$('#output .ingredients-block .search-box .autocomplete')[0],
			empty : $$('#output .ingredients-block .empty')[0]
		},
		
		cocktails : {
			block : $$('#output .cocktails-block')[0],
			amount : $$('#output .cocktails-block .title .amount')[0],
			switcher : $$('#output .cocktails-block .switcher')[0],
			swPhotos : $$('#output .cocktails-block .switcher .photos')[0],
			swCombs : $$('#output .cocktails-block .switcher .combs')[0],
			wrapper : $$('#output .cocktails-block .wrapper')[0],
			empty : $$('#output .cocktails-block .empty')[0]
		},
		
		bottomOutput : {
			output : $$('#output .bottom-output')[0],
			title : $$('#output .bottom-output .title')[0],
			wrapper : $$('#output .bottom-output .wrapper')[0],
			empty : $$('#output .bottom-output .empty')[0],
			recommends : $$('#output .bottom-output .recommends')[0],
			mustHave : $$('#output .bottom-output .must-have')[0]
		},
		
		menuLink : $$('#output .cocktails-block .bar-link')[0]
	}

	var widget = new MyBar()
	widget.bind(nodes)

	document.documentElement.removeClassName('loading')
}

$.onready(onready)

})();
