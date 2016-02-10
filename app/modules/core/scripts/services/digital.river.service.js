'use strict';

angular.module('Core')
  .constant('NAME_DELIMITER', ' \u000B')
  .service('DigitalRiverService', ['$http', 'Config', 'Log', 'Auth', 'NAME_DELIMITER',
    function ($http, Config, Log, Auth, NAME_DELIMITER) {

      return {

        getUserFromEmail: function (email) {
          return Auth.setAccessToken().then(function () {
            return $http.get(Config.getAdminServiceUrl() + "ordertranslator/digitalriver/user/" + email + "/exists", {
              cache: false
            });
          });
        },

        addDrUser: function (emailPassword) {
          return Auth.setAccessToken().then(function () {
            return $http.post(Config.getAdminServiceUrl() + "ordertranslator/digitalriver/user", emailPassword);
          });
        },

        // TODO: Remove this after the go-live.
        getDrReferrer: function () {
          return "digitalriver-ZGlnaXRhbHJpdmVy";
        }
      };

    }
  ]);
