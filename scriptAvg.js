var w = 300,
      h = 300;
    
    var colorscale = d3.scale.category10();
    
    //Legend titles
    var LegendOptions = ['2023','2018','2013'];
    
    //Data
    var d = [
          [
          {axis:"Jan",value:50},
          {axis:"Feb",value:48},
          {axis:"Mar",value:49.8},
          {axis:"Apr",value:62.2},
          {axis:"May",value:68.2},
          {axis:"Jun",value:78},
          {axis:"Jul",value:77.7},
          {axis:"Aug",value:77.9},
          {axis:"Sep",value:75},
          {axis:"Oct",value:64.9},
          {axis:"Nov",value:51.6},
          {axis:"Dec",value:47.9},
          
          ],[
          {axis:"Jan",value:40.4},
          {axis:"Feb",value:58},
          {axis:"Mar",value:55.4},
          {axis:"Apr",value:59.5},
          {axis:"May",value:74.4},
          {axis:"Jun",value:79.3},
          {axis:"Jul",value:80.7},
          {axis:"Aug",value:79.5},
          {axis:"Sep",value:79.4},
          {axis:"Oct",value:67.4},
          {axis:"Nov",value:50.4},
          {axis:"Dec",value:49},
          ],[
          {axis:"Jan",value:51.5},
          {axis:"Feb",value:56.4},
          {axis:"Mar",value:58.7},
          {axis:"Apr",value:63.2},
          {axis:"May",value:70.4},
          {axis:"Jun",value:76.8},
          {axis:"Jul",value:81.3},
          {axis:"Aug",value:82.3},
          {axis:"Sep",value:75.8},
          {axis:"Oct",value:65.2},
          {axis:"Nov",value:55.4},
          {axis:"Dec",value:49.2},
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
    RadarChart.draw("#chartAvg", d, mycfg);
    
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
        .attr("x", w + 20 )
        .attr("y", function(d, i){ return i * 20;})
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d, i){ return colorscale(i);});
        
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