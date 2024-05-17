// Set the dimensions and margins of the graph
const margin = {top: 30, right: 70, bottom: 100, left: 50},
    width = 650 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// Append the svg object to the div
const svg = d3.select("#scatterplot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data
d3.csv("https://github.com/ErfanFathi/data-visualization/blob/main/data/life_expectancy_vs_gdp_all_years.csv").then(function(data) {

    // Format the data
    data.forEach(d => {
        d['Life expectancy'] = +d['Life expectancy'];
        d.GDP = +d.GDP;
        d.Year = +d.Year;
    });

    // Get 5 sample points from the data for each year
    const sampleData = [];
    let years2 = [...new Set(data.map(d => d.Year))]; // Get unique years
    years2.forEach(year => {
        const yearData = data.filter(d => d.Year === year);
        const sample = d3.shuffle(yearData).slice(0, 5);
        sampleData.push(...sample);
    });

    // Add X axis
    const x = d3.scaleLinear()
        .domain([-2000, d3.max(sampleData, d => d.GDP)])
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Add X axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 20)
        .text("GDP per Capita");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([d3.min(sampleData, d => d['Life expectancy']), d3.max(sampleData, d => d['Life expectancy'])])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add Y axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top)
        .text("Life Expectancy");

    // Define a color scale
    const color = d3.scaleSequential()
        .domain([2000, 2015])
        .interpolator(d3.interpolateViridis);

    // Add a tooltip
    const tooltip = d3.select("#tooltip");

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(sampleData)
        .join("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.GDP))
            .attr("cy", d => y(d['Life expectancy']))
            .attr("r", 3)
            .style("fill", d => color(d.Year))
            .style("fill-opacity", 0.8)
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                       .html(`Year: ${d.Year}<br>Life Expectancy: ${d['Life expectancy']}<br>GDP: ${d.GDP.toFixed(2)}`)
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

    // Create a legend for the years
    const years = [...new Set(data.map(d => d.Year))]; // Get unique years
    const legendSpacing = 20;

    const legend = svg.selectAll(".legend")
        .data(years)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * legendSpacing})`);

    legend.append("rect")
        .attr("x", width + 10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d))
        .style("fill-opacity", 0.6);

    legend.append("text")
        .attr("x", width + 65)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
});