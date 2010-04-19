;(function(){

var Papa = AllBarmensPage;
var Me = Papa.View;

eval(NodesShortcut.include());

var myProto =
{
	initialize: function ()
	{
		this.nodes = {};
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes;
	},
	
	modelChanged: function (barmen)
	{
		this.renderBarmen(barmen);
	},
	
	renderBarmen: function (barmen)
	{
		barmen.randomize();
		
		var tmp = document.createDocumentFragment();

		this.itemCache = [];
		
		for (var i = 0, il = barmen.length; i < il; i++)
		{
			var barman = barmen[i];
			
			var item = Nc('li', 'item');
			tmp.appendChild(item);
			
			var preview = Nc('a', 'barman-preview');
			preview.barmanImageSrc = 'url(' + barman.getPhoto() + ')';
			preview.href = barman.pageHref();
			item.appendChild(preview);
			preview.appendChild(Nct('span', 'name', barman.name));
			this.itemCache.push(preview);
		}
		
		var list = this.nodes.barmensList;
		list.empty();
		list.appendChild(tmp);

		this.setupVisibilityFrame(this.itemCache);
	},
	setupVisibilityFrame: function(nodes) {
		var boxes = Boxer.sameNodesToBoxes(nodes);
		var frame = new VisibilityFrame();
		frame.setFrame(window.innerWidth, window.innerHeight);
		frame.setStep(500, 500);
		frame.setBoxes(boxes);

		frame.onmove = function (show, hide)
		{
			for (var i = 0; i < show.length; i++)
			{
				var box = show[i];
				if (!box.loaded)
				{
					var node = box.node,
						image = node.barmanImageSrc;

					node.style.backgroundImage = image;
					node.removeClassName('lazy');

					box.loaded = true;
				}
			}
		};

		function onscroll ()
		{
			frame.moveTo(window.pageXOffset, window.pageYOffset);
		}
		window.addEventListener('scroll', function () { onscroll(); }, false);
		onscroll();
	}
}

Object.extend(Me.prototype, myProto);

})();
