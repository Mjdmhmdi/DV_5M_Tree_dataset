// Set the dimensions and margins of the graph
const margin = {top: 30, right: 70, bottom: 100, left: 50},
    width = 750 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// Append the svg object to the div
const svg = d3.select("#bubblechart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data
d3.csv("./data/bubble_chart_data.csv").then(function(data) {

    // Format the data
    data.forEach(d => {
        d['Life expectancy'] = +d['Life expectancy'];
        d.GDP = +d.GDP;
        d.Population = +d.Population;
    });

    // Get 1 sample points from the data for each Life Expectancy
    const sampleData = [];
    let lifeExpectancies = [...new Set(data.map(d => d['Life expectancy']))]; // Get unique life expectancies
    lifeExpectancies.forEach(lifeExpectancy => {
        const lifeExpectancyData = data.filter(d => d['Life expectancy'] === lifeExpectancy);
        const sample = d3.shuffle(lifeExpectancyData).slice(0, 1);
        sampleData.push(...sample);
    });

    // Add X axis
    const x = d3.scaleLinear()
        .domain([-5000, d3.max(sampleData, d => d.GDP)])
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

    // Add a scale for bubble size
    const z = d3.scaleSqrt()
        .domain([0, d3.max(sampleData, d => d.Population)])
        .range([1, 20]);

    // Define the tooltip
    const tooltip = d3.select("#tooltip");

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(sampleData)
        .join("circle")
            .attr("class", "bubble")
            .attr("cx", d => x(d.GDP))
            .attr("cy", d => y(d['Life expectancy']))
            .attr("r", d => z(d.Population))
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                       .html(`Life Expectancy: ${d['Life expectancy']}<br>GDP: ${d.GDP.toFixed(2)}<br>Population: ${d.Population}`)
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
});
