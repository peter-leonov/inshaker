var Calculator = {
	init: function(){
		this.view       = new CalculatorView();
		this.model      = new CalculatorModel(this.view);
		this.controller = new CalculatorController(this.model, this.view);
	}
};