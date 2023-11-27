const form = document.querySelector("#myForm");
const input = document.querySelector(".input");
const resultSection = document.querySelector("#results");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchKey = input.value.trim();
    if (searchKey.length === 0)
        return

    const resultElement = document.createElement("div");
    resultElement.setAttribute("class", 'results-div max-1500');
    resultElement.innerHTML = '<div class="loading-animation"></div>';
    resultSection.prepend(resultElement);
    removeNotFound();
    resultSection.setAttribute('style', 'padding-block:10px;')
    resultElement.scrollIntoView({behavior : "smooth"});
    //to set loading animation
    setLoaders(resultElement);
    input.value = ""
    fetch("data/", {
        method : 'POST',
        header : {
            "Content-Type" : "application/x-www-form-urlencoded"
        },
        body : new URLSearchParams({
            'csrfmiddlewaretoken' : document.querySelector('[name=csrfmiddlewaretoken]').value,
            'searchKey' : searchKey
        })
    })
    .then(response => response.json())
    .then(data => {
        renderData(data, resultElement, searchKey)
    })
})
function fetchDataTrigger(searchKey){
    const resultElement = document.createElement("div");
    resultElement.setAttribute("class", 'results-div max-1500');
    resultElement.innerHTML = '<div class="loading-animation"></div>';
    resultSection.prepend(resultElement);
    removeNotFound();
    resultSection.setAttribute('style', 'padding-block:10px;')
    resultElement.scrollIntoView({behavior : "smooth"});
    //to set loading animation
    setLoaders(resultElement);
    fetch("data/", {
        method : 'POST',
        header : {
            "Content-Type" : "application/x-www-form-urlencoded"
        },
        body : new URLSearchParams({
            'csrfmiddlewaretoken' : document.querySelector('[name=csrfmiddlewaretoken]').value,
            'searchKey' : searchKey
        })
    })
    .then(response => response.json())
    .then(data => {
        renderData(data, resultElement, searchKey)
    })
}

function renderData(data, resultElement, searchKey){
    if(data.code === 404){
        resultElement.setAttribute('id', 'not-found')
        resultElement.innerHTML = `
                <div class="not-found">
                <div class="header-data-n-f">
                    <h4 class="margin-10">No Data Found for "${searchKey}"</h4>
                </div>
                <div class="sub-div-n-f">
                    <span class="small">Retry using Another Proper city name.</span>
                </div>
            </div>`;
    }else {
        data = data.response;
        let cityName = data.city_name;
        let cityStationName = data.city_station;
        let cityNameFromStationTemp = String(cityStationName).split(",");
        let cityNameFromStation;
        if(cityNameFromStationTemp.length === 1){
            cityNameFromStation = cityNameFromStationTemp[cityNameFromStationTemp.length - 1]
        }else{
            cityNameFromStation = cityNameFromStationTemp[cityNameFromStationTemp.length - 2];

        }
        let cityCountryCode = data.country_code;
        let predictedValues = data.predicted_data;
        let presentDayValues = data.presentDayData;

        let currentDate = new Date();
        let presentDate = `${currentDate.getDate()}-${currentDate.getMonth()}-${currentDate.getFullYear()}`;
        let presentDayHeaderData = "";
        let presentDayBodyData = "";
        let presentPollutantValuesTemp = []
        for (let pollutant in presentDayValues){
            let presentPollutantValue = presentDayValues[pollutant].toFixed(2);
            if(presentPollutantValuesTemp.length === 0){
                presentPollutantValuesTemp.push(presentPollutantValue);
                presentPollutantValuesTemp.push(pollutant);
            }else{
                if(Number(presentPollutantValue) > Number(presentPollutantValuesTemp[0])){
                    presentPollutantValuesTemp = [];
                    presentPollutantValuesTemp.push(presentPollutantValue);
                    presentPollutantValuesTemp.push(pollutant);
                }
            }
            presentDayHeaderData += `
                                        <div class="r-a-b-b">
                                            <strong>${pollutant}</strong>
                                        </div>
                                    `;
            presentDayBodyData += `
                                    <div class="r-a-b-b">
                                        ${presentPollutantValue}
                                    </div>
                                `;
        }

        let presentDateColorClass = getColorClass(Number(presentPollutantValuesTemp[0]));
        let presentDateTextColorClass = getTextColorClass(presentDateColorClass);
        
        let predictedValuesHeader = '';
        let predictedValuesBody = '';
        let predictedPollutantValuesTemp;
        for(let date in predictedValues){
            predictedPollutantValuesTemp = [];
            if(predictedValuesHeader == ""){
                for(pollutant in predictedValues[date]){
                    predictedValuesHeader += `
                                <div class="r-a-b-b">
                                    <strong>${pollutant}</strong>
                                </div>
                    `;
                }
            }
            temp = "";
            let predictedDateColorClass;
            let predictedDateTextColorClass;
            for(pollutant in predictedValues[date]){
                let pollutantValue = predictedValues[date][pollutant].toFixed(2);
                if(predictedPollutantValuesTemp.length === 0){
                    predictedPollutantValuesTemp.push(pollutantValue);
                    predictedPollutantValuesTemp.push(pollutant);
                }else{
                    if(Number(pollutantValue) > Number(predictedPollutantValuesTemp[0])){
                        predictedPollutantValuesTemp = [];
                        predictedPollutantValuesTemp.push(pollutantValue);
                        predictedPollutantValuesTemp.push(pollutant);
                    }
                }
                temp += `
                    <div class="r-a-b-b">
                        ${pollutantValue}
                    </div>
                `
            }

            predictedDateColorClass = getColorClass(Number(predictedPollutantValuesTemp[0]));
            predictedDateTextColorClass = getTextColorClass(predictedDateColorClass);
            predictedValuesBody += `
            <div class="r-a-b-a-item r-a-b-a ${predictedDateTextColorClass} ${predictedDateColorClass}">                   
                <div class="r-a-b-b">
                    ${date}
                </div>
                ${temp}
                <div class="r-a-b-b">
                    ${predictedPollutantValuesTemp[0]}
                </div>
                <div class="r-a-b-b">
                    ${predictedPollutantValuesTemp[1]}
                </div>
            </div>`;
        }


        let template = `
        <div class="r-header margin-10">
            <h2>Showing Results for ${cityName}</h2>
        </div>
        <div class="r-content small margin-10">
            <div class="r-res-data">
                <div class="r-res-item">
                    City&nbsp;:&nbsp;<strong>${cityNameFromStation}</strong>
                </div>
                <div class="r-res-item">
                    Station&nbsp;:&nbsp;<strong>${cityStationName}</strong>
                </div>
                <div class="r-res-item">
                    Country Code&nbsp;:&nbsp;<strong>${cityCountryCode}</strong>
                </div>
            </div>
            <div class="r-r-res-d">
                <div class="r-a-a  margin-10">
                    <div class="r-a-a-header">
                        <h3 class="large">Present Values</h3>
                    </div>
                    <div class="r-a-b-body medium">
                        <div class="r-a-b-a-header r-a-b-a">
                            <div class="r-a-b-b">
                                <strong>Date</strong>
                            </div>
                            ${presentDayHeaderData}
                            <div class="r-a-b-b">
                                <strong>AQI</strong>
                            </div>
                            <div class="r-a-b-b">
                                <strong>Dominant Pollutant</strong>
                            </div>
                        </div>
                        <div class="r-a-b-a-body ${presentDateTextColorClass} ${presentDateColorClass}">
                            <div class="r-a-b-a-item r-a-b-a">
                                
                                <div class="r-a-b-b">
                                    ${presentDate}
                                </div>
                                ${presentDayBodyData}
                                <div class="r-a-b-b">
                                    ${presentPollutantValuesTemp[0]}
                                </div>
                                <div class="r-a-b-b">
                                    ${presentPollutantValuesTemp[1]}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="r-a-a  margin-10">
                        <div class="r-a-a-header">
                            <h3 class="large">Predicted Values</h3><span class="small">Predictions for 30 days from tommorrow</span>
                        </div>
                        <div class="r-a-b-body medium">
                            <div class="r-a-b-a-header r-a-b-a">
                                <div class="r-a-b-b">
                                    <strong>Date</strong>
                                </div>
                                ${predictedValuesHeader}
                                <div class="r-a-b-b">
                                    <strong>AQI</strong>
                                </div>
                                <div class="r-a-b-b">
                                    <strong>Dominant Pollutant</strong>
                                </div>
                            </div>
                            <div class="r-a-b-a-body">
                                ${predictedValuesBody}
                            </div>
                        </div>
                    </div>
               </div>
            </div>

                        `
        resultElement.innerHTML = template;
    }
}

function getColorClass(value){
    let colorsClasses = [
        {
            'start' : 0,
            'end' : 50,
            'class' : 'good'
        },
        {
            'start' : 50,
            'end' : 100,
            'class' : 'moderate'
        },
        {
            'start' : 100,
            'end' : 150,
            'class' : 'unhealthy-s'
        },
        {
            'start' : 150,
            'end' : 200,
            'class' : 'unhealthy'
        },
        {
            'start' : 200,
            'end' : 300,
            'class' : 'v-unhealthy'
        },
        {
            'start' : 300,
            'end' : 1000,
            'class' : 'hazardous'
        },
    ];

    for(let i in colorsClasses){
        if((colorsClasses[i].start <= value) && (colorsClasses[i].end >= value))
            return colorsClasses[i].class
    }
}

function getTextColorClass(value){
    let blackTextItems = ['good', 'moderate', 'unhealthy-s'];
    if(value in blackTextItems)
        return 
    else return 'white-txt'
}


function setLoaders(){
    const resultsDiv = document.querySelector(".results-div .loading-animation");
    const loaderDiv = document.createElement("div");

    loaderDiv.setAttribute('class', 'loader-results');
    resultsDiv.appendChild(loaderDiv);

    const loaders = [
        `<div class="loader-section">
            <div class="loader-upper-section">
                <svg xmlns="http://www.w3.org/2000/svg" class="large-svg" viewBox="0 0 640 512"><path d="M0 336c0 79.5 64.5 144 144 144H512c70.7 0 128-57.3 128-128c0-61.9-44-113.6-102.4-125.4c4.1-10.7 6.4-22.4 6.4-34.6c0-53-43-96-96-96c-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32C167.6 32 96 103.6 96 192c0 2.7 .1 5.4 .2 8.1C40.2 219.8 0 273.2 0 336z"/></svg>
            </div>
            <div class="loader-lower-section">
                <strong class="large-font">
                    Collecting Data...
                </strong>
            </div>
        </div>`,
        `<div class="loader-section">
            <div class="loader-upper-section">
                <svg xmlns="http://www.w3.org/2000/svg" class="large-svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zm-312 8v64c0 13.3 10.7 24 24 24s24-10.7 24-24l0-64c0-13.3-10.7-24-24-24s-24 10.7-24 24zm80-96V280c0 13.3 10.7 24 24 24s24-10.7 24-24V120c0-13.3-10.7-24-24-24s-24 10.7-24 24zm80 64v96c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>                </div>
            <div class="loader-lower-section">
                <strong class="large-font">
                    Analyzing Data...
                </strong>
            </div>
        </div>`,
        `<div class="loader-section">
            <div class="loader-upper-section">
                <svg xmlns="http://www.w3.org/2000/svg" class="large-svg" viewBox="0 0 448 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm64 192c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V256c0-17.7 14.3-32 32-32zm64-64c0-17.7 14.3-32 32-32s32 14.3 32 32V352c0 17.7-14.3 32-32 32s-32-14.3-32-32V160zM320 288c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V320c0-17.7 14.3-32 32-32z"/></svg>   
                </div>             
                <div class="loader-lower-section">
                <strong class="large-font">
                    Preparing Results...
                </strong>
            </div>
        </div>
    </div>`
    ]
    let counter = 0;

    setTimeout(setLoadingAnimations, 1000)

    function setLoadingAnimations(){
        let newElement = document.createElement('div');
        newElement.setAttribute('class', 'swipe-in');
        newElement.innerHTML = loaders[counter];
        loaderDiv.innerHTML = "";
        loaderDiv.appendChild(newElement);
        counter ++;
        if(counter < loaders.length)
            setTimeout(() => {
                newElement.removeAttribute('class');
                newElement.setAttribute('class', 'swipe-out');
                setTimeout(setLoadingAnimations, 400);
            }, 8000);
        else return
    }
}

function removeNotFound(){
    try{
        document.getElementById("not-found").style.display = 'none'
    }catch{}
}