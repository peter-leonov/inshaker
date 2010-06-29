;(function(){

function script (src) { document.write('<script src="' + src + '" type="text/javascript"></script>') }
function style (src) { document.write('<link rel="stylesheet" href="' + src + '" type="text/css"/>') }

script('/lib-0.3/modules/cascade.js')
script('/lib-0.3/modules/test.js')
script('/lib-0.3/modules/test-tool.js')
script('/lib-0.3/widgets/tests.js')

style('/tests/tests.css')

})();