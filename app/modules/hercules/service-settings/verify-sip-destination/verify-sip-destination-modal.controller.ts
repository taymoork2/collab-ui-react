import { L2SipService } from 'modules/hercules/services/l2sip-service';

class VerifySipDestinationModalController {

  public result;
  public loading = true;

  /* @ngInject */
  constructor(
    private L2SipService: L2SipService,
    public destinationUrl: string,
  ) {
    this.L2SipService.verifySipDestination(this.destinationUrl, true)
      .then((result) => {
        this.result =  JSON.stringify(result.steps, null, 4);
      })
      .catch((error) => {
        this.result = 'ERROR: The server responded with: ' + error;
      })
      .finally(() => {
        this.loading = false;
      });
  }

}

angular
  .module('Hercules')
  .controller('VerifySipDestinationModalController', VerifySipDestinationModalController);
