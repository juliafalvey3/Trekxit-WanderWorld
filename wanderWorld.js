function init(){

	var width = 1000,
		height = 800;
	 
	var svg = d3.select('body').append('svg')
	    .attr('width', width)
	    .attr('height', height);


	var projection = d3.geo.mercator()
				   //.translate([width/2, height/2])
				   .scale([1000]);

	var path = d3.geo.path().projection(projection);

	var color = d3.scale.linear().range(["floralwhite", "darkgreen"]);

	d3.queue()
		.defer(d3.json, 'eu.topojson')
		.await(ready);


	function ready(error, eu) {

	  if (error) throw error;

	  svg.append("g")
	      .attr("class", "counties")
	    .selectAll("path")
	    .data(topojson.feature(eu, eu.objects.europe).features)
	    .enter().append("path")
    		.attr("class", function(d) { ; })
    		.attr('fill', "goldenrod")
	     .attr("d", path)
	     .attr('id', function(d){return d.id})
      	.on("mouseover", tip.show)
        .on("mouseout", tip.hide);

  }

	
}