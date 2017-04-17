var width = 1400,
	height = 800;

var mapW = 680,
	mapH = 1000,
	mapX = 700,
	mapY = 0;

var projScale = 1000,
	projX = 230,
	projY = 1400;

var otherW = width-mapW
	otherH = 1000;

var half = width/2;

function init(){
	d3.select('#vis').selectAll('*').remove();
	var container = d3.select('#vis').append('svg')
	    .attr('width', width)
	    .attr('height', height);

	var map = container.append('svg')
	    .attr('width', mapW)
	    .attr('height', mapH)
	    .attr('transform', 'translate('+mapX+','+mapY+')')
	    .attr('fill', 'none');

	makeOthers(container, map)
	makeMap(container, map)

}

function makeMap(container, map){

	var circ = map.append('circle')
		.attr("r", 17)
		.attr('cx', 594)
		.attr('cy', 578)
		.attr("opacity", 1)
		.attr('fill', '#5BA7CF');

	var projection = d3.geo.mercator()
		.scale(projScale)
		.translate([projX, projY]);

	var path = d3.geo.path().projection(projection);

	d3.json("eu.json", function(error, eu) {
	  if (error) return console.error(error);

  	var subunits = topojson.feature(eu, eu.objects.subunits).features;

  	var places = topojson.feature(eu, eu.objects.places);

	  map.append("g")
	      .attr("class", "counties")
	    .selectAll("path")
	    .data(subunits)
	    .enter().append("path")
			.attr('fill', "#5BA7CF")
			.style("opacity", 1)
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

	// var Palma = map.select(".place-label")
	//  	.data("Palma")
	//  	.enter().append('g')
	//  	.on("mouseover", function(d){d3.select(this).selectAll("*").style("opacity", 0.9); })
	// 	.on("mouseout", function(d){d3.select(this).selectAll("text").style("opacity", 0), d3.select(this).selectAll("rect").style("opacity", 0)});

 // 	Palma.append("rect")
	// 	 	.attr("width", function(d){len = "Palma".length; return (6*len+(len/2)*5+15)})//; return text.length*5})
	// 	 	.attr("height", 20)
	// 	 	.attr("fill", "white")
	// 	 	.style("opacity", 0)
	// 	 	.attr("x", 290)
	// 	 	.attr("y", 650);

	//  Palma.append("text")
	// 	    .attr("class", "place-label")
	// 	    .attr("opacity", 0)
	// 	    .attr("transform", "translate(304, 640)")
	// 	    .attr("dy", ".35em")
	// 	    .attr('x', 5)
	// 	    .text("Palma");

	//   Palma.append("circle")
	//   	.attr("cx", 304)
	//    	.attr("cy", 640)
	//    	.attr("id", "Palma")
	//    	.style("stroke", "#444")
	//    	.attr("r", 4);
	});
}


function makeOthers(container, map){

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
		.attr('height', 690)

	startText = others.append("text")
				.attr('id', "start")

	startText.text("Where are you coming from?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", 40)

    var startCities = ["Atlanta"]
    //var startCities = ["Atlanta", "Boston", "New York", "Orlando"];
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

    var destinationTextY = 110

	destinationText.text("Where do you want to go?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", destinationTextY)

	helpDestinationText = others.append("text");

    helpDestinationText.text("Hold down the Cmd or Ctrl key to select up to 5 cities.")
		.attr("class", "helper")
		.attr("x", 20)
		.attr("y", destinationTextY + 20)

    var dateTextY = 255

	dateText = others.append("text");
	dateText.text("What range of dates could you travel?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", dateTextY);

	helpdateText = others.append("text");
	helpdateText.text("Choose a flexible time frame in which you want to travel.")
		.attr("class", "helper")
		.attr("x",20)
		.attr("y", dateTextY + 20);

    var minDayTextY = 390

	minDayText = others.append("text");
	minDayText.html("How many days in each location?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", minDayTextY)
	// list = 10000

	helpMinDayText = others.append("text");
	helpMinDayText.text("What is the minimum number of days you want to stay in each city?")
		.attr("class", "helper")
		.attr("x", 20)
		.attr("y", minDayTextY + 20);

    var numDaysTextY = 475

	numDaysText = others.append("text");
	numDaysText.html("Total days you want to travel?")
       .attr("class", "question")
       .attr("x", 20)
       .attr("y", numDaysTextY);

    helpnumDaysText = others.append("text");
    helpnumDaysText.text("What is the total number of days you want to spend traveling?")
    	.attr("class", "helper")
    	.attr("x", 20)
    	.attr("y", numDaysTextY + 20);

    var budgetTextY = 560
	budgetText = others.append("text");
	budgetText.text("What is your budget? (USD)")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", budgetTextY);

	helpbudgetText = others.append("text");
    helpbudgetText.text("We'll show you several travel options within your budget!")
    	.attr("class", "helper")
    	.attr("x", 20)
    	.attr("y", budgetTextY + 20);

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
                    outputList.push({key: "Origin", value: onChange ()});
                    outputList.push({key: "Dests",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#multDropDown option:checked'),0)
             				.map(function(v,i,a) {
    						return v.value;})});
                    outputList.push({key: "StartDate",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#field1'),0)
             				.map(function(v,i,a) {
    						return v.value;})[0]});
                    outputList.push({key: "EndDate",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#field2'),0)
             				.map(function(v,i,a) {
    						return v.value;})[0]});
                    outputList.push({key: "MinDays",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#minDaysInput'),0)
             				.map(function(v,i,a) {
    						return v.value;})[0]});
                    outputList.push({key: "NumDays",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#numDaysInput'),0)
             				.map(function(v,i,a) {
    						return v.value;})[0]});
                    outputList.push({key: "Budget",
                    	value: Array.prototype.slice
             				.call(document.querySelectorAll('#budgetInput'),0)
             				.map(function(v,i,a) {
    						return v.value;})[0]});
                    console.log(outputList)
                    validateForm(outputList)
             	}
				else {
					d3.select(this).select("rect").attr("fill", defaultColor)
					console.log("removing "+d)
					d3.select(this).select("text").text(buttonText)
					d3.select(this).select("text").attr("x", 80)
					d3.select("#book").style("opacity",0)
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
			.attr("y", 635)
			.attr("rx", 3) //rx and ry give the buttons rounded corners
			.attr("ry", 3)
			.attr("fill", defaultColor);

	optimize.append('text')
			.attr('class', 'text')
			.attr("stroke", "none")
			.attr('y', 655)
			.attr('x', 80)
			.text(function(d){return d});

    // VALIDATE INPUT
    function validateForm(outputList) {
        //everything must be filled out
        if (outputList[0].value == "Select a Starting City")
            {alert("Select an origin city."); return false;}
        if (outputList[1].value.length == 0)
            {alert("Select at least one destination city."); return false;}
        if (outputList[2].value == "")
            {alert("Select a start date for your flexible time frame."); return false;}
        if (outputList[3].value == "")
            {alert("Select an end date for your flexible time frame."); return false;}
        if (outputList[4].value == "")
            {alert("Minimum number of days must be filled out."); return false;}
        if (outputList[5].value == "")
            {alert("Total number of days must be filled out."); return false;}
        if (outputList[6].value == "")
            {alert("Budget must be filled out."); return false;}
        //num days must be >= min days * num cities
        if (outputList[5].value < outputList[4].value*outputList[1].value.length)
            {alert("Increase your total number of days or reduce your minimum stay per city."); return false;}
        //min days, num days, and budget must be valid formats
        if (!(/^\$*(\d*\.?\d+|\d{1,3}(,\d{3})*(\.\d+)?)$/.test(outputList[6].value)))
            {alert("Budget is not a valid input."); return false;}
        //timeframe should be > total days
        var daysBetween = days_between(parseDate(outputList[2].value), parseDate(outputList[3].value));
        if (daysBetween < outputList[5].value)
            {alert("Increase your flexible time frame or decrease total number of days."); return false;}
        else{return showboxes(others, map);}
        }

    function days_between(date1, date2) {
        // The number of milliseconds in one day
        var ONE_DAY = 1000 * 60 * 60 * 24
        // Convert both dates to milliseconds
        var date1_ms = date1.getTime()
        var date2_ms = date2.getTime()
        // Calculate the difference in milliseconds
        var difference_ms = Math.abs(date1_ms - date2_ms)
        // Convert back to days and return
        return Math.round(difference_ms/ONE_DAY)
        }
        // function from http://stackoverflow.com/questions/2627473/how-to-calculate-the-number-of-days-between-two-dates-using-javascript

    function parseDate(input) {
        var parts = input.match(/(\d+)/g);
        // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
        // function from http://stackoverflow.com/questions/2627650/why-javascript-gettime-is-not-a-function
    }
}

function showboxes(others, map){

	// load the data
	d3.csv("./optimization/niceOutput.csv", function(data) {

    var flights = null;
        flights = d3.nest()
       .key(function(d) {return d['TripID']})
       .key(function(d) {return d['Seq']})
       .entries(data);

    numberofTrips = flights.length;

    others.append('rect')
		.attr('id', 'resultsBox')
		.attr('fill', 'white')
		.attr('stroke', 'grey')
		.attr('x', 390)
		.attr('y', 0)
		.attr("rx", 15) //rx and ry give the buttons rounded corners
        .attr("ry", 15)
		.attr('width', 329)
		.attr('height', 320)

	var results = others.append('g')
		.attr('id', 'resultsBox').selectAll("g")
		.data(flights)
		.enter().append('g')

	flightText = results.append('text')
	flightText.text("Wander to...")
		.attr("class", "resultHeader")
		.attr("x", 400)
		.attr("y", 40)

	if (numberofTrips < 1) {
		errorText = results.append('text')
		errorText.text("Sorry, no options for those choices!")
			.attr("class", "text")
			.attr("x", 402)
			.attr("y", 80)
	}

	if (numberofTrips > 0 ){
		detailsText = results.append('text');
		detailsText.text("Click on an option for details.")
			.attr("class", "helper")
			.attr("x", 402)
			.attr("y", 60)

		results.append('text')
			.attr("class", "pricetext")
			.attr('x', 478)
			.attr('y', function(d,i){return i*50 + 80})
			.text(function(d, i ){
					d.Price = []
					d.Origin = []
					for( j = 0; j < d.values.length; j+= 1){
						d.Price.push(d.values[j].values[0].Price)
						d.Origin.push(d.values[j].values[0].Origin_ID)
					}

			return "Price $" + d.values[0].values[0]['Total_Price']

		});

	option1Text = results.append('text');
	option1Text.text("Option 1 : ")
		.attr("class", "text")
		.attr("x", 402)
		.attr("y", 80)
		.on("mouseover", function() {
            if (d3.select(this).attr("fill") != "grey") {
                d3.select(this).attr("fill", "blue"); }})
        .on("mouseout", function() {
            if (d3.select(this).attr("fill") != "grey") {
                d3.select(this).attr("fill","black")}})
		.on("click", function(d) {if (d3.select(this).attr("fill") != "grey") {d3.select(this).attr("fill", "grey"), node_link(flights[0], map)}
                else {d3.select(this).attr("fill", "black"), d3.selectAll(".link").remove(), d3.selectAll(".node").remove()}});
    var options1Cities = others.append('g')
		.attr('id', resultsBox).selectAll('g')
		.data(flights[0].Origin)
		.enter().append('g')
	cities1 = ""
	options1Cities.append("text")
		.attr("class", "text")
		.attr("x", 405)
		.attr("y", 100)
		.attr("stroke", "none")
		.text(function (d,i){
				if (i > 0){
					cities1 += " -> " + d
				}
				else {
					cities1 += d
				}
				return cities1
		});
	}
	if (numberofTrips > 1) {
		option2Text = results.append('text');
		option2Text.text("Option 2 : ")
			.attr("class", "text")
			.attr("x", 402)
			.attr("y", 130)
			.on("mouseover", function() {
            if (d3.select(this).attr("fill") != "grey") {
                d3.select(this).attr("fill", "blue"); }})
        .on("mouseout", function() {
            if (d3.select(this).attr("fill") != "grey") {
                d3.select(this).attr("fill","black")}})
		.on("click", function(d) {if (d3.select(this).attr("fill") != "grey") {d3.select(this).attr("fill", "grey"), node_link(flights[1], map)}
                else {d3.select(this).attr("fill", "black"), d3.selectAll(".link").remove(), d3.selectAll(".node").remove()}});
		var options2Cities = others.append('g')
			.attr('id', resultsBox).selectAll('g')
			.data(flights[1].Origin)
			.enter().append('g')
		cities2 = ""
		options2Cities.append("text")
			.attr("class", "text")
			.attr("x", 405)
			.attr("y", 150)
			.attr("stroke", "none")
			.text(function (d,i){
					if (i > 0){
						cities2 += " -> " + d
					}
					else {
						cities2 += d
					}
					return cities2
			});
	}
	if (numberofTrips > 2) {
		option3Text = results.append('text');
		option3Text.text("Option 3 : ")
			.attr("class", "text")
			.attr("x", 402)
			.attr("y", 180)
			.on("mouseover", function() {
            if (d3.select(this).attr("fill") != "grey") {
                d3.select(this).attr("fill", "blue"); }})
        .on("mouseout", function() {
            if (d3.select(this).attr("fill") != "grey") {
                d3.select(this).attr("fill","black")}})
		  .on("click", function(d) {if (d3.select(this).attr("fill") != "grey") {d3.select(this).attr("fill", "grey"), node_link(flights[2], map)}
                else {d3.select(this).attr("fill", "black"), d3.selectAll(".link").remove(), d3.selectAll(".node").remove()}});
		var options3Cities = others.append('g')
			.attr('id', resultsBox).selectAll('g')
			.data(flights[2].Origin)
			.enter().append('g')
		cities3 = ""
		options3Cities.append("text")
			.attr("class", "text")
			.attr("x", 405)
			.attr("y", 200)
			.attr("stroke", "none")
			.text(function (d,i){
					if (i > 0){
						cities3 += " -> " + d
					}
					else {
						cities3 += d
					}
					return cities3
			});
	}
	if (numberofTrips > 3) {
		option4Text = results.append('text');
		option4Text.text("Option 4 : ")
			.attr("class", "text")
			.attr("x", 402)
			.attr("y", 230)
			.on("mouseover", function() {
			            if (d3.select(this).attr("fill") != "grey") {
			                d3.select(this).attr("fill", "blue"); }})
			        .on("mouseout", function() {
			            if (d3.select(this).attr("fill") != "grey") {
			                d3.select(this).attr("fill","black")}})
					.on("click", function(d) {if (d3.select(this).attr("fill") != "grey") {d3.select(this).attr("fill", "grey"), node_link(flights[3], map)}
			                else {d3.select(this).attr("fill", "black"), d3.selectAll(".link").remove(), d3.selectAll(".node").remove()}});
		var options4cities = others.append('g')
			.attr('id', resultsBox).selectAll('g')
			.data(flights[3].Origin)
			.enter().append('g')
		cities4 = ""
		options4cities.append("text")
			.attr("class", "text")
			.attr("x", 405)
			.attr("y", 250)
			.attr("stroke", "none")
			.text(function (d,i){
					if (i > 0){
						cities4 += " -> " + d
					}
					else {
						cities4 += d
					}
					return cities4
			});
	}
	if (numberofTrips > 4) {
		option5Text = results.append('text');
		option5Text.text("Option 5 : ")
			.attr("class", "text")
			.attr("x", 402)
			.attr("y", 280)
			.on("mouseover", function() {
			            if (d3.select(this).attr("fill") != "grey") {
			                d3.select(this).attr("fill", "blue"); }})
			        .on("mouseout", function() {
			            if (d3.select(this).attr("fill") != "grey") {
			                d3.select(this).attr("fill","black")}})
					.on("click", function(d) {if (d3.select(this).attr("fill") != "grey") {d3.select(this).attr("fill", "grey"), node_link(flights[4], map)}
			                else {d3.select(this).attr("fill", "black"), d3.selectAll(".link").remove(), d3.selectAll(".node").remove()}});		var options5cities = others.append('g')
			.attr('id', resultsBox).selectAll('g')
			.data(flights[4].Origin)
			.enter().append('g')
		cities5 = ""
		options5cities.append("text")
			.attr("class", "text")
			.attr("x", 405)
			.attr("y", 300)
			.attr("stroke", "none")
			.text(function (d,i){
					if (i > 0){
						cities5 += " -> " + d
					}
					else {
						cities5 += d
					}
					return cities5
			});
		}

	});
}

function node_link(d, map){

	color_scale = ["Purple", "MidnightBlue", "Teal", "#6c6960", "#972808", "#6c6960"] //BE3F3F

	var sourceList = [],
		targetList = [],
		orderList = [],
		linkList = [],
		landDateList = [],
		departDateList = [],
		priceList = [];

	for (i=0; i<d.values.length; i+=1){
		sourceList.push({source: d.values[i].values[0].Origin_Name})
		targetList.push(d.values[i].values[0].Dest_Name)
		orderList.push(d.values[i].values[0].Seq)
		landDateList.push(d.values[i].values[0].Date1)
		departDateList.push(d.values[i].values[0].Date2)
		priceList.push(d.values[i].values[0].Price)
	}

	for(i=0; i<d.values.length; i+=1){
		linkList.push({source:sourceList[i].source, target:targetList[i], seq:orderList[i], land: landDateList[i], depart: departDateList[i], price: priceList[i]})
	}


 	var linkTip = d3.tip()
			  .attr('class', 'd3-tip')
			  .html(function(d){return ("<i> Destination: </i> "  + d.target + " </br> <i> Flight Price: </i> $" + d.price + "</br> <i>Land Date: </i>" + d.land + " </br> <i>Depart Date:</i> " + d.depart)})

 	var nodeTip = d3.tip()
			  .attr('class', 'd3-tip')
			  .html(function(d){return ("<i> City: </i> "  + d.source + " </br> <i> Flight Price: </i> $" + d.price + "</br> <i>Land Date: </i>" + d.land + " </br> <i>Depart Date:</i> " + d.depart)})

	var linkTP = map.append('g')
		.data(linkList);

	linkTP.call(linkTip)
	linkTP.call(nodeTip)

   	var link = map.selectAll('.link')
   	    .data(linkList)
   	    .enter().append('line')
   	    .attr('class', 'link')
   	    .attr("stroke", function(d) {return(color_scale[+d.seq])})
   	    .attr("x1", function(d) {if (!(d.source == 'Atlanta' || d.source == 'Orlando' || d.source == 'Palma')) {var t = d3.transform(d3.select("#"+d.source).attr("transform")); return (t.translate[0]);}
       							  else if (d.source == 'Palma'){return 280}
       							  else {return 0}})
		.attr("y1", function(d) {if (!(d.source == 'Atlanta' || d.source == 'Orlando' || d.source == 'Palma')) {var t = d3.transform(d3.select("#"+d.source).attr("transform")); return (t.translate[1]);}
       							  else if (d.source == 'Palma'){return 648}
   							      else {return 400}})
  		.attr("x2", function(d) { if (!(d.target == 'Atlanta' || d.target == 'Orlando' || d.target == 'Palma')) {var t = d3.transform(d3.select("#"+d.target).attr("transform")); return (t.translate[0]);}
       							  else if (d.target == 'Palma'){return 280}
       							  else {return 20}})
  		.attr("y2", function(d) {if (!(d.target == 'Atlanta' || d.target == 'Orlando' || d.target == 'Palma')) {var t = d3.transform(d3.select("#"+d.target).attr("transform")); return (t.translate[1]);}
       							  else if (d.target == 'Palma'){return 648}
       							  else {return 300}})
  		.on("mouseover", linkTip.show)
  		.on("mouseout", linkTip.hide);

    var node = map.selectAll(".node")
    	.data(linkList)
      .enter().append("g")
        .attr("class", "node");

    node.append("circle")
          .attr("r", 5)
       	  .attr("cx", function(d){ if (!(d.source == 'Atlanta' || d.source == 'Orlando' || d.source == 'Palma')) {var t = d3.transform(d3.select("#"+d.source).attr("transform")); return (t.translate[0]);}
       							  else if (d.source == 'Palma'){return 280}})
       	  .attr("cy", function(d){ if (!(d.source == 'Atlanta' || d.source == 'Orlando' || d.source == 'Palma')) {var t = d3.transform(d3.select("#"+d.source).attr("transform")); return (t.translate[1]);}
    							  else if (d.source == 'Palma'){return 648}})
       	  .on("mouseover", nodeTip.show)
       	  .on("mouseout", nodeTip.hide);
}
