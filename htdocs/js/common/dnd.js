function Draggable(element, name, dropTarget){
    this.STYLE_CURSOR = 'drag_cursor';

	this.dragObject = null;
    var self = this;
	var mouseOffset = {};

    element.addEventListener('mousedown', function(e){
        e.preventDefault();
        
		self.dragObject = element.cloneNode(true);
		self.dragObject.style.position = "absolute";
		 
        var mousePos = self.mouseCoords(e);
		mouseOffset = self.getMouseOffset(element);
		
		self.dragObject.style.top  = (mousePos.y - mouseOffset.y) + "px";
        self.dragObject.style.left = (mousePos.x - mouseOffset.x)  + "px";
		
		document.body.appendChild(self.dragObject);
		document.body.addClassName(self.STYLE_CURSOR);
        return false;
    }, false);

    document.addEventListener('mouseup', function(e){
        if(self.dragObject) {
            document.body.removeChild(self.dragObject);
			document.body.remClassName(self.STYLE_CURSOR);
            self.dragObject = null;
        }
    }, false);

    document.addEventListener('mousemove', function(e){
        e = e || window.event;
        var mousePos = self.mouseCoords(e);
        if(self.dragObject){
            self.dragObject.style.top  = (mousePos.y - mouseOffset.y) + "px";
            self.dragObject.style.left = (mousePos.x - mouseOffset.x)  + "px";
            return false;
        }
    }, false);

	this.getMouseOffset = function(elem){
		return {x:elem.offsetWidth/2, y:elem.offsetHeight/2};
	};

    this.mouseCoords = function(e){
        if(e.pageX || e.pageY) {
            return {x:e.pageX, y:e.pageY};
        }
        return {
            x:e.clientX + document.body.scrollLeft - document.body.clientLeft,
            y:e.clientY + document.body.scrollTop  - document.body.clientTop
        };
    };
    
}
