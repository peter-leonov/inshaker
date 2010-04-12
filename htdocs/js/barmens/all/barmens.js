/**
 * dependencies:
 *    Barman.js
 */
;(function() {
	var myName = 'AllBarmensPage';
	var Me = self[myName] = MVC.create(myName);

	var myProto = {
		initialize: function() {
			this.model.initialize();
			this.view.initialize();
			this.controller.initialize();
		},
		bind: function(nodes, sources, state) {
			this.model.bind(sources);
			this.view.bind(nodes);
			this.controller.bind(state);

			return this;
		}
	};

	Object.extend(Me.prototype, myProto);

	$.onready(function () {
		var nodes = {
		};
		var sources = {
		};

		var page = new AllBarmensPage();

		page.bind(nodes, sources);

		/* ---- DEBUG INFO ---- */
		/* ---- DEBUG INFO ---- */
	});
})();

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->