class DomainManagementService {

  private _domainList = [
    /* {
     text: 'initialDomain.com',
     status: 'pending'}*/
  ];

  constructor($http, Config, Authinfo, private $q) {
    var _verifiedDomainsUrl = Config.getDomainManagementUrl() + '/' + Authinfo.getOrgId() + '/v1/Domains';
  }

  get domainList() {
    return this._domainList;
  }

  refreshDomainList() {
    var promises = [];
    promises.push(this.getVerifiedDomains());
    return this.$q.all(promises);
  }

  addDomain(domainToAdd) {
    let deferred = this.$q.defer();

    //we always normalize to lowercase.
    domainToAdd = domainToAdd || domainToAdd.toLowerCase();

    if (domainToAdd && domainToAdd.endsWith('.com')) {
      this._domainList.push({
        text: domainToAdd,
        code: '234SDSSFVD',
        status: 'pending'
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
        status: 'verified'
      });

    deferred.resolve();
    return deferred.promise;
  }

  public verifyDomain(domain) {
    let deferred = this.$q.defer();
    let domainInList = _.find(this._domainList, {text: domain.text});
    if (domainInList) {
      domainInList.status = "verified";
      deferred.resolve()
    } else {
      deferred.reject("not a domain possible to verify");
    }
    return deferred.promise;
  }
}

angular.module('Core')
  .service('DomainManagementService', DomainManagementService);


