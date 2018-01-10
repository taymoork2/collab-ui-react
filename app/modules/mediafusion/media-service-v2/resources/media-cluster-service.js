(function () {
  'use strict';

  /* @ngInject */
  function MediaClusterServiceV2($http, Authinfo, HybridServicesClusterService, UrlConfig) {
    function extractDataFromResponse(res) {
      return _.get(res, 'data');
    }

    function getPropertySets() {
      var url = UrlConfig.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/property_sets?type=mf.group';
      return $http
        .get(url)
        .then(extractDataFromResponse);
    }

    function createPropertySet(payLoad) {
      var url = UrlConfig.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/property_sets';
      return $http
        .post(url, payLoad)
        .then(function (res) {
          HybridServicesClusterService.clearCache();
          return res;
        });
    }

    function updatePropertySetById(id, payLoad) {
      var url = UrlConfig.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/property_sets/' + id;
      return $http
        .post(url, payLoad)
        .then(function (res) {
          HybridServicesClusterService.clearCache();
          return res;
        });
    }

    return {
      getPropertySets: getPropertySets,
      createPropertySet: createPropertySet,
      updatePropertySetById: updatePropertySetById,
    };
  }

  angular
    .module('Mediafusion')
    .service('MediaClusterServiceV2', MediaClusterServiceV2);
}());
