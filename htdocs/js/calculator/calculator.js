var Calculator = {
	init: function(){
		this.view       = new CalculatorView();
		this.model      = new CalculatorModel(this.view);
		this.controller = new CalculatorController(this.model, this.view);
	},
	
	getSum: function(){
		return this.view.cartSum;
	},
	
	getShopList: function(){
		return this.model.cartData;
	},
	
	addChangeListener: function(listener){
		this.model.addDataListener(listener);
	},
	
	setPopupStatusListener: function(listener){
		this.view.popupStatusListener = listener;
	}
};