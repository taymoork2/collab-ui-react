namespace myCompanyPage {
  
  class SubscriptionHeaderCtrl {
    private _isTrial = false;
    private _isOnline = false;
    private _upgradeUrl: string;
    private _upgradeTrialUrl: string;

    get isTrial() {
      return this._isTrial;
    }
    get isOnline() {
      return this._isOnline;
    }
    get upgradeUrl() {
      return this._upgradeUrl;
    }
    get upgradeTrialUrl(){
      return this._upgradeTrialUrl;
    }

    /* @ngInject */
    constructor($scope, Authinfo) {
      this._isOnline = Authinfo.isOnline();

      $scope.$on('SUBSCRIPTION::upgradeData', (event, response) => {
        this._isTrial = response.isTrial;
        this._upgradeUrl = response.url;
        this._upgradeTrialUrl = response.upgradeTrialUrl;
      });
    }
  }

  angular
    .module('Core')
    .controller('SubscriptionHeaderCtrl', SubscriptionHeaderCtrl);
}
