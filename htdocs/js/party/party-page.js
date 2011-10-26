<!--# include virtual="/lib-0.3/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->
<!--# include virtual="/lib-0.3/modules/interpolate.js" -->

<!--# include virtual="/js/common/number.js" -->
<!--# include virtual="/js/common/units.js" -->
<!--# include virtual="/js/common/popup.js" -->
<!--# include virtual="/js/common/ingredient-popup.js" -->
<!--# include virtual="/js/common/share-box.js" -->

;(function(){

<!--# include virtual="party.js" -->

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	
	IngredientPopup.bootstrap()
	
	var nodes =
	{
		partyName: $('party-name'),
		window:
		{
			root: $$('#window')[0],
			layers: $$('#window .layer'),
			images: $$('#window .layer .image')
		},
		recipeList: $$('#recipe-list')[0],
		purchasePlan: $$('#purchase-plan')[0],
		purchasePlanList: $$('#ingredients-part .parts-list .list')[0],
		purchasePlanTotal:
		{
			value: $$('#purchase-plan .total .cost')[0],
			unit: $$('#purchase-plan .total .unit')[0]
		},
		cocktailPlan: $$('#cocktail-plan')[0],
		peopleCount: $$('#cocktail-plan .people .value')[0],
		peopleUnit: $$('#cocktail-plan .people .unit')[0],
		body: $$('#cocktail-plan .body')[0],
		portions: $$('#cocktail-plan .body .portions')[0],
		
		shareBox:
		{
			root: $$('#links-box .share-box')[0],
			buttons: $$('#links-box .share-box .button')
		},
		
		printButton: $$('#links-box .print-box .print-page')[0]
	}
	
	RoundedCorners.round(nodes.window.root)
	
	var widget = new PartyPage()
	widget.bind(nodes)
}

document.addEventListener('ready', onready, false)
})();
