function CalculatorModel(view, cartData){
	this.dataListener = view;
	this.cartData = cartData;
	
 	this.cartData.goods = DataFilter.goodsByCocktails(goods, this.cartData.cocktails);
	this.dataListener.modelChanged(this.cartData);
};