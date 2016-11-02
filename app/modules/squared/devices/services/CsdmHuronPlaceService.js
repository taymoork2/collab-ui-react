(function () {
  'use strict';

  /* @ngInject  */
  function CsdmHuronPlaceService($window, $http, Authinfo, CsdmConverter, FeatureToggleService, $q, HuronConfig, CsdmConfigService) {

    var cmiOtpUri = HuronConfig.getCmiUrl() + '/identity/machines/otp';
    var cmiPlacesUrl = HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/places/';
    var csdmPlaceUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/places/';


    function placesFeatureIsEnabled() {
      if ($window.location.search.indexOf("enablePlaces=true") > -1) {
        return $q.when(true);
      } else {
        return FeatureToggleService.supports(FeatureToggleService.features.csdmPlaces);
      }
    }

    function createOtp(machineUuid) {
      return $http.post(cmiOtpUri, {
        machineUuid: machineUuid
      }).then(function (res) {
        return CsdmConverter.convertCode({
          type: 'huron',
          activationCode: res.data.password,
          expiryTime: res.data.expiresOn,
          cisUuid: machineUuid,
          state: 'UNCLAIMED'
        });
      });
    }

    function createCmiPlace(name, directoryNumber, externalNumber) {
      return $http.post(cmiPlacesUrl, {
        displayName: name,
        directoryNumber: directoryNumber,
        externalNumber: externalNumber,
      }, {
        headers: {
          'Access-Control-Expose-Headers': 'Location'
        }
      }).then(function (res) {
        var location = res.headers('Location');
        return $http.get(location).then(function (res) {
          res.data.phones = !res.data.phones ? [] : res.data.phones;
          res.data.type = 'huron';
          res.data.entitlements = ['ciscouc'];
          res.data.url = csdmPlaceUrl + res.data.uuid;
          return CsdmConverter.convertPlace(res.data);
        });
      });
    }

    return {
      placesFeatureIsEnabled: placesFeatureIsEnabled,
      createCmiPlace: createCmiPlace,
      createOtp: createOtp
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronPlaceService', CsdmHuronPlaceService);

})();
