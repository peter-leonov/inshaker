;(function(){

var myName = 'MyBarName',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
		this.model.bind()
		this.controller.bind()
		
		return this
	},
	
	setMainState : function(barName)
	{
		this.model.setMainState(barName)
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();


/*View*/

;(function(){

var Me = MyBarName.View

var myProto =
{
	bind : function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		
		nodes.wrapper.addEventListener('click', function(e){ me.handleBarNameClick(e) }, false)
		document.body.addEventListener('click', function(e){ me.barNameChanging(e) }, true)
		nodes.form.addEventListener('submit', function(e){ me.handleNewBarName(e) }, false)		
		nodes.input.addEventListener('keypress', function(e){ me.handleBarNameKeypress(e) }, false)
		
		nodes.input.bName = true
		nodes.title.bTitle = true
	},
	
	renderBarName : function(barName)
	{
		var nodes = this.nodes
		
		if(barName)
		{
			nodes.bName.innerHTML = barName
			
			nodes.help.hide()
			nodes.bName.show()
		}	
		else
		{
			nodes.help.show()
			nodes.bName.hide()
		}
		
		if(this.barIsChanging)
		{
			this.barIsChanging = false
			nodes.title.show()
			nodes.form.hide()
		}	
	},
	
	handleBarNameClick : function(e)
	{
		var node = e.target,
			nodes = this.nodes
		if(node.parentNode.bTitle)
		{
			nodes.title.hide()
			nodes.form.show()
			
			var currBarName = this.controller.getBarName()
			nodes.input.value = currBarName
			
			if(!nodes.input.value)
				nodes.tip.show()
			else
				nodes.tip.hide()
			
			this.barIsChanging = true
			nodes.input.focus()
		}
	},
	
	barNameChanging : function(e)
	{
		if(!this.barIsChanging) return
		if(e.target.bName) return
		
		this.handleNewBarName()
	},
	
	handleNewBarName : function(e)
	{
		if(e)
			e.preventDefault()
		var input = this.nodes.input,
			notEmpty = /\S/.test(input.value)
		
		if(!notEmpty) input.value = ''
		
		this.controller.setNewBarName(notEmpty ? input.value : this.nodes.tip.innerHTML)
	},
	
	handleBarNameKeypress : function(e)
	{
			var tip = this.nodes.tip
			setTimeout(function(){
				if(e.target.value == '')
					tip.show()
				else
					tip.hide()
			}, 1)
	}
}

Object.extend(Me.prototype, myProto)

})();


/*Model*/
/*Supposed, that BarStorage was be inited*/

;(function(){

var Me = MyBarName.Model

var myProto =
{
	bind : function ()
	{
		this.barName = ''
	},
	
	setMainState : function(barName)
	{
		this.barName = barName
		this.view.renderBarName(barName)
	},
	
	setNewBarName : function(barName)
	{
		this.barName = barName
		BarStorage.saveBar({ barName : barName })
		this.view.renderBarName(barName)
	},
	
	getBarName : function()
	{
		return this.barName
	}
}

Object.extend(Me.prototype, myProto)

})();


/*Controller*/

;(function(){

var Me = MyBarName.Controller

var myProto =
{
	bind : function()
	{
		
	},
	
	setNewBarName : function(barName)
	{
		this.model.setNewBarName(barName)
	},
	
	getBarName : function()
	{
		return this.model.getBarName()
	}
}

Object.extend(Me.prototype, myProto)

})();
