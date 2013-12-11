;(function(){

eval(NodesShortcut.include())

var Super = Popup,
	superProto = Super.prototype

function PlainPopup ()
{
	Super.apply(this)
}

PlainPopup.prototype = new Super()

var myProto =
{
	render: function (child)
	{
		var clone = this.cloner.create()
		this.popupRoot.appendChild(clone.root)
		
		var nodes = clone.nodes
		nodes.root = clone.root
		
		nodes.window.appendChild(child)
		
		// implies this.nodes = nodes
		this.bind(nodes)
	},
	
	destroy: function ()
	{
		this.nodes.root.remove()
	}
}

Object.extend(PlainPopup.prototype, myProto)

var myStatic =
{
	bind: function (nodes)
	{
		this.cache = {}
		
		var proto = this.prototype
		
		proto.popupRoot = nodes.root
		
		var cloner = proto.cloner = new Cloner()
		cloner.bind(nodes.popupMain, nodes.popupParts)
	},
	
	show: function (child)
	{
		this.hide()
		
		var popup = new PlainPopup()
		popup.render(child)
		popup.show()
		
		this.popup = popup
		return popup
	},
	
	hide: function ()
	{
		var popup = this.popup
		if (!popup)
			return
		
		popup.hide()
		popup.destroy()
		
		this.popup = null
	}
}

Object.extend(PlainPopup, myStatic)

window.PlainPopup = PlainPopup

})();


;(function(){

$.onready(function ()
{
  PlainPopup.bind
  ({
    root: document.body,
    popupMain: $('.plain-popup-widget'),
    popupParts:
    {
      window: $('.plain-popup-widget .popup-window'),
      front: $('.plain-popup-widget .popup-front')
    }
  })


  document.body.addEventListener('click', function (e)
  {
    var h = e.target.findParent(function (n)
    {
      var selector = n.getAttribute('data-popup')
      return selector && {selector: selector, root: n}
    })
    
    if (!h) // it is not our click at all
      return
    
    var content = $(h.selector, h.root)
    if (!content) // broken markup
    {
      // TODO: scream to the error log
      return
    }
    
    PlainPopup.show(content.cloneNode(true))
  }, false)
})

})();
