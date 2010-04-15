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
		},
		setBarmensPhoto: function() {
			this.controller.setBarmensPhoto();
		}
	};

	Object.extend(Me.prototype, myProto);

	$.onready(function () {
		var nodes = {
			loadingNode: $$('div.loading')[0],
			barmensList: $$('ul.list')[0]
		};
		var sources = {
			barmens: Barman.barmen
		};

		var page = new AllBarmensPage();

		page.bind(nodes, sources);
		page.setBarmensPhoto();

		/* ---- DEBUG INFO ---- */
		/* ---- DEBUG INFO ---- */
	});
})();

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->