<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->

Math.roundPrecision = function($num, $precision) {
	if (isNaN($precision)) $precision = 0;
 	return Math.round(($num * Math.pow(10, $precision))) / Math.pow(10, $precision);
};

var Calculator = {	
	_MIN_CALL_BARMEN_SUM : 25000,
	_MIN_ORDER_SUM  : 3000,
	
	init: function(){
		this.view       = new CalculatorView();
		this.model      = new CalculatorModel(this.view);
		this.controller = new CalculatorController(this.model, this.view);
	},
	
	getSum: function(){
		return this.model.getCartSum();
	},
	
	checkSum: function(context){
		var minSum = this.getMinSum(context);
		return (this.getSum() > minSum);
	},
	
	getShopList: function(){
		return this.model.cartData;
	},
	
	addChangeListener: function(listener){
		this.model.addDataListener(listener);
	},
	
	getMinSum: function(context){
		var value = "_MIN_" + context.toUpperCase() + "_SUM";
		return this[value] || 0;
	},
	
	isIngredientPresent: function(name){
		return this.model.isIngredientPresent(name);
	},

    showPopup: function(ingredName){
        this.view.showPopup(ingredName);
    },

    addCocktail: function(cocktailName){
        this.controller.addCocktail(cocktailName);
    },
	
	CART : 'cart',
	
	serializeCartData: function (cd)
	{
		var cocktails = [],
			goods = {}
		
		for (var i = 0; i < cd.cocktails.length; i++)
			cocktails[i] = [cd.cocktails[i][0].name, cd.cocktails[i][1]]
		
		for (var k in cd.goods)
		{
			goods[k] =
			{
				bottles: cd.goods[k].bottles,
				dose: cd.goods[k].dose
			}
		}
		
		return {cocktails: cocktails, goods: goods}
	},
	
	deSerializeCartData: function (cartData)
	{
		var dataCocktails = cartData.cocktails,
			cocktails = []
		for (var i = 0; i < dataCocktails.length; i++)
		{
			var cocktail = Cocktail.getByName(dataCocktails[i][0])
			if (cocktail)
				cocktails.push([cocktail, dataCocktails[i][1]])
		}
		
		var gds = {}
		for (var name in cartData.goods)
		{
			var good = Ingredient.getByName(name)
			if (good)
			{
				gds[name] = cartData.goods[name]
				gds[name].good = good
			}
		}
		
		return {cocktails: cocktails, goods: gds}
	}
};
