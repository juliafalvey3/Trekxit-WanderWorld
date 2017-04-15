var width = 1400,
	height = 800;

var mapW = 680,
	mapH = 1000,
	mapX = 700,
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
		.attr('cx', 1260)
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
	  .on("mouseover", function(d){d3.select(this).selectAll("*").style("opacity", 0.9); })
	  .on("mouseout", function(d){d3.select(this).selectAll("rect").style("opacity", 0); d3.select(this).selectAll("text").style("opacity", 0); });

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
	    .attr("id", function(d){return d.properties.name})
	    .text(function(d) { return d.properties.name; })

	cities.append("circle")
		.attr("cx", function(d) { return (projection(d.geometry.coordinates)[0]) })
	 	.attr("cy", function(d) { return (projection(d.geometry.coordinates)[1]) })
	 	.style("fill", "grey")
	 	.attr("id", function(d){return d.properties.name})
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
  		.attr("id", "startSelect")
  		.attr("class", "select")
  		.on('change', onChange);

	var options = select.selectAll('option')
		.data(startCities).enter()
		.append('option')
		.text(function (d) {return d; });

	function onChange (){
		selectValue = d3.select('#startSelect').property('value')
		return selectValue;
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

    helpDestinationText.text("Hold down the Cmd or Ctrl key to select up to 5 cities.")
		.attr("class", "helper")
		.attr("x", 20)
		.attr("y", 120)

	dateText = others.append("text");
	dateText.text("What range of dates could you travel?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 260);

	helpdateText = others.append("text");
	helpdateText.text("Choose a flexible time frame in which you want to travel.")
		.attr("class", "helper")
		.attr("x",20)
		.attr("y", 280);

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
		.attr("y", 395);

	numDaysText = others.append("text");
	numDaysText.html("Total days you want to travel?")
       .attr("class", "question")
       .attr("x", 20)
       .attr("y", 450);

    helpnumDaysText = others.append("text");
    helpnumDaysText.text("What is the total number of days you want to spend traveling?")
    	.attr("class", "helper")
    	.attr("x", 20)
    	.attr("y", 470);


	// connectionText = others.append("text");
	// connectionText.text("How many connections?")
	// 	.attr("class", "question")
	// 	.attr("x", 20)
	// 	.attr("y", 525)


	budgetText = others.append("text");
	budgetText.text("What is your budget? (USD)")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 640);

	helpbudgetText = others.append("text");
    helpbudgetText.text("We'll show you several travel options within your budget!")
    	.attr("class", "helper")
    	.attr("x", 20)
    	.attr("y", 660);

	buttonText = ["Find My Optimal Trips!"]
	var optimize = others.append('g')
		.attr('id', 'go').selectAll("g")
		.data(buttonText)
		.enter().append('g')
		.attr("stroke", '#252525')
		.on("click",function(d,i) {
				var outputList = [];
				if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                    d3.select(this).select("rect").attr("fill", pressedColor);
                    d3.select(this).select("text").text("Trips Incoming!");
                    d3.select(this).select("text").attr("x", 110);
                    showboxes(others);
                    outputList.push({key: "Origin", value: onChange ()});
                    outputList.push({key: "Dests",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#multDropDown option:checked'),0)
             				.map(function(v,i,a) {
    						return v.value;})});
                    outputList.push({key: "Start Date",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#field1'),0)
             				.map(function(v,i,a) {
    						return v.value;})[0]});
                    outputList.push({key: "End Date",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#field2'),0)
             				.map(function(v,i,a) {
    						return v.value;})[0]});
                    outputList.push({key: "Min Days",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#minDaysInput'),0)
             				.map(function(v,i,a) {
    						return v.value;})[0]});
                    outputList.push({key: "Num Days",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#numDaysInput'),0)
             				.map(function(v,i,a) {
    						return v.value;})[0]});
                    outputList.push({key: "Budget",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#budgetInput'),0)
             				.map(function(v,i,a) {
    						return v.value;})[0]});
                    console.log(outputList);
             	}

             		// d3.select("#multDropDown")
                     //    .selectAll("option")
                     //    .filter(function (d, i) {
                     //        if (this.selected) {return this.label};
                     //    })


				else {
					d3.select(this).select("rect").attr("fill", defaultColor)
					console.log("removing "+d)
					d3.select(this).select("text").text(buttonText)
					d3.select(this).select("text").attr("x", 80)
					d3.select("#book").style("opacity",0)
					d3.selectAll("#resultsBox").remove()
					d3.selectAll("#resultsBox2").remove()

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


function showboxes(others){

	// load the data
	d3.csv("./optimization/niceOutput.csv", function(data) {
    console.log(data[0]);    
    var flights = null;
        flights = d3.nest()
       .key(function(d) {return d['TripID']})
       .key(function(d) {return d['Seq']})
       .entries(data);


    others.append('rect')
		.attr('id', 'resultsBox')
		.attr('fill', 'white')
		.attr('stroke', 'grey')
		.attr('x', 390)
		.attr('y', 0)
		.attr("rx", 15) //rx and ry give the buttons rounded corners
        .attr("ry", 15)
		.attr('width', 329)
		.attr('height', 400)

	others.append('rect')
		.attr('id', 'resultsBox2')
		.attr('fill', 'white')
		.attr('stroke', 'grey')
		.attr('x', 390)
		.attr('y', 400)
		.attr("rx", 15) //rx and ry give the buttons rounded corners
        .attr("ry", 15)
		.attr('width', 329)
		.attr('height', 400)

	var results = others.append('g')
		.attr('id', 'resultsBox').selectAll("g")
		.data(flights)
		.enter().append('g')

	results.append('text')
		.attr("class", "text")
		.attr('x', 530)
		.attr('y', function(d,i){return i*130 + 70})
		.attr('stroke', 'none')
		.text(function(d){

			
				d.Price = []
				d.Origin = []
				for( i = 0; i < d.values.length; i+= 1){
					d.Price.push(d.values[i].values[0].Price)
					d.Origin.push(d.values[i].values[0].Origin)
				}

		return d.values[0].values[0]['Total Price']
	});
	
	var options1Cities = others.append('g')
		.attr('id', resultsBox).selectAll('g')
		.data(flights[0].Origin)
		.enter().append('g')
	cities = ""
	options1Cities.append("text")
		.attr("class", "text")
		.attr("x", 400)
		.attr("y", 100)
		.attr("stroke", "none")
		.text(function (d,i){
				if (i > 0){
					cities += " -> " + d
				}
				else {
					cities += d
				}
				return cities
		});

	flightText = results.append('text');
	flightText.text("Wander to...")
		.attr("class", "resultHeader")
		.attr("x", 400)
		.attr("y", 40)
	detailsText = results.append('text');
	detailsText.text("Click on an option for details.")
		.attr("class", "helper")
		.attr("x", 400)
		.attr("y", 55)
	option1Text = results.append('text');
	option1Text.text("Option 1 : Price")
		.attr("class", "resulttext")
		.attr("x", 400)
		.attr("y", 70)
		.on("mouseover", function() {
            if (d3.select(this).attr("fill") != "grey") {
                d3.select(this).attr("fill", "blue"); }})
        .on("mouseout", function() {
            if (d3.select(this).attr("fill") != "grey") {
                d3.select(this).attr("fill","black")}})
		.on("click", function(d) {if (d3.select(this).attr("fill") != "grey") {d3.select(this).attr("fill", "grey"), clickResult(d, others)}
                else {d3.select(this).attr("fill", "black"), console.log("remove")}});
	option2Text = results.append('text');
	option2Text.text("Option 2 : Price")
		.attr("x", 400)
		.attr("y", 200)
		.on("mouseover", function() {
            if (d3.select(this).attr("fill") != "grey") {
                d3.select(this).attr("fill", "blue"); }})
        .on("mouseout", function() {
            if (d3.select(this).attr("fill") != "grey") {
                d3.select(this).attr("fill","black")}})
		.on("click", function(d) {if (d3.select(this).attr("fill") != "grey") {d3.select(this).attr("fill", "grey"), clickResult(d, others)}
                else {d3.select(this).attr("fill", "black"), console.log("remove")}});


	});
}




function clickResult(d, others){
	node_link(d, others)
}

function node_link(d, others){
	color_scale = d3.scale.category10()

	console.log(d)
	sourceList = []
	targetList = []

// 	var force = d3.layout.force()
//     	.size([width, height])
//    		.nodes(nodes)
//     	.links(linkList);

	// var path = others.append("g").selectAll("path")
 //    .data(linkList)
 //  		.enter().append("path")
 //    .style("stroke", function(d,i){color_scale[i]})
 //    .attr();
  
	for (i=0; i<d.values.length; i+=1){
		sourceList.push(d.values[i].values[0].Origin_Name)
		targetList.push(d.values[i].values[0].Dest_Name)
	}
	linkList = []
	for(i=0; i<d.values.length; i+=1){
		linkList.push({source:sourceList[i],target:targetList[i]})
	}

	console.log(linkList)
	// var path = others.append("g").selectAll("path")
 //    .data(linkList)
 //  		.enter().append("path")
 //    .style("stroke", function(d,i){color_scale[i]});
	//var link = ;
	// var svg = d3.select("body").append("svg")
	//     .attr("width", 900)
	//     .attr("height", 800)
	//   .append("g");

	// var raceData = null;
	// var teamData = null;

	// teamData = d3.nest()
	//     .key(function(d) { return d['driver'];})
	//     .key(function(d){return d['team']})
	//     .entries(dataset);

	// teamData = teamData.sort(function (a,b) {return d3.ascending(a.key, b.key)})
	// teamData = teamData.sort(function (a,b) {return d3.descending(a.values[0],b.values[0]); });
}
