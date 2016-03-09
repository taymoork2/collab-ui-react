'use strict';

angular.module('Hercules')
  .service('UriVerificationService', ['DomainManagementService',
    function UriVerificationService(DomainManagementService) {

      DomainManagementService.getVerifiedDomains();

      return {
        isDomainVerified: function (uri) {

          if (!uri)
            return false;

          var uriDomain = uri.slice(uri.lastIndexOf('@') + 1);

          if (!uriDomain)
            return false;
          //we always normalize to lowercase.
          uriDomain = uriDomain ? uriDomain.toLowerCase() : uriDomain;

          return _.some(DomainManagementService.domainList, function (domain) {
            return domain.status && domain.name &&
              (domain.status === DomainManagementService.states.verified || domain.status === DomainManagementService.states.claimed) &&
              (uriDomain === domain.name || uriDomain.indexOf('.' + domain.name, uriDomain.length - domain.name.length - 1) !== -1);
          });
        }
      };
    }
  ]);
