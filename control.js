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
    $("#animateButton").on("click", function(){animateChart(yearsForAnimation, 0)})
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
            html = `{<option value='${collection[index]}' =>${data_labels[collection[index]]}</option>}`;
        else 
            html = `{<option value='${collection[index]}' =>${collection[index]}</option>}`;
            
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
        default:
            break;
    }
    resources.singleYear = resources.selectedYear.start;
    yearsForAnimation = getYearsRange(resources.selectedYear.start, resources.selectedYear.finish)
    debugger
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

