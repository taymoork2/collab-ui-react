(function () {
  'use strict';

  /* @ngInject  */
  function CsdmCodeService($http, Authinfo, CsdmConfigService, CsdmCacheUpdater, CsdmConverter, CsdmCacheFactory) {

    var codesUrl = CsdmConfigService.getUrl() + '/web/organization/' + Authinfo.getOrgId() + '/codes';

    var codeCache = CsdmCacheFactory.create({
      remove: $http.delete,
      update: function (url, obj) {
        return $http.put(url + '/name/' + obj).then(function () {
          return undefined;
        });
      },
      fetch: function () {
        return $http.get(codesUrl).then(function (res) {
          return CsdmConverter.convertCodes(res.data);
        });
      },
      create: function (url, obj) {
        return $http.post(url, obj).then(function (res) {
          return CsdmConverter.convertCode(res.data);
        });
      }
    });

    function getCodeList() {
      return codeCache.list();
    }

    function updateCodeName(deviceUrl, newName) {
      return codeCache.update(deviceUrl, newName).then(function (cachedCode) {
        cachedCode.updateName(newName);
        return cachedCode;
      });
    }

    function deleteCode(code) {
      return codeCache.remove(code.url);
    }

    function createCode(name) {
      return codeCache.create(codesUrl, {
        name: name
      });
    }

    return {
      getCodeList: getCodeList,
      deleteCode: deleteCode,
      createCode: createCode,
      updateCodeName: updateCodeName,
      subscribe: codeCache.subscribe
    };
  }

  angular
    .module('Squared')
    .service('CsdmCodeService', CsdmCodeService);

})();
