// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let 
     width = 600, 
     height = 400;

    let margin = {
      top: 50,
      bottom: 50, 
      left: 50, 
      right: 50
    };

    // Create the SVG container
    let svg = d3.select('#boxplot')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'lightblue');
    

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform

    // Add scales 
    let xscale = d3.scaleBand()
                   .domain([...new Set(data.map(d => d.Platform))]) 
                   .range([margin.left, width - margin.right])
                   .padding(0.5);

    let yscale = d3.scaleLinear()
                   .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
                   .range([height - margin.bottom, margin.top]);
    
    let xaxis = svg.append("g")
                   .call(d3.axisBottom().scale(xscale))
                   .attr("transform", `translate(0, ${height - margin.bottom})`);
    
    let yaxis = svg.append("g")
                   .call(d3.axisLeft().scale(yscale))
                   .attr('transform', `translate(${margin.left},0)`);

    // Add x-axis label
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height - 15)
       .style("text-anchor", "middle")
       .text("Social Media Platforms");

    // Add y-axis label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", 0 - height / 2)
       .attr("y", 15)
       .style("text-anchor", "middle")
       .text("Number of Likes");
    
    // Compute quantiles
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return { min, q1, median, q3, max };
    };

    // Group data by platform and compute quartiles
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);
    
    // Loop through each platform and draw the box plot components
    // Maps the platform name to its corresponding x-axis position
    // Determines the width allocated to each platform in a band scale
    quantilesByGroups.forEach((quantiles, Platform) => {
        const x = xscale(Platform); 
        const boxWidth = xscale.bandwidth(); 

        // Draw vertical lines
        svg.append("line")
           .attr("x1", x + boxWidth / 2)
           .attr("x2", x + boxWidth / 2)
           .attr("y1", yscale(quantiles.min))
           .attr("y2", yscale(quantiles.max))
           .attr("stroke", "black")
           .attr("stroke-width", 2);
        

        // Draw box
        svg.append("rect")
           .attr("x", x)
           .attr("y", yscale(quantiles.q3))
           .attr("width", boxWidth)
           .attr("height", yscale(quantiles.q1) - yscale(quantiles.q3))
           .attr("stroke", "black")
           .attr("fill", "blue");
        

        // Draw median line
        svg.append("line")
           .attr("x1", x)
           .attr("x2", x + boxWidth)
           .attr("y1", yscale(quantiles.median))
           .attr("y2", yscale(quantiles.median))
           .attr("stroke", "black")
           .attr("stroke-width", 2);
        
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
      d.AvgLikes = +d.AvgLikes;
    });


    // Define the dimensions and margins for the SVG
    let 
      width = 800, 
      height = 400;

    let margin = {
      top: 50,
      bottom: 50, 
      left: 50, 
      right: 50
    };

    // Create the SVG container
    let svg = d3.select('#barplot')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'lightyellow');
    

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const x0 = d3.scaleBand()
                 .domain([...new Set(data.map(d => d.Platform))])
                 .range([margin.left, width - margin.right - 100])
                 .padding(0.2); 

    const x1 = d3.scaleBand()
                 .domain([...new Set(data.map(d => d.PostType))])
                 .range([0, x0.bandwidth()])
                 .padding(0.05);  

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.AvgLikes)])
                .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.PostType))])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y  
    let x0scale = d3.scaleBand()
                  .domain([...new Set(data.map(d => d.Platform))])
                  .range([margin.left, width - margin.right - 100])
                  .padding(0.2);

    let yscale = d3.scaleLinear()
                  .domain([0, d3.max(data, d => d.AvgLikes)])
                  .range([height - margin.bottom, margin.top]);

    // Add x-axis label
    let x0axis = svg.append('g')
                  .call(d3.axisBottom().scale(x0scale))
                  .attr('transform', `translate(0, ${height - margin.bottom})`);

    // Add y-axis label
    let yaxis = svg.append('g')
                  .call(d3.axisLeft().scale(yscale))
                  .attr('transform', `translate(${margin.left},0)`);

    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height - 15)
       .attr("text-anchor", "middle")
       .text("Social Media Platform");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .text("Average Likes");


  // Group container for bars
  const barGroups = svg.selectAll("bar")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
    barGroups.append("rect")
              .attr("x", d => x1(d.PostType))
              .attr("y", d => y(d.AvgLikes))
              .attr("width", x1.bandwidth())
              .attr("height", d => height - margin.bottom - y(d.AvgLikes))
              .attr("fill", d => color(d.PostType));
      

    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");

      legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 20)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", color(type));
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
      d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    let 
    width = 600, 
    height = 400;

    let margin = {
      top: 50,
      bottom: 100, 
      left: 50, 
      right: 50
    };

    // Create the SVG container
    let svg = d3.select('#lineplot')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'pink');
    

    // Set up scales for x and y axes  
    let yscale = d3.scaleLinear()
                  .domain([0, d3.max(data, d => d.AvgLikes)])
                  .range([height - margin.bottom, margin.top]);

    let xscale = d3.scaleBand()
                   .domain([...new Set(data.map(d => d.Date))])
                   .range([margin.left, width - margin.right])    
                   .padding(0.5);


    // Draw the axis, you can rotate the text in the x-axis here
    let yaxis = svg.append('g')
                   .call(d3.axisLeft().scale(yscale))
                   .attr('transform', `translate(${margin.left},0)`);

    let xaxis = svg.append('g')
                   .call(d3.axisBottom().scale(xscale))
                   .attr('transform', `translate(0,${height - margin.bottom})`)
                   .selectAll("text")
                   .style("text-anchor", "end")
                   .attr("transform", "rotate(-25)");


    // Add x-axis label
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height - 15)
       .attr("text-anchor", "middle")
       .text("Date");
    

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .text("Average Likes");


    // Draw the line and path. Remember to use curveNatural. 
    let line = d3.line()
            .x(d=>xscale(d.Date)+xscale.bandwidth()/2)
            .y(d=>yscale(d.AvgLikes))
            .curve(d3.curveNatural);

    let path = svg.append('path')
                  .datum(data)
                  .attr('stroke', 'black')
                  .attr('stroke-width', 2)
                  .attr('d', line)
                  .attr('fill', 'none');


});
