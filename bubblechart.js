
var canvasChart = function () {

    var ctx,
        margin = { top: 100, left: 75, right: 100, bottom: 75 },
        xKey,
        yKey,
        zKey,
        maxYValue = 0,
        maxXValue = 0,
        ratio = 0,
        pointRadius = 20,
        renderType = { lines: 'lines', points: 'points' },
        finalDataPoints = [],
        selectedDataPoint = null,
        timerID,
        overlayDiv,
        maxZValue = 0,
        config = null,
        renderedCountries = [],
        selectedYears = [],
        isSingleYear = false,

        AppendConfig = function (data, config) {
            data_set.title = config.title;
            data_set.animationPoints = config.animationPoints;
            data_set.animationSpeed = config.animationSpeed;
            data_set.xLabel = config.xLabel;
            data_set.yLabel = config.yLabel;
            data_set.labelFont = config.labelFont;
            data_set.dataPointFont = config.dataPointFont;
            data_set.renderTypes = config.renderTypes;
        },

        render = function (canvasID, dataObj, configObj, resources, IsSingleYear) {
            data = dataObj;
            config = configObj;
            AppendConfig(data, config);
            xKey = resources.selectedAttributes.x;
            yKey = resources.selectedAttributes.y;
            zKey = resources.selectedAttributes.z;
            singleYear = resources.singleYear;
            isSingleYear = IsSingleYear;
            renderedCountries = [
                resources.selectedCountries.first,
                resources.selectedCountries.second,
                resources.selectedCountries.third
            ];
            selectedYears = getYearsRange(resources.selectedYear.start, resources.selectedYear.finish);
            createOverlay();
            var canvas = document.getElementById(canvasID);
            chartHeight = canvas.getAttribute('height');
            chartWidth = canvas.getAttribute('width');


            canvas.addEventListener('mousemove', mouseMove, false);
            ctx = canvas.getContext("2d");
            clearCurrentCanvas(canvas.width, canvas.height);

            ctx.beginPath();
            ctx.closePath();
            finalDataPoints = [];

            xMax = chartWidth - (margin.left + margin.right);
            yMax = chartHeight - (margin.top + margin.bottom);
            //Delete at refactoring

            var allCountries = resources.availableCountries;
            maxYValue = Math.ceil(getAllTimeAttributeMaxValue(allCountries, yKey, data));
            maxXValue = getAllTimeAttributeMaxValue(allCountries, xKey, data);
            maxZValue = getAllTimeAttributeMaxValue(allCountries, zKey, data);
            maxRadius = getPointRadius(maxZValue);
            yMax -= maxRadius
            xMax -= maxRadius
            ratio = yMax / maxYValue;
            xRatio = xMax / maxXValue;


            if (data.renderTypes === undefined || data.renderTypes == null)
                data.renderTypes = [renderType.lines];
            renderParts();

        },

        renderParts = function () {
            renderBackround();
            renderText();
            renderLinesAndLabels(true);
            renderData();
        },

        renderBackround = function () {
            var lingrad = ctx.createLinearGradient(margin.left, margin.top, xMax - margin.right, yMax - margin.bottom);
            lingrad.addColorStop(0.0, '#D4D4D4');
            lingrad.addColorStop(0.2, '#fff');
            lingrad.addColorStop(0.8, '#fff');
            lingrad.addColorStop(1, '#D4D4D4');

            ctx.fillStyle = lingrad;
            ctx.fillRect(margin.left, margin.top, xMax, yMax);
            ctx.fillStyle = 'black'
        },

        renderText = function () {
            var labelFont = (config.labelFont != null) ? config.labelFont : '20pt Arial';
            ctx.font = labelFont;
            ctx.textAlign = "center";

            ctx.fillText(config.title, (chartWidth / 2), margin.top / 2);

            var txtSize = ctx.measureText(data.xLabel);
            ctx.fillText(config.xLabel, margin.left + (xMax / 2), yMax + margin.top / 1.2 + (margin.bottom / 1.2));

            ctx.save();
            ctx.rotate(-Math.PI / 2);
            ctx.font = labelFont;
            ctx.fillText(config.yLabel, ((yMax + margin.top) / 2) * -1, margin.left / 4);
            ctx.restore();
        },

        renderLinesAndLabels = function (shouldRenderText) {
            var yInc = yMax / 20;
            var yPos = margin.top;
            var xInc = xMax / 20;
            var xPos = margin.left;
            var ceiledYMaxValue = Math.ceil(maxYValue)

            if (shouldRenderText) {
                ctx.font = (config.dataPointFont != null) ? config.dataPointFont : '10pt Calibri';
                var txt = ceiledYMaxValue;
                var txtSize = ctx.measureText(txt);
                ctx.fillText(txt, margin.left - ((txtSize.width >= 14) ? txtSize.width : 10) - 7, yPos + 4);
            }
            for (var i = 0; i < 20; i++) {
                yPos += yInc;

                drawLine({ x: margin.left, y: yPos, x2: xMax + margin.left, y2: yPos }, '#E8E8E8');
                if (shouldRenderText) {
                    ctx.font = (config.dataPointFont != null) ? config.dataPointFont : '10pt Calibri';
                    var txt = Math.ceil((ceiledYMaxValue - (ceiledYMaxValue / 20) * (i + 1)) * 100) / 100;
                    var txtSize = ctx.measureText(txt);
                    ctx.fillText(txt, margin.left - ((txtSize.width >= 14) ? txtSize.width : 10) - 7, yPos + 4);


                    txt = Math.ceil((maxXValue / 20) * 100 * i) / 100;
                    txtSize = ctx.measureText(txt);
                    ctx.fillText(txt, xPos, yMax + margin.top + (margin.bottom / 3));
                    xPos += xInc;

                }
            }

            if (shouldRenderText) {
                txt = Math.ceil((maxXValue / 20) * 100 * i) / 100;
                txtSize = ctx.measureText(txt);
                ctx.fillText(txt, xPos, yMax + margin.top + (margin.bottom / 3));
            }

            drawLine({ x: margin.left, y: margin.top, x2: margin.left, y2: yMax + margin.top });

            drawLine({ x: margin.left, y: yMax + margin.top, x2: xMax + margin.left, y2: yMax + margin.top });
        },

        renderData = function () {
            var xInc = getXInc(),
                prevX = 0,
                prevY = 0;
            var yearIterator = [];
            debugger
            if (isSingleYear)
                yearIterator.push(singleYear)
            else
                yearIterator = selectedYears;
            for (i in yearIterator) {
                var year = yearIterator[i]
                for (j in renderedCountries) {
                    var country = renderedCountries[j];
                    var pt = data[year][country];


                    var x = 0;
                    var y = 0;

                    y = (maxYValue - pt[yKey]) * ratio + margin.top;
                    x = pt[xKey] * xRatio + margin.left;
                    var z = getPointRadius(pt[zKey])
                    var color = (j == 0)
                        ? "#0000FF"
                        : (j == 1)
                            ? "#FF0000"
                            : "#00FF00"

                    var dataPoint = { x: x, y: y, z: z, color: color };
                    finalDataPoints.push(dataPoint);


                }


            }
            drawPoints();

        },

        drawLines = function () {
            for (var i = 0; i < finalDataPoints.length; i++) {
                var pt = finalDataPoints[i];
                if (pt.x2 > 0) drawLine(pt);
            }
        },

        drawLine = function (pt, strokeStyle) {
            ctx.strokeStyle = (strokeStyle == null) ? 'black' : strokeStyle;
            ctx.lineWitdth = 1;
            ctx.beginPath();
            ctx.moveTo(pt.x2, pt.y2);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
            ctx.closePath();
        },

        drawPoints = function () {
            for (var i = 0; i < finalDataPoints.length; i++) {
                var pt = finalDataPoints[i];
                renderCircle(pt.x, pt.y, pt.color, pt.z);
            }
        },

        renderCircle = function (x, y, highlightColor, pointRadius = 20) {

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

        getXInc = function () {
            return Math.round(xMax / Object.keys(data).length) - 1;
        },

        mouseMove = function () {

        },

        getAllTimeAttributeMaxValue = function (countries, attribute, data) {
            var max = 0;
            for (var year in data) {
                var localAttributeMaxValue = getAttributeMaxValue(year, countries, attribute, data);
                if (max < localAttributeMaxValue)
                    max = localAttributeMaxValue;
            }
            return max;
        }
    getAttributeMaxValue = function (year, countries, attribute, data) {
        var max = 0;
        for (var country in data[year]) {
            if (max < data[year][country][attribute])
                max = data[year][country][attribute]
        }
        return max;
    },

        getPointRadius = function (pointPopulation) {
            return pointPopulation / maxZValue * pointRadius / 20;
        },



        createOverlay = function () {

        },

        getRandomColor = function () {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },

        clearCurrentCanvas = function (width, height) {

            ctx.clearRect(0, 0, width, height);
        },


        setRandomColor = function () {
            $("#colorpad").css("background-color", getRandomColor());
        }



    return {
        render: render,
        renderType: renderType
    };

};