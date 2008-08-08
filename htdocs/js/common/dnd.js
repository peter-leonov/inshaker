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
	
	function elementMove(e){
		e.preventDefault();
		if(self.dragObject){
			self.dragObject.style.display = "block";
			self.dragObject.style.top  = (e.pageY - mouseOffset.y) + "px";
			self.dragObject.style.left = (e.pageX - mouseOffset.x)  + "px";
			return false;
		}
	}
	
	element.addEventListener('mousedown', function(e){
		e.preventDefault()
		self.dragObject = element.cloneNode(true);
		self.dragObject.style.position = "absolute";
		
		mouseOffset = self.getMouseOffset(element);
		self.dragObject.style.display = "none";
		
		document.body.appendChild(self.dragObject);
		// document.body.addClassName(self.STYLE_CURSOR);
		for(var i = 0; i < dropTargets.length; i++){
			if(dropTargets[i].onDragStart) dropTargets[i].onDragStart(element);
		}
		
		document.addEventListener('mousemove', elementMove, false);
	}, false);
	
	document.addEventListener('mouseup', function(e){
		document.removeEventListener('mousemove', elementMove, false);
		if(self.dragObject) {
			document.body.removeChild(self.dragObject);
			// document.body.remClassName(self.STYLE_CURSOR);
			
			// dropping
			for(var i = 0; i < dropTargets.length; i++){
				if(dropTargets[i].style.display != "none"){
					var targPos    = getPosition(dropTargets[i]); // from util.js
					var targWidth  = parseInt(dropTargets[i].offsetWidth);
					var targHeight = parseInt(dropTargets[i].offsetHeight);
					
					if(
						(e.pageX > targPos.x)                &&
						(e.pageX < (targPos.x + targWidth))  &&
						(e.pageY > targPos.y)                &&
						(e.pageY < (targPos.y + targHeight))){
						dropTargets[i].onDrop(name);
					} else {
						if(dropTargets[i].onDragEnd) dropTargets[i].onDragEnd();
					}
				}
			}
			self.dragObject = null;
        }
    }, false);

	this.getMouseOffset = function(elem){
		return {x:elem.offsetWidth/2, y:elem.offsetHeight/2};
	}; 
}