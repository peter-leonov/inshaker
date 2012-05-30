;(function(){

if (document.documentElement.classList)
	return

function ClassList (node)
{
	this.node = node
}

var R = RegExp

var rexCache = {}
function getRex (cn)
{
	var rex = rexCache[cn]
	if (rex)
	{
		rex.lastIndex = 0
		return rex
	}
	
	return rexCache[cn] = new R('(?:^| +)(?:' + R.escape(cn) + '(?:$| +))+', 'g')
}

ClassList.prototype =
{
	add: function (cn)
	{
		var node = this.node
		
		var className = node.className
		if (!className)
		{
			node.className = cn
			return
		}
		
		if (className.substr(-1) == ' ')
		{
			node.className = className + cn
			return
		}
		
		node.className = className + ' ' + cn
	},
	
	remove: function (cn)
	{
		var node = this.node
		
		var className = node.className
		if (!className)
			return
		
		node.className = className.replace(getRex(cn), '∅').replace(/^∅|∅$/g, '').replace(/∅/g, ' ')
	},
	
	contains: function (cn)
	{
		var node = this.node
		
		var className = node.className
		if (className == cn)
			return true
		
		return getRex(cn).test(className)
	},
	
	toggle: function (cn)
	{
		if (this.contains(cn))
		{
			this.remove(cn)
			return false
		}
		
		this.add(cn)
		return true
	},
	
	toArray: function ()
	{
		var className = this.node.className
		if (!className)
			return []
		
		return className.replace(/^\s+|\s+$/g, '').split(/ +/)
	},
	
	item: function (n)
	{
		var v = this.toArray()[n]
		return v === undefined ? null : v
	},
	
	getLength: function ()
	{
		return this.toArray().length
	}
}

ClassList.prototype.__defineGetter__('length', ClassList.prototype.getLength)

function bakeItemGetter (n)
{
	return function () { return this.item(n) }
}

for (var i = 0; i < 100; i++)
	ClassList.prototype.__defineGetter__(i, bakeItemGetter(i))


function getClassList ()
{
	var classList = this.__classList
	if (classList)
		return classList
	
	return this.__classList = new ClassList(this)
}

Element.prototype.__defineGetter__('classList', getClassList)

})();
