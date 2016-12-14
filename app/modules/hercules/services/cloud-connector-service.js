(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('CloudConnectorService', CloudConnectorService);

  function CloudConnectorService($http, $q, $timeout, Authinfo, ServiceDescriptor, UrlConfig) {

    return {
      updateConfig: updateConfig,
      deactivateService: deactivateService,
      getService: getService,
      getStatusCss: getStatusCss
    };

    function extractDataFromResponse(res) {
      return res.data;
    }

    function getService(serviceId, orgId) {
      return $http.get(UrlConfig.getCccUrl() + '/orgs/' + (orgId || Authinfo.getOrgId()) + '/services/' + serviceId)
        .then(extractDataFromResponse)
        .then(function (service) {
            // Align this with the FusionClusterService.getServiceStatus() to make the UI handling simpler
          service.serviceId = serviceId;
          service.setup = service.provisioned;
          service.statusCss = getStatusCss(service);
          service.status = translateStatus(service);
          return service;
        });
    }

    function updateConfig(newServiceAccountId, privateKey, serviceId) {
      return $http
        .post(UrlConfig.getCccUrl() + '/orgs/' + Authinfo.getOrgId() + '/services/' + serviceId, {
          serviceAccountId: newServiceAccountId,
          privateKeyData: privateKey.split(',')[1]
        })
        .then(function () {
          return ServiceDescriptor.enableService(serviceId)
            .catch(function (error) {
              throw error;
            });
        });
    }

    /* Still not sure how to disable the service, keeping dummy implementation for now.  */
    function deactivateService(serviceId) {
      return $q(function (resolve, reject) {
        if (serviceId === 'squared-fusion-gcal' && Authinfo.isFusionGoogleCal()) {
          ServiceDescriptor.disableService(serviceId)
            .then(function () {
              resolve(extractDataFromResponse({
                data: {},
                status: 200
              }));
            })
            .catch(function (error) {
              reject(error);
            });
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

    function getStatusCss(service) {
      if (!service || !service.provisioned || !service.status) {
        return 'default';
      }
      switch (service.status.toLowerCase()) {
        case 'ok':
          return 'success';
        case 'error':
          return 'danger';
        case 'warn':
          return 'warning';
        default:
          return 'default';
      }
    }

    function translateStatus(service) {
      if (!service || !service.provisioned || !service.status) {
        return 'setupNotComplete';
      }
      switch (service.status.toLowerCase()) {
        case 'ok':
          return 'operational';
        case 'error':
          return 'outage';
        case 'warn':
          return 'impaired';
        default:
          return 'unknown';
      }
    }
  }

})();
