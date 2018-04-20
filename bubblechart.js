var canvasChart = function(){

    var ctx,
    margin = {top: 40, left: 75, right:0, bottom: 75},
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
          xMax = chartWidth -  (margin.left + margin.right);
          yMax = chartHeight - (margin.top + margin.bottom);
         maxYValue = Math.ceil(getMaxYValue());
         maxXValue = getMaxXValue();
         maxPop = getMaxPopulation();
         maxRadius = getPointRadius(maxPop);

         ratio = yMax / maxYValue;
         xRatio = xMax / maxXValue;
        debugger
         margin.right += pointRadius;
         margin.bottom += pointRadius;
         
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
        var lingrad = ctx.createLinearGradient(margin.left, margin.top, xMax - margin.right, yMax - margin.bottom);
        lingrad.addColorStop(0.0, '#D4D4D4');
        lingrad.addColorStop(0.2, '#fff');
        lingrad.addColorStop(0.8, '#fff');
        lingrad.addColorStop(1, '#D4D4D4');
        ctx.fillStyle = lingrad;
        ctx.fillRect(margin.left, margin.top, xMax , yMax );
        ctx.fillStyle = 'black'
    },

    renderText = function(){
        var labelFont = (data.labelFont != null) ? data.labelFont : '20pt Arial';
        ctx.font = labelFont;
        ctx.textAlign = "center";

        ctx.fillText(data.title, (chartWidth / 2), margin.top/2);

        var txtSize = ctx.measureText(data.xLabel);
        ctx.fillText(data.xLabel, margin.right + (xMax / 2) - (txtSize.width / 2), yMax + margin.top + (margin.bottom / 1.2));

        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.font = labelFont;
        ctx.fillText(data.yLabel, ((yMax + margin.top) / 2) * -1, margin.left / 4);
        ctx.restore();
    },

    renderLinesAndLabels = function(shouldRenderText){
        var yInc = (yMax + margin.top) / 20;
        var yPos = 0;
        var xInc = (xMax + margin.left)  / 20 ;
        var xPos = 0;
        var ceiledYMaxValue = Math.ceil(maxYValue)
        for (var i = 0; i < 20; i++){
            yPos +=  yInc;
            xPos += (i ==0 ) ? margin.left: xInc;

            drawLine({ x : margin.left, y: yPos, x2: xMax + margin.left, y2: yPos}, '#E8E8E8');
            if(shouldRenderText){
                ctx.font = (data.dataPointFont != null) ? data.dataPointFont : '10pt Calibri';
                var txt =  Math.ceil( (ceiledYMaxValue - (ceiledYMaxValue / 20) * (i+1))*100) / 100;
                debugger
                var txtSize = ctx.measureText(txt);
                ctx.fillText(txt, margin.left - ((txtSize.width >= 14) ? txtSize.width: 10) -7 , yPos + 4);
                

                txt = Math.ceil((maxXValue / 20) *100 * i) / 100;
                txtSize = ctx.measureText(txt);
                ctx.fillText(txt, xPos, yMax + margin.top + (margin.bottom / 3));
               
            }
        }

        drawLine({ x: margin.left, y: margin.top, x2: margin.left, y2: yMax + margin.top});

        drawLine({x: margin.left, y: yMax + margin.top, x2: xMax + margin.left, y2: yMax + margin.top});
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
            
            y = (maxYValue - army) * ratio + margin.top ;
            x = (maxXValue - oil) * xRatio + margin.left;
            
             population = getPointRadius(set.population)
            var dataPoint = { x: x, y: y, population : population};
            finalDataPoints.push(dataPoint);

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
        return pointPopulation / maxPop * pointRadius / 40;
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