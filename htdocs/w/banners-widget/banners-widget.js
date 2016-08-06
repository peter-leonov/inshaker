!function(){

var db = <!--# include virtual="/db/banners/banners.json" -->

var bannersRoot = $('#banners-widget')
if (!bannersRoot)
  return

var type = bannersRoot.getAttribute('data-type')

function renderBanners ()
{
    
}

$.onready(renderBanners)

}()