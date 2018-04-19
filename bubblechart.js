var canvasChart = function(){

    var ctx,
    margin = {top: 40, left: 75, right: 0, bottom: 75},
    maxYValue = 0, 
    maxXValue = 0,
    ratio = 0,
    pointRadius = 20,
    renderType = {lines: 'lines', points : 'points'},
    finalDataPoints = [],
    selectedDataPoint = null,
    timerID,
    overlayDiv,
    maxPop = 0,

    render = function(canvasID, dataObj){
         data = dataObj;
         createOverlay();
         var canvas = document.getElementById(canvasID);
         chartHeight = canvas.getAttribute('height');
         chartWidth = canvas.getAttribute('width');
         canvas.addEventListener('mousemove', mouseMove, false);
         ctx = canvas.getContext("2d");

          xMax = chartWidth - (margin.left + margin.right);
          yMax = chartHeight - (margin.top + margin.bottom);
         maxYValue = 1;
         maxXValue = getMaxXValue();
         maxPop = getMaxPopulation();
         ratio = yMax / maxYValue / 5;
         xRatio = xMax / maxXValue;

         if( data.renderTypes === undefined || data.renderTypes == null)
            data.renderTypes = [renderType.lines];
        renderParts();

    },

    renderParts = function(){
        getMaxPopulation()
        renderBackround();
        renderText();
        renderLinesAndLabels(true);
        renderData();
    },

    renderBackround = function(){
        var lingrad = ctx.createLinearGradient(margin.left, margin.top, xMax - margin.right, yMax);
        lingrad.addColorStop(0.0, '#D4D4D4');
        lingrad.addColorStop(0.2, '#fff');
        lingrad.addColorStop(0.8, '#fff');
        lingrad.addColorStop(1, '#D4D4D4');
        ctx.fillStyle = lingrad;
        ctx.fillRect(margin.left, margin.top, xMax - margin.left, yMax - margin.top);
        ctx.fillStyle = 'black'
    },

    renderText = function(){
        var labelFont = (data.labelFont != null) ? data.labelFont : '20pt Arial';
        ctx.font = labelFont;
        ctx.textAlign = "center";

        ctx.fillText(data.title, (chartWidth / 2), margin.top/2);

        var txtSize = ctx.measureText(data.xLabel);
        ctx.fillText(data.xLabel, margin.right + (xMax / 2) - (txtSize.width / 2), yMax + (margin.bottom / 1.2));

        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.font = labelFont;
        ctx.fillText(data.yLabel, (yMax / 2) * -1, margin.left / 4);
        ctx.restore();
    },

    renderLinesAndLabels = function(shouldRenderText){
        var yInc = yMax / data.dataPoints.length;
        var yPos = 0;
        var xInc = getXInc();
        var xPos = margin.left;

        for (var i = 0; i < data.dataPoints.length; i++){
            yPos += (i ==0 ) ? margin.top : yInc;
            
            drawLine({ x : margin.left, y: yPos, x2: xMax, y2: yPos}, '#E8E8E8');

            if(shouldRenderText){
                ctx.font = (data.dataPointFont != null) ? data.dataPointFont : '10pt Calibri';
                var txt = Math.round(maxYValue - ((i == 0 ) ? 0 :yPos / ratio));
                var txtSize = ctx.measureText(txt);
                ctx.fillText(txt, margin.left - ((txtSize.width >= 14) ? txtSize.width: 10) -7 , yPos + 4);
                

                txt = data.dataPoints[i].x;
                txtSize = ctx.measureText(txt);
                ctx.fillText(txt, xPos, yMax + (margin.bottom / 3));
                xPos += xInc;
            }
        }

        drawLine({ x: margin.left, y: margin.top, x2: margin.left, y2: yMax});

        drawLine({x: margin.left, y: yMax, x2: xMax, y2: yMax});
    },

    renderData = function(){
        var xInc = getXInc(),
            prevX = 0,
            prevY = 0;
            var oil = 0;
            var army = 0;
            var population = 0;
            var year = 0;
            var entryNumber = 0;
        for(country in data_set["1989"]){
            entryNumber ++ ;
            var set = data_set["1989"][country];
            oil = set.oil;
            army = set.army;
            population = set.population;

            var x = 0;
            var y = 0;
            y = (maxYValue - army) * ratio;
            if( y < margin.top) army = margin.top;
            debugger
             x = (maxXValue - oil) *xRatio;
             population = getPointRadius(set.population)

            var dataPoint = { x: x, y: y, currX: margin.left, x2: prevX, y2: prevY, originalY : set.army, population : population};
            finalDataPoints.push(dataPoint);

            prevX = x;
            prevY = y;
            drawLines();
            drawPoints();

        }


        // for(var i = 0; i < data.dataPoints.length; i++){
        //     pt = data.dataPoints[i];
        //     var x = 0;
        //     var y = 0;
        //     y = (maxYValue - pt.y) * ratio;
        //     if( y < margin.top) y = margin.top;
        //      x = (i * xInc) + margin.left;
        //      population = getPointRadius(12345123)

        //     var dataPoint = { x: x, y: y, currX: margin.left, x2: prevX, y2: prevY, originalY : pt.y, population : population};
        //     finalDataPoints.push(dataPoint);

        //     prevX = x;
        //     prevY = y;

        //     // if(data.renderTypes.contains(renderType.lines)) 
        //     drawLines();
        //     drawPoints();
        // }
    },

    drawLines = function(){
        for (var i = 0; i < finalDataPoints.length; i++){
            var pt = finalDataPoints[i];
            if(pt.x2 > 0) drawLine(pt);
        }
    },

    drawLine = function(pt, strokeStyle){
        ctx.strokeStyle = (strokeStyle == null) ? 'black' : strokeStyle;
        ctx.lineWitdth = 1;
        ctx.beginPath();
        ctx.moveTo(pt.x2, pt.y2);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        ctx.closePath();
    },

    drawPoints = function(){
        for (var i = 0; i < finalDataPoints.length; i++){
            var pt = finalDataPoints[i];
            renderCircle(pt.x, pt.y, null, pt.population);
        }
    },

    renderCircle = function(x, y, highlightColor, pointRadius = 20){
        debugger
        x = Math.round(x);
        y = Math.round(y);
        var radgrad = ctx.createRadialGradient(x, y, pointRadius, x - 5, y - 5, 0);
        radgrad.addColorStop(0, (highlightColor == null) ? 'Green' : highlightColor);
        radgrad.addColorStop(0.9, 'White');
        ctx.beginPath();
        ctx.fillStyle = radgrad;

        ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.lineWitdth = 1;
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.closePath();
    },

    getXInc = function(){
        return Math.round(xMax / Object.keys(data_set).length) -1;
    },

    mouseMove = function(){

    },

    getMaxYValue = function(){
        debugger
        var maxY = 0;
        for(var year in data_set){
            for (var country in data_set[year]){
                if (maxY < data_set[year][country].army)
                maxY = data_set[year][country].army
            }
            break;
        }
        return maxY;
    },

    getMaxXValue = function(){
        var maxX = 0;
        for(var year in data_set){
            for (var country in data_set[year]){
                if (maxX < data_set[year][country].oil)
                maxX = data_set[year][country].oil
            }
            break;
        }
        return maxX;
    },

    getMaxPopulation = function(){
        var maxPop = 0;
        for(var year in data_set){
            for (var country in data_set[year]){
                if (maxPop < data_set[year][country].population)
                    maxPop = data_set[year][country].population
            }
            break;
        }
        console.log(maxPop)
        return maxPop;
    },
    getPointRadius = function (pointPopulation){
        return pointPopulation / maxPop * pointRadius / 10;
    },

    createOverlay = function(){

    },
    
    getRandomColor = function() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      },
      
      
      
       setRandomColor = function() {
        $("#colorpad").css("background-color", getRandomColor());
      }



    return {
        render: render,
        renderType : renderType
    };

};