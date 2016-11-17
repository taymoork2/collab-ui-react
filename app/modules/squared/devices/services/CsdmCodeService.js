(function () {
  'use strict';

  /* @ngInject  */
  function CsdmCodeService($http, Authinfo, CsdmConfigService, CsdmConverter) {

    var codesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/codes';

    function fetchCodes() {
      return $http.get(codesUrl).then(function (res) {
        return CsdmConverter.convertCodes(res.data);
      });
    }

    function fetchItem(url) {
      return $http.get(url).then(function (res) {
        return CsdmConverter.convertCode(res.data);
      });
    }

    function updateItemName(code, name) {
      return $http.patch(code.url, {
        name: name
      }).then(function (res) {
        return CsdmConverter.convertCode(res.data);
      });
    }

    function updateTags(url, tags) {
      return $http.patch(url, {
        description: JSON.stringify(tags || [])
      });
    }

    function deleteCode(code) {
      return $http.delete(code.url);
    }

    function createCode(name) {
      return $http.post(codesUrl, {
        name: name
      }).then(function (res) {
        return CsdmConverter.convertCode(res.data);
      });
    }

    function createCodeForExisting(cisUuid) {
      return $http.post(codesUrl, {
        cisUuid: cisUuid
      }).then(function (res) {
        return CsdmConverter.convertCode(res.data);
      });
    }

    return {
      fetchCodes: fetchCodes,
      fetchItem: fetchItem,
      deleteItem: deleteCode,
      updateTags: updateTags,
      createCode: createCode,
      createCodeForExisting: createCodeForExisting,
      updateItemName: updateItemName
    };
  }

  angular
    .module('Squared')
    .service('CsdmCodeService', CsdmCodeService);

})();
