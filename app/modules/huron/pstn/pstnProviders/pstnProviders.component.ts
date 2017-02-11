import {
  IPstnCarrierGet,
  IPstnCarrierStatic,
  PstnCarrier,
} from './pstnCarrier';

export class PstnProvidersComponent implements ng.IComponentOptions {
  public controller = PstnProvidersCtrl;
  public templateUrl = 'modules/huron/pstn/pstnProviders/pstnProviders.html';
  public bindings = {
    onChangeFn: '&',
    onReadyFn: '&',
  };
}

export class PstnProvidersCtrl implements ng.IComponentController {
  public show: boolean = false;
  public pstnCarriers: Array<PstnCarrier>;
  private pstnCarrierStatics: Array<IPstnCarrierStatic>;
  private onChangeFn: Function;
  private onReadyFn: Function;

  /* @ngInject */
  constructor(
    public PstnSetup,
    private PstnSetupService,
    private $resource: ng.resource.IResourceService,
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    this.pstnCarriers = new Array<PstnCarrier>();
    this.pstnCarrierStatics = new Array<IPstnCarrierStatic>();
    this.getCarriersStatic();
    this.getCarriersNetwork();
  }

  public onSetProvider(carrier: PstnCarrier) {
    this.PstnSetup.setProvider(carrier);
    this.onChangeFn();
  }

  public onReady() {
    this.show = true;
    this.onReadyFn();
  }

  //Get static carrier informantion from JSON file
  private getCarriersStatic() {
    this.getCarriersJson().query().$promise.then(carriers => {
      carriers.forEach((carrier: IPstnCarrierStatic) => {
        //translate the feature strings
        for (let i: number = 0; i < carrier.features.length; i++) {
          carrier.features[i] = this.$translate.instant(carrier.features[i]);
        }
        this.pstnCarrierStatics.push(carrier);
      });
    });
  }

  //Not using a service, due to just one call used by this component for retrieving JSON file
  private getCarriersJson(): any {
    return this.$resource('modules/huron/pstn/pstnProviders/pstnProviders.json', {}, {
      query: {
        method: 'GET',
        isArray: true,
        cache: true,
      },
    });
  }

  //Get array of carriers from Terminus service
  private getCarriersNetwork(): void {
    //Are carriers already loaded
    if (this.PstnSetup.isCarrierExists()) {
      this.onReady();
      return;
    }

    if (this.PstnSetup.isCustomerExists()) {
      //Get Customer Carriers (Most likely there is only 1, the previous selected carrier)
      this.PstnSetupService.listCustomerCarriers(this.PstnSetup.getCustomerId()).then ( carriers => {
        if (_.isArray(carriers) && carriers.length > 0) {
          carriers.forEach(carrier => {
            this.addCarrier(<IPstnCarrierGet> carrier);
          });
          this.PstnSetup.setCarriers(this.pstnCarriers);
          this.onReady();
        } else {
          this.getCarriersNetworkDefault();
        }
      })
      .catch( () => {
        this.getCarriersNetworkDefault();
      });
    } else {
      //Get Reseller Carriers
      this.PstnSetupService.listResellerCarriers().then(carriers => {
        if (_.isArray(carriers) && carriers.length > 0) {
          carriers.forEach(carrier => {
            this.addCarrier(<IPstnCarrierGet> carrier);
          });
          this.PstnSetup.setCarriers(this.pstnCarriers);
          this.onReady();
        } else {
          this.getCarriersNetworkDefault();
        }
      })
      .catch( () => {
        this.getCarriersNetworkDefault();
      });
    }
  }

  private getCarriersNetworkDefault() {
    this.PstnSetupService.listDefaultCarriers().then ( carriers => {
      carriers.forEach(carrier => {
        this.addCarrier(<IPstnCarrierGet> carrier);
      });
      this.PstnSetup.setCarriers(this.pstnCarriers);
      this.onReady();
    });
  }

  private addCarrier(carrier: IPstnCarrierGet): void {
    let pstnCarrier = _.find(this.pstnCarriers, pstnCarrierTest => {
      return pstnCarrierTest.vendor === carrier.vendor;
    });
    if (!_.isObject(pstnCarrier)) {
      let size: number = this.pstnCarriers.push(new PstnCarrier());
      pstnCarrier = this.pstnCarriers[size - 1];
    }
    //Save the Network info in the 'pstnCarrier' object
    pstnCarrier.setPstnCarrierGet(carrier);
    for (let x: number = 0; x < this.pstnCarrierStatics.length; x++) {
      if (this.pstnCarrierStatics[x].name === carrier.vendor) {
        //Add the static info to 'pstnCarrier' object
        pstnCarrier.setPstnCarrierStatic(this.pstnCarrierStatics[x]);
        break;
      }
    }
  }

}
