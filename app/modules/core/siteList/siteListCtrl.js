'use strict';

angular.module('Core')
  .controller('SiteListCtrl', ['$q', '$translate', 'Authinfo', 'Config', '$log', '$scope', 'Userservice', 'WebExUtilsFact', 'WebExXmlApiFact', 'WebExXmlApiInfoSvc',
    function ($q, $translate, Authinfo, Config, $log, $scope, Userservice, WebExUtilsFact, WebExXmlApiFact, webExXmlApiInfoObj) {
      var vm = this;

      vm.getWebexUrl = function (url) {
        return Config.getWebexAdvancedHomeUrl(url);
      };

      vm.siteLaunch = {
        adminEmailParam: Authinfo.getPrimaryEmail(),
        advancedSettings: null,
        userEmailParam: null,
      };

      if (_.isUndefined(Authinfo.getPrimaryEmail())) {
        Userservice.getUser('me', function (data, status) {
          if (data.success) {
            if (data.emails) {
              Authinfo.setEmail(data.emails);
              vm.siteLaunch.adminEmailParam = Authinfo.getPrimaryEmail();
            }
          }
        });
      }

      vm.gridData = Authinfo.getConferenceServicesWithoutSiteUrl();
      vm.showSiteLinks = false;
      vm.iframeSupportedSite = false;
      vm.webExSessionTicket = null;

      var siteUrl = vm.gridData[0].license.siteUrl;
      var siteName = WebExUtilsFact.getSiteName(siteUrl);

      var logMsg = "siteListCtrl(): " + "\n" +
        "vm.gridData[0]=" + JSON.stringify(vm.gridData[0]);
      $log.log(logMsg);

      // Start of grid set up
      var rowTemplate =
        '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell" ng-click="showUserDetails(row.entity)">' + '\n' +
        '  <div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' + '\n' +
        '  <div ng-cell></div>' + '\n' +
        '</div>' + '\n';

      var siteUrlTemplate =
        '<div ng-if="!siteList.showSiteLinks">' + '\n' +
        '  <p class="ngCellText">' + '\n' +
        '    <i class="icon-spinner icon"></i>' + '\n' +
        '  </p>' + '\n' +
        '</div>' + '\n' +
        '<div ng-if="siteList.showSiteLinks">' + '\n' +
        '  <div ng-if="!siteList.iframeSupportedSite">' + '\n' +
        '    <launch-site admin-email-param="{{siteList.siteLaunch.adminEmailParam}}"' + '\n' +
        '                 advanced-settings="{{siteList.siteLaunch.advancedSettings}}"' + '\n' +
        '                 user-email-param="{{siteList.siteLaunch.userEmailParam}}"' + '\n' +
        '                 webex-advanced-url="{{siteList.getWebexUrl(row.entity.license.siteUrl)}}">' + '\n' +
        '    </launch-site>' + '\n' +
        '  </div>' + '\n' +
        '  <div ng-if="siteList.iframeSupportedSite">' + '\n' +
        '    <a id="webex-site-settings"' + '\n' +
        '       ui-sref="site-settings({siteUrl:row.entity.license.siteUrl})">' + '\n' +
        '                            ' + '\n' +
        '      <p class="ngCellText">' + '\n' +
        '        <span name="webexSiteSettings"' + '\n' +
        '              id="webexSiteSettings">' + '\n' +
        '          <i class="icon-settings icon"></i>' + '\n' +
        '        </span>' + '\n' +
        '      </p>' + '\n' +
        '    </a>' + '\n' +
        '  </div>' + '\n' +
        '</div>' + '\n';

      var siteReportsTemplate =
        '<div ng-if="siteList.showSiteLinks">' + '\n' +
        '  <div ng-if="siteList.iframeSupportedSite">' + '\n' +
        '     <a id="webex-reports-list-iframe"' + '\n' +
        '         ui-sref="webex-reports({siteUrl:row.entity.license.siteUrl})"> ' + '\n' +
        '      <p class="ngCellText">' + '\n' +
        '        <span name="webexReports"' + '\n' +
        '              id="webexReports">' + '\n' +
        '          <i class="icon-settings icon"></i>' + '\n' +
        '        </span>' + '\n' +
        '       </p>' + '\n' +
        '     </a>' + '\n' +
        '  </div>' + '\n' +
        '</div>' + '\n';

      vm.gridOptions = {
        data: 'siteList.gridData',
        multiSelect: false,
        showFilter: false,
        enableRowSelection: false,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: true,
        columnDefs: [],
      };

      vm.gridOptions.columnDefs.push({
        field: 'license.siteUrl',
        displayName: $translate.instant('siteList.siteName'),
        sortable: false
      });

      vm.gridOptions.columnDefs.push({
        field: 'license.capacity',
        displayName: $translate.instant('siteList.type'),
        cellFilter: 'capacityFilter:row.entity.label',
        sortable: false
      });

      vm.gridOptions.columnDefs.push({
        field: 'license.volume',
        displayName: $translate.instant('siteList.licenseCount'),
        sortable: false
      });

      vm.gridOptions.columnDefs.push({
        field: 'license.siteUrl',
        displayName: $translate.instant('siteList.siteSettings'),
        cellTemplate: siteUrlTemplate,
        sortable: false
      });

      vm.gridOptions.columnDefs.push({
        field: 'license.siteReports',
        displayName: $translate.instant('siteList.siteReports'),
        cellTemplate: siteReportsTemplate,
        sortable: false
      });
      // End of grid set up

      // Start of site links set up
      getSessionTicket().then(
        function getSessionTicketSuccess(sessionTicket) {
          $log.log("getSessionTicketSuccess()");

          webExXmlApiInfoObj.xmlServerURL = "https://" + siteUrl + "/WBXService/XMLService";
          webExXmlApiInfoObj.webexSiteName = siteName;
          webExXmlApiInfoObj.webexAdminID = Authinfo.getPrimaryEmail();
          webExXmlApiInfoObj.webexAdminSessionTicket = sessionTicket;

          getSiteVersionXml().then(
            function getSiteVersionInfoXmlSuccess(getInfoResult) {
              var funcName = "getSiteVersionInfoXmlSuccess()";
              var logMsg = "";

              $log.log(funcName);

              vm.iframeSupportedSite = iframeSupportedSiteVersionCheck(getInfoResult);
              vm.showSiteLinks = true;
            }, // getSiteVersionInfoXmlSuccess()

            function getSiteVersionInfoXmlError(getInfoResult) {
              $log.log("vm.getSiteVersionInfoXmlError()");

              vm.showSiteLinks = true;
            } // getSiteVersionInfoXmlError()
          ); // vm.getSessionTicket(siteUrl).then()
        }, // getSessionTicketSuccess()

        function getSessionTicketError(errId) {
          vm.showSiteLinks = true;
        } // getSessionTicketError()
      ); // vm.getSessionTicket(siteUrl).then()

      function getSessionTicket() {
        return WebExXmlApiFact.getSessionTicket(siteUrl);
      } // getSessionTicket()

      function getSiteVersionXml() {
        var siteVersionXml = WebExXmlApiFact.getSiteVersion(webExXmlApiInfoObj);

        return $q.all({
          siteVersionXml: siteVersionXml
        });
      } // getSiteVersionXml()

      function iframeSupportedSiteVersionCheck(getInfoResult) {
        var funcName = "iframeSupportedSiteVersionCheck()";

        var logMsg = "";

        var iframeSupportedSiteVersion = false;
        var siteVersionJsonObj = WebExUtilsFact.validateSiteVersionXmlData(getInfoResult.siteVersionXml);

        if ("" === siteVersionJsonObj.errId) { // got a good response
          var siteVersionJson = siteVersionJsonObj.bodyJson;
          var trainReleaseVersion = siteVersionJson.ep_trainReleaseVersion;
          var trainReleaseOrder = siteVersionJson.ep_trainReleaseOrder;

          logMsg = funcName + ": " + "\n" +
            "trainReleaseVersion=" + trainReleaseVersion + "\n" +
            "trainReleaseOrder=" + trainReleaseOrder;
          $log.log(logMsg);

          if (
            (null != trainReleaseOrder) &&
            (400 <= +trainReleaseOrder)
          ) {

            iframeSupportedSiteVersion = true;
          }
        }

        $log.log("iframeSupportedSiteVersion(): iframeSupportedSiteVersion=" + iframeSupportedSiteVersion);

        return iframeSupportedSiteVersion;
      } // iframeSupportedSiteVersionCheck()
      // End of site links set up
    }
  ]);
