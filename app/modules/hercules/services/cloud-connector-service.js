(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('CloudConnectorService', CloudConnectorService);

  function CloudConnectorService($q, $timeout, Authinfo) {

    var serviceAccountId = 'google@example.org'; // dummy value for now
    var isGoogleCalendarSetup = false;

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
        $timeout(function () {
          if (serviceId === 'squared-fusion-gcal' && Authinfo.isFusionGoogleCal() && isGoogleCalendarSetup) {
            resolve(true);
          } else {
            resolve(false);
          }
        }, 750);
      });
    }

    function getServiceAccount(serviceId) {
      return $q(function (resolve, reject) {
        if (serviceId === 'squared-fusion-gcal' && Authinfo.isFusionGoogleCal()) {
          resolve(serviceAccountId);
        } else {
          reject();
        }
      });
    }

    function updateConfig(newServiceAccountId, privateKey, serviceId) {
      isGoogleCalendarSetup = true;
      return $q(function (resolve, reject) {
        if (serviceId === 'squared-fusion-gcal' && Authinfo.isFusionGoogleCal()) {
          $timeout(function () {
            serviceAccountId = newServiceAccountId;
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
        if (serviceId === 'squared-fusion-gcal' && Authinfo.isFusionGoogleCal()) {
          $timeout(function () {
            isGoogleCalendarSetup = false;
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
