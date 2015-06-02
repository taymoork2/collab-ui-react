'use strict';

angular.module('Squared').service('CsdmService',

  /* @ngInject  */
  function ($rootScope, $http, Authinfo) {

    var codesUrl = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/' + Authinfo.getOrgId() + '/codes';
    var devicesUrl = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/' + Authinfo.getOrgId() + '/devices';

    return {
      listDevices: function (callback) {
        $http.get(devicesUrl)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });
      },

      listCodes: function (callback) {
        $http.get(codesUrl)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });
      },

      listCodesAndDevices: function (callback) {
        this.listCodes(function (err, codes) {
          if (err) return callback(err);
          this.listDevices(function (err, devices) {
            if (err) return callback(err);
            callback(null, _.extend(codes, devices));
          });
        }.bind(this));
      },

      getDeviceStatus: function (deviceUrl, callback) {
        $http.get(deviceUrl)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });
      }
    };

  }
);
