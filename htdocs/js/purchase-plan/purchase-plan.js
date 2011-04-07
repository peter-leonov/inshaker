;(function(){

var myName = 'PurchasePlan',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind : function (nodes)
	{
		this.view.bind(nodes)
		this.model.bind()
		this.controller.bind()
	},
	
	setMainState : function()
	{
		this.model.setMainState()
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/lib-0.3/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/lib-0.3/modules/json.js" -->
<!--# include virtual="/lib-0.3/modules/user-agent.js" -->

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->

<!--# include virtual="/js/combinator/popup.js" -->
<!--# include virtual="/js/combinator/ingredient-popup.js" -->
<!--# include virtual="/js/combinator/throttler.js" -->

<!--# include virtual="/js/common/bar-storage.js" -->
<!--# include virtual="/js/common/mybar-name.js" -->
<!--# include virtual="/js/common/purchase-plan-table-editable.js" -->

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->

;(function(){

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	document.documentElement.removeClassName('loading')
	
	var nodes =
	{
		root: document.body,
		popupMain: $('ingredient-info-popup'),
		popupParts:
		{
			window: $$('#ingredient-info-popup .popup-window')[0],
			front: $$('#ingredient-info-popup .popup-front')[0],
			ingredientWindow: $$('#ingredient-info-popup .popup-window .ingredient-window')[0],
			image: $$('#ingredient-info-popup .description .image')[0],
			inBar : $$('#ingredient-info-popup .description .about .in-bar')[0],
			mark: $$('#ingredient-info-popup .description .about .mark')[0],
			brand: $$('#ingredient-info-popup .description .about .brand .link')[0],
			buy: $$('#ingredient-info-popup .description .about .where-to-buy .link')[0],
			name: $$('#ingredient-info-popup .description .about .name')[0],
			text: $$('#ingredient-info-popup .description .about .text')[0],
			allCocktails: $$('#ingredient-info-popup .description .about .all-cocktails')[0],
			allCocktailsLink: $$('#ingredient-info-popup .description .about .all-cocktails .link')[0],
			combinations: $$('#ingredient-info-popup .description .about .combinations')[0],
			combinationsList: $$('#ingredient-info-popup .description .about .combinations .list')[0],
			cocktails: $$('#ingredient-info-popup .cocktail-list')[0],
			cocktailsViewport: $$('#ingredient-info-popup .cocktail-list .viewport')[0],
			cocktailsSurface: $$('#ingredient-info-popup .cocktail-list .surface')[0],
			cocktailsPrev: $$('#ingredient-info-popup .cocktail-list .prev')[0],
			cocktailsNext: $$('#ingredient-info-popup .cocktail-list .next')[0]
		}
	}
	
	IngredientPopup.setup(nodes)
	
	Ingredient.calculateEachIngredientUsage()
	
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
		
		purchasePlan : {
			main : $$('#output .b-content .purchase-plan-block')[0],
			wrapper : $$('#output .b-content .purchase-plan-block .wrapper')[0],
			body : $$('#output .b-content .purchase-plan-block .wrapper .plan-table .tbody')[0],
			totalPrice : $$('#output .b-content .purchase-plan-block .wrapper .plan-table .tfoot .total-price .total')[0],
			empty : $$('#output .b-content .purchase-plan-block .empty')[0]
		}
	}
	
	var widget = new PurchasePlan()
	widget.bind(nodes)
}

$.onready(onready)

})();
