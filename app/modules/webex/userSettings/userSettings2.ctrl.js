(function () {
  'use strict';

  angular.module('WebExUserSettings2').controller('WebExUserSettings2Ctrl', [
    '$scope',
    '$log',
    '$filter',
    '$stateParams',
    '$sce',
    'WebExUserSettingsFact',
    'Notification',
    'Authinfo',
    'Config',
    function (
      $scope,
      $log,
      $filter,
      $stateParams,
      $sce,
      WebExUserSettingsFact,
      Notification,
      Authinfo,
      Config
    ) {

      $scope.userSettingsView.form.$dirty = false;

      this.initPanel = function (webexSiteUrl) {
        WebExUserSettingsFact.initPanel(webexSiteUrl);
      }; // initPanel()

      this.getUserSettingsInfo = function () {
        WebExUserSettingsFact.getUserSettingsInfo();
      }; // getUserSettingsInfo()

      this.updateUserSettings = function () {
        var funcName = "updateUserSettings()";
        var logMsg = "";

        logMsg = funcName + ": " + "START";
        $log.log(logMsg);

        WebExUserSettingsFact.updateUserSettings2().then(
          function () {
            var successMsg = [];
            successMsg.push($filter('translate')('webexUserSettings2.updateSuccess'));

            Notification.notify(['Privileges updated'], 'success');
          },
          function () {
            Notification.notify(['Privileges update failed'], 'error');
          }
        );

        logMsg = funcName + ": " + "END";
        $log.log(logMsg);
      }; // updateUserSettings()

      //----------------------------------------------------------------------//

      this.userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();

      var _self = this;
      var webexSiteUrl = WebExUserSettingsFact.getSiteUrl();
      var webexSiteName = WebExUserSettingsFact.getSiteName(webexSiteUrl);

      this.initPanel(webexSiteUrl);
      /*
      WebExUserSettingsFact.getSessionTicket(webexSiteUrl).then(
        function getSessionTicketSuccess(webexAdminSessionTicket) {
          WebExUserSettingsFact.initXmlApiInfo(
            webexSiteUrl,
            webexSiteName,
            webexAdminSessionTicket
          );

          _self.getUserSettingsInfo();

          $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
          };

          $scope.webexAdvancedUrl = Config.getWebexAdvancedEditUrl(webexSiteUrl);
          $scope.adminEmailParam = Authinfo.getUserName();
          $scope.userEmailParam = $stateParams.currentUser.userName;
        }, // getSessionTicketSuccess()

        function getSessionTicketError(reason) {
          $log.log("WebExUserSettings2Ctrl(): failed to get session ticket");

          this.userSettingsModel.sessionTicketErr = true;
        } // getSessionTicketError()
      ); // WebExUserSettingsFact.getSessionTicket().then()
      */
    } // WebExUserSettings2Ctrl()
  ]);
})();
