<!--# include virtual="/liby/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/liby/modules/interpolate.js" -->

<!--# include virtual="/js/common/units.js" -->
<!--# include virtual="/js/common/ingredient-popup.js" -->
<!--# include virtual="/js/common/share-box.js" -->

<!--# include virtual="/js/party/cocktail-parts.js" -->
<!--# include virtual="/js/party/number.js" -->


;(function(){

<!--# include virtual="party.js" -->

function onready ()
{
  UserAgent.setupDocumentElementClassNames()
  
  IngredientPopup.bootstrap()
  
  var nodes =
  {
    root: $('#common-main-wrapper'),
    
    ogImage: $('#og-image'),
    partyName: $('#party-name'),
    window:
    {
      root: $('#window'),
      layers: $$('#window .layer'),
      images: $$('#window .layer .image'),
      bar: $('#window .stub .label .bar')
    },
    recipeList: $('#recipe-list'),
    recipeIngredientPreviews: $$('#recipe-list .recipe .ingredients .ingredient-preview'),
    purchasePlan: $('#purchase-plan'),
    
    ingredients:
    {
      root: $('#ingredients-part'),
      list: $('#ingredients-part .parts-list .list'),
      previewList: $('#ingredients-part .preview-list'),
    },
    
    tools:
    {
      root: $('#tools-part'),
      list: $('#tools-part .parts-list .list'),
      previewList: $('#tools-part .preview-list'),
    },
    
    things:
    {
      root: $('#things-part'),
      list: $('#things-part .parts-list .list'),
      previewList: $('#things-part .preview-list'),
    },
    
    purchasePlanTotal:
    {
      perParty:
      {
        value: $('#purchase-plan .total .per-party .cost'),
        unit: $('#purchase-plan .total .per-party .unit')
      },
      perPerson:
      {
        value: $('#purchase-plan .total .per-person .cost .value'),
        unit: $('#purchase-plan .total .per-person .cost .unit')
      }
    },
    cocktailPlan: $('#cocktail-plan'),
    peopleCount: $('#cocktail-plan .people .value'),
    peopleUnit: $('#cocktail-plan .people .unit'),
    body: $('#cocktail-plan .body'),
    portions: $('#cocktail-plan .body .portions'),
    
    shareBox:
    {
      root: $('#links-box .share-box'),
      buttons: $$('#links-box .share-box .button')
    },
    
    printButton: $('#links-box .print-box .print-page'),
    
    partyList: $('#party-list')
  }
  
  var widget = new PartyPage()
  widget.bind(nodes).guessParty()
}

$.onready(onready)

})();
