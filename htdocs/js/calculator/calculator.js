var Calculator = {
	init: function(){
		var cartData = {};
		cartData.cocktails = [];
		cartData.cocktails.push([cocktails["Куба Либре"], 3]);
		cartData.cocktails.push([cocktails["Бронкс"], 2]);
		cartData.goods = {};

		var view       = new CalculatorView();
		var model      = new CalculatorModel(view, cartData);
		var controller = new CalculatorController(model, view);
	},
	
};