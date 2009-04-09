;(function() {
	var Papa = BarmensPage;
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
		},
		renderBarmanCocktails: function(cocktails) {
			var tmp = document.createDocumentFragment();

			for (var i=0, ii=cocktails.length; i<ii; i++) {
				var cocktail = cocktails[i];
				var li = Cocktail.getByName(cocktail).getPreviewNode();

				tmp.appendChild(li);
			}

			this.nodes.ajaxLoadingImage.hide();
			this.nodes.barmanCocktailsList.appendChild(tmp);
		},
		renderNextAndPrevBarmensLinks: function(barman) {
			this.nodes.nextBarman.href = '/barman/' + barman.next().path + '/index.html';
			this.nodes.prevBarman.href = '/barman/' + barman.prev().path + '/index.html';
		}
	};

	Object.extend(Me.prototype, myProto);
})();