;(function(){

function Me (data)
{
	for (var k in data) this[k] = data[k];
}

Me.prototype = {
	constructor: Me,
	
	imgSrc: function(){
		return "/i/merchandise/tools/" + this.name.trans() + ".png";
	}
}

Me.staticMethods =
{
	tools: [],
	
	initialize: function (array)
	{
		for(var i = 0; i < array.length; i++){
			var tool = new Tool(array[i]);
			this.tools[i] = tool;
		}
	},
	
	getByName: function (name)
	{
		for(var i = 0; i < this.tools.length; i++){
			if(this.tools[i].name == name) return this.tools[i];
		}
	}
}

Object.extend(Me, Me.staticMethods)

Me.className = 'Tool'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/tools/tools.json" -->)

})();
