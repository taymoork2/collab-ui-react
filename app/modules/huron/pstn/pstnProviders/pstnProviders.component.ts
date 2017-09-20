import { PstnModel } from '../pstn.model';
import {
  PstnCarrier,
} from './pstnCarrier';
import { PstnProvidersService } from './pstnProviders.service';

export class PstnProvidersComponent implements ng.IComponentOptions {
  public controller = PstnProvidersCtrl;
  public template = require('modules/huron/pstn/pstnProviders/pstnProviders.html');
  public bindings = {
    onChangeFn: '&',
    onReadyFn: '&',
  };
}

export class PstnProvidersCtrl implements ng.IComponentController {
  public show: boolean = false;
  public pstnCarriers: PstnCarrier[];
  private onChangeFn: Function;
  private onReadyFn: Function;

  /* @ngInject */
  constructor(
    public PstnModel: PstnModel,
    private PstnProvidersService: PstnProvidersService,
  ) {}

  public $onInit() {
    this.PstnProvidersService.getCarriers().then((pstnCarriers: PstnCarrier[]) => {
      if (_.isArray(pstnCarriers)) {
        this.pstnCarriers = pstnCarriers;
        this.pstnCarriers.forEach( (pstnCarrier: PstnCarrier) => {
          pstnCarrier.selected = false;
        });
        this.show = true;
        this.onReadyFn();
      }
    });
  }

  public onSetProvider(carrier: PstnCarrier) {
    this.pstnCarriers.forEach( (pstnCarrier: PstnCarrier) => {
      if (pstnCarrier.title === carrier.title) {
        pstnCarrier.selected = true;
      } else {
        pstnCarrier.selected = false;
      }
    });
    this.PstnModel.setProvider(carrier);
    this.onChangeFn();
  }
}
