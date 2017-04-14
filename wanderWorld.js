var width = 1400,
	height = 800;

var mapW = 800,
	mapH = 1000,
	mapX = 660,
	mapY = 0;

var projScale = 900,
	projX = 230,
	projY = 1350;

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
	    .attr('transform', 'translate('+mapX+','+mapY+')')
	    .attr('fill', 'none');

	var rect = container.append('circle')
		.attr("r", 16)
		.attr('cx', 1217)
		.attr('cy', 610)
		.attr('fill', '#3690c0')

	var projection = d3.geo.mercator()
		.scale(projScale)
		.translate([projX, projY]);

	var path = d3.geo.path().projection(projection);

 	// var tip = d3.tip()
		// 	  .attr('class', 'd3-tip')
		// 	  .html(function(d){return d.properties.name})

	d3.json("eu.json", function(error, eu) {
	  if (error) return console.error(error);

  	var subunits = topojson.feature(eu, eu.objects.subunits).features;

  	var places = topojson.feature(eu, eu.objects.places);

 //   	var tp = map.append("g")
 // 		.data(subunits);

	// tp.call(tip);

	  map.append("g")
	      .attr("class", "counties")
	    .selectAll("path")
	    .data(subunits)
	    .enter().append("path")
			.attr('fill', "#3690c0")
	     .attr("d", path)
	     .attr('id', function(d){return d.id});


	   map.append("path")
	    .datum(topojson.mesh(eu, eu.objects.subunits, function(a, b) {return a !== b; }))
	    .attr("d", path)
	    .attr("fill", "none")
	    .attr("stroke", "#252525")

	   map.selectAll(".subunit-label")
	       .data(topojson.feature(eu, eu.objects.subunits).features)
	     .enter().append("text")
	       .attr("class", function(d) { return "subunit-label " + d.id; })
	       .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
	       .attr("dy", ".35em")
	       .text(function(d) { if(d.properties.name == 'Spain' || d.properties.name=='France' || d.properties.name=='Germany' || d.properties.name=='Poland'|| d.properties.name=='Italy') {return d.properties.name}; });

	 cities = map.selectAll(".place-label")
	    .data(topojson.feature(eu, eu.objects.places).features)
	  .enter().append("g")
	  .on("mouseover", function(d){d3.select(this).selectAll("*").style("opacity", 0.8); })
	  .on("mouseout", function(d){d3.select(this).selectAll("*").style("opacity", 0); });

	cities.append("rect")
	 	.attr("width", function(d){len = d.properties.name.length; return (6*len+(len/2)*5+15)})//; return text.length*5})
	 	.attr("height", 20)
	 	.attr("fill", "white")
	 	.style("opacity", 0)
	 	.attr("x", function(d) { return (projection(d.geometry.coordinates)[0]) })
	 	.attr("y", function(d) { return (projection(d.geometry.coordinates)[1] - 10) })

	cities.append("text")
	    .attr("class", "place-label")
	    .attr("opacity", 0)
	    .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
	    .attr("dy", ".35em")
	    .attr('x', 5)
	    .text(function(d) { return d.properties.name; })

	cityDots = map.selectAll("circle")
	    .data(topojson.feature(eu, eu.objects.places).features)
	  	.enter().append("g").append("circle")
		.attr("cx", function(d) { return (projection(d.geometry.coordinates)[0]) })
	 	.attr("cy", function(d) { return (projection(d.geometry.coordinates)[1]) })
	 	.style("fill", "grey")
	 	.style("stroke", "#444")
	 	.attr("r", 4)
	});
}

function makeOthers(container){

// #dropdowns  https://bl.ocks.org/mbostock/5872848
	var others = container.append('svg')
		.attr('width', otherW)
	    .attr('height', otherH)
	    .attr("id", "others");
	others.append('rect')
		.attr('fill', 'white')
		.attr('stroke', 'grey')
		.attr('x', 0)
		.attr('y', 0)
		.attr("rx", 15) //rx and ry give the buttons rounded corners
        .attr("ry", 15)
		.attr('width', 390)
		.attr('height', 800)

	juliaWork(others)

}

function juliaWork(others){

	startText = others.append("text")
				.attr('id', "start")

	startText.text("Where are you coming from?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 30)

    var startCities = ["Atlanta", "Boston", "New York", "Orlando"];
    startCities.sort(function(x, y){ return d3.ascending(x, y);})
    startCities.unshift("Select a Starting City")

	var select = d3.select('body')
  		.append('select')
  		.attr("class", "select")
  		.on('change', onChange);

	var options = select.selectAll('option')
		.data(startCities).enter()
		.append('option')
		.text(function (d) {return d; });

	function onChange (){
		selectValue = d3.select('select').property('value')
		console.log(selectValue)
	}

	var defaultColor= "#ebebeb";
    var hoverColor= "darkgrey";
    var pressedColor= "grey";

	destinationText = others.append("text");

	destinationText.text("Where do you want to go?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 100)

	helpDestinationText = others.append("text");

    helpDestinationText.text("Select up to 5 cities.")
		.attr("class", "helper")
		.attr("x", 20)
		.attr("y", 115)

	dateText = others.append("text");
	dateText.text("What range of dates could you travel?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 260);

	helpdateText = others.append("text");
	helpdateText.text("Not the spefic days you want to travel but a flexible time frame!")
		.attr("class", "helper")
		.attr("x",20)
		.attr("y", 275);

	minDayText = others.append("text");
	minDayText.html("Min days in each location?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 375)
	// list = 10000

	helpMinDayText = others.append("text");
	helpMinDayText.text("What is the minimum number of days you want to stay in each city?")
		.attr("class", "helper")
		.attr("x", 20)
		.attr("y", 390);

	numDaysText = others.append("text");
	numDaysText.html("Total days you want to travel?")
       .attr("class", "question")
       .attr("x", 20)
       .attr("y", 450);

    helpnumDaysText = others.append("text");
    helpnumDaysText.text("Number of days to spend traveling")
    	.attr("class", "helper")
    	.attr("x", 20)
    	.attr("y", 465);


	connectionText = others.append("text");
	connectionText.text("How many connections?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 525)


	budgetText = others.append("text");
	budgetText.text("What is your max budget? (USD)")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 640);


	buttonText = ["Find My Optimal Trips!"]
	var optimize = others.append('g')
		.attr('id', 'go').selectAll("g")
		.data(buttonText)
		.enter().append('g')
		.attr("stroke", '#252525')
		.on("click",function(d,i) {
				if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this).select("rect").attr("fill", pressedColor);
                    d3.select(this).select("text").text("Trips Incoming!")
                    d3.select(this).select("text").attr("x", 110)
                    showboxes(others)
             	}
				else {
					d3.select(this).select("rect").attr("fill", defaultColor)
					console.log("removing "+d)
					d3.select(this).select("text").text(buttonText)
					d3.select(this).select("text").attr("x", 80)
					d3.selectAll("#resultsBox").remove()

			}})
        .on("mouseover", function() {
                if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this).select("rect").attr("fill", hoverColor);
             	}})
        .on("mouseout", function() {
                if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this).select("rect").attr("fill",defaultColor)}});

	optimize.append("rect")
			.attr("width", 275)
			.attr("height", 30)
			.attr("x", 30)
			.attr("y", 750)
			.attr("rx", 3) //rx and ry give the buttons rounded corners
			.attr("ry", 3)
			.attr("fill", defaultColor);

	optimize.append('text')
			.attr('class', 'text')
			.attr("stroke", "none")
			.attr('y', 770)
			.attr('x', 80)
			.text(function(d){return d});

}

var resultsData = [{'Trip1': '$800'}]

function showboxes(others){

	others.append('rect')
		.attr('id', 'resultsBox')
		.attr('fill', 'white')
		.attr('stroke', 'grey')
		.attr('x', 370)
		.attr('y', 0)
		.attr("rx", 15) //rx and ry give the buttons rounded corners
        .attr("ry", 15)
		.attr('width', 230)
		.attr('height', 400)

	var results = others.append('g')
		.attr('id', 'resultsBox').selectAll("g")
		.data(resultsData)
		.enter().append('g')
		.attr("stroke", '#252525')

	results.append('text')
		.attr("class", "text")
		.attr('x', 380)
		.attr('y', function(d,i){return i*20 + 30})
		.attr('stroke', 'none')
		.text(function(d){return d.value})

}