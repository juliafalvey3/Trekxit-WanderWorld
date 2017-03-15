function init(){

	var width = 1000,
		height = 800;
	 
	var svg = d3.select('body').append('svg')
	    .attr('width', width)
	    .attr('height', height);


	var projection = d3.geo.mercator()
				   .scale([1000]);

	var path = d3.geo.path().projection(projection);

	d3.json("eu.json", function(error, eu) {
	  if (error) return console.error(error);

	  console.log(eu)
	  svg.append("path")
	      .data(topojson.feature(eu, eu.objects.subunits).features)
	      .attr("d", path)
	      .attr("fill", "black");
	});
}