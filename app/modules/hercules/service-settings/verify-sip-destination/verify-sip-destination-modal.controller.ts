import { VerificationStep } from 'modules/hercules/services/l2sip-service';

class VerifySipDestinationModalController {

  public sanitizedResultSet: VerificationStep[];

  /* @ngInject */
  constructor(
    public resultSet: VerificationStep[],
  ) {
    this.sanitizedResultSet = _.filter(resultSet, (result) => {
      return result.type !== 'ServerTestBegin' && result.type !== 'ServerTestEnd';
    });
  }

}

angular
  .module('Hercules')
  .controller('VerifySipDestinationModalController', VerifySipDestinationModalController);
