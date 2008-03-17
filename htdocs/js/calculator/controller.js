function CalculatorController(model, view) {
	this.eventListener = model;
	view.eventListener = this;
	
	this.onViewEvent = function() { // view
		
	}
};