var Calculator = {	
	_MIN_CALL_BARMEN_SUM : 25000,
	_MIN_ORDER_SUM  : 3000,
	
	init: function(){
		this.view       = new CalculatorView();
		this.model      = new CalculatorModel(this.view);
		this.controller = new CalculatorController(this.model, this.view);
	},
	
	getSum: function(){
		return this.view.cartSum;
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
	
	setPopupStatusListener: function(listener){
		this.view.popupStatusListener = listener;
	},
	
	getMinSum: function(context){
		var value = "_MIN_" + context.toUpperCase() + "_SUM";
		return this[value] || 0;
	},
	
	isIngredientPresent: function(name){
		return this.model.isIngredientPresent(name);
	}
};