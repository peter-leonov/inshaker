/**
 * Get element's absolute position. Properly handles Safari's body scroll*.
 * 
 * @param e - element
 * @return {Object} position - x,y
 */
function getPosition (n)
{
	var x = 0, y = 0, p
	for (;;)
	{
		x += n.offsetLeft
		y += n.offsetTop
		if ((p = n.offsetParent))
		{
			x -= n.scrollLeft
			y -= n.scrollTop
			n = p
		}
		else
			break
	}
	
	return {x:x, y:y};
}


/**
 * Класс, который позволяет сделать элемент перетаскиваемым (создается его клон)
 * В результате перетаскивания у элемента-цели срабатывает метод onDrop(name)
 * 
 * @param element который мы хотим таскать
 * @param name - имя или идентификатор этого элемента (или любые данные)
 * @param dropTargets - массив элементов-целей, на которые можно перетаскивать
 */
function Draggable(element, name, dropTargets){
	this.STYLE_CURSOR = 'drag-cursor';
	
	this.dragObject = null;
	var self = this;
	
	function elementWaits(e) {
		e.preventDefault();
		var s = self.startMouse
		if (Math.abs(s.x - e.pageX) > 4 || Math.abs(s.y - e.pageY) > 4)
			beginDrag(e)
	}
	
	function elementMove(e){
		e.preventDefault();
		if(self.dragObject){
			var delta = self.delta, style = self.style
			style.left = (e.pageX + delta.x)  + "px";
			style.top  = (e.pageY + delta.y) + "px";
			return false;
		}
	}
	
	element.addEventListener('mousedown', function(e){
		self.movements = 0
		self.startMouse = {x:e.pageX, y:e.pageY}
		e.preventDefault()
		document.addEventListener('mousemove', elementWaits, false);
	}, false);
	
	function beginDrag(e) {
		var node = self.dragObject = element.cloneNode(true);
		self.style = node.style
		node.addClassName("dragging-object")
		var startPos = getPosition(element)
		self.delta = {x: startPos.x - e.pageX, y: startPos.y - e.pageY}
		
		document.body.appendChild(node)
		// document.body.addClassName(self.STYLE_CURSOR);
		for(var i = 0; i < dropTargets.length; i++){
			if(dropTargets[i].onDragStart) dropTargets[i].onDragStart(element);
		}
		
		document.removeEventListener('mousemove', elementWaits, false);
		document.addEventListener('mousemove', elementMove, false);
		elementMove.apply(this, [e])
	}
	
	document.addEventListener('mouseup', function(e){
		document.removeEventListener('mousemove', elementMove, false);
		document.removeEventListener('mousemove', elementWaits, false);
		if(self.dragObject) {
			document.body.removeChild(self.dragObject);
			// document.body.remClassName(self.STYLE_CURSOR);
			
			// dropping
			for(var i = 0; i < dropTargets.length; i++){
				if(dropTargets[i].style.display == "block"){
					var targPos    = getPosition(dropTargets[i]);
					var targWidth  = parseInt(dropTargets[i].offsetWidth);
					var targHeight = parseInt(dropTargets[i].offsetHeight);
					
					if(
						(e.pageX > targPos.x)                &&
						(e.pageX < (targPos.x + targWidth))  &&
						(e.pageY > targPos.y)                &&
						(e.pageY < (targPos.y + targHeight))){
						if (dropTargets[i].onDrop(name) === true)
							break;
					}
				}
			}
			
			for(var i = 0; i < dropTargets.length; i++)
				if (dropTargets[i].onDragEnd)
					dropTargets[i].onDragEnd();
			
			self.dragObject = null;
		}
	}, false);
}