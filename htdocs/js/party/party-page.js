<!--# include virtual="/lib-0.3/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->

<!--# include virtual="/js/common/popup.js" -->
<!--# include virtual="/js/common/ingredient-popup.js" -->

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
			layers: $$('#window .layer')
		},
		recipeList: $$('#recipe-list')[0],
		peopleCount: $$('#cocktail-plan .head .people .count')[0],
		body: $$('#cocktail-plan .body')[0],
		cocktails: $$('#cocktail-plan .body .cocktails')[0]
	}
	
	RoundedCorners.round(nodes.window.root)
	
	var widget = new PartyPage()
	widget.bind(nodes)
}

document.addEventListener('ready', onready, false)
})();
