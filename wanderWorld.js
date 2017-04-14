var width = 1400,
	height = 800;

var mapW = 800,
	mapH = 1000,
	mapX = 660,
	mapY = 0;

var projScale = 800,
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
	    .attr('transform', 'translate('+mapX+','+mapY+')')
	    .attr('fill', 'none');


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
	others.append('rect')
		.attr('fill', 'white')
		.attr('stroke', 'grey')
		.attr('x', 0)
		.attr('y', 0)
		.attr("rx", 15) //rx and ry give the buttons rounded corners
        .attr("ry", 15)
		.attr('width', 350)
		.attr('height', 800)

	claraWork(others)
	juliaWork(others)

}

function juliaWork(others){

	startText = others.append("text")
				.attr('id', "start")

	startText.text("Where are you coming from?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 30)

	var startCities = ["Select a Starting City", "Atlanta", "Boston", "New York", "Orlando"];

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

	var destCities = ['Barcelona', 'Madrid', 'Dublin', 'London', 'Edinburgh', 'Berlin', 'Paris', 'Marseilles'];
	//Sort List
	destCities.sort(function(x, y){ return d3.ascending(x, y);})
	//Get Length of List
	var destLen = destCities.length;
	//Subset half of list
	var dest1 = destCities.slice(0,Math.ceil(destLen/2))
	//Get other half
	var dest2 = destCities.slice(Math.ceil(destLen/2), destLen)

	var buttons = others.append('g')
		.attr('id', 'checkboxes');

	var defaultColor= "#ebebeb";
    var hoverColor= "darkgrey";
    var pressedColor= "grey";

	var cityButtons = buttons.selectAll("g")
		.data(dest1)
		.enter().append('g')
		.attr('id', function(d){return d})
		.attr("stroke", '#252525')
		.on("click",function(d,i) {
				if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this).select("rect").attr("fill", pressedColor);
                    console.log(d)
             	}
				else {
					d3.select(this).select("rect").attr("fill", defaultColor)
					console.log("removing "+d)
			}})
        .on("mouseover", function() {
                if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this).select("rect").attr("fill", hoverColor);
             	}})
        .on("mouseout", function() {
                if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this).select("rect").attr("fill",defaultColor);
                }})
	
	 cityButtons.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("x", 30)
        .attr("y", function(d,i){return (i*30 + 120)})
        .attr("rx", 3) //rx and ry give the buttons rounded corners
        .attr("ry", 3)
        .attr("fill",defaultColor)

	cityButtons.append('text')
		.attr("class", "text")
		.attr('stroke', 'none')
		.attr('y', function(d,i){return (i*30 + 131)})
		.attr('x', 50)
		.text(function(d){return d});

	var buttons2 = others.append('g')
		.attr('id', 'checkboxes');

	var cityButtons2 = buttons2.selectAll("g")
		.data(dest2)
		.enter().append('g')
		.attr('id', function(d){return d})
		.attr("stroke", '#252525')
		.on("click",function(d,i) {
				if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this).select("rect").attr("fill", pressedColor);
                    console.log(d)
             	}
				else {
					d3.select(this).select("rect").attr("fill", defaultColor)
					console.log("removing "+d)
			}})
        .on("mouseover", function() {
                if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this).select("rect").attr("fill", hoverColor);
             	}})
        .on("mouseout", function() {
                if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this).select("rect").attr("fill",defaultColor);
                }})

    cityButtons2.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("x", 150)
        .attr("y", function(d,i){return (i*30 + 120)})
        .attr("rx", 3) //rx and ry give the buttons rounded corners
        .attr("ry", 3)
        .attr("fill",defaultColor)

	cityButtons2.append('text')
		.attr("class", "text")
		.attr('stroke', 'none')
		.attr('y', function(d,i){return (i*30 + 131)})
		.attr('x', 170)
		.text(function(d){return d});

	destinationText = others.append("text");

	destinationText.text("Where do you want to go?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 100)

	connectionText = others.append("text");

	connectionText.text("How many connections?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 500)

	minDayText = others.append("text");

	minDayText.html("Days in each location?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 260)

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

function claraWork(others){
	
	list = 10000
	dateText = others.append("text");

	dateText.text("What dates do you want to travel?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 330);

	budgetText = others.append("text");

	budgetText.text("What is your budget range?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 600)

	var drag = d3.behavior.drag()
	    .origin(function() { var t = d3.select(this); return {x: t.attr("x"), y: t.attr("y")};})
	    .on("drag", dragmove);

	function dragmove(d) {
	  var x = d3.event.x;
	  var x1 = function(d){if(d >=300){return 300} else {return d}};
	  d3.select("#handle").attr("transform", "translate(" + x + "," + 0 + ")");
	}

	var slider = others.append("g")
    	.attr("class", "slider")
    	.attr("transform", "translate(" + 15 + "," + 625 + ")");
   	slider.append("line")
   	    .attr("class", "track")
   	    .attr("x1", 0)
   	    .attr("x2", 300)
   	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
   	    .attr("class", "track-inset")
   	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
   	    .attr("class", "track-overlay")
   	    .call(drag);
   	slider.insert("g", ".track-overlay")
   	    .attr("class", "ticks")
   	    .attr("transform", "translate(0," + 18 + ")")
   	  .selectAll("text")
   	  .data(list)
   	  .enter().append("text")
   	    .attr("x", function(d,i){return 20*i})
   	    .attr("text-anchor", "middle")
   	    .text(function(d) { return d; });
   	var handle = slider.insert("circle", ".track-overlay")
   	    .attr("class", "handle")
   	    .attr("id", "handle")
   	    .attr("r", 6)
   	    .call(drag);
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
		.attr('width', 238)
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