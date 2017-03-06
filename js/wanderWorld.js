function init(){


	//Width and height
	var width = 800;
	var height = 600;

	var projection = d3.geo.satellite()
		.translate([width/2,0])
		.distance(1.1)
		.scale(3250)
		.center([30, 50])
		.rotate([3, -51.3849401, -45])
		.tilt(20)
		.clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI - 1e-6);
		
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
		land.append("path")
			.datum(topojson.object(data, data.objects.europe))
			.attr("class", "land")
			.attr("d", path);
	});
	
}