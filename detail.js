function getQueryParams() {
    let params = {};
    let queryString = window.location.search;
    if (queryString) {
        queryString = queryString.substring(1); // Remove the leading '?'
        let paramPairs = queryString.split('&');
        for (let pair of paramPairs) {
            let [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
    }
    return params;
}


function displayData() {
    let params = getQueryParams();
    let dataElement = document.getElementById('data');
    console.log(dataElement);
    if (params.data) {
        dataElement.innerHTML = params.data;
    } else {
        dataElement.innerHTML = 'No data found';
    }
}

window.onload = displayData;