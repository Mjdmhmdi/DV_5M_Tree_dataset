import topojson from "https://cdn.skypack.dev/topojson@3.0.2";
var svg = d3.select("svg"),
    margin = {
        top: 20,
        right: 100,
        bottom: 30,
        left: 100
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var barPadding = 5; // Adjust this value to change the padding/margin of the bars
var intervalDuration = 300; // Default interval duration
var startDelay = 100; // Delay before the graphic starts
var xAxisLineColor = "#999999"; // Default x-axis line color
var maxLoops = 1; // Maximum number of loops

var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleBand().range([0, height]).paddingInner(0.1).paddingOuter(0.1);

var parseTime = d3.timeParse("%Y");

// Define icons for each country (you can add more icons here as needed)
var icons = {
    'USA': 'https://www.makoboard.com/img/d3/flags/com.png',
    'China': 'https://www.makoboard.com/img/d3/flags/cn.png',
    'India': 'https://www.makoboard.com/img/d3/flags/in.png',
    'Germany': 'https://www.makoboard.com/img/d3/flags/de.png',
    'UK': 'https://www.makoboard.com/img/d3/flags/co.uk.png',
    'Japan': 'https://www.makoboard.com/img/d3/flags/co.jp.png',
    'France': 'https://www.makoboard.com/img/d3/flags/fr.png',
    'Russia': 'https://www.makoboard.com/img/d3/flags/ru.png',
    'Canada': 'https://www.makoboard.com/img/d3/flags/ca.png',
    'Italy': 'https://www.makoboard.com/img/d3/flags/it.png'
};

// Define custom colors for each country (you can add more colors here as needed)
var colors = {
    'USA': '#3C3B6E',
    'China': '#FFDE00',
    'India': '#138808',
    'Germany': '#DD0000',
    'UK': '#C8102E',
    'Japan': '#BC002D',
    'France': '#0055A4',
    'Russia': '#CA190C',
    'Canada': '#FF0000',
    'Italy': '#009246'
};

d3.csv("real-gdp.csv").then(function (data) {
    data.forEach(function (d) {
        d.date = parseTime(d.date);
        for (const country of Object.keys(d)) {
            if (country !== 'date') {
                d[country] = +d[country];
            }
        }
    });

    var yearData = {};
    data.forEach(function (d) {
        var year = d.date.getFullYear();
        if (!yearData[year]) {
            yearData[year] = [];
        }
        for (const country of Object.keys(d)) {
            if (country !== 'date' && d[country] > 0) {
                yearData[year].push({
                    country: country,
                    gdp: d[country]
                });
            }
        }
    });

    var years = Object.keys(yearData).map(d => +d).sort((a, b) => a - b);
    years.forEach(function (year) {
        yearData[year].sort((a, b) => b.gdp - a.gdp);
        yearData[year] = yearData[year].slice(0, 10); // Keep only the top 10 countries for each year
    });

    var firstYear = years[0];
    x.domain([0, d3.max(yearData[firstYear], d => d.gdp)]);
    updateYScale(yearData[firstYear]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(width / 80))
        .selectAll(".tick line")
        .attr("y1", -height)
        .attr("stroke", xAxisLineColor);

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(6));

    var bars = g.selectAll(".bar")
        .data(yearData[firstYear], d => d.country)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", x(0))
        .attr("y", d => y(d.country))
        .attr("width", d => x(d.gdp))
        .attr("height", y.bandwidth()) // Use y.bandwidth() for bar height
        .attr("fill", d => colors[d.country]);

    var iconsSelection = g.selectAll(".icon")
        .data(yearData[firstYear], d => d.country)
        .enter().append("image")
        .attr("class", "icon")
        .attr("x", d => x(d.gdp) - 60) // Adjust the icon position to the right within the bar
        .attr("y", d => y(d.country) + (y.bandwidth() - 40) / 2) // Center the icon vertically within the bar
        .attr("width", 40)
        .attr("height", 40)
        .attr("href", d => icons[d.country]);

    var gdpLabels = g.selectAll(".gdp-label")
        .data(yearData[firstYear], d => d.country)
        .enter().append("text")
        .attr("class", "gdp-label")
        .attr("x", d => x(d.gdp) + 5)
        .attr("y", d => y(d.country) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .text(d => `$${d3.format(",")(Math.round(d.gdp))}B GDP`); // Format GDP values with commas and add "B"

    var yearText = svg.append("text")
        .attr("class", "year-text")
        .attr("x", width + margin.left + margin.right - 10)
        .attr("y", height - 50)
        .attr("text-anchor", "end")
        .text(firstYear);

    function updateYScale(data) {
        y.domain(data.map(d => d.country))
            .range([0, height]);
    }

    function update(year) {
        var yearDataSlice = yearData[year];
        x.domain([0, d3.max(yearDataSlice, d => d.gdp)]);
        updateYScale(yearDataSlice);

        var xAxis = g.select(".axis--x").transition()
            .duration(intervalDuration)
            .call(d3.axisBottom(x).ticks(width / 80));

        xAxis.selectAll(".tick line")
            .attr("stroke", xAxisLineColor);

        g.select(".axis--y").transition()
            .duration(intervalDuration)
            .call(d3.axisLeft(y).tickSize(0).tickPadding(6));

        // Update bars
        bars = g.selectAll(".bar").data(yearDataSlice, d => d.country);
        bars.exit().transition().duration(intervalDuration).style("opacity", 0).remove();
        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("x", x(0))
            .attr("y", d => y(d.country))
            .attr("width", d => x(d.gdp))
            .attr("height", y.bandwidth())
            .attr("fill", d => colors[d.country])
            .style("opacity", 0)
            .transition().duration(intervalDuration).style("opacity", 1);

        bars.transition()
            .duration(intervalDuration)
            .attr("y", d => y(d.country))
            .attr("width", d => x(d.gdp))
            .attr("height", y.bandwidth());

        // Update icons
        iconsSelection = g.selectAll(".icon").data(yearDataSlice, d => d.country);
        iconsSelection.exit().transition().duration(intervalDuration).style("opacity", 0).remove();
        iconsSelection.enter().append("image")
            .attr("class", "icon")
            .attr("x", d => x(d.gdp) - 60)
            .attr("y", d => y(d.country) + (y.bandwidth() - 40) / 2)
            .attr("width", 40)
            .attr("height", 40)
            .attr("href", d => icons[d.country])
            .style("opacity", 0)
            .transition().duration(intervalDuration).style("opacity", 1);

        iconsSelection.transition()
            .duration(intervalDuration)
            .attr("x", d => x(d.gdp) - 60)
            .attr("y", d => y(d.country) + (y.bandwidth() - 40) / 2);

        // Update GDP labels
        gdpLabels = g.selectAll(".gdp-label").data(yearDataSlice, d => d.country);
        gdpLabels.exit().transition().duration(intervalDuration).style("opacity", 0).remove();
        gdpLabels.enter().append("text")
            .attr("class", "gdp-label")
            .attr("x", d => x(d.gdp) + 5)
            .attr("y", d => y(d.country) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .text(d => `$${d3.format(",")(Math.round(d.gdp))}B GDP`)
            .style("opacity", 0)
            .transition().duration(intervalDuration).style("opacity", 1);

        gdpLabels.transition()
            .duration(intervalDuration)
            .attr("x", d => x(d.gdp) + 5)
            .attr("y", d => y(d.country) + y.bandwidth() / 2)
            .tween("text", function (d) {
                var i = d3.interpolateNumber(+this.textContent.replace(/[^\d]/g, ''), d.gdp);
                return function (t) {
                    this.textContent = `$${d3.format(",")(Math.round(i(t)))}B GDP`;
                };
            });

        yearText.transition()
            .duration(intervalDuration)
            .text(year);
    }

    var currentIndex = 0;
    var loopCount = 0;
    setTimeout(function () {
        var interval = setInterval(() => {
            update(years[currentIndex]);
            currentIndex = (currentIndex < years.length - 1) ? currentIndex + 1 : 0;
            if (currentIndex === 0) {
                loopCount++;
                if (loopCount >= maxLoops) {
                    clearInterval(interval);
                }
            }
        }, intervalDuration);
    }, startDelay);
}).catch(function (error) {
    console.error("Error loading or parsing data:", error);
});

//ANCHOR - /////////////////////////////////////////////////  SECOND CHART //////////////////////////////////////////////////////////////
// set the dimensions and margins of the graph
var circularMargin = {
        top: 100,
        right: 0,
        bottom: 0,
        left: 0
    },
    width = 660 - circularMargin.left - circularMargin.right,
    height = 660 - circularMargin.top - circularMargin.bottom,
    innerRadius = 120,
    outerRadius = Math.min(width, height) / 2; // the outerRadius goes from the middle of the SVG area to the border

// append the svg object
var circularSvg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + circularMargin.left + circularMargin.right)
    .attr("height", height + circularMargin.top + circularMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + (width / 2 + circularMargin.left) + "," + (height / 2 + circularMargin.top) + ")");

d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum.csv").then(function (data) {

    // Scales
    var x = d3.scaleBand()
        .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0) // This does nothing
        .domain(data.map(function (d) {
            return d.Country;
        })); // The domain of the X axis is the list of states.
    var y = d3.scaleRadial()
        .range([innerRadius, outerRadius]) // Domain will be define later.
        .domain([0, 14000]); // Domain of Y is from 0 to the max seen in the data

    // Sort data according to their value
    data.sort(function (a, b) {
        return b.Value - a.Value;
    });
    // Add the bars
    circularSvg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        .attr("d", d3.arc() // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(function (d) {
                return y(d['Value']);
            })
            .startAngle(function (d) {
                return x(d.Country);
            })
            .endAngle(function (d) {
                return x(d.Country) + x.bandwidth();
            })
            .padAngle(0.01)
            .padRadius(innerRadius))
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#ff6347"); // Change color on hover
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.Country + "<br/>" + d.Value)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function (event, d) {
            tooltip.style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            d3.select(this).attr("fill", "#69b3a2"); // Reset color
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add the labels
    circularSvg.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("text-anchor", function (d) {
            return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start";
        })
        .attr("transform", function (d) {
            return "rotate(" + ((x(d.Country) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['Value']) + 10) + ",0)";
        })
        .append("text")
        .text(function (d) {
            return (d.Country)
        })
        .attr("transform", function (d) {
            return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)";
        })
        .style("font-size", "11px")
        .attr("alignment-baseline", "middle");

    // Add tooltip
    var tooltip = d3.select("#my_dataviz").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

});



/////////////////////////////////////////////   THIRD CHART ///////////////////////////////////////////////////////////////


var bubbleMargin = {
        top: 40,
        right: 150,
        bottom: 60,
        left: 30
    },
    width = 750 - bubbleMargin.left - bubbleMargin.right,
    height = 520 - bubbleMargin.top - bubbleMargin.bottom;

// append the bubbleSvg object to the body of the page
var bubbleSvg = d3.select("#my_bubble")
    .append("svg")
    .attr("width", width + bubbleMargin.left + bubbleMargin.right)
    .attr("height", height + bubbleMargin.top + bubbleMargin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + bubbleMargin.left + "," + bubbleMargin.top + ")");

//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/4_ThreeNum.csv").then(function (data) {

    // ---------------------------//
    //       AXIS  AND SCALE      //
    // ---------------------------//

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, 45000])
        .range([0, width]);
    bubbleSvg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(3));

    // Add X axis label:
    bubbleSvg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 50)
        .text("Gdp per Capita");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([35, 90])
        .range([height, 0]);
    bubbleSvg.append("g")
        .call(d3.axisLeft(y));

    // Add Y axis label:
    bubbleSvg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20)
        .text("Life expectancy")
        .attr("text-anchor", "start")

    // Add a scale for bubble size
    var z = d3.scaleSqrt()
        .domain([200000, 1310000000])
        .range([2, 30]);

    // Add a scale for bubble color
    var myColor = d3.scaleOrdinal()
        .domain(["Asia", "Europe", "Americas", "Africa", "Oceania"])
        .range(d3.schemeSet1);


    // ---------------------------//
    //      TOOLTIP               //
    // ---------------------------//

    // -1- Create a tooltip div that is hidden by default:
    var bubbleTooltip = d3.select("#my_bubble")
        .append("div")
        .style("opacity", 0)
        .attr("class", "bubbletooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")



    // ---------------------------//
    //       HIGHLIGHT GROUP      //
    // ---------------------------//

    // What to do when one group is hovered
    var highlight = function (d) {
        // reduce opacity of all groups
        d3.selectAll(".bubbles").style("opacity", .05)
        // expect the one that is hovered
        d3.selectAll("." + d).style("opacity", 1)
    }

    // And when it is not hovered anymore
    var noHighlight = function (d) {
        d3.selectAll(".bubbles").style("opacity", 1)
    }


    // ---------------------------//
    //       CIRCLES              //
    // ---------------------------//

    // Add dots
    bubbleSvg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", function (d) {
            return "bubbles " + d.continent
        })
        .attr("cx", function (d) {
            return x(d.gdpPercap);
        })
        .attr("cy", function (d) {
            return y(d.lifeExp);
        })
        .attr("r", function (d) {
            return z(d.pop);
        })
        .style("fill", function (d) {
            return myColor(d.continent);
        })
        // -3- Trigger the functions for hover
        .on("mouseover", function (event, d) {
            bubbleTooltip.transition()
                .duration(200)
                .style("opacity", .9);
            bubbleTooltip.html("Country: " + d.country)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseleave", function (d) {
            bubbleTooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });



    // ---------------------------//
    //       LEGEND              //
    // ---------------------------//

    // Add legend: circles
    var valuesToShow = [10000000, 100000000, 1000000000]
    var xCircle = 390
    var xLabel = 440
    bubbleSvg
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("circle")
        .attr("cx", xCircle)
        .attr("cy", function (d) {
            return height - 100 - z(d)
        })
        .attr("r", function (d) {
            return z(d)
        })
        .style("fill", "none")
        .attr("stroke", "black")

    // Add legend: segments
    bubbleSvg
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("line")
        .attr('x1', function (d) {
            return xCircle + z(d)
        })
        .attr('x2', xLabel)
        .attr('y1', function (d) {
            return height - 100 - z(d)
        })
        .attr('y2', function (d) {
            return height - 100 - z(d)
        })
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))

    // Add legend: labels
    bubbleSvg
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("text")
        .attr('x', xLabel)
        .attr('y', function (d) {
            return height - 100 - z(d)
        })
        .text(function (d) {
            return d / 1000000
        })
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')

    // Legend title
    bubbleSvg.append("text")
        .attr('x', xCircle)
        .attr("y", height - 100 + 30)
        .text("Population (M)")
        .attr("text-anchor", "middle")

    // Add one dot in the legend for each name.
    var size = 20
    var allgroups = ["Asia", "Europe", "Americas", "Africa", "Oceania"]
    bubbleSvg.selectAll("myrect")
        .data(allgroups)
        .enter()
        .append("circle")
        .attr("cx", 650)
        .attr("cy", function (d, i) {
            return 10 + i * (size + 5)
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function (d) {
            return myColor(d)
        })
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add labels beside legend dots
    bubbleSvg.selectAll("mylabels")
        .data(allgroups)
        .enter()
        .append("text")
        .attr("x", 650 + size * .8)
        .attr("y", function (d, i) {
            return i * (size + 5) + (size / 2)
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) {
            return myColor(d)
        })
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
})


//ANCHOR - /////////////////////////////////////////////////  FOURTH CHART //////////////////////////////////////////////////////////////
let alldata;
d3.csv("./Life Expectancy Data.csv").then(function (data) {
    alldata = data;
    Choropleth.initialize(alldata);
});
const Choropleth = {
    // Fields to be updated when another year is selected
    tooltip: null,
    world: null,
    path: null,
    colorScale: null,
    mouseLeave: null,

    initialize: function (alldata) {
        const legendWidth = 110;
        const legendHeight = 300;

        const width = 1228;
        const marginTop = 46;
        const height = width / 2 + marginTop;

        // Calculate the position for the legend
        const legendX = width - legendWidth;
        const legendY = height / 2 - legendHeight / 2 - 300;

        let projection = d3.geoEqualEarth().fitExtent([
            [2, marginTop + 2],
            [width - 2, height]
        ], {
            type: "Sphere"
        });
        const self = this; // saving a reference to the Choropleth object

        this.mouseLeave = function () {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke-width", "0.75px");
            if (self.tooltip) {
                self.tooltip.transition().duration(500)
                    .style("opacity", 0)
                    .remove();
                self.tooltip = null; // Reset tooltip variable
            }
        }

        this.path = d3.geoPath().projection(projection);

        // Define color scale
        this.colorScale = d3.scaleThreshold()
            .domain([0, 20, 40, 60, 80, 100])
            .range(d3.schemeGreens[6]);

        let svg = d3.select("#choropleth")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${width} ${height}`);

        this.world = svg.append("g");

        // Add the stripe pattern to the SVG
        const defs = svg.append("defs");

        defs.append("pattern")
            .attr("id", "stripe")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 8)
            .attr("height", 8)
            .attr("patternTransform", "rotate(45)")
            .append("rect")
            .attr("width", 4)
            .attr("height", 8)
            .attr("transform", "translate(0,0)")
            .attr("opacity", 0.5)
            .attr("fill", "grey");

        // Legend
        const x = d3.scaleLinear()
            .domain([2.6, 75.1])
            .rangeRound([600, 860]);

        const legend = svg.append("g")
            .attr("class", "choropleth-legend")
            .attr("transform", `translate(${legendX}, ${legendY})`);

        const legend_entry = legend.selectAll("g.legend")
            .data(this.colorScale.range().map(function (d) {
                d = self.colorScale.invertExtent(d);
                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            }))
            .enter().append("g")
            .attr("class", "legend_entry");

        const ls_w = 30,
            ls_h = 30;

        legend_entry.append("rect")
            .attr("x", 10)
            .attr("y", function (d, i) {
                return height - (i * ls_h) - 6 * ls_h - 25;
            })
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", function (d) {
                return self.colorScale(d[0]);
            });

        legend_entry.append("text")
            .attr("x", 45)
            .attr("y", function (d, i) {
                return height - (i * ls_h) - 5 * ls_h - 35;
            })
            .text(function (d, i) {
                if (i === 0) return "< " + d[1];
                if (d[1] < d[0]) return d[0] + "+";
                return d[0] + " - " + d[1];
            });

        legend.append("text").attr("x", -10).attr("y", 290).text("Life expectancy");
        let AllData = alldata;
        this.updateMap(AllData, 0);
    },
    updateMap: function (AllData, yearIndex) {
        const self = this;
        let mouseOver = function (event, d) {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .3)
                .style("stroke", "black")
                .style("stroke-width", "0.75px");
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke-width", "2px");
            // Create the tooltip if it doesn't exist
            if (!self.tooltip) {
                self.tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
            }
            let value = 300
            let description = value != 0 ? ': ' + value + 'k' : '';
            self.tooltip.html(`<b>${d.properties.name}</b>`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px")
                .transition().duration(200)
                .style("opacity", 1);
        }

        fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
            .then(response => response.json())
            .then(data => {
                const dataFeatures = data.features;
                // Import topojson at the top of the file:
                // self.world.selectAll(".Country").remove(); // Remove previous paths (if any)
                self.world.selectAll(".country")
                    .data(dataFeatures)
                    .enter().append("path")
                    // Add a class, styling and mouseover/mouseleave
                    .attr("d", this.path)
                    .style("stroke", "black")
                    .attr("class", "Country")
                    .style("fill", function (d) {

                        let value = AllData.filter(ad => ad.Country === d.properties.name && ad.Year === '2015')[0] ? AllData.filter(ad => ad.Country === d.properties.name && ad.Year === '2015')[0]["Life expectancy "] : 0;

                        return value !== 0 ? self.colorScale(value) : "url(#stripe)";
                    })
                    .style("opacity", 1)
                    .style("stroke-width", "0.75px")
                    .on("mouseover", mouseOver)
                    .on("mousemove", function (event, d) {

                        // Move the tooltip with the mouse pointer
                        self.tooltip.style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY + 10) + "px");

                    })
                    .on("mouseleave", self.mouseLeave);
            })
            .catch(error => {
                console.error("Error fetching the data:", error);
            });
    }
}

// Initialize the Choropleth map


//ANCHOR - /////////////////////////////////////////////////  FIFTH CHART //////////////////////////////////////////////////////////////

const stackedChart = () => {
    const margin = {
            top: 10,
            right: 30,
            bottom: 20,
            left: 50
        },
        width = 860 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#stacked")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse the Data
    d3.csv("./Life Expectancy Data.csv").then(function (data) {
        const selectedCountry = ['Italy', 'Ireland', 'Japan', 'Libya', 'Netherlands', 'Russian Federation', 'Senegal', 'France', 'Spain', 'China']
        data = data.filter(item => selectedCountry.includes(item.Country) && (item.Year === "2000" || item.Year === "2005" || item.Year === "2010" || item.Year === "2015"));

        var legendContainer = d3.select("#stack_legend");

        // Data for legend items
        var legendData = [{
                level: '2000',
                color: '#ef7f23'
            },
            {
                level: '2005',
                color: '#f39f5a'
            },
            {
                level: '2010',
                color: '#f7bf91'
            },
            {
                level: '2015',
                color: '#fbdfc8'
            }
        ];

        // Create legend items
        var legendItems = legendContainer.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("div")
            .attr("class", "legend-item");

        // Add color boxes to legend
        legendItems.append("div")
            .attr("class", "legend-color-box")
            .style("background-color", function (d) {
                return d.color;
            });

        // Add level names to legend
        legendItems.append("div")
            .attr("class", "legend-text")
            .text(function (d) {
                return d.level;
            });

        let stackData = [];
        selectedCountry.forEach((c) => {
            stackData.push({
                Country: c,
                Year2000: data.find(d => d.Country === c && d.Year === "2000").GDP,
                Year2005: data.find(d => d.Country === c && d.Year === "2005").GDP,
                Year2010: data.find(d => d.Country === c && d.Year === "2010").GDP,
                Year2015: data.find(d => d.Country === c && d.Year === "2015").GDP
            })
        })
        const subgroups = ['Year2000', 'Year2005', 'Year2010', 'Year2015']

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        const groups = stackData.map(d => d.Country)
        // Add X axis
        const x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#ef7f23', '#f39f5a', '#f7bf91', '#fbdfc8'])

        // Normalize the data -> sum of each group must be 100!
        let dataNormalized = []
        stackData.forEach(function (d) {
            // Compute the total
            let tot = 0
            for (let i in subgroups) {
                let name = subgroups[i];
                tot += +d[name]
            }
            // Now normalize
            for (let i in subgroups) {
                let name = subgroups[i];
                d[name] = d[name] / tot * 100
            }
        })

        //stack the data? --> stack per subgroup
        const stackedData = d3.stack()
            .keys(subgroups)(stackData)

        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(d => d)
            .join("rect")
            .attr("x", d => {
                return x(d.data.Country)
            })
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
    })

}

stackedChart();
