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
		renderBarmensPhoto: function(barmen) {
			var li, div, a, span, text, tmp = document.createDocumentFragment();

			for (var i = 0, ii = barmen.length; i < ii; i++) {
				li = document.createElement('li');
				li.className = 'item';
				div = document.createElement('div');
				a = document.createElement('a');
				a.href = barmen[i].path;
				span = document.createElement('span');
				text = document.createTextNode(barmen[i].name);
				span.appendChild(text);
				a.appendChild(span);
				div.appendChild(a);

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

		var currentWindowOffsetTop = clientVisibleHeight + pageYOffset;
		var barmans = Barman.barmen;

		for (var i = 0, ii = this.nodes.barmanListItems.length; i < ii; i++) {
			var barmanListNode = this.nodes.barmanListItems[i];

			if (barmanListNode.offsetTop <= currentWindowOffsetTop) {
				barmanListNode.style.background = 'url(' + Barman.getPhoto(barmans[i]) + ')';
			}
		}
	}

//	function newlazyLoadingImages(clientVisibleHeight, pageYOffset, elements, callback) {
//		clientVisibleHeight = clientVisibleHeight || document.documentElement.clientHeight;
//		pageYOffset = pageYOffset || 0;
//
//		var currentWindowOffsetTop = clientVisibleHeight + pageYOffset;
//
//		for (var i = 0, ii = elements.length; i < ii; i++) {
//			var node = elements[i];
//
//			if (node.offsetTop <= currentWindowOffsetTop) {
//				callback(node);
//			}
//		}
//	}


	Object.extend(Me.prototype, myProto);
})();