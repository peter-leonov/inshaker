<!--# config timefmt="%Y.%m" -->
!function(){

function branding ()
{
  var SELECTOR = '#spotlighted, #branded-image'
  var LINK = '<!--# include virtual="/skin/$date_local/link.txt" -->'

  var nodes = $$(SELECTOR)
  for (var i = 0, il = nodes.length; i < il; i++)
    nodes[i].href = LINK
}
branding()


function pink ()
{
  var SELECTOR = '#pink-block'
  var PINK = JSON.parse('<!--# include virtual="/skin/$date_local/pink.json" -->')
  var random = PINK[Math.ceil(Math.random() * PINK.length)]

  var nodes = $$(SELECTOR)
  for (var i = 0, il = nodes.length; i < il; i++)
  {
    nodes[i].innerHTML = random.text
    nodes[i].href      = random.link
  }
}
try { pink() } catch (e) { /* I don't care */ }

}();