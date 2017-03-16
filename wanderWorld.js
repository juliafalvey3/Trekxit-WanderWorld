var width = 1400,
	height = 800;

var mapW = 900,
	mapH = 1000,
	mapX = 520,
	mapY = 0;

var projScale = 750,
	projX = 300,
	projY = 1300;


function init(){

	var container = d3.select('body').append('svg')
	    .attr('width', width)
	    .attr('height', height);
	makeOthers(container)
	makeMap(container)
}

function makeMap(container){

	var map = container.append('svg')
	    .attr('width', mapW)
	    .attr('height', mapH)
	    .attr('transform', 'translate('+mapX+','+mapY+')');


	var projection = d3.geo.mercator()
		.scale(projScale)
		.translate([projX, projY]);

	var path = d3.geo.path().projection(projection);


	d3.json("eu.json", function(error, eu) {
	  if (error) return console.error(error);

	  var subunits = topojson.feature(eu, eu.objects.subunits);

  	  map.append("path")
	      .datum(subunits)
      	  .attr("d", path)
      	  .attr("fill", "#3690c0")
      	  .attr("class", function(d) { return "subunit " + d.id; });
      map.append("path")
	    .datum(topojson.mesh(eu, eu.objects.subunits, function(a, b) {return a !== b; }))
	    .attr("d", path)
	    .attr("fill", "none")
	    .attr("stroke", "#252525");

	});
}

function makeOthers(container){

	var others = container.append('svg')
		.attr('width', (width-projX))
	    .attr('height', (height - projY));

	others.append("text")
		.text("Test")
		.attr("fill", "black")
		.attr("x", 100)
		.attr("y", 100)

}