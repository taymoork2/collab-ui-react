
class DomainManagementService {

  private _domainList = [
    {
      text: 'initialDomain.com',
      status: 'pending'}
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

    promises.push(ctrl.getVerifiedDomains);


    this.$q.all(promises).then(
      function (data) {
      ctrl._domainList.push({
        text: 'allgetVerifiedDomainspromise.com',
        status: 'pending'
      });
    }, function(errorGettingVerifiedDomains) {

    }
    );
  }

  addDomain(domainToAdd) {

    var ctrl = this;
    var deferred = this.$q.defer();

    if (domainToAdd && domainToAdd.endsWith('.com')){
      ctrl._domainList.push({
        text: domainToAdd,
        status: 'new'
      });

      deferred.resolve();
    } else {
      deferred.reject("does not end with .com");
    }

    return deferred.promise;
  }

  getVerifiedDomains(callback) {

    var deferred = this.$q.defer();

    console.log("getVerifiedDomains");

    return deferred.resolve([{
      text: 'getVerifiedDomainspromise.com',
      status: 'pending'
    }]).promise;

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


