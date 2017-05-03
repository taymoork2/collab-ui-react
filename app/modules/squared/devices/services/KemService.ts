export class KemService {
  private kemConfig = {
    'Cisco 8851': {},
    'Cisco 8851NR': {},
    'Cisco 8861': {},
    'Cisco 8865': {},
  };
  /* @ngInject  */
  constructor(private $translate) {

  }

  private getLabel() {
    return [this.$translate.instant('deviceOverviewPage.kemOptions.none'),
      this.$translate.instant('deviceOverviewPage.kemOptions.one'),
      this.$translate.instant('deviceOverviewPage.kemOptions.two'),
      this.$translate.instant('deviceOverviewPage.kemOptions.three')];
  }

  public isKEMAvailable(phoneModel: string) {
    return this.kemConfig && _.has(this.kemConfig, phoneModel);
  }

  public getKemOption(kemNumber) {
    let labels = this.getLabel();
    if (kemNumber >= 0 && kemNumber < labels.length) {
      return labels[kemNumber];
    } else {
      return labels[0];
    }
  }
}

module.exports =
  angular
    .module('Squared').service('KemService', KemService)
    .name;
