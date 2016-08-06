window.BannersWidget = function (type) {

var db = <!--# include virtual="/db/banners/banners.json" -->

var bannersRoot = $('#banners-widget')
if (!bannersRoot)
    return

var bannerWide = $('.BannersWidget-wide')
var bannerA    = $$('.BannersWidget-small')[0]
var bannerB    = $$('.BannersWidget-small')[1]

function sortByWeightAndRandomize (banners)
{
    return banners.slice().sort(function (a, b) {
        if (a.weight == b.weight)
            return Math.random() - 0.5
        return -(a.weight - b.weight)
    })
}

function selectBannersToShow (banners)
{
    var wide = banners
        .filter(function (e) { return e.type == "wide" })
        .slice(0, 1)

    var small = banners
        .filter(function (e) { return e.type == "small" })
        .slice(0, 2)

    return {
        wide:  wide.length  == 1 && wide,
        small: small.length == 2 && small
    }
}

function renderBannersToNodes (banners, nodes)
{
    banners.forEach(function (banner, i) {
        nodes[i].show()
        nodes[i].href = banner.link
        nodes[i].style.backgoundImage = 'url('+banner.img+')'
    })
}

function renderAllCocktailsPageBanners ()
{
    // get banners marked to be shown on cocktails page
    var matching = db
        .filter(function (e) { return e.showOnAllCocktailsPage })

    var layout = selectBannersToShow(sortByWeightAndRandomize(matching))

    if (layout.wide)
    {
        bannersRoot.show()
        bannerWide.show()
        renderBannersToNodes(layout.wide, [bannerWide])
    }
    
}

if (type == 'all-cocktails')
    renderAllCocktailsPageBanners()

}