<!--# config timefmt="%Y.%m" -->
!function(){

var LINK = '<!--# include virtual="/skin/$date_local/link.txt" -->'
var SELECTOR = '#spotlighted, #branded-image'

var nodes = $$(SELECTOR)
for (var i = 0, il = nodes.length; i < il; i++)
  nodes[i].href = LINK

var PINK_LINK = '<!--# include virtual="/skin/$date_local/pink-link.txt" -->'
var PINK_TEXT = 'Только в ноябре: <u>набор супер бармена</u> всего за 1 999.-'
var PINK_SLCR = '#pink-block'

var nodes = $$(PINK_SLCR)
for (var i = 0, il = nodes.length; i < il; i++)
{
  nodes[i].innerHTML = PINK_TEXT
  nodes[i].href      = PINK_LINK
}

}();