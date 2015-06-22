'use strict';

angular.module('Hercules').service('UserDetails',

  /* @ngInject  */
  function (Utils, Config, Authinfo, $http, Log) {

    var getUsers = function (stateInfo, callback) {
      var userId = stateInfo.userId;

      var org_id = Authinfo.getOrgId();
      var listUrl = Utils.sprintf(Config.getScimUrl(), [org_id]);

      var userid = "myuserid";
      var scimUrl = Config.getScimUrl() + '?filter=id eq "' + userId + '"'; //+ userIds[0];
      var userUrl = Utils.sprintf(scimUrl, [org_id]);
      //console.log(userUrl);

      $http.get(userUrl)
        .success(function (data, status) {
          var result = {};
          result.success = true;
          result.details = {
            id: userId,
            userName: data.Resources[0].userName,
            entitled: stateInfo.entitled ? "Entitled" : "Not Entitled",
            state: stateInfo.state,
            message: stateInfo.state == "error" ? stateInfo.description.defaultMessage : ""
          };
          callback(result, status);
        })
        .error(function (data, status) {
          var result = {};
          result.success = false;
          result.details = {
            id: userId,
            userName: "username not found",
            entitled: stateInfo.entitled ? "Entitled" : "Not Entitled",
            state: stateInfo.state,
            message: stateInfo.state == "error" ? stateInfo.description.defaultMessage : ""
          };
          callback(result, status);
        });
    };

    return {
      getUsers: getUsers
    };

  }
);
