<!--# include virtual="/liby/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/liby/modules/interpolate.js" -->

<!--# include virtual="/js/common/units.js" -->
<!--# include virtual="/js/common/ingredient-popup.js" -->
<!--# include virtual="/js/common/share-box.js" -->

<!--# include virtual="/js/party/number.js" -->

;(function(){

<!--# include virtual="party.js" -->

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	
	IngredientPopup.bootstrap()
	
	var nodes =
	{
		ogImage: $('#og-image'),
		partyName: $('#party-name'),
		window:
		{
			root: $$('#window')[0],
			layers: $$('#window .layer'),
			images: $$('#window .layer .image'),
			bar: $$('#window .stub .label .bar')[0]
		},
		recipeList: $$('#recipe-list')[0],
		recipeIngredientPreviews: $$('#recipe-list .recipe .ingredients .ingredient-preview'),
		purchasePlan: $$('#purchase-plan')[0],
		
		ingredientsPart: $$('#ingredients-part')[0],
		ingredientsPartList: $$('#ingredients-part .parts-list .list')[0],
		ingredientsPartPreviewList: $$('#ingredients-part .preview-list')[0],
		
		toolsPart: $$('#tools-part')[0],
		toolsPartList: $$('#tools-part .parts-list .list')[0],
		toolsPartPreviewList: $$('#tools-part .preview-list')[0],
		
		thingsPart: $$('#things-part')[0],
		thingsPartList: $$('#things-part .parts-list .list')[0],
		thingsPartPreviewList: $$('#things-part .preview-list')[0],
		
		purchasePlanTotal:
		{
			perParty:
			{
				value: $$('#purchase-plan .total .per-party .cost')[0],
				unit: $$('#purchase-plan .total .per-party .unit')[0]
			},
			perPerson:
			{
				value: $$('#purchase-plan .total .per-person .cost .value')[0],
				unit: $$('#purchase-plan .total .per-person .cost .unit')[0]
			}
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
		
		printButton: $$('#links-box .print-box .print-page')[0],
		
		partyList: $$('#party-list')[0]
	}
	
	var widget = new PartyPage()
	widget.bind(nodes).guessParty()
}

$.onready(onready)

})();
