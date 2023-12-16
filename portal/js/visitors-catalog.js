var api_url = '';
function getUrlParams(urlOrQueryString) {
  if ((i = urlOrQueryString.indexOf("?")) >= 0) {
    const queryString = urlOrQueryString.substring(i + 1);
    if (queryString) {
      return _mapUrlParams(queryString);
    }
  }
  return {};
}
function _mapUrlParams(queryString) {
  return queryString
    .split("&")
    .map(function (keyValueString) {
      return keyValueString.split("=");
    })
    .reduce(function (urlParams, [key, value]) {
      if (Number.isInteger(parseInt(value)) && parseInt(value) == value) {
        urlParams[key] = parseInt(value);
      } else {
        urlParams[key] = decodeURI(value);
      }
      return urlParams;
    }, {});
}
function generate_token(length = 40) {
  //edit the token allowed characters
  var a =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
  var b = [];
  for (var i = 0; i < length; i++) {
    var j = (Math.random() * (a.length - 1)).toFixed(0);
    b[i] = a[j];
  }
  return b.join("");
}
function getIP(json) {
  return json.ip;
}
function visitorsEngage(params, string = "") {
  // let api_url = "{{ env('DISCOVER_URL') }}";
  $.ajax({
    type: "POST",
    url: `/customer-journy/`,
    data: {
      params: params,
      type: string,
      typof_token: localStorage.getItem(`typof-token`),
    },
    success: function (response) {
      // console.log(data);
      // let jparse = JSON.parse(response);
      //console.log(response);
      string === "" &&
        localStorage.setItem(
          `typof-landed-${response.domain}-${response.uri}`,
          response.uri
        );
      string === "addtocart" &&
        localStorage.setItem(
          `typof-addtocart-${response.domain}-${response.uri}`,
          response.uri
        );
      string === "purchased" &&
        localStorage.setItem(
          `typof-purchased-${response.domain}-${response.uri}`,
          response.uri
        );
    },
    error: function(a, b, c){
      console.log(a,b,c);
    },
  });
}
function initialCall(string) {
  resetPageVisit();
  string = $("#vorder_id").length > 0 ? "purchased" : string;
  let urlParams = getUrlParams(location.search);
  let prev_page = document.referrer;
  let referrer =
    prev_page == "" || prev_page == null
      ? urlParams.respg != "" ||
        urlParams.respg == undefined ||
        urlParams.respg == null
        ? decodeURIComponent(urlParams.respg)
        : null
      : prev_page;
  let currentURL = $(location).attr("href");
  let _token = generate_token();
  let domain = $(location).attr("hostname");
  let param_uri =
    $("#vorder_id").length > 0 ? $("#vorder_id").html() : getPageUri();
  // console.log(document.referrer);
  const params = {
    user_agent: window.navigator.userAgent,
    ip: "",
    source: urlParams.utm_source == undefined ? null : urlParams.utm_source,
    from_url: referrer,
    land_url: currentURL,
    store_id: domain,
    session_id: _token,
    action: string,
    pageUri: param_uri,
    utm: urlParams,
  };
  // console.log(params);
  // let urlParams = getUrlParams(location.search); // Assume location.search = "?a=1&b=2b2"
  // if (!urlParams.hasOwnProperty("utm_source")) {
  //   url = $(location).attr("href");
  //   urlParams = {
  //     utm_medium: "self",
  //     utm_source: "self-typed",
  //     utm_campaign: "self-landed",
  //     utm_content: url,
  //   };
  // }
  // let decodedURL = decodeURIComponent(urlParams.utm_content).split("/");
  // let lastSeg = "";
  // if (string == "purchased") {
  //   lastSeg = $("#__catalog").length > 0 ? $("#__catalog").val() : null;
  //   urlParams.slug = lastSeg;
  // } else lastSeg = decodedURL[decodedURL.length - 1];
  let isToken = localStorage.getItem(`typof-token`);
  let check = "";
  if (string == "")
    check = localStorage.getItem(`typof-landed-${domain}-${param_uri}`); //landed
  if (string == "addtocart")
    check = localStorage.getItem(`typof-addtocart-${domain}-${param_uri}`);
  if (string == "purchased")
    check = localStorage.getItem(`typof-purchased-${domain}-${param_uri}`);
  //console.log(isToken, check, param_uri, params);
  //console.log(check === null || check === undefined ? "enter" : "exit");
  // // return false;
  if (isToken) {
    if (check === null || check === undefined) {
      // console.log(params, string);
      visitorsEngage(params, string);
    }
  } else {
    localStorage.clear();
    localStorage.setItem(`typof-token`, generate_token());
    //24 hour expire
    localStorage.setItem(`typof-expire`, Date.now() + 60 * 60 * 24 * 1000);
    // localStorage.setItem(`typof-expire`, Date.now() + 600);
    if (check === null || check === undefined) {
      //console.log(params, string, api_url);
      visitorsEngage(params, string);
    }
  }
}
function resetPageVisit() {
  let setTime = localStorage.getItem(`typof-expire`);
  if (setTime < Date.now()) {
    localStorage.clear();
    return true;
  }
  return false;
}
function getPageUri() {
  return window.location.pathname + window.location.search;
}
function setURL(urlString){
  api_url = urlString;
}