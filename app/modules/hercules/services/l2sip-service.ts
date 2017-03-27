export interface ISipDestinationSteps {
  steps: VerificationStep[];
}
export type VerificationStep = {
  type: string,
  description?: string,
  severity: Severity,
};
export type Severity = 'Info' | 'Warn' | 'Error';

export class L2SipService {
  private l2sipUrl: string;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private UrlConfig,
  ) {
    this.l2sipUrl = this.UrlConfig.getL2sipUrl();
  }

  private extractData(res) {
    return res.data;
  }

  public verifySipDestination(expresswayUrl: string, verifyTls: boolean = true): ng.IPromise<ISipDestinationSteps> {
    return this.$http
      .get(`${this.l2sipUrl}/test/dns?name=${expresswayUrl}&validateTls=${verifyTls}`)
      .then(this.extractData);
  }

}
angular
  .module('Hercules')
  .service('L2SipService', L2SipService);
