/**
 * Класс, который позволяет сделать элемент перетаскиваемым (создается его клон)
 * В результате перетаскивания у элемента-цели срабатывает метод onDrop(name)
 * 
 * @param element который мы хотим таскать
 * @param name - имя или идентификатор этого элемента (или любые данные)
 * @param dropTargets - массив элементов-целей, на которые можно перетаскивать
 */
function Draggable(element, name, dropTargets){
    this.STYLE_CURSOR = 'drag_cursor';

	this.dragObject = null;
    var self = this;
	var mouseOffset = {};

   	element.addEventListener('mousedown', function(e){
        e.preventDefault();
        
		self.dragObject = element.cloneNode(true);
		self.dragObject.style.position = "absolute";

		mouseOffset = self.getMouseOffset(element);
		self.dragObject.style.display = "none";
		
		document.body.appendChild(self.dragObject);
		document.body.addClassName(self.STYLE_CURSOR);
        return false;
    }, false);

    document.addEventListener('mouseup', function(e){
        if(self.dragObject) {
            var mousePos = self.mouseCoords(e);
			document.body.removeChild(self.dragObject);
			document.body.remClassName(self.STYLE_CURSOR);
			
			// dropping
			for(var i = 0; i < dropTargets.length; i++){
				if(dropTargets[i].style.display != "none"){
					var targPos    = self.getPosition(dropTargets[i]);
					var targWidth  = parseInt(dropTargets[i].offsetWidth);
					var targHeight = parseInt(dropTargets[i].offsetHeight);
            		
					if(
						(mousePos.x > targPos.x)                &&
						(mousePos.x < (targPos.x + targWidth))  &&
						(mousePos.y > targPos.y)                &&
						(mousePos.y < (targPos.y + targHeight))){
						dropTargets[i].onDrop(name);
					}
				}
			}
            self.dragObject = null;
        }
    }, false);

    document.addEventListener('mousemove', function(e){
        var mousePos = self.mouseCoords(e);
        if(self.dragObject){
			self.dragObject.style.display = "block";
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

	this.getPosition = function(e){
		var left = 0;
		var top  = 0;

		while (e.offsetParent){
			left += e.offsetLeft;
			top  += e.offsetTop;
			e     = e.offsetParent;
		}

		left += e.offsetLeft;
		top  += e.offsetTop;

		return {x:left, y:top};
	};   
}