var w = 300,
      h = 300;
    
    var colorscale = d3.scale.category10();
    
    //Legend titles
    var LegendOptions = ['2023','2018','2013'];
    
    //Data
    var d = [
          [
          {axis:"Jan",value:40.3},
          {axis:"Feb",value:37.2},
          {axis:"Mar",value:37.2},
          {axis:"Apr",value:50},
          {axis:"May",value:56.8},
          {axis:"Jun",value:68.2},
          {axis:"Jul",value:69.2},
          {axis:"Aug",value:68.6},
          {axis:"Sep",value:63.8},
          {axis:"Oct",value:53.5},
          {axis:"Nov",value:40},
          {axis:"Dec",value:37.6},
          
          ],[
          {axis:"Jan",value:29},
          {axis:"Feb",value:47.9},
          {axis:"Mar",value:43.2},
          {axis:"Apr",value:46.2},
          {axis:"May",value:62.7},
          {axis:"Jun",value:68.7},
          {axis:"Jul",value:70.8},
          {axis:"Aug",value:69.4},
          {axis:"Sep",value:69.6},
          {axis:"Oct",value:56.7},
          {axis:"Nov",value:40.1},
          {axis:"Dec",value:40},
          ],[
          {axis:"Jan",value:40.7},
          {axis:"Feb",value:45.4},
          {axis:"Mar",value:46.1},
          {axis:"Apr",value:51},
          {axis:"May",value:59.4},
          {axis:"Jun",value:65.8},
          {axis:"Jul",value:71},
          {axis:"Aug",value:70.9},
          {axis:"Sep",value:64.4},
          {axis:"Oct",value:52.5},
          {axis:"Nov",value:43.9},
          {axis:"Dec",value:39.5},
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
    RadarChart.draw("#chartMin", d, mycfg);
    
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