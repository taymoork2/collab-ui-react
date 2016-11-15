(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('CloudConnectorService', CloudConnectorService);

  function CloudConnectorService($q, $timeout, Authinfo) {

    var service = {
      isServiceSetup: isServiceSetup,
      updateConfig: updateConfig,
      deactivateService: deactivateService,
      getServiceAccount: getServiceAccount,
    };
    return service;

    function extractDataFromResponse(res) {
      return res.data;
    }

    function isServiceSetup(serviceId) {
      return $q(function (resolve) {
        if (serviceId === 'squared-fusion-gcal' && Authinfo.getOrgId() === 'fe5acf7a-6246-484f-8f43-3e8c910fc50d') {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    }

    function getServiceAccount(serviceId) {
      return $q(function (resolve, reject) {
        if (serviceId === 'squared-fusion-gcal' && Authinfo.getOrgId() === 'fe5acf7a-6246-484f-8f43-3e8c910fc50d') {
          resolve('serviceaccount@example.org');
        } else {
          reject();
        }
      });
    }

    function updateConfig(serviceAccountId, privateKey, serviceId) {
      return $q(function (resolve, reject) {
        if (serviceAccountId === 'serviceaccount@example.org'
           && privateKey === 'MIIEpQIBAAKCAQEA3Tz2mr7SZiAMfQyuvBjM9Oi..Z1BjP5CE/Wm/Rr500P'
           && serviceId === 'squared-fusion-gcal') {
          $timeout(function () {
            resolve(extractDataFromResponse({
              data: {},
              status: 200
            }));
          }, 1000);
        } else {
          $timeout(function () {
            reject({
              data: {
                message: 'Not implemented yet!',
                errors: {
                  description: 'API not found!'
                },
                trackingId: 'ATLAS_08193b4d-3061-0cd4-3f2c-96117f019146_15'
              },
              status: 501
            });
          }, 2000);
        }
      });
    }

    function deactivateService(serviceId) {
      return $q(function (resolve, reject) {
        if (serviceId === 'squared-fusion-gcal' && Authinfo.getOrgId() === 'fe5acf7a-6246-484f-8f43-3e8c910fc50d') {
          $timeout(function () {
            resolve(extractDataFromResponse({
              data: {},
              status: 200
            }));
          }, 300);
        } else {
          $timeout(function () {
            reject({
              data: {
                message: 'Not implemented yet!',
                errors: {
                  description: 'API not found!'
                },
                trackingId: 'ATLAS_08193b4d-3061-0cd4-3f2c-96117f019146_15'
              },
              status: 501
            });
          }, 1000);

        }
      });
    }


  }

})();
