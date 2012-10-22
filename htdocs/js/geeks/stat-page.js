<!--# include virtual="/liby/modules/motion.js" -->
<!--# include virtual="/liby/modules/motion-types.js" -->
<!--# include virtual="/liby/modules/animation.js" -->
<!--# include virtual="/js/common/rolling-images.js" -->

<!--# include virtual="/liby/modules/google-api-loader.js" -->
<!--# include virtual="/js/common/google.js" -->

<!--# include virtual="/js/geeks/stat.js" -->


function drawChartToNode (node, data)
{
	var visual = google.visualization
	
	var dataPie = new visual.DataTable()
	dataPie.addColumn('string', 'Browser')
	dataPie.addColumn('number', 'Slices')
	dataPie.addRows(data.data)
	
	var optionsPie =
	{
		height: 822,
		width: 960,
		colors: data.colors,
		backgroundColor: 'none',
		pieSliceText: 'label',
		pieSliceTextStyle:
		{
			fontSize: 11
		},
		chartArea:
		{
			top: 30,
			left: 1,
			height: 670,
			width: 960
		},
		legend:
		{
			position: 'none'
		},
		sliceVisibilityThreshold: 0
	}
	
	var chartPie = new visual.PieChart(node)
	chartPie.draw(dataPie, optionsPie)
}

function onready ()
{
	function onvisualization ()
	{
		drawChartToNode($('#stat-browsers'), BrowsersStats.getChartData())
		drawChartToNode($('#stat-browsers-plain'), BrowsersStats.getChartDataPlain())
	}
	
	googleApiLoader.addEventListener('visualization', onvisualization, false)
	googleApiLoader.load('visualization', 1, {packages: ['corechart']})
	
	new RollingImagesLite($('#rolling-stats'), {animationType: 'directJump'})
}
$.onready(onready)
