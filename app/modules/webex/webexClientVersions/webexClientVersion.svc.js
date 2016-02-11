'use strict';

angular.module('WebexClientVersions').service('WebexClientVersion', [
  '$q',
  '$log',
  '$translate',
  '$filter',
  '$http',
  'Authinfo',
  'Config',
  'WebExUtilsFact',
  'Notification',
  function (
    $q,
    $log,
    $translate,
    $filter,
    $http,
    Authinfo,
    Config,
    WebExUtilsFact,
    Notification
  ) {

    //reference http://www.codelord.net/2015/09/24/$q-dot-defer-youre-doing-it-wrong/

    this.toggleWebexSelectLatestVersionAlways = function (partnerId, selectLatestVersion) {
      $log.info("Togging");
    };

    this.getToggle_webexSelectLatestVersionAlways = function (partnerId) {
      var selectLatest = "latest_version";
      return $q.when(selectLatest);
    };

    /**
        Sample: data in response

                   {
    "clientVersions": [
      "T30LSP2",
      "T29L",
      "T29LSP10",
      "T29LSP11",
      "T29LSP12",
       "T29LSP13",
      "T29LSP8",
      "T29LSP9",
      "T30L",
        "T30LSP1",
      "T30LSP3"
    ]
   }
       Here we will simply return a list of strings that corresponds to the client versions. 
    */
    this.getWbxClientVersions = function () {
      //http://atlas-integration.wbx2.com/admin/api/v1/partnertemplate/clientversions

      var url = Config.getAdminServiceUrl() + 'partnertemplate/clientversions';

      return $http.get(url).then(function (response) {
        return response.data.clientVersions;
      });

      //clientVersions = ["version1", "version2"];
      //return $q.when(clientVersions);
    };

    this.getSelectedWbxClientVersion = function () {
      var clientVersion = "selectedVersion";
      return $q.when(clientVersion);
    };
  }
]);
