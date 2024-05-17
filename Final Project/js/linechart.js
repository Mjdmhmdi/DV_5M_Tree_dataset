// Set the dimensions and margins of the graph
const margin = {top: 30, right: 60, bottom: 100, left: 50},
    width = 750 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// Append the svg object to the div
const svg = d3.select("#linechart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data
d3.csv("https://github.com/ErfanFathi/data-visualization/blob/main/data/stats_by_year.csv").then(function(data) {

    // Parse the data
    data.forEach(d => {
        d.Year = +d.Year;
        d['Min Life Expectancy'] = +d['Min Life Expectancy'];
        d['Average Life Expectancy'] = +d['Average Life Expectancy'];
        d['Max Life Expectancy'] = +d['Max Life Expectancy'];
    });

    // Add X axis
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));
    
    // Add X axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 20) 
        .text("Year");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d['Min Life Expectancy'], d['Average Life Expectancy'], d['Max Life Expectancy']))])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add Y axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top)
        .text("Life Expectancy");

    // Define the lines
    const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d['Average Life Expectancy']));

    const lineMin = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d['Min Life Expectancy']));

    const lineMax = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d['Max Life Expectancy']));

    const colors = d3.scaleOrdinal(d3.schemeCategory10); // D3 color scheme

    // Draw the lines
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", colors(1));

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", lineMin)
        .style("stroke", colors(0));

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", lineMax)
        .style("stroke", colors(2));

    // Define the tooltip
    const tooltip = d3.select("#tooltip");

    // Draw the circles
    data.forEach(d => {
        svg.append("circle")
            .attr("cx", x(d.Year))
            .attr("cy", y(d['Average Life Expectancy']))
            .attr("r", 5)
            .attr("class", "circle")
            .style("fill", colors(1))
            .on("mouseover", function(event, d2) {
                tooltip.style("visibility", "visible")
                    .html(`Year: ${d.Year}<br>Average Life Expectancy: ${d['Average Life Expectancy']}`)
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });
    });

    data.forEach(d => {
        svg.append("circle")
            .attr("cx", x(d.Year))
            .attr("cy", y(d['Min Life Expectancy']))
            .attr("r", 5)
            .attr("class", "circle")
            .style("fill", colors(0))
            .on("mouseover", function(event, d2) {
                tooltip.style("visibility", "visible")
                    .html(`Year: ${d.Year}<br>Minimum Life Expectancy: ${d['Min Life Expectancy']}`)
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });
    });

    data.forEach(d => {
        svg.append("circle")
            .attr("cx", x(d.Year))
            .attr("cy", y(d['Max Life Expectancy']))
            .attr("r", 5)
            .attr("class", "circle")
            .style("fill", colors(2))
            .on("mouseover", function(event, d2) {
                tooltip.style("visibility", "visible")
                    .html(`Year: ${d.Year}<br>Maximum Life Expectancy: ${d['Max Life Expectancy']}`)
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });
    });

    // Legend configuration
    const legendSpace = 30; // spacing for legend
    const dataCategories = ['Max Life Expectancy', 'Average Life Expectancy', 'Min Life Expectancy'];

    // Add legend
    dataCategories.forEach((category, index) => {
        svg.append("circle")
            .attr("cx", width - 180)
            .attr("cy", (height - 90) + index * legendSpace)
            .attr("r", 6)
            .style("fill", colors(2-index));

        svg.append("text")
            .attr("x", width - 170)
            .attr("y", (height - 90) + index * legendSpace)
            .attr("dy", ".35em") // to align
            .style("fill", colors(2-index))
            .text(category)
            .attr("text-anchor", "start");
    });


});