(function () {
  'use strict';

  /* @ngInject  */
  function CsdmCodeService($http, Authinfo, CsdmConfigService, CsdmCacheUpdater, CsdmConverter, CsdmCacheFactory) {

    var codesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/codes';

    var codeCache = CsdmCacheFactory.create({
      remove: function (url, obj) {
        if (obj) {
          deleteFromCsdm(codesUrl + '/' + obj.activationCode);
        }
        return deleteFromEnrollment(url);
      },
      update: function (url, obj) {
        return $http.patch(url, obj).then(function (res) {
          return CsdmConverter.convertCode(res.data);
        });
      },
      fetch: function () {
        var url = CsdmConfigService.getEnrollmentServiceUrl() + '/enrollment/entries/?organizationId=' + Authinfo.getOrgId();

        var req = {
          method: 'GET',
          url: url,
          headers: {
            'Cisco-Experimental': true
          }
        };

        return $http(req).then(function (res) {
          var codes = res.data;
          var filtered = _.filter(codes, function (c) {
            return c.status != 'CLAIMED';
          });
          var converted = CsdmConverter.convertCodes(filtered);
          return _.indexBy(converted, 'url');
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
      return codeCache.update(deviceUrl, {
        name: newName
      });
    }

    function deleteCode(code) {
      return codeCache.remove(code.url);
    }

    function deleteFromCsdm(url) {
      return $http.delete(url);
    }

    function deleteFromEnrollment(url) {
      var req = {
        method: 'DELETE',
        url: url,
        headers: {
          'Cisco-Experimental': true
        }
      };
      return $http(req);
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
