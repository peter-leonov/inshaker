;(function() {
	var Papa = AllBarmensPage;
	var Me = Papa.Controller;

	var myProto = {
		initialize: function() {
			this.state = {};
		},
		bind: function(state) {
			this.model.setState(state);
		},
		setBarmensPhoto: function() {
			this.view.renderBarmensPhoto(this.model.sources.barmens);
		}
	};

	Object.extend(Me.prototype, myProto);
})();