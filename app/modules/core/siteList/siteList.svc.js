'use strict';

angular.module('Core').service('SiteListService', [
  '$log',
  'Authinfo',
  'Userservice',
  'Config',
  'WebExApiGatewayService',

  function (
    $log,
    Authinfo,
    Userservice,
    Config,
    WebExApiGatewayService
  ) {

    var _this = this;

    this.updateGrid = function (gridData) {
      var funcName = "updateGrid()";
      var logMsg = "";

      // $log.log(funcName);

      if (!_.isUndefined(Authinfo.getPrimaryEmail())) {
        updateGridColumns();
      } else {
        Userservice.getUser('me', function (data, status) {
          if (
            (data.success) &&
            (data.emails)
          ) {
            Authinfo.setEmails(data.emails);
            _this.updateGridColumns();
          }
        });
      }

      function updateGridColumns() {
        var funcName = "updateGridColumns()";
        var logMsg = "";

        gridData.forEach(
          function processGrid(siteRow) {
            var funcName = "processGrid()";
            var logMsg = "";

            var siteUrl = siteRow.license.siteUrl;

            siteRow.adminEmailParam = Authinfo.getPrimaryEmail();
            siteRow.userEmailParam = Authinfo.getPrimaryEmail();
            siteRow.advancedSettings = Config.getWebexAdvancedEditUrl(siteUrl);
            siteRow.webexAdvancedUrl = Config.getWebexAdvancedHomeUrl(siteUrl);

            WebExApiGatewayService.isSiteSupportsIframe(siteUrl).then(
              function isSiteSupportsIframeSuccess(result) {
                var funcName = "isSiteSupportsIframeSuccess()";
                var logMsg = "";

                logMsg = funcName + ": " + "\n" +
                  "result=" + JSON.stringify(result);
                $log.log(logMsg);

                siteRow.isIframeSupported = result.isIframeSupported;
                siteRow.isAdminReportEnabled = result.isAdminReportEnabled;
                siteRow.isCSVSupported = result.isCSVSupported;

                siteRow.showSiteLinks = true;

                logMsg = funcName + ": " + "\n" +
                  "siteUrl=" + siteUrl + "\n" +
                  "siteRow.isCSVSupported=" + siteRow.isCSVSupported + "\n" +
                  "siteRow.isIframeSupported=" + siteRow.isIframeSupported + "\n" +
                  "siteRow.isAdminReportEnabled=" + siteRow.isAdminReportEnabled + "\n" +
                  "siteRow.showSiteLinks=" + siteRow.showSiteLinks;
                $log.log(logMsg);

                _this.updateCSVColumn(siteRow);
              }, // isSiteSupportsIframeSuccess()

              function isSiteSupportsIframeError(response) {
                var funcName = "isSiteSupportsIframeError()";
                var logMsg = "";

                siteRow.isIframeSupported = false;
                siteRow.isAdminReportEnabled = false;
                siteRow.showSiteLinks = true;
                siteRow.showCSVInfo = true;
                siteRow.isError = true;
                if (response.response.indexOf("030048") != -1) {
                  siteRow.isWarn = true;
                }

                logMsg = funcName + ": " + "\n" +
                  "response=" + JSON.stringify(response);
                $log.log(logMsg);
              } // isSiteSupportsIframeError()
            ); // WebExApiGatewayService.isSiteSupportsIframe().then
          } // processGrid()
        ); // vm.gridData.forEach()
      } // updateGridColumns()
    }; // updateGrid()

    this.updateCSVColumn = function (siteRow) {
      if (!siteRow.isCSVSupported) {
        // no further data to get
        siteRow.showCSVInfo = true;
        return;
      }

      // TODO
      var siteUrl = siteRow.license.siteUrl;
      WebExApiGatewayService.csvStatus(siteUrl).then(
        function getCSVStatusSuccess(response) {
          var funcName = "getCSVStatusSuccess()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "response=" + JSON.stringify(response);
          $log.log(logMsg);

          siteRow.showCSVInfo = true;
        }, // getCSVStatusSuccess()

        function getCSVStatusError(response) {
          var funcName = "getCSVStatusError()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "response=" + JSON.stringify(response);
          $log.log(logMsg);

          siteRow.showCSVInfo = true;
        } // getCSVStatusError()
      ); // WebExApiGatewayService.csvStatus(siteUrl).then()
    }; // updateCSVColumn()
  } // end top level function
]);
