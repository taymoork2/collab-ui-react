(function () {
  'use strict';

  angular
    .module('Core')
    .controller('WebexReportsCtrl', WebexReportsCtrl);

  /* @ngInject */
  function WebexReportsCtrl($q, $stateParams, Authinfo, LocalStorage, Log, Userservice, WebExApiGatewayService, WebexReportService) {
    var vm = this;

    vm.webexReportsObject = {};
    vm.webexOptions = [];
    vm.webexSelected = null;
    vm.updateWebexReports = updateWebexReports;

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    function getUniqueWebexSiteUrls() {
      var conferenceServices = Authinfo.getConferenceServicesWithoutSiteUrl() || [];
      var webexSiteUrls = [];

      conferenceServices.forEach(
        function getWebExSiteUrl(conferenceService) {
          webexSiteUrls.push(conferenceService.license.siteUrl);
        }
      );

      return webexSiteUrls.filter(onlyUnique);
    }

    function generateWebexReportsUrl() {
      var promiseChain = [];
      var webexSiteUrls = getUniqueWebexSiteUrls(); // strip off any duplicate webexSiteUrl to prevent unnecessary XML API calls

      webexSiteUrls.forEach(
        function chkWebexSiteUrl(url) {
          promiseChain.push(
            WebExApiGatewayService.siteFunctions(url).then(
              function getSiteSupportsIframeSuccess(result) {
                if (result.isAdminReportEnabled && result.isIframeSupported) {
                  vm.webexOptions.push(result.siteUrl);
                }
              }).catch(_.noop));
        }
      );

      $q.all(promiseChain).then(
        function promisChainDone() {
          var funcName = "promisChainDone()";
          var logMsg = "";

          // TODO: add code to sort the siteUrls in the dropdown to be in alphabetical order
          // get the information needed for the webex reports index page
          var stateParamsSiteUrl = $stateParams.siteUrl;
          var stateParamsSiteUrlIndex = vm.webexOptions.indexOf(stateParamsSiteUrl);

          var storageReportsSiteUrl = LocalStorage.get('webexReportsSiteUrl');
          var storageReportsSiteUrlIndex = vm.webexOptions.indexOf(storageReportsSiteUrl);

          // initialize the site that the webex reports index page will display
          var webexSelected = null;
          if (-1 !== stateParamsSiteUrlIndex) { // if a valid siteUrl is passed in, the reports index page should reflect that site
            webexSelected = stateParamsSiteUrl;
          } else if (-1 !== storageReportsSiteUrlIndex) { // otherwise, if a valid siteUrl is in the local storage, the reports index page should reflect that site
            webexSelected = storageReportsSiteUrl;
          } else { // otherwise, the reports index page should reflect the 1st site that is in the dropdown list
            webexSelected = vm.webexOptions[0];
          }

          logMsg = funcName + ": " + "\n" +
            "stateParamsSiteUrl=" + stateParamsSiteUrl + "\n" +
            "stateParamsSiteUrlIndex=" + stateParamsSiteUrlIndex + "\n" +
            "storageReportsSiteUrl=" + storageReportsSiteUrl + "\n" +
            "storageReportsSiteUrlIndex=" + storageReportsSiteUrlIndex + "\n" +
            "webexSelected=" + webexSelected;
          Log.debug(logMsg);

          vm.webexSelected = webexSelected;
          updateWebexReports();
        }
      );
    }

    if (!_.isUndefined(Authinfo.getPrimaryEmail())) {
      generateWebexReportsUrl();
    } else {
      Userservice.getUser(
        'me',
        function (data) {
          if (data.success) {
            if (data.emails) {
              Authinfo.setEmails(data.emails);
              generateWebexReportsUrl();
            }
          }
        }
      );
    }

    function updateWebexReports() {
      var funcName = "updateWebexReports()";
      var logMsg = "";

      var storageReportsSiteUrl = LocalStorage.get('webexReportsSiteUrl');
      var webexSelected = vm.webexSelected;

      logMsg = funcName + "\n" +
        "storageReportsSiteUrl=" + storageReportsSiteUrl + "\n" +
        "webexSelected=" + webexSelected;
      Log.debug(logMsg);

      vm.webexReportsObject = WebexReportService.initReportsObject(webexSelected);

      if (webexSelected !== storageReportsSiteUrl) {
        LocalStorage.put('webexReportsSiteUrl', webexSelected);
      }
    }
  }
})();
