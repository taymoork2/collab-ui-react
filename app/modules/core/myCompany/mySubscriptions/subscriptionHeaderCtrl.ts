namespace myCompanyPage {
  
  class SubscriptionHeaderCtrl {
    private _displayButton = false;
    private _upgradeUrl = undefined;

    get displayButton() {
      return this._displayButton;
    }

    get upgradeUrl() {
      return this._upgradeUrl;
    }

    /* @ngInject */
    constructor($scope) {
      $scope.$on('SUBSCRIPTION::upgradeData', (event, response) => {
        this._displayButton = response.display;
        this._upgradeUrl = response.url;
      });
    }
  }

  angular
    .module('Core')
    .controller('SubscriptionHeaderCtrl', SubscriptionHeaderCtrl);
}
