import { ICluster } from 'modules/hercules/hybrid-services.types';

export class FirstTimeCallingController implements ng.IComponentController {

  public cluster: ICluster;
  public a: ICluster;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
  ) {
    this.a = this.cluster;
    this.init();
  }

  private init() {
    this.$log.info('test' + this.cluster);
  }

}

export class FirstTimeCallingComponent implements ng.IComponentOptions {
  public controller = FirstTimeCallingController;
  public template = require('./first-time-calling.html');
}
