var width = 1400,
	height = 800;

var mapW = 900,
	mapH = 1000,
	mapX = 520,
	mapY = 0;

var projScale = 700,
	projX = 300,
	projY = 1250;

var otherW = width-mapW
	otherH = 1000;

var half = width/2;

function init(){
	d3.select('#vis').selectAll('*').remove();
	var container = d3.select('#vis').append('svg')
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

 	var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .html(function(d){return d.properties.name})



	d3.json("eu.json", function(error, eu) {
	  if (error) return console.error(error);

  	var subunits = topojson.feature(eu, eu.objects.subunits).features;

  	var places = topojson.feature(eu, eu.objects.places);
  	console.log(places)

   	var tp = map.append("g")
 		.data(subunits);

	tp.call(tip);


	  map.append("g")
	      .attr("class", "counties")
	    .selectAll("path")
	    .data(subunits)
	    .enter().append("path")
    		.attr('fill', "#3690c0")
	     .attr("d", path)
	     .attr('id', function(d){return d.id})
      	.on("mouseover", tip.show)
        .on("mouseout", tip.hide);

  	  map.append("path")
	    .datum(topojson.mesh(eu, eu.objects.subunits, function(a, b) {return a !== b; }))
	    .attr("d", path)
	    .attr("fill", "none")
	    .attr("stroke", "#252525")

	});
}

function makeOthers(container){

// #dropdowns  https://bl.ocks.org/mbostock/5872848
	var others = container.append('svg')
		.attr('width', otherW)
	    .attr('height', otherH)
	    .attr("id", "others");

	claraWork(others)
	juliaWork(others)

}

function claraWork(others){

	startText = others.append("text")
				.attr('id', "start")

	startText.text("Where are you coming from?")
		.attr("class", "text")
		.attr("x", 0)
		.attr("y", 20)

	sampleStart = [1,2,3,4]

	var select = d3.select('#others')
	  .append('select')
	  	.attr("x", "100")
	  	.attr("y", "100")
	    .on('change',console.log("change"))

	var options = select
	  .selectAll('option')
		.data(sampleStart).enter()
		.append('option')
			.text(function (d) { return d; });

}

function juliaWork(others){
	
	destinationText = others.append("text");

	destinationText.text("Where do you want to go?")
		.attr("class", "text")
		.attr("x", 0)
		.attr("y", 120)

	budgetText = others.append("text");

	budgetText.text("What is your budget range?")
		.attr("class", "text")
		.attr("x", 0)
		.attr("y", 220)


	dateText = others.append("text");

	dateText.text("What dates do you want to travel?")
		.attr("class", "text")
		.attr("x", 0)
		.attr("y", 320);
}