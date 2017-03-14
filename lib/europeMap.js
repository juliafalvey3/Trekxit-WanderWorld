/**
 * Contains the class for constructing the map of Europe.
 * europe.json was created using data from
 * Natural Earth: http://naturalearthdata.com
 * and GDAL: http://www.gdal.org/
 * with topojson (need node.js): npm install -g topojson
 */

/**
 * Generates the map of Europe and optionally the timeline.
 * @param {EuropeMap~Options} [_options] - The options for constructing the map.
 */
function EuropeMap(_options) {
    /**
     * The options used at map initialization.
     * @typedef {Object} EuropeMap~Options
     * @property {string} [container=null]            - The identifier for the map container.
     * @property {string} [timelineContainer=null]    - The identifier for the timeline container.
     * @property {string} [clusterInfoContainer=null] - The identifier for the cluster info container.
     * @property {Object} [gridSize]                  - Clustering minimum and maximum grid size in the map.
     * @property {number} [gridSize.min=8]            - Minimum grid size.
     * @property {number} [gridSize.max=40]           - Maximum grid size.
     * @property {Object} [margin]                    - Margin on the map content.
     * @property {number} [margin.left=20]            - Left margin.
     * @property {number} [margin.top=20]             - Top margin.
     * @property {number} [margin.bottom=20]          - Bottom margin.
     * @property {number} [margin.right=20]          - Right margin.
     */
    var options = $.extend({
        container:            null,
        timelineContainer:    null,
        clusterInfoContainer: null,
        gridSize:             { min: 8, max: 40 },
        margin:               { top: 20, left: 20, bottom: 20, right: 20 }
    }, _options);

    // class container
    var self = this;

    // Reusable parameters.
    // Used for manipulating with the SVG objects.
    var map               = null,
        timeline          = null,
        projection        = null,
        quadtree          = null,
        radiusScale       = null,
        gridScale         = null,
        x                 = null,
        xAxis             = null,
        brush             = null,
        brushg            = null,
        tooltipDiv        = null,
        zoom              = null,
        zoomEnableFlag    = false;


    // The collection of all jobs, the selected
    var allJobPoints       = [],
        timequeryJobPoints = [],
        pointClusters      = [];

    // Zoom properties: used to save the current zoom state
    var scale = 0;
    var trans = [0, 0];
    var zoomLevel = 0;

    var changeFlag = false;
    var showFlag = false;

    /**
     * Alpha-3 to Alpha-2 ISO code (only EU countries)
     */
    var Alpha3To2 = {
        'AND': 'AD',    // Andorra
        'AUT': 'AT',    // Austria
        'BEL': 'BE',    // Belgium
        'BGR': 'BG',    // Bulgaria
        'CYP': 'CY',    // Cyprus
        'CZE': 'CZ',    // Czech Republic
        'CHE': 'CH',    // Switzerland
        'DNK': 'DK',    // Denmark
        'DEU': 'DE',    // Germany
        'ESP': 'ES',    // Spain
        'EST': 'EE',    // Estonia
        'FIN': 'FI',    // Finland
        'FRA': 'FR',    // France
        'GBR': 'GB',    // United Kingdom
        'GRC': 'GR',    // Greece
        'HUN': 'HU',    // Hungary
        'HRV': 'HR',    // Croatia
        'IRL': 'IE',    // Ireland
        'ITA': 'IT',    // Italy
        'LTU': 'LT',    // Lithuania
        'LUX': 'LU',    // Luxembourg
        'LVA': 'LV',    // Latvia
        'MLT': 'MT',    // Malta
        'NLD': 'NL',    // Netherlands
        'POL': 'PL',    // Poland
        'PRT': 'PT',    // Portugal
        'ROU': 'RO',    // Romania
        'SMR': 'SM',    // San Marino
        'UKR': 'UA',    // Ukraine
        'SVK': 'SK',    // Slovakia
        'SVN': 'SI',    // Slovenia
        'VAT': 'VA'     // holy city of Vatican
    };

    /**
     * Alpha-2 to Alpha-3 ISO code (only EU countries)
     */
    var Alpha2To3 = {
        'AD': 'AND',    // Andorra
        'AT': 'AUT',    // Austria
        'BE': 'BEL',    // Belgium
        'BG': 'BGR',    // Bulgaria
        'CY': 'CYP',    // Cyprus
        'CZ': 'CZE',    // Czech Republic
        'CH': 'CHE',    // Switzerland
        'DK': 'DNK',    // Denmark
        'DE': 'DEU',    // Germany
        'ES': 'ESP',    // Spain
        'EE': 'EST',    // Estonia
        'FI': 'FIN',    // Finland
        'FR': 'FRA',    // France
        'GB': 'GBR',    // United Kingdom
        'GR': 'GRC',    // Greece
        'HU': 'HUN',    // Hungary
        'HR': 'HRV',    // Croatia
        'IE': 'IRL',    // Ireland
        'IT': 'ITA',    // Italy
        'LT': 'LTU',    // Lithuania
        'LU': 'LUX',    // Luxembourg
        'LV': 'LVA',    // Latvia
        'MT': 'MLT',    // Malta
        'NL': 'NLD',    // Netherlands
        'PL': 'POL',    // Poland
        'PT': 'PRT',    // Portugal
        'RO': 'ROU',    // Romania
        'SM': 'SMR',    // San Marino
        'UA': 'UKR',    // Ukraine
        'SK': 'SVK',    // Slovakia
        'SI': 'SVN',    // Slovenia
        'VA': 'VAT'     // holy city of Vatican
    };

    /**
     * Alpha-3 ISO Code to full country names (only EU countries)
     */
    var Alpha3ToFull = {
        'AND': 'Andorra',
        'AUT': 'Austria',
        'BEL': 'Belgium',
        'BGR': 'Bulgaria',
        'CYP': 'Cyprus',
        'CZE': 'Czech Republic',
        'CHE': 'Switzerland',
        'DNK': 'Denmark',
        'DEU': 'Germany',
        'ESP': 'Spain',
        'EST': 'Estonia',
        'FIN': 'Finland',
        'FRA': 'France',
        'GBR': 'United Kingdom',
        'GRC': 'Greece',
        'HUN': 'Hungary',
        'HRV': 'Croatia',
        'IRL': 'Ireland',
        'ITA': 'Italy',
        'LTU': 'Lithuania',
        'LUX': 'Luxembourg',
        'LVA': 'Latvia',
        'MLT': 'Malta',
        'NLD': 'Netherlands',
        'POL': 'Poland',
        'PRT': 'Portugal',
        'ROU': 'Romania',
        'SMR': 'San Marino',
        'UKR': 'Ukraine',
        'SVK': 'Slovakia',
        'SVN': 'Slovenia'
    };

    /**
     * Draws the map of Europe with the timeline
     */
    this.DrawMap = function () {
        // empty the container
        $(options.container + " svg").remove();
        var totalWidth  = $(options.container).width(),
            totalHeight = $(options.container).height(),
            width       = totalWidth - options.margin.left - options.margin.right,
            height      = totalHeight - options.margin.top - options.margin.bottom;
        // the alpha-3 ISO codes of the Non-EU European countries
        var nonEUCountry = ['ALB', 'AND', 'BLR', 'BIH', 'GEO', 'ISL', 'UNK', 'LIE', 'MKD',
                            'MDA', 'MNE', 'NOR', 'SMR', 'SRB', 'CHE', 'UKR', 'VAT'];

        // set the projection function from spherical coords to euclidean
        projection = d3.geo.vanDerGrinten()
                       .center([5, 55])
                       .scale(600)
                       .translate([width / 2, height / 2]);

        var path = d3.geo.path()
                     .pointRadius(0.5)
                     .projection(projection);

        // graticules at 10 degrees
        var graticule = d3.geo.graticule()
                          .step([10, 10]);

        zoom = d3.behavior.zoom()
                 .scaleExtent([1, 5])
                 .on("zoom", onZoom);

        gridScale = d3.scale.linear()
                      .domain(zoom.scaleExtent())
                      .range([options.gridSize.max, options.gridSize.min]);

        tooltipDiv = d3.select("body").append("div")
                       .attr("class", "graph-tooltip")
                       .style("display", "none");

        //-------------------------------------------------
        // Map functionality
        //-------------------------------------------------

        var svg = d3.select(options.container).append("svg")
                    .attr("id", "map-europe")
                    .attr("width", totalWidth)
                    .attr("height", totalHeight)
                    .call(zoom);

        map = svg.append("g")
                 .attr("transform", "translate(" + options.margin.left + ", " + options.margin.top + ")");

        // load the europe data
        d3.json("data/map/europe.json", function (error, europe) {
             if (error) { throw error; }

            //-----------------------------------
            // Adding countries and it's labels
            //-----------------------------------

            // get the countries from the json file
            var countries = topojson.feature(europe, europe.objects.countries),
                cities    = topojson.feature(europe, europe.objects.cities);

            // set the country features
            map.selectAll(".country")
               .data(countries.features)
               .enter().append("path")
               .attr("class", function (d) {
                  var hidden = nonEUCountry.indexOf(d.id) !== -1 ? "notvisible" : "";
                  return "country " + hidden;
               })
               .attr("id", function (d) { return d.id; })
               .attr("d", path);

            // set the country label
            map.selectAll(".country-label")
               .data(countries.features)
               .enter().append("text")
               .attr("class", function (d) { return "country-label " + d.id; })
               .attr("transform", function (d) {
                   var addX = d.id == "FRA" ?  55 : 0;
                   var addY = d.id == "FRA" ? -45 : 0;
                   return "translate(" + (path.centroid(d)[0] + addX) + ", " + (path.centroid(d)[1] + addY) + ")";
               })
               .attr("dy", ".35em")
               .text(function (d) {
                   if (nonEUCountry.indexOf(d.id) === -1) {
                       return d.properties.name;
                   } else {
                       return "";
                   }
               });

            // graticule lines
            map.selectAll('.graticule')
               .data([graticule()])
               .enter().append('path')
               .attr('class', 'graticule')
               .attr('d', path);

            // set the city location as points
            map.append("path")
               .datum(cities)
               .attr("class", "city")
               .attr("d", path);

            // set the city label/names
            map.selectAll(".city-label")
               .data(cities.features)
               .enter().append("text")
               .attr("class", "city-label")
               .attr("transform", function (d) {
                   return "translate(" + projection(d.geometry.coordinates) + ")";
               })
               .attr("dy", ".35em")
               .text(function (d) {
                   return d.properties.name;
               })
               .attr("x", function (d) {
                   return d.geometry.coordinates[0] > -1 ? 3 : -3;
               })
               .style("text-anchor", function (d) {
                   return d.geometry.coordinates[0] > -1 ? "start" : "end";
               });
        });

        //-----------------------------------
        // Zoom functionality
        //-----------------------------------

        // the zoom behaviour (panning and boundary limits)
        function onZoom() {
            scale = d3.event.scale;
            trans = d3.event.translate;
            var h = height / 4;
            trans[0] = Math.min(
                width / height * (scale - 1) + 90 * scale,
                Math.max(width * (1 - scale) - 90 * scale, trans[0])
            );
            trans[1] = Math.min(
                h * (scale - 1) + 3 * h / 4 * scale,
                Math.max(height * (1 - scale) - 3 * h / 4 * scale, trans[1])
            );
            map.attr("transform", "translate(" + trans + ")scale(" + scale + ")");
            zoom.translate(trans);

            if (Math.floor(scale) !== zoomLevel) {
                zoomLevel = Math.floor(scale);
                if (timequeryJobPoints.length !== 0) {
                    createJobClusters();
                }
                changeFlag = scale > 2.5 === true && showFlag === false || scale > 2.5 === false && showFlag === true;
                showFlag   = scale > 2.5;
                toggleCityLabel(changeFlag, showFlag);
            }

        }
    };

    /**
     * Stores the points and draws the clusters.
     * @param {Array.<Object>} _points - The array containing the points.
     */
    this.DrawPoints = function (_points) {
        if (typeof(_points) === 'undefined') throw "No parameter specified";

        timequeryJobPoints = allJobPoints = _points;

        createTimeline();
        createJobClusters();
    };


    //-------------------------------------------------
    // Cluster functionality
    //-------------------------------------------------
    function createJobClusters() {

        var totalWidth  = $(options.container).width(),
            totalHeight = $(options.container).height(),
            width       = totalWidth - options.margin.left - options.margin.right,
            height      = totalHeight - options.margin.top - options.margin.bottom;

        // get the coordinates data of the points
        var pointsRaw = timequeryJobPoints.map(function (d, i) {
            var location = d.location_coord;
            var point = projection([location[1], location[0]]);
            return { x: point[0], y: point[1], id: d.id };
        });
        // create the quadtree used for the clustering
        quadtree = d3.quadtree()
                     .x(function (d) { return d.x; })
                     .y(function (d) { return d.y; })
                     .addAll(pointsRaw);

        // Find the nodes within the specified rectangle
        function search(quadtree, x0, y0, x3, y3) {
            var validData = [];
            quadtree.visit(function (node, x1, y1, x2, y2) {
                if (!node.length) {
                    do {
                        p = node.data;
                        if (p) {
                            p.selected = (p.x >= x0) && (p.x <= x3) && (p.y >= y0) && (p.y <= y3);
                            if (p.selected) {
                                validData.push(p);
                            }
                        }
                        node = node.next;
                    } while (node);
                }
            });
            return validData;
        }
        pointClusters = [];
        for (var x = 0; x <= width; x += gridScale(scale)) {
            for (var y = 0; y <= height; y += gridScale(scale)) {
                var searched = search(quadtree, x, y, x + gridScale(scale), y + gridScale(scale));
                if (searched.length === 0) continue;
                var centerPoint = searched.reduce(function (prev, current) {
                    return { x: prev.x + current.x, y: prev.y + current.y };
                }, { x: 0, y: 0 });
                centerPoint.x = centerPoint.x / searched.length;
                centerPoint.y = centerPoint.y / searched.length;
                centerPoint.jobs = searched;

                if (centerPoint.x && centerPoint.y) {
                    pointClusters.push(centerPoint);
                }
            }
        }
        /**
         * Creates the Cluster points on the map
         */
        // TODO: change the cluster radius
        radiusScale = d3.scale.log()
                        .domain([
                            d3.min(pointClusters, function (d) { return d.jobs.length; }),
                            d3.max(pointClusters, function (d) { return d.jobs.length; })
                        ])
                        .rangeRound([2, 12 / zoom.scale() + 1]);

        // add the clusters on the map
        var clusters = map.selectAll(".jobCluster")
                          .data(pointClusters);

        clusters.attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .attr("r", function (d) { return radiusScale(d.jobs.length); });

        clusters.exit().remove();

        clusters.enter().append("circle")
                .attr("class", "jobCluster")
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .attr("r", function (d) { return radiusScale(d.jobs.length); });

        clusters.on("click", function (d, i) {
            if (options.clusterInfoContainer) {
                $(options.clusterInfoContainer).html(getJobClusterInfo(d));
            }
        });

        // getting the information
        clusters.on("mousemove", function (d, i) {

            // set the description in the tooltip
            tooltipDiv.html(tooltipBodyConstructor(d, options.tooltipType));

            // TODO set the offset of the div container
            var x = d3.event.pageX;
            var y = d3.event.pageY;
            var xOffset = 10;
            var yOffset = 10;
            // set the position of the tooltip
            tooltipDiv.style("left", (x + xOffset) + "px")
                      .style("top",  (y + yOffset) + "px")
                      .style("display", "block");
        }).on("mouseout", function (d, idx) {
            tooltipDiv.style("display", "none");
        });
    }

    //-------------------------------------------------
    // Timeline functionality
    //-------------------------------------------------
    function createTimeline(brushStartEnd) {

        if (options.timelineContainer) {
            // empty the container
            $(options.timelineContainer + " svg").remove();

            // get the width and height of the timeline container
            var totalWidth  = $(options.timelineContainer).width(),
                totalHeight = $(options.timelineContainer).height(),
                width       = totalWidth - options.margin.left - options.margin.right,
                height      = totalHeight - options.margin.top - options.margin.bottom;

            var jobTimestamps = allJobPoints.map(function (job) {
                return job.timestamp;
            });

            var minTime = new Date(Math.min.apply(Math, jobTimestamps)),
                maxTime = new Date(Math.max.apply(Math, jobTimestamps));

            var wholeTimeline = [minTime, maxTime];

            var format = d3.time.format.multi([
              [".%L", function(d) { return d.getMilliseconds(); }],
              [":%S", function(d) { return d.getSeconds(); }],
              ["%I:%M", function(d) { return d.getMinutes(); }],
              ["%I %p", function(d) { return d.getHours(); }],
              ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
              ["%b %d", function(d) { return d.getDate() != 1; }],
              ["%b", function(d) { return d.getMonth(); }],
              ["%Y", function() { return true; }]
            ]);

            // timeline axis domain and range
            x = d3.time.scale()
                      .domain(wholeTimeline)
                      .range([0, width]);

            // create the svg timeline container
            xAxis = d3.svg.axis().scale(x)
                      .innerTickSize(5)
                      .outerTickSize(0)
                      .tickFormat(format)
                    //   .ticks(d3.time.month, 3)
                      .orient("bottom");

            var svg = d3.select(options.timelineContainer).append("svg")
                        .attr("width", totalWidth)
                        .attr("height", totalHeight)
                        .append("g")
                        .attr("transform", "translate(" + options.margin.left + ", 0)");

            timeline = svg.append("g");

            timeline.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0, " + (totalHeight - options.margin.bottom) + ")")
                    .call(xAxis);

            // add the brush functionality
            brush = d3.svg.brush()
                      .x(x)
                      .on("brush", changeView);

            var arc = d3.svg.arc()
                        .outerRadius(totalHeight / 10)
                        .startAngle(0)
                        .endAngle(function (d, i) { return i ? -Math.PI : Math.PI; });

            brushg = timeline.append("g")
                             .attr("class", "brush")
                             .call(brush);

            brushg.selectAll(".resize").append("path")
                  .attr("transform", "translate(0," + (2 * totalHeight / 5) + ")")
                  .attr("d", arc);

            brushg.selectAll("rect")
                  .attr("y", 5)
                  .attr("height", totalHeight - 25);

            // set the default brush width
            if (brushStartEnd) {
                brush.extent(brushStartEnd);
            } else {
                brush.extent(wholeTimeline);
            }
            timeline.select('.brush').call(brush);
        }

        // when timeline brush changes
        function changeView() {
            // if there are no points in the cluster
            if (allJobPoints.length === 0) { return; }
            // get the minimum and maximum times in miliseconds
            var timeInterval = brush.extent();
            var minTime = timeInterval[0].getTime();
            var maxTime = timeInterval[1].getTime();

            // get the selected jobs (that were published in the time interval)
            timequeryJobPoints = allJobPoints.filter(function (rec) {
                var timestamp = rec.timestamp;
                return minTime <= timestamp && timestamp <= maxTime;
            });
            // redraw the clusters
            createJobClusters();
        }
    }
    //-------------------------------------------------
    // Helper functions
    //-------------------------------------------------

    function resizeRedraw () {
        $(".graph-tooltip").remove();
        $("#map-load-container").css("width", $(".map").width());
        // empty the container
        $(options.container + " svg").remove();

        var totalWidth  = $(options.container).width(),
            totalHeight = $(options.container).height(),
            width       = totalWidth - options.margin.left - options.margin.right,
            height      = totalHeight - options.margin.top - options.margin.bottom;

        // the alpha-3 ISO codes of the Non-EU European countries
        var nonEUCountry = ['ALB', 'AND', 'BLR', 'BIH', 'GEO', 'ISL', 'UNK', 'LIE', 'MKD',
                            'MDA', 'MNE', 'NOR', 'SMR', 'SRB', 'CHE', 'UKR', 'VAT'];

        scale = 0;
        trans = [0, 0];
        zoomLevel = 0;

        // set the projection function from spherical coords to euclidean
        projection = d3.geo.vanDerGrinten()
                       .center([5, 55])
                       .scale(600)
                       .translate([width / 2, height / 2]);

        var path = d3.geo.path()
                     .pointRadius(0.5)
                     .projection(projection);

        // graticules at 10 degrees
        var graticule = d3.geo.graticule()
                          .step([10, 10]);

        zoom = d3.behavior.zoom()
                 .scaleExtent([1, 5])
                 .on("zoom", onZoom);

        gridScale = d3.scale.linear()
                      .domain(zoom.scaleExtent())
                      .range([options.gridSize.max, options.gridSize.min]);

        tooltipDiv = d3.select("body").append("div")
                       .attr("class", "graph-tooltip")
                       .style("display", "none");

        //-------------------------------------------------
        // Map functionality
        //-------------------------------------------------

        var svg = d3.select(options.container).append("svg")
                    .attr("id", "map-europe")
                    .attr("width", totalWidth)
                    .attr("height", totalHeight)
                    .call(zoom);

        map = svg.append("g")
                 .attr("transform", "translate(" + options.margin.left + ", " + options.margin.top + ")");

        // load the europe data
        d3.json("data/map/europe.json", function (error, europe) {
             if (error) { throw error; }

            //-----------------------------------
            // Adding countries and it's labels
            //-----------------------------------

            // get the countries from the json file
            var countries = topojson.feature(europe, europe.objects.countries),
                cities    = topojson.feature(europe, europe.objects.cities);

            // set the country features
            map.selectAll(".country")
               .data(countries.features)
               .enter().append("path")
               .attr("class", function (d) {
                  var hidden = nonEUCountry.indexOf(d.id) !== -1 ? "notvisible" : "";
                  return "country " + hidden;
               })
               .attr("id", function (d) { return d.id; })
               .attr("d", path);

            // set the country label
            map.selectAll(".country-label")
               .data(countries.features)
               .enter().append("text")
               .attr("class", function (d) { return "country-label " + d.id; })
               .attr("transform", function (d) {
                   var addX = d.id == "FRA" ?  55 : 0;
                   var addY = d.id == "FRA" ? -45 : 0;
                   return "translate(" + (path.centroid(d)[0] + addX) + ", " + (path.centroid(d)[1] + addY) + ")";
               })
               .attr("dy", ".35em")
               .text(function (d) {
                   if (nonEUCountry.indexOf(d.id) === -1) {
                       return d.properties.name;
                   } else {
                       return "";
                   }
               });

            // graticule lines
            map.selectAll('.graticule')
               .data([graticule()])
               .enter().append('path')
               .attr('class', 'graticule')
               .attr('d', path);

            // set the city location as points
            map.append("path")
               .datum(cities)
               .attr("class", "city")
               .attr("d", path);

            // set the city label/names
            map.selectAll(".city-label")
               .data(cities.features)
               .enter().append("text")
               .attr("class", "city-label")
               .attr("transform", function (d) {
                   return "translate(" + projection(d.geometry.coordinates) + ")";
               })
               .attr("dy", ".35em")
               .text(function (d) {
                   return d.properties.name;
               })
               .attr("x", function (d) {
                   return d.geometry.coordinates[0] > -1 ? 3 : -3;
               })
               .style("text-anchor", function (d) {
                   return d.geometry.coordinates[0] > -1 ? "start" : "end";
               });

            if (allJobPoints.length !== 0) {
                createTimeline(brush.extent());
                createJobClusters();
            }
        });

        //-----------------------------------
        // Zoom functionality
        //-----------------------------------

        // the zoom behaviour (panning and boundary limits)
        function onZoom() {
            scale = d3.event.scale;
            trans = d3.event.translate;
            var h = height / 4;
            trans[0] = Math.min(
                width / height * (scale - 1) + 90 * scale,
                Math.max(width * (1 - scale) - 90 * scale, trans[0])
            );
            trans[1] = Math.min(
                h * (scale - 1) + 3 * h / 4 * scale,
                Math.max(height * (1 - scale) - 3 * h / 4 * scale, trans[1])
            );
            map.attr("transform", "translate(" + trans + ")scale(" + scale + ")");
            zoom.translate(trans);

            if (Math.floor(scale) !== zoomLevel) {
                zoomLevel = Math.floor(scale);
                if (timequeryJobPoints.length !== 0) {
                    createJobClusters();
                }
                changeFlag = scale > 2.5 === true && showFlag === false || scale > 2.5 === false && showFlag === true;
                showFlag   = scale > 2.5;
                toggleCityLabel(changeFlag, showFlag);
            }

        }
    }

    var getJobClusterInfo = function(cluster) {
        var text = "";
        // get the data from the job cluster
        var clusterJobs = cluster.jobs;
        var NumOfJobs   = clusterJobs.length;

        var JobIds = clusterJobs.map(function (job) { return job.id; });
        var Jobs   = timequeryJobPoints.filter(function (job) {
            return JobIds.indexOf(job.id) != -1;
        });

        // get the infosets
        var skillset = getSkills(Jobs, "skillset");
        var cities   = getLocation(Jobs, "location_city");
        var country  = getLocation(Jobs, "location_country")[0];

        // set the description
        text += "<h4>Cluster data</h4><dl>";
        text += "<dt>Number of Jobs</dt> <dd>" + NumOfJobs + "</dd>";
        text += "<dt>Number of Skills</dt> <dd>" + skillset.length + "</dd>";
        text += "<dt>Country</dt> <dd>" + country.name + "</dd>";
        text += "<dt>Locations</dt> <dd>";
        for (var LocationN = 0; LocationN < cities.length; LocationN++) {
            text += "<a onclick=\"queryLocation(\'" + cities[LocationN].name + "\')\">" +cities[LocationN].name + "</a>" + "(" + cities[LocationN].count + ")";
            if   (LocationN != cities.length - 1) text += ", ";
            else text += "</dd>";
        }
        text += "<dt>Skill set</dt><dd>";
        for (var SkillN = 0; SkillN < skillset.length; SkillN++) {
            text += "<a onclick=\"querySkill(\'"+ skillset[SkillN].name +"\')\">"+ skillset[SkillN].name + "</a>"+ "(" + skillset[SkillN].count + ")";
            if (SkillN != skillset.length - 1) text += ", ";
        }

        text += "</dd></dl>";
        return text;
    };

    var tooltipBodyConstructor = function (cluster) {
            return getTooltipBody(cluster);
    };

    /**
     * Creates the html body of the tooltip.
     */
    function getTooltipBody(cluster) {
        var text = "";
        // get the data from the job cluster
        var clusterJobs = cluster.jobs;
        var NumOfJobs   = clusterJobs.length;

        var JobIds = clusterJobs.map(function (job) { return job.id; });
        var Jobs   = timequeryJobPoints.filter(function (job) {
            return JobIds.indexOf(job.id) != -1;
        });
        // get the skillset
        var skillset    = getSkills(Jobs, "skillset");
        var NumOfSkills = skillset.length > 10 ? 10 : skillset.length;

        var cities      = getLocation(Jobs, "location_city");
        var NumOfCities = cities.length > 10 ? 10 : cities.length;

        var country = getLocation(Jobs, "location_country")[0];

        text += "<h4>Cluster Data</h4><dl>";
        text += "<dt>Cluster Found in Country</dt><dd>" + country.name + "</dd>";
        text += "<dt>Top 10 Locations the Cluster Includes</dt><dd>";

        for (var CityN = 0; CityN < NumOfCities; CityN++) {
            text += cities[CityN].name + " (" + cities[CityN].count + ")";
            if   (CityN != NumOfCities - 1) text += ", ";
            else text += "</dd>";
        }

        text += "<dt>Number of Queried Jobs in Cluster</dt><dd>" + NumOfJobs + "</dd>";
        text += "<dt>Number of Different Skills </dt><dd>" + skillset.length + "</dd>";
        text += "<dt>Top 10 Skills</dt><dd>";

        for (var SkillN = 0; SkillN < NumOfSkills; SkillN++) {
            text += skillset[SkillN].name + " (" + skillset[SkillN].count + ")";
            if   (SkillN != NumOfSkills - 1) text += ", ";
            else text += "</dd>";
        }
        text += "</dl>";
        return text;
    }

    // Gets the skills from the Jobs located under the field queryField
    function getSkills(Jobs, queryField) {
        var skillset    = [];
        var knownSkills = {};
        var idx = 0;
        // go through all jobs
        for (var JobN = 0; JobN < Jobs.length; JobN++) {
            var jobSkillset = Jobs[JobN][queryField];
            // go through all skills needed for the job
            for (var SkillN = 0; SkillN < jobSkillset.length; SkillN++) {
                var skillName = jobSkillset[SkillN];
                if (!knownSkills[skillName]) {
                    skillset.push({ name: skillName, count: 1 });
                    knownSkills[skillName] = idx++;
                } else {
                    skillset[knownSkills[skillName]].count += 1;
                }
            }
        }
        // sort in descending order (based on count)
        function compare(a, b) { return b.count - a.count; }
        skillset.sort(compare);
        return skillset;
    }

    // Gets the locations from the Jobs located under the field queryField
    function getLocation(Jobs, queryField) {
        var locationset    = [];
        var knownLocations = {};
        var idx = 0;
        // go through all jobs
        for (var JobN = 0; JobN < Jobs.length; JobN++) {
            var location = Jobs[JobN][queryField];
            // get the location count
            if (typeof knownLocations[location] === 'undefined') {
                locationset.push({ name: location, count: 1 });
                knownLocations[location] = idx++;
            } else {
                locationset[knownLocations[location]].count += 1;
            }
        }
        // sort in descending order (based on count)
        function compare(a, b) { return b.count - a.count; }
        locationset.sort(compare);
        return locationset;
    }

    function toggleCityLabel (changeFlag, showFlag) {
        if (changeFlag) {
            // show city labels and location
            if (!showFlag) {
                $("#map-europe .city").hide();
                $("#map-europe .city-label").hide();
                $("#map-europe .country-label").show();
            } else {
                $("#map-europe .city").show();
                $("#map-europe .city-label").show();
                $("#map-europe .country-label").hide();
            }
        }
    }

    //-------------------------------------------------
    // Get functions
    //-------------------------------------------------

    this.getPointsData = function () {
        return allJobPoints;
    };


    //-------------------------------------------------
    // Set functions
    //-------------------------------------------------

    // resize on window resize
    var resizeTimer;
    var windowWidth = $(window).width();
    $(window).resize(function () {
        if ($(this).width() !== windowWidth) {
            windowWidth = $(this).width();
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resizeRedraw();
            }, 200);
        }
    });
}
