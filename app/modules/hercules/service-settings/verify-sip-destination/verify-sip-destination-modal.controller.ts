import { IFormattedResult } from 'modules/hercules/services/l2sip-service';

class VerifySipDestinationModalController {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    public resultSet: IFormattedResult[],
  ) {
    this.resultSet = resultSet;
  }

  public localizeType(type: string): string {
    return this.$translate.instant(`hercules.settings.verifySipDestination.types.${type}`);
  }

  public severityToIcon(severity): string {
    switch (severity) {
      case 'Error':
        return 'icon-error';
      case 'Warn':
        return 'icon-warning';
      default:
        return 'icon-checkbox';
    }
  }
}

angular
  .module('Hercules')
  .controller('VerifySipDestinationModalController', VerifySipDestinationModalController);
