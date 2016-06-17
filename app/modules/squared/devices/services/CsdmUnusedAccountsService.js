(function () {
  'use strict';

  /* @ngInject  */
  function CsdmUnusedAccountsService($http, Authinfo, CsdmConfigService, CsdmConverter) {

    var accountsUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/nonExistingDevices';

    var accountList = [];
    var loadedData = false;

    function fetch() {
      return $http.get(accountsUrl).then(function (res) {
        loadedData = true;
        accountList = CsdmConverter.convertAccounts(res.data);
      });
    }

    fetch();

    function dataLoaded() {
      return loadedData;
    }

    function getAccountList() {
      return accountList;
    }

    function deleteAccount(account) {
      accountList = _.reject(accountList, function (el) {
        return el.url === account.url;
      });
      return $http.delete(account.url);
    }

    return {
      deleteAccount: deleteAccount,
      getAccountList: getAccountList,
      dataLoaded: dataLoaded
    };
  }

  angular
    .module('Squared')
    .service('CsdmUnusedAccountsService', CsdmUnusedAccountsService);

})();
