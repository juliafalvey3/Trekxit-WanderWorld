var height = 800;
var mapH = 1000,
	mapX = 730,


    mapY = 0;

var projScale = 1000,
	projX = 230,
	projY = 1400;

var otherW = width-mapW
	otherH = 1000;

var mapFill ="#00254c"
var textFill = "#202092"
var cityFill = "#c59353"

var half = width/2;

function init(){
	d3.select('#vis').selectAll('*').remove();
	var container = d3.select('#vis').append('svg')
		.attr("class", "svg-classed")
	    .attr("width", this.width)
	    .attr('height', height);

	var map = container.append('svg')
	    .attr('width', (0.5*this.width))
	    .attr('height', mapH)
	    .attr('transform', 'translate('+mapX+','+mapY+')')
	    .attr('fill', 'none');

	var others = container.append('svg')
		.attr('width', (0.55*this.width))
	    .attr('height', otherH)
	    .attr("id", "others");

	makeOthers(others, map)
	makeMap(container, map)

}

function makeMap(container, map){

	var circ = map.append('circle')
		.attr("r", 17)
		.attr('cx', 594)
		.attr('cy', 578)
		.attr("opacity", 1)
		.attr('fill', mapFill);

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
			.attr('fill', mapFill)
			.style("opacity", 1)
	     .attr("d", path)
	     .attr('id', function(d){return d.id});


	   map.append("path")
	    .datum(topojson.mesh(eu, eu.objects.subunits, function(a, b) {return a !== b; }))
	    .attr("d", path)
	    .attr("fill", "none")
	    .attr("stroke", cityFill)

	   map.selectAll(".subunit-label")
	       .data(topojson.feature(eu, eu.objects.subunits).features)
	     .enter().append("text")
	       .attr("class", function(d) { return "subunit-label " + d.id; })
	       .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
	       .attr("dy", ".35em")
	       .text(function(d) { if(d.properties.name == 'Spain' || d.properties.name=='France' || d.properties.name=='Germany' || d.properties.name=='Poland'|| d.properties.name=='Italy') {return d.properties.name}; })
	       .attr("stroke", "#c59353");
	
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
	 	.style("fill", cityFill)
	 	.attr("id", function(d){return d.properties.name})
	 	.style("stroke", "#444")
	 	.attr("r", 4)
	});
}


function makeOthers(others, map){

// #dropdowns  https://bl.ocks.org/mbostock/5872848

	others.append('rect')
		.attr('fill', 'white')
		.attr('stroke', 'grey')
		.attr('x', 0)
		.attr('y', 1)
		.attr("rx", 15) //rx and ry give the buttons rounded corners
        .attr("ry", 15)
		.attr('width', 400)
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

    helpDestinationText.text("Hold down Cmd (Mac) or Ctrl (Windows) key to select up to 5 cities.")
		.attr("class", "helper")
		.attr("x", 20)
		.attr("y", destinationTextY + 20)

    var dateTextY = 255

	dateText = others.append("text");
	dateText.text("Choose a flexible range of dates.")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", dateTextY);

	helpdateText = others.append("text");
	helpdateText.text("Are you free all summer? Winter break? When COULD you travel?")
		.attr("class", "helper")
		.attr("x",20)
		.attr("y", dateTextY + 20);

    var minDayTextY = 390

	minDayText = others.append("text");
	minDayText.html("Minimum number of days in each city?")
		.attr("class", "question")
		.attr("x", 20)
		.attr("y", minDayTextY)
	// list = 10000

	helpMinDayText = others.append("text");
	helpMinDayText.text("About how many days do you want to stay in each location?")
		.attr("class", "helper")
		.attr("x", 20)
		.attr("y", minDayTextY + 20);

    var numDaysTextY = 475

	numDaysText = others.append("text");
	numDaysText.html("How long do you want your trip to be?")
       .attr("class", "question")
       .attr("x", 20)
       .attr("y", numDaysTextY);

    helpnumDaysText = others.append("text");
    helpnumDaysText.text("What is the total number of days you want to spend in Europe?")
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
                    validateForm(outputList)
             	}
				else {
					d3.select(this).select("rect").attr("fill", defaultColor)
					console.log("removing "+d)
					d3.select(this).select("text").text(buttonText)
					d3.select(this).select("text").attr("x", 80)
					d3.select("#book").style("opacity",0)
					d3.selectAll("#resultsBox").remove()
					d3.selectAll(".citiesText").remove()

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
        if (outputList[2].value != "2017-05-01")
            {alert("Sorry! For the purpose of this prototype, we need you to choose May 1, 2017 as the start date of your flexible time frame."); return false;}
        if (outputList[3].value == "")
            {alert("Select an end date for your flexible time frame."); return false;}
        if (outputList[3].value != "2017-05-31")
            {alert("Sorry! For the purpose of this prototype, we need you to choose May 31, 2017 as the end date of your flexible time frame."); return false;}
        if (outputList[4].value == "")
            {alert("Minimum number of days must be filled out."); return false;}
        if (outputList[4].value != "2")
            {alert("Sorry! For the purpose of this prototype, we need you to choose 2 as your minimum number of days."); return false;}
        if (outputList[5].value == "")
            {alert("Total number of days must be filled out."); return false;}
        if (outputList[5].value != "21")
            {alert("Sorry! For the purpose of this prototype, we need you to choose 21 total days."); return false;}
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
        else{ d3.select("#book").style("opacity", 1); return showboxes(others, map);}
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
		.attr('y', 1)
		.attr("rx", 15) //rx and ry give the buttons rounded corners
        .attr("ry", 15)
		.attr('width', 329)
		.attr('height', 320)

	var results = others.append('g')
		.attr('id', 'resultsBox').selectAll("g")
		.data(flights)
		.enter().append('g')
		.style("z-index", 1)

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

			return "Price $" + d.values[0].values[0].Total_Price

		});}

	for (i = 0; i<numberofTrips; i+=1){

	optionText = results.append('text');
	optionText.text("Option " + (i+1) + ": ")
		.attr("class", "text")
		.attr("class", "option")
		.attr("x", 402)
		.attr("y", (80+50*i))
		.on("mouseover", function() {
            if (d3.select(this).attr("fill") != textFill) {
                d3.select(this).attr("fill", cityFill); }})
        .on("mouseout", function() {
            if (d3.select(this).attr("fill") != textFill) {
                d3.select(this).attr("fill","black")}})
		.on("click", function() {if (d3.select(this).attr("fill") != textFill) {d3.select(this).attr("fill", textFill);

			if(d3.select(this).text()=="Option 1: "){node_link(flights[0].values, map, others)}
			else if (d3.select(this).text()=="Option 2: "){node_link(flights[1].values, map, others)}
			else if (d3.select(this).text()=="Option 3: "){node_link(flights[2].values, map, others)}
			else if (d3.select(this).text()=="Option 4: "){node_link(flights[3].values, map, others)}
			else if (d3.select(this).text()=="Option 5: "){node_link(flights[4].values, map, others)}
			else {};
		 	}
            else {d3.select(this).attr("fill", "black"), d3.selectAll(".link").remove(), d3.selectAll(".node").remove(), d3.selectAll(".flightTP").remove() }});
    var optionsCities = others.append('g')
		.attr('id', resultsBox).selectAll('g')
		.data(flights[i].Origin)
		.enter().append('g')
	cities = ""
	optionsCities.append("text")
		.attr("class", "text")
		.attr("class", "citiesText")
		.attr("x", 405)
		.attr("y", (100 + 50*i))
		.attr("stroke", "none")
		.text(function (d,j){
				if (j > 0){
					cities += " > " + d
				}
				else {
					cities += d
				}
				return cities
		});
}
})};

function node_link(d, map, others){

	color_scale = ["#fed976", "#feb24c", "Darkgoldenrod", "#fd8d3c", "Goldenrod", "#fee391", "#fee391", "#fee391" ]

	var sourceList = [],
		targetList = [],
		orderList = [],
		linkList = [],
		landDateList = [],
		departDateList = [],
		priceList = [];
		totalPrice = d[1].values[0].Total_Price

	for (i=0; i<d.length; i+=1){
		sourceList.push({source: d[i].values[0].Origin_Name})
		targetList.push(d[i].values[0].Dest_Name)
		orderList.push(d[i].values[0].Seq)
		landDateList.push(d[i].values[0].Date1)
		departDateList.push(d[i].values[0].Date2)
		priceList.push(d[i].values[0].Price)
	}


	for(i=0; i<d.length; i+=1){
		linkList.push({source:sourceList[i].source, target:targetList[i], seq:orderList[i], land: landDateList[i], depart: departDateList[i], price: priceList[i]})
	}

	var linkLength = (linkList.length-1)

 	var linkTip = d3.tip()
			  .attr('class', 'd3-tipGraph')
			  .html(function(d){return ("<i> Destination: </i> "  + d.target + " </br> <i> Flight Price: </i> $" + d.price + "</br> <i>Depart Date: </i>" + d.land + " </br> <i>Land Date:</i> " + d.depart)})

 	var nodeTip = d3.tip()
			  .attr('class', 'd3-tipGraph')
			  .html(function(d,i){
			  		if(linkList[(i - 1)] != undefined) {return ("<i> City: </i> "  + linkList[i-1].target + " </br> <i> Flight Price To City: </i> $" + linkList[i-1].price + "</br> <i>Land Date: </i>" + linkList[i-1].depart + " </br> <i>Depart Date:</i> " + d.depart)}
			  		else {return ("<i> City: </i> "  + linkList[linkLength].target + " </br> <i> Flight Price To City: </i> $" + linkList[linkLength].price + "</br> <i>Land Date: </i>" + linkList[linkLength].land + " </br> <i>Depart Date:</i> " + linkList[linkLength].depart)}
			  	})

	var linkTP = map.append('g')
		.data(linkList);

	linkTP.call(linkTip)
	linkTP.call(nodeTip)

	var flightTip = d3.tip()
			  .attr('class', 'd3-tip flightTP')
			  .offset([400,115])
			  // .attr("x", 400)
			  // .attr("y", 115) //{for (i = linkList.length; i>0; i-=1) {console.log(i); return ([i*100,115])}})
			  .html(function(d){strhtml = "<strong>Route Price: $" + totalPrice + "</strong><br> <table class='GeneratedTable'> <thead><tr><th>Origin</th><th>Destination</th><th>Date</th><th>Price</th></tr></thead><tbody> ";

				    for (i = 0 ; i <linkList.length;i++){
				            strhtml  += '<tr><td>' + linkList[i].source +'</td><td>'+ linkList[i].target + '</td><td>'+ linkList[i].land +'</td><td> $'+ linkList[i].price +"</td></tr>";
						};

					strhtml  += "</tbody></table>";
					return (strhtml)});


	var flightTP = others.append('g')
		.data(linkList)
		.attr("class", "flightTP");

	flightTP.call(flightTip);

	var flightDeets = others.selectAll("table")
		.data(linkList)
		.enter().append("g")
		.attr("class", "table flightTP")

	flightDeets.append("rect")
		.attr('x', 405)
		.attr('y', 325)
		.attr("rx", 15) //rx and ry give the buttons rounded corners
        .attr("ry", 15)
		.attr('width', 320)
		.attr('height', 320)
		.attr("stroke", "none")
		.attr("fill", "#ebebeb")
		.call(flightTip.show);


   	var link = map.selectAll('.link')
   	    .data(linkList)
   	    .enter().append('line')
   	    .attr('class', 'link')
   	    .attr("stroke", function(d) {return(color_scale[+d.seq])})
   	    .attr("x1", function(d) {if (!(d.source == 'Atlanta' || d.source == 'Orlando' || d.source == 'Palma')) {var t = d3.transform(d3.select("#"+d.source).attr("transform")); return (t.translate[0]);}
       							  else if (d.source == 'Palma'){return 280}
       							  else {return 20}})
		.attr("y1", function(d) {if (!(d.source == 'Atlanta' || d.source == 'Orlando' || d.source == 'Palma')) {var t = d3.transform(d3.select("#"+d.source).attr("transform")); return (t.translate[1]);}
       							  else if (d.source == 'Palma'){return 648}
   							      else {return 300}})
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
       							  else if (d.source == 'Palma'){return 280}
       							  else {return 20}})
       	  .attr("cy", function(d){ if (!(d.source == 'Atlanta' || d.source == 'Orlando' || d.source == 'Palma')) {var t = d3.transform(d3.select("#"+d.source).attr("transform")); return (t.translate[1]);}
    							  else if (d.source == 'Palma'){return 648}
    							  else {return 300}})
       	  .on("mouseover", nodeTip.show)
       	  .on("mouseout", nodeTip.hide);

}


