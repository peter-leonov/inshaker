;(function() {
	var Papa = AllBarmensPage;
	var Me = Papa.View;

	eval(NodesShortcut.include());

	var myProto = {
		initialize: function () {
			this.nodes = {};
		},
		bind: function (nodes) {
			this.nodes = nodes;
			//this.nodes.word = this.nodes.main.appendChild(T(''));
		},
		modelChanged: function (data) {
			//this.nodes.word.nodeValue = data;
		}
	};

	Object.extend(Me.prototype, myProto);
})();