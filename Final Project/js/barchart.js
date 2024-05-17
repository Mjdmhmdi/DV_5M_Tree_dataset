// Set the dimensions and margins of the graph
const margin = {top: 30, right: 60, bottom: 100, left: 30},
    width = 650 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// Append the svg object to the div
const svg = d3.select("#barchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the Data
d3.csv("./data/average_life_expectancy_per_country.csv").then( function(data2) {

  // Split data for top 20 countries
  const data = data2.slice(0, 20);

  // Add X axis
  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(d => d.Country))
    .padding(0.2);
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d['Life expectancy'])])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Define the tooltip
  const tooltip = d3.select("#tooltip");

  // Bars
  svg.selectAll("mybar")
    .data(data)
    .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.Country))
      .attr("y", d => y(d['Life expectancy']))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d['Life expectancy']))
      .on("mouseover", function(event, d) {
        tooltip.style("visibility", "visible")
               .html(`Country: ${d.Country}<br>Life Expectancy: ${(d['Life expectancy'])}`)
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
})
