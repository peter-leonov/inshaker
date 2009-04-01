;(function() {
	var Papa = BarmensPage;
	var Me = Papa.Controller;

	var myProto = {
		initialize: function() {
			this.state = {};
		},
		bind: function(state) {
			this.model.setState(state);
		},
		setCocktails: function() {
			this.view.renderBarmanCocktails(this.model.sources.barman.cocktails);
		}
	};

	Object.extend(Me.prototype, myProto);
})();