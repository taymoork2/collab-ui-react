class SubscriptionHeaderCtrl {
  public isTrial = false;
  public isOnline = false;
  public subId: string;
  public upgradeTrialUrl: string;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private Authinfo,
  ) {
    this.isOnline = this.Authinfo.isOnline();

    this.$scope.$on('SUBSCRIPTION::upgradeData', (_event, response) => {
      this.isTrial = response.isTrial;
      this.subId = response.subId;
      this.upgradeTrialUrl = response.upgradeTrialUrl;
    });
  }
}

angular
  .module('Core')
  .controller('SubscriptionHeaderCtrl', SubscriptionHeaderCtrl);
