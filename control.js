$(document).ready(function () {
    var data = data_set;
    debugger
    populateCountries(resources.availableCountries);
    populateAttributes(resources.availableAttributes);
    populateYears(resources.availableYears);
    yearsForAnimation = getYearsRange(resources.selectedYear.start, resources.selectedYear.finish)
    $(".countrySelector").on("change", changeDataCountry)
    $(".attributeSelector").on("change", changeDataAttribute)
    $(".yearSelector").on("change", changeDataYear)
    $("#generateButton").on("click", generateChart)
    $("#generateMultipleButton").on("click", function () { chart.render('BubbleChart', data_set, config, resources, false);})
    $("#animateButton").on("click", function(){animateChart(yearsForAnimation, 0)})
    $("#generateTable").on("click", populateTable )
    setInitialDropdownValues();
})


function getAvailableYears(data) {
    return Object.keys(data);
}
function getAvailableCountries(data) {
    for (var year in data) {
        return Object.keys(data[year]);
    }
}

function getAvailableAttributes(data) {
    debugger
    for (var year in data) {
        for (var country in data[year]) {
            return Object.keys(data[year][country])
        }
    }
}


function populateSelector(collection, selectClass, isAttribute, isCountry) {
    $("." + selectClass).empty();
    var selected = "";
    var html=`<option value=""></option>`;
    debugger
    if(isCountry) 
        $("." + selectClass).append(html);
    for (var index in collection) {
        
        if (isAttribute)
            html = `<option value='${collection[index]}' >${data_labels[collection[index]]}</option>`;
        else 
            html = `<option value='${collection[index]}' >${collection[index]}</option>`;
            
        $("." + selectClass).append(html)
    }
}


function populateCountries(countries) {
    populateSelector(countries, "countrySelector", false, true )
}

function populateAttributes(attributes) {
    populateSelector(attributes, "attributeSelector", isAttribute = true)
}

function populateYears(years) {
    populateSelector(years, "yearSelector")
}

function changeDataCountry(event) {
    var $countrySelect = $(event.target);
    var selectedCountry = $countrySelect.val();
    var selectId = $countrySelect.attr("id");

    switch (selectId) {
        case "firstCountrySelector":
            {
                resources.selectedCountries.first = selectedCountry;

                break;
            }
        case "secondCountrySelector":
            {
                resources.selectedCountries.second = selectedCountry;
                break;
            }
        case "thirdCountrySelector":
            {
                resources.selectedCountries.third = selectedCountry;
                break;
            }
        default:
            break;
    }

}


function changeDataAttribute(event) {
    var $attributeSelect = $(event.target);
    var selectedAttribute = $attributeSelect.val();
    var selectId = $attributeSelect.attr('id');

    switch (selectId) {
        case "xAttribute":
            {
                resources.selectedAttributes.x = selectedAttribute;
                config.xLabel = data_labels[selectedAttribute];
                break;
            }
        case "yAttribute":
            {
                resources.selectedAttributes.y = selectedAttribute;
                config.yLabel = data_labels[selectedAttribute];
                break;
            }
        case "zAttribute":
            {
                resources.selectedAttributes.z = selectedAttribute;
                break;
            }
        default:
            break;
    }
}


function changeDataYear(event) {
    var $yearSelect = $(event.target)
    var selectedYear = $yearSelect.val();
    var selectedId = $yearSelect.attr('id');

    switch (selectedId) {
        case 'startingYear': {
            resources.selectedYear.start = selectedYear;
            break;
        }
        case 'lastYear': {
            resources.selectedYear.finish = selectedYear;
            break;
        }
        case 'singleYearSelector': {
            resources.singleYear = selectedYear;
            break;
        }
        default:
            break;
    }
    yearsForAnimation = getYearsRange(resources.selectedYear.start, resources.selectedYear.finish)
}


getYearsRange = function (startYear, finishYear) {
    var years = []
    for (var year = parseInt(startYear); year <= parseInt(finishYear); year++) {
        years.push(year);
    }
    return years;
}
function generateChart() {
    chart.render('BubbleChart', data_set, config, resources, true);
}

function animateChart(years, index) {
    debugger
    if (index == years.length - 1)
        return;
    resources.singleYear = years[index];
    config.title = resources.singleYear;
    chart.render('BubbleChart', data_set, config, resources, true);
    setTimeout(function(){animateChart(years, index + 1)}, 1000)
}

function buildHeader(header){
    return `<th>${header}</th>`;
}

function buildCell(dictionary){
    var html = "<tr>";
    for(var attribute in dictionary)
        html += `<td>${dictionary[attribute]}</td>`
    html+="</tr>"
    return html;
}


function buildRow(collection, callback){
    var html = `<tr>`;
    for( var i  = 0 ; i< collection.length; i++)
        html += callback(collection[i])
    html +=`</tr>`
    return html;
}

function buildCellRow(collection){
   return buildRow(collection, buildCell);
}

function buildHeaderRow(collection){
    return buildRow(collection, buildHeader)
}

function builTable(tableHeaders, tableData){
    var html = "<table class = 'table'>";
    html += buildHeaderRow(tableHeaders);
    html += buildCellRow(tableData);
    html += "</table>";
    return html;
}

function populateTable(){
    var $dataSection = $("#data");
    $dataSection.empty();
    var html = "";
    var headers = getHeaders();
    for (var country in resources.selectedCountries){
        let tableData = getData(resources.selectedCountries[country]);
        html += `<h2>${resources.selectedCountries[country]}</h2>`;
        html += builTable(headers, tableData)
    }

    $dataSection.append(html)
}

function getHeaders(){
    var headers = ["Year"];
    for(var year in data_set){
        for(var country in data_set[year]){
            var attributes = Object.keys(data_set[year][country])
            for(var i = 0; i<attributes.length; i++){
                headers.push(data_labels[attributes[i]]);
            }
            break;
        }
        break;
    }
    return headers
}

function getData(country){
    var tableData = [];
    var years = getYearsRange(resources.selectedYear.start, resources.selectedYear.finish)
    for(var index in years){
        let year = years[index]
        let yearData = data_set[year][country];
        let tableElement = {};
        tableElement.year = year;
        for (var attribute in data_set[year][country]){
            tableElement[attribute] = data_set[year][country][attribute];
        }
        tableData.push(tableElement);
    }
    return tableData;
}

function setInitialDropdownValues(){
   $("#firstCountrySelector").val(resources.selectedCountries.first) 
   $("#secondCountrySelector").val(resources.selectedCountries.second) 
   $("#thirdCountrySelector").val(resources.selectedCountries.third)
   $("#xAttribute").val(resources.selectedAttributes.x) 
   $("#yAttribute").val(resources.selectedAttributes.y) 
   $("#zAttribute").val(resources.selectedAttributes.z) 
   $("#startingYear").val(resources.selectedYear.start) 
   $("#lastYear").val(resources.selectedYear.finish) 
   $("#singleYearSelector").val(resources.singleYear) 
}