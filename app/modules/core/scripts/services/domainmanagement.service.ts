
class DomainManagementService {

  private _domainList = [
   /* {
      text: 'initialDomain.com',
      status: 'pending'}*/
  ];

  constructor ($http, Config, Authinfo, private $q) {

    var _verifiedDomainsUrl = Config.getDomainManagementUrl() + '/' + Authinfo.getOrgId() + '/v1/Domains';

  }

  get domainList() {
    return this._domainList;
  }


  refreshDomainList() {

    var ctrl = this;
    var promises = [];

    promises.push(ctrl.getVerifiedDomains());

    return this.$q.all(promises);

  }

  addDomain(domainToAdd) {

    var ctrl = this;
    let deferred = this.$q.defer();

    if (domainToAdd && domainToAdd.endsWith('.com')){
      ctrl._domainList.push({
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

  getVerifiedDomains() {

    let deferred = this.$q.defer();

    this._domainList.push(
    {
      text: 'getVerifiedDomainspromise.com',
      code: '',
      status: 'verified'
    });

    deferred.resolve();

    return deferred.promise;

    /*$http.get(dirsyncUrl)
     .success(function (data, status) {
     data = data || {};
     data.success = true;
     Log.debug('Retrieved dirsync status');
     callback(data, status);
     })
     .error(function (data, status) {
     data = data || {};
     data.success = false;
     data.status = status;
     callback(data, status);
     });*/
  }
}

angular.module('Core')
  .service('DomainManagementService', DomainManagementService);


