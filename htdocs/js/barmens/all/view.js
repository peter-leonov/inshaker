;
(function() {
	var Papa = AllBarmensPage;
	var Me = Papa.View;

	eval(NodesShortcut.include());

	var myProto = {
		initialize: function () {
			this.nodes = {};
			this.bindEvents();
		},
		bind: function (nodes) {
			this.nodes = nodes;
			//this.nodes.word = this.nodes.main.appendChild(T(''));
		},
		modelChanged: function (data) {
			//this.nodes.word.nodeValue = data;
		},
		bindEvents: function() {
			var view = this;
			window.onscroll = function(e) {
				lazyLoadingImages.call(view, e.currentTarget.innerHeight, e.currentTarget.pageYOffset);
			};
		},
		renderBarmensPhoto: function(barmens) {
			var barman, li, div, tmp = document.createDocumentFragment();

			//this.nodes.barmanListItems = [];

			for (var i = 0, ii = barmens.length; i < ii; i++) {
				barman = barmens[i];
				li = document.createElement('li');
				li.className = 'item';
				div = document.createElement('div');
				div.style.image = 'url(' + Barman.getPhoto(barman) + ')';

				li.appendChild(div);
				tmp.appendChild(li);
			}

			this.nodes.loadingNode.hide();
			this.nodes.barmensList.appendChild(tmp);

			this.nodes.barmanListItems = $$('li.item div');
			lazyLoadingImages.call(this);
		}
	};

	function getOffsetRect(elem) {
		var box = elem.getBoundingClientRect();

		var body = document.body;
		var docElem = document.documentElement;

		var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

		var clientTop = docElem.clientTop || body.clientTop || 0;
		var clientLeft = docElem.clientLeft || body.clientLeft || 0;

		var top = box.top + scrollTop - clientTop;
		var left = box.left + scrollLeft - clientLeft;

		return { top: Math.round(top), left: Math.round(left) };
	}

	function lazyLoadingImages(clientVisibleHeight, pageYOffset) {
		clientVisibleHeight = clientVisibleHeight || document.documentElement.clientHeight;
		pageYOffset = pageYOffset || 0;
		//var currentWindowOffsetTop = e.currentTarget.innerHeight + e.currentTarget.pageYOffset;
		var currentWindowOffsetTop = clientVisibleHeight + pageYOffset;
		var nodes = $$('li.item div');

		for (var i = 0, ii = this.nodes.barmanListItems.length; i < ii; i++) {
			var barmanListNode = this.nodes.barmanListItems[i];
			//console.log(barmanListNode.offsetTop < currentWindowOffsetTop, !barmanListNode.style.background);
			if (barmanListNode.offsetTop <= currentWindowOffsetTop) {
				barmanListNode.innerHTML = 'ololol ' + barmanListNode.style.image;
				//barmanListNode.style.background = barmanListNode.style.image;
			}
		}
	}


	Object.extend(Me.prototype, myProto);
})();