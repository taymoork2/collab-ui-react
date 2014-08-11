'use strict';
angular
  .module('wx2AdminWebClientApp')
  .run(['$cookies', '$location', '$rootScope', 'Auth', 'Storage', 'Localize', 'Utils', 'Log',
    function($cookies, $location, $rootScope, Auth, Storage, Localize, Utils, Log) {

      //Expose the localize service globally.
      $rootScope.Localize = Localize;
      $rootScope.Utils = Utils;
      $rootScope.services = [];
      $rootScope.exporting = false;

      //Enable logging
      $rootScope.debug = true;

      var data = null;

      if (document.URL.indexOf('access_token') !== -1) {
        data = Auth.getFromGetParams(document.URL);
        Storage.put('accessToken', data.access_token);

      } else if (document.URL.indexOf('code') !== -1) {
        data = Auth.getFromStandardGetParams(document.URL);
        console.log(data);
      } else {
        Log.debug('No access code data.');
      }

      //When a route is loaded, activate the tab corresponding to that route
      $rootScope.$watch(function(){
        return $location.path();
      }, function(){
        Utils.setNavigationTab();
      });

    }
  ]);