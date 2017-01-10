class UriVerificationService {
  // private

  /* @ngInject */
  constructor(
    private   DomainManagementService,
  ) {}

  public isDomainVerified(domainList, uri): any {
    if (!domainList) {
      return false;
    }
    if (!uri) {
      return false;
    }
    let uriDomain = uri.slice(uri.lastIndexOf('@') + 1);
    if (!uriDomain) {
      return false;
    }
    uriDomain = uriDomain ? uriDomain.toLowerCase() : uriDomain;

    return _.some(domainList,  (domain: any) => {
      return domain.status && domain.text && (domain.status === this.DomainManagementService.states.verified || domain.status === this.DomainManagementService.states.claimed) && (uriDomain === domain.text || uriDomain.indexOf('.' + domain.text, uriDomain.length - domain.text.length - 1) !== -1);

    });
  }
}
angular
  .module('Hercules')
  .service('UriVerificationService', UriVerificationService);
