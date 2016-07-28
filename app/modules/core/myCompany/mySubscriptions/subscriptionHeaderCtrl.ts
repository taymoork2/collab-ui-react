namespace myCompanyPage {
  
  class SubscriptionHeaderCtrl {
    private _isTrial = false;
    private _isOnline = false;
    private _upgradeUrl = undefined;

    get isTrial() {
      return this._isTrial;
    }
    get isOnline() {
      return this._isOnline;
    }
    get upgradeUrl() {
      return this._upgradeUrl;
    }

    /* @ngInject */
    constructor($scope) {
      $scope.$on('SUBSCRIPTION::upgradeData', (event, response) => {
        this._isTrial = response.isTrial;
        this._isOnline = response.isOnline;
        this._upgradeUrl = response.url;
      });
    }
  }

  angular
    .module('Core')
    .controller('SubscriptionHeaderCtrl', SubscriptionHeaderCtrl);
}
