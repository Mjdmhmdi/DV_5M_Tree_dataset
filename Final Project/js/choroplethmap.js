// Set the dimensions and margins of the graph
const margin = {top: 0, right: 100, bottom: 100, left: 0},
    width = 750 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Append the svg object to the div called 'chart'
const svg = d3.select("#map")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define a projection and path generator
const projection = d3.geoNaturalEarth1().scale(width / 2 / Math.PI).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Load and display the world
Promise.all([
    d3.json('./utils/countries.geo.json'), 
    d3.csv('./data/average_life_expectancy_per_country.csv')
]).then(function([worldData, lifeExpectancyData]) {
    // Convert lifeExpectancyData to a map for easy lookup
    const lifeExpectancyMap = new Map();
    lifeExpectancyData.forEach(d => {
        lifeExpectancyMap.set(d.Country, +d['Life expectancy']);
    });

    // Merge the data
    worldData.features.forEach(d => {
        d.properties.lifeExpectancy = lifeExpectancyMap.get(d.properties.name);
    });

    // Define a color scale
    const colorScale = d3.scaleSequential()
        .domain([d3.min(lifeExpectancyData, d => d['Life expectancy']), d3.max(lifeExpectancyData, d => d['Life expectancy'])])
        .interpolator(d3.interpolateViridis);
    
    // Define the tooltip
    const tooltip = d3.select("#tooltip");

    // Draw the map
    svg.selectAll(".country")
        .data(worldData.features)
        .join("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", d => d.properties.lifeExpectancy ? colorScale(d.properties.lifeExpectancy) : 'white')
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                   .html(`Country: ${d.properties.name}<br>Life Expectancy: ${d.properties.lifeExpectancy ? d.properties.lifeExpectancy.toFixed(2) : 'No data'}`)
                   .style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    // Define the size of the legend
    const legendWidth = 100, legendHeight = 10;

    // Append a legend holder within the SVG
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width/3 - legendWidth + 200}, ${height - legendHeight })`);

    // Create a linear gradient for the legend
    const linearGradient = legend.append("defs")
        .append("linearGradient")
        .attr("id", "linear-gradient");

    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Draw the rectangle and fill with gradient
    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#linear-gradient)");

    // Add an axis to show the scale
    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, legendWidth]);

    legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(d3.axisBottom(legendScale).ticks(5));


});
