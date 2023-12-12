var w = 300,
      h = 300;
    
    var colorscale = d3.scale.category10();
    
    //Legend titles
    var LegendOptions = ['2023','2018','2013'];
    
    //Data
    var d = [
          [
          {axis:"Jan",value:62.4},
          {axis:"Feb",value:67.4},
          {axis:"Mar",value:71.3},
          {axis:"Apr",value:75.5},
          {axis:"May",value:81.5},
          {axis:"Jun",value:87.8},
          {axis:"Jul",value:91.6},
          {axis:"Aug",value:93.6},
          {axis:"Sep",value:87.3},
          {axis:"Oct",value:77.9},
          {axis:"Nov",value:66.8},
          {axis:"Dec",value:58.8},
          
          ],[
          {axis:"Jan",value:51.18},
          {axis:"Feb",value:68.1},
          {axis:"Mar",value:67.4},
          {axis:"Apr",value:72.8},
          {axis:"May",value:86.1},
          {axis:"Jun",value:89.8},
          {axis:"Jul",value:90.6},
          {axis:"Aug",value:89.6},
          {axis:"Sep",value:89.2},
          {axis:"Oct",value:78.2},
          {axis:"Nov",value:60.7},
          {axis:"Dec",value:58},
          ],[
          {axis:"Jan",value:59.9},
          {axis:"Feb",value:58.9},
          {axis:"Mar",value:62.3},
          {axis:"Apr",value:74.3},
          {axis:"May",value:79.6},
          {axis:"Jun",value:87.7},
          {axis:"Jul",value:86.1},
          {axis:"Aug",value:87.1},
          {axis:"Sep",value:86.1},
          {axis:"Oct",value:76.3},
          {axis:"Nov",value:63.3},
          {axis:"Dec",value:58.2},
          ]
        ];
    
    //Options for the Radar chart, other than default
    var mycfg = {
      w: w,
      h: h,
      maxValue: 0.6,
      levels: 6,
      ExtraWidthX: 300
    }
    
    //Call function to draw the Radar chart
    //Will expect that data is in %'s
    RadarChart.draw("#chartMax", d, mycfg);
    
    ////////////////////////////////////////////
    /////////// Initiate legend ////////////////
    ////////////////////////////////////////////
    
    var svg = d3.select('#body')
      .selectAll('svg')
      .append('svg')
      .attr("width", w + 300)
      .attr("height", h )
    
    //Create the title for the legend
    var text = svg.append("text")
      .attr("class", "title")
      .attr('transform', 'translate(90,0)') 
      .attr("x", w + 50)
      .attr("y", 10)
      .attr("font-size", "12px")
      .attr("fill", "#404040")
      .text("Year:");
        
    //Initiate Legend	
    var legend = svg.append("g")
      .attr("class", "legend")
      .attr("height", 100)
      .attr("width", 200)
      .attr('transform', 'translate(90,20)') 
      ;
      //Create colour squares
      legend.selectAll('rect')
        .data(LegendOptions)
        .enter()
        .append("rect")
        .attr("x", w + 20)
        .attr("y", function(d, i){ return i * 20;})
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d, i){ return colorscale(i);})
        ;
      //Create text next to squares
      legend.selectAll('text')
        .data(LegendOptions)
        .enter()
        .append("text")
        .attr("x", w + 52)
        .attr("y", function(d, i){ return i * 20 + 9;})
        .attr("font-size", "11px")
        .attr("fill", "#737373")
        .text(function(d) { return d; })
        ;	