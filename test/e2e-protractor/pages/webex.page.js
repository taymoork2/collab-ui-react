'use strict';

/*global webEx*/

var request = require('request');

function post(url, body) {
  var defer = protractor.promise.defer();

  var options = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    url: url,
    body: body
  };

  function callback(error, response, body) {
    var ticket;
    if (!error && response.statusCode == 200) {
      var start = response.body.indexOf('<use:sessionTicket>') + '<use:sessionTicket>'.length;
      var end = response.body.indexOf('</use:sessionTicket>');
      if (start >= 0 & end >= 0) {
        ticket = response.body.slice(start, end);
      }
      defer.fulfill(ticket);
    } else {
      defer.reject();
    }

  }
  
  request(options, callback);
  
  return defer.promise;
} // post()

var WebExPage = function () {
  var ticket;
  var xmlApiUrl;
  var sessionTicketRequest;

  this.initPost = function () {
    var promise = post(xmlApiUrl, sessionTicketRequest);
    return promise;
  }

  this.getTicket = function (
    webexAdminID,
    accessToken,
    siteUrl
  ) {

    xmlApiUrl = "https://" + siteUrl + "/WBXService/XMLService";

    var dotIndex = siteUrl.indexOf(".");
    var wbxSiteName = siteUrl.slice(0, dotIndex);

    sessionTicketRequest = "" +
      "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
      "    <header>\n" +
      "        <securityContext>\n" +
      "            <siteName>" + wbxSiteName + "</siteName> \n" +
      "            <webExID>" + webexAdminID + "</webExID>\n" +
      "        </securityContext>\n" +
      "    </header>\n" +
      "    <body>\n" +
      "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.AuthenticateUser\">\n" +
      "            <accessToken>" + accessToken + "</accessToken>\n" +
      "        </bodyContent>\n" +
      "    </body>\n" +
      "</serv:message>\n";

    var flow = protractor.promise.controlFlow();
    return flow.execute(this.initPost);
  }; // getTicket()

  this.setup = function (
    loginType,
    adminId,
    adminUserName,
    adminPassword,
    testSiteUrl
  ) {

    switch (loginType) {
    case 1:
      login.loginUsingIntegrationBackend(adminId);
      break;

    default:
      login.loginThroughGuiUsingIntegrationBackend(adminUserName, adminPassword);
      break;
    }

    var defer = protractor.promise.defer();

    browser.executeScript("return window.localStorage.getItem('accessToken');").then(function (accessToken) {
      var promise = webEx.getTicket(
        adminUserName,
        accessToken,
        testSiteUrl
      );

      promise.then(
        function success(ticket) {
          defer.fulfill(ticket);
          // defer.fulfill(null);
        },

        function error() {
          defer.reject();
        });
    });

    return defer.promise;
  }; // setup()
};

module.exports = WebExPage;
