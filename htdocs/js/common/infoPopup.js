/**
 * Popup-окошко большое прямоугольное для фотографа-гида и барменов
 *
 * @requires "/inc/*-info-popup.html"
 * @requires "/t/info-popup.css" 
 *
 * @param opener - элемент, при клике на котором открывается Popup
 * @param popup - элемент popup'a.
 * @param displayObject - объект, обладающий функцией render(context), которая вызывается для его отрисовки в popup'e \
 * а также свойством {Boolean} switchable, если элемент меняется, и функциями next() и prev(), \
 * если switchable == true  
 */
function InfoPopup (opener, popup, displayObject)
{   
    popup.InfoPopup = me = this
    
    var View  = function (opener, popup, switchable) {
        this.initialize = function()
        {
            var ct = this.controller
            opener.addEventListener('click', function(e) { if(switchable) { ct.resetDisplayObject() }; popup.show() }, false)
		    var ici = [cssQuery('.popup-controls .text', popup)[0], cssQuery('.popup-controls .cross', popup)[0], cssQuery('.popup-back', popup)[0]]
	        for(var i = 0; i < ici.length; i++)	
                ici[i].addEventListener('click', function(e){ me.closeListener && me.closeListener(); popup.hide() }, false)
         
            if (switchable)
            {
                this.next = cssQuery('.arrow.next', popup)[0], this.prev = cssQuery('.arrow.prev', popup)[0]
                this.next.addEventListener('click', function (e) { ct.switchView(true)  }, false)
                this.prev.addEventListener('click', function (e) { ct.switchView(false) }, false)
             }
        }

        this.show = function () { popup.show() }
        this.displayObjectChanged = function (newObject, nextDisabled, prevDisabled) 
        { 
            if (switchable)
            {
                if (nextDisabled) this.next.addClassName('disabled'); else this.next.remClassName('disabled')
                if (prevDisabled) this.prev.addClassName('disabled'); else this.prev.remClassName('disabled')
            }
            newObject.render(popup) 
        }
    }
    
    var Model = function (view) {
        this.setDisplayObject = function (obj)
        {
            if(this.displayObject != obj)
            {
                this.displayObject = obj
                var nextDisabled = false, prevDisabled = false
                if (obj.switchable) nextDisabled = !obj.next(), prevDisabled = !obj.prev()
                view.displayObjectChanged(this.displayObject, nextDisabled, prevDisabled)
            }
        }

        this.switchDisplayObject = function (next) 
        { 
            var obj = next? this.displayObject.next() : this.displayObject.prev()
            if(obj) this.setDisplayObject(obj)
        }
    }

    var Controller = function (displayObject, model, view) {
        view.controller = this
        var initialDisplayObject = displayObject
        
        this.resetDisplayObject = function () { model.setDisplayObject(initialDisplayObject) }
        this.switchView = function (next) { model.switchDisplayObject(next) }
        this.initialize = function ()
        {
            view.initialize()
            // model.setDisplayObject(displayObject)
        }
        this.initialize()
    }

    this.view = new View(opener, popup, displayObject.switchable)
    this.model = new Model(this.view)
    this.controller = new Controller(displayObject, this.model, this.view) 
    
    this.addCloseListener = function (closeListener) { this.closeListener = closeListener } 
}

