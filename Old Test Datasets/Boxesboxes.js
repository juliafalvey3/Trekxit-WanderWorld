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
		.attr('width', 390)
		.attr('height', 800)

	// claraWork(others)
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
	// var startCities = ["Atlanta", "Boston", "New York", "Orlando"];
	// 	startCities.sort(function(x, y){ return d3.ascending(x, y);})
	// 	startCities.unshift(“Select a Starting City”)

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
        .attr("y", function(d,i){return (i*30 + 125)})
        .attr("rx", 3) //rx and ry give the buttons rounded corners
        .attr("ry", 3)
        .attr("fill",defaultColor)

	cityButtons.append('text')
		.attr("class", "text")
		.attr('stroke', 'none')
		.attr('y', function(d,i){return (i*30 + 136)})
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
        .attr("y", function(d,i){return (i*30 + 125)})
        .attr("rx", 3) //rx and ry give the buttons rounded corners
        .attr("ry", 3)
        .attr("fill",defaultColor)

	cityButtons2.append('text')
		.attr("class", "text")
		.attr('stroke', 'none')
		.attr('y', function(d,i){return (i*30 + 136)})
		.attr('x', 170)
		.text(function(d){return d});

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


var resultsData = [{name: 'Trip1', value: 800}, {name: 'Trip2', value: 1000}];

function showboxes(others){
	

	// load the data
	d3.csv("final_result_Sample.csv", function(data) {
    console.log(data[0]);

    
    var flights = null;
    
        flights = d3.nest()
       .key(function(d) { return d['TripID']})
       .key(function(d) { return d['Seq']})
       .entries(data);
       console.log(flights[0]);

       others.append('rect')
		.attr('id', 'resultsBox')
		.attr('fill', 'white')
		.attr('stroke', 'grey')
		.attr('x', 390)
		.attr('y', 0)
		.attr("rx", 15) //rx and ry give the buttons rounded corners
        .attr("ry", 15)
		.attr('width', 230)
		.attr('height', 400)

	others.append('rect')
		.attr('id', 'resultsBox2')
		.attr('fill', 'white')
		.attr('stroke', 'grey')
		.attr('x', 390)
		.attr('y', 400)
		.attr("rx", 15) //rx and ry give the buttons rounded corners
        .attr("ry", 15)
		.attr('width', 230)
		.attr('height', 400)

		console.log(typeof(resultsData[0]));
		console.log(resultsData[0].value);

	var results = others.append('g')
		.attr('id', 'resultsBox').selectAll("g")
		.data(flights)
		.enter().append('g')
		.attr("stroke", '#252525')

	results.append('text')
		.attr("class", "text")
		.attr('x', 400)
		.attr('y', function(d,i){return i*20 + 30})
		.attr('stroke', 'none')
		.text(function(d){return d.values[0].values[0]['Price']});
   //  flights = flights.sort(function (a,b) {return d3.ascending(a.key, b.key);});
   //  flights = flights.sort(function (a,b) {return d3.descending(a.values[0], a.values[0]);});
   //  console.log(flights[0]);

  
   //  var List = []
   //  console.log(List);
  
   // for (var i = 0; i < flights.length; i++){
   //     flights2 = flights[i].values[i].key;
   //     console.log(flights2);
       
   
   //      List.push(flights[i].values[i]);
   //      console.log(List);
      });

}

