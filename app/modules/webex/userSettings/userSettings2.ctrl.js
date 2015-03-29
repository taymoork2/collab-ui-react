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

      this.getUserSettingsInfo = function () {
        angular.element('#reloadBtn').button('loading'); //show spinning icon in "Try again" button

        var getUserSettingsInfoResult = WebExUserSettingsFact.getUserSettingsInfo();

        angular.element('#reloadBtn').button('reset'); // Reset "try again button" to normal state
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
      var webexSiteUrl = "";
      var webexSiteName = "";

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
        } // getSessionTicketError()
      );
    } // WebExUserSettings2Ctrl()
  ]);
})();
