Tool = function (data)
{
	for (var k in data) this[k] = data[k];
}

Tool.prototype = {
	constructor: Tool,
	
	imgSrc: function(){
		return "/i/merchandise/tools/" + this.name.trans() + ".png";
	}
}

Object.extend(Tool,
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
});

Tool.initialize(<!--# include file="/db/tools.js" -->)