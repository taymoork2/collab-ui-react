(function() {
  'use strict';

  angular.module('Mediafusion')
    .service('vtslistservice', vtslistservice);

  /* @ngInject */
  function vtslistservice($http, $rootScope, Storage, Authinfo, Utils, Auth) {

    var vtslistservice = {

      listVts: function (callback) {
        //console.log("Inside vtslistservice function");

        var listUrl = 'http://mf-device-mgmt-service.mb-lab.huron.uno/mediafusion/v1/devices' + '?orgId=' + [Authinfo.getOrgId()];

        $http.get(listUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            //console.log("inside http success");
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
            //console.log("inside http error");
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
          });

      },

      remove: function (entResId, callback) {
        //console.log("Inside remove function");

        var deleteUrl = 'http://mf-device-mgmt-service.mb-lab.huron.uno/mediafusion/v1/devices' + '/' + entResId;

        $http.delete(deleteUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            //console.log("inside http success");
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
            //console.log("inside http error");
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
          });

      },

      changeState: function (entResId, currentState, callback) {
        //console.log("Inside changeState function");
        //console.log("currentState = " + currentState);
        var changeStateUrl = 'http://mf-device-mgmt-service.mb-lab.huron.uno/mediafusion/v1/devices';
        if (currentState === "MANAGED") {
          changeStateUrl = changeStateUrl + '/' + entResId + '/suspend';
        } else {
          changeStateUrl = changeStateUrl + '/' + entResId + '/resume';
        }
        //console.log("changeStateUrl = " + changeStateUrl);

        $http.put(changeStateUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            data.status = status;
            //console.log("inside http changeState success");
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
            //console.log("inside http changeState error");
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
            //console.log("inside http changeState error description = " + description);
          });

      }

    };

    return vtslistservice;

  }
})();