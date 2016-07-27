(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('UriVerificationService', UriVerificationService);

  /* @ngInject */
  function UriVerificationService(DomainManagementService) {

    return {

      isDomainVerified: function (domainList, uri) {

        if (!domainList) {
          return false;
        }

        if (!uri) {
          return false;
        }

        var uriDomain = uri.slice(uri.lastIndexOf('@') + 1);

        if (!uriDomain) {
          return false;
        }
        //we always normalize to lowercase.
        uriDomain = uriDomain ? uriDomain.toLowerCase() : uriDomain;

        return _.some(domainList, function (domain) {
          return domain.status && domain.text &&
            (domain.status === DomainManagementService.states.verified || domain.status === DomainManagementService.states.claimed) &&
            (uriDomain === domain.text || uriDomain.indexOf('.' + domain.text, uriDomain.length - domain.text.length - 1) !== -1);
        });
      }
    };
  }
}());
