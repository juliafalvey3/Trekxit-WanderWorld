function init(){


	//Width and height
	var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

	var width = 600,
    	height = 500;

	var projection = d3.geo.conicConformalEurope();
	var path = d3.geo.path()
		.projection(projection);
		
	var graticule = d3.geo.graticule()
	    .step([5, 5]);
		
	var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height);
		
	svg.append("path")
		.datum(graticule)
		.attr("class", "graticule")
		.attr("d", path);
	
	var land = svg.append("g");

	d3.json('europe.json', function(err, data) {
		console.log(data)
		// land.append("path")
		// 	.datum(topojson.object(data, data.objects.europe))
		// 	.attr("class", "land")
		// 	.attr("d", path);
	});
	
}