<!--# config timefmt="%Y.%m" -->
!function(){

function branding ()
{
  var SELECTOR = '#spotlighted, #branded-image'
  var LINK = '<!--# include virtual="/skin/2015.11/link.txt" -->'

  var nodes = $$(SELECTOR)
  for (var i = 0, il = nodes.length; i < il; i++)
    nodes[i].href = LINK
}
branding()


function pink ()
{
  var SELECTOR = '#pink-block'
  var PINK = JSON.parse('<!--# include virtual="/skin/2015.11/pink.json" -->')
  var random = PINK.random(1)[0]

  var nodes = $$(SELECTOR)
  for (var i = 0, il = nodes.length; i < il; i++)
  {
    nodes[i].innerHTML = random.text
    nodes[i].href      = random.link
  }
}
try { pink() } catch (e) { /* I don't care */ }

}();