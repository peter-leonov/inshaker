<!--# config timefmt="%Y.%m" -->
!function(){

var LINK = '<!--# include virtual="/skin/$date_local/link.txt" -->'
var SELECTOR = '#spotlighted, #branded-image'

var nodes = $$(SELECTOR)
for (var i = 0, il = nodes.length; i < il; i++)
  nodes[i].href = LINK

}();