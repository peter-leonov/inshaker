!function(){

var LINK = 'http://shop.inshaker.ru/products/antica?variant=1187319656'
var SELECTOR = '#spotlighted, #branded-image'

var nodes = $$(SELECTOR)
for (var i = 0, il = nodes.length; i < il; i++)
  nodes[i].href = LINK

}();