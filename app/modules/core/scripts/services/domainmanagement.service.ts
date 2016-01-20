class DomainManagementService {

  private _domainList = [
    /* {
     text: 'initialDomain.com',
     status: this.states.pending}*/
  ];

  private _states = {
    pending: 'pending',
    verified: 'verified',
    claimed: 'claimed'
  }

  constructor($http, Config, Authinfo, private $q) {
    var _verifiedDomainsUrl = Config.getDomainManagementUrl(Authinfo.getOrgId());
  }

  get states() {
    return this._states;
  }

  get domainList() {
    return this._domainList;
  }

  refreshDomainList() {
    return this.getVerifiedDomains();
  }

  addDomain(domainToAdd) {
    let deferred = this.$q.defer();

    //we always normalize to lowercase.
    domainToAdd = domainToAdd ? domainToAdd.toLowerCase() : domainToAdd;

    if (domainToAdd && domainToAdd.endsWith('.com')) {
      this._domainList.push({
        text: domainToAdd,
        code: '234SDSSFVD',
        status: this.states.pending
      });

      deferred.resolve();
    } else {
      deferred.reject("does not end with .com");
    }
    return deferred.promise;
  }

  deleteDomain(domainToDelete) {
    let deferred = this.$q.defer();
    if (domainToDelete && domainToDelete.text && domainToDelete.text.endsWith('.com')) {
      _.remove(this._domainList, {text: domainToDelete.text});
      deferred.resolve();
    } else {
      deferred.reject("does not end with .com");
    }
    return deferred.promise;
  }

  getVerifiedDomains() {
    let deferred = this.$q.defer();

    this._domainList.push(
      {
        text: 'getVerifiedDomainspromise.com'.toLowerCase(),
        code: '',
        status: this.states.verified
      });

    deferred.resolve();
    return deferred.promise;
  }

  public verifyDomain(domain) {
    let deferred = this.$q.defer();
    let domainInList = _.find(this._domainList, {text: domain.text});
    if (domainInList) {
      domainInList.status = this.states.verified;
      deferred.resolve()
    } else {
      deferred.reject("not a domain possible to verify");
    }
    return deferred.promise;
  }
}
angular.module('Core')
  .service('DomainManagementService', DomainManagementService);
