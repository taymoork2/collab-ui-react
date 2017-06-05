import {
  IPstnCarrierGet,
  IPstnCarrierStatic,
  IPstnCarrierCapability,
  PstnCarrier,
  PstnCarrierStatic,
} from './pstnCarrier';
import { PstnModel } from '../pstn.model';
import { PstnService } from '../pstn.service';

export class PstnProvidersService {
  /* @ngInject */
  constructor (
    private PstnService: PstnService,
    private PstnModel: PstnModel,
    private $q: ng.IQService,
    private $resource: ng.resource.IResourceService,
    private $translate: ng.translate.ITranslateService,
  ) {}

  //Get all Carriers
  public getCarriers(): ng.IPromise<any> {
    //Are carriers already loaded
    if (this.PstnModel.isCarrierExists()) {
      return this.$q.resolve(this.PstnModel.getCarriers());
    }
    return this.getCarriersStatic().then((pstnCarrierStatics: Array<IPstnCarrierStatic>) => {
      return this.getCarriersNetwork(pstnCarrierStatics).then( (pstnCarriers: Array<PstnCarrier>) => {
        return pstnCarriers;
      });
    });
  }

  //Get all static carrier informantion
  public getCarriersStatic(): ng.IPromise<Array<any>> {
    return this.getCarriersJson().query().$promise.then(carriers => {
      let pstnCarrierStatics: Array<IPstnCarrierStatic> = new Array<IPstnCarrierStatic>();
      carriers.forEach((carrier: IPstnCarrierStatic) => {
        //translate the feature strings
        for (let i: number = 0; i < carrier.features.length; i++) {
          carrier.features[i] = this.$translate.instant(carrier.features[i]);
        }
        pstnCarrierStatics.push(carrier);
      });
      return pstnCarrierStatics;
    });
  }

  //Reading static carrier information from status JSON file
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
  private getCarriersNetwork(pstnCarrierStatics: Array<IPstnCarrierStatic>): ng.IPromise<Array<any>> {
    let pstnCarriers: Array<PstnCarrier> = new Array<PstnCarrier>();
    if (this.PstnModel.isCustomerExists()) {
      //Get Customer Carriers (Most likely there is only 1, the previous selected carrier)
      return this.PstnService.listCustomerCarriers(this.PstnModel.getCustomerId()).then ( carriers => {
        if (_.isArray(carriers) && carriers.length > 0) {
          carriers.forEach( (carrier: IPstnCarrierGet) => {
            this.addCarrier(carrier, pstnCarriers, pstnCarrierStatics);
          });
          this.PstnModel.setCarriers(pstnCarriers);
          return this.PstnModel.getCarriers();
        } else {
          return this.getCarriersNetworkDefault(pstnCarriers, pstnCarrierStatics);
        }
      })
      .catch( () => {
        return this.getCarriersNetworkDefault(pstnCarriers, pstnCarrierStatics);
      });
    } else {
      //Get Reseller Carriers
      return this.PstnService.listResellerCarriersV2().then(carriers => {
        if (_.isArray(carriers) && carriers.length > 0) {
          carriers.forEach((carrier: IPstnCarrierGet) => {
            this.addCarrier(carrier, pstnCarriers, pstnCarrierStatics);
          });
          this.PstnModel.setCarriers(pstnCarriers);
          return this.PstnModel.getCarriers();
        } else {
          return this.getCarriersNetworkDefault(pstnCarriers, pstnCarrierStatics);
        }
      })
      .catch( () => {
        return this.getCarriersNetworkDefault(pstnCarriers, pstnCarrierStatics);
      });
    }
  }

  private getCarriersNetworkDefault(
    pstnCarriers: Array<PstnCarrier>,
    pstnCarrierStatics: Array<IPstnCarrierStatic>,
  ): ng.IPromise<Array<any>> {
    return this.PstnService.listDefaultCarriersV2().then ( (carriers: Array<IPstnCarrierGet>) => {
      carriers.forEach( (carrier: IPstnCarrierGet) => {
        this.addCarrier(carrier, pstnCarriers, pstnCarrierStatics);
      });
      this.PstnModel.setCarriers(pstnCarriers);
      return this.PstnModel.getCarriers();
    });
  }

  private addCarrier(
    carrier: IPstnCarrierGet,
    pstnCarriers: Array<PstnCarrier>,
    pstnCarrierStatics: Array<IPstnCarrierStatic>,
  ): void {
    let size: number = pstnCarriers.push(new PstnCarrier());
    let pstnCarrier: PstnCarrier = pstnCarriers[size - 1];

    //Save the Network info in the 'pstnCarrier' object
    pstnCarrier.setPstnCarrierGet(carrier);
    // Add static carrier information if match on vendor name and country code
    let pstnCarrierStatic: IPstnCarrierStatic[] = _(pstnCarrierStatics)
        .filter((c: IPstnCarrierStatic) =>
          c.countryCode === carrier.country && c.name ===  carrier.vendor).value();
    if (pstnCarrierStatic.length > 0) {
      pstnCarrier.setPstnCarrierStatic(pstnCarrierStatic[0]);
    } else {
      // If vendor is present, update default with vendor logo
      let pstnCarrierVendorMatch: IPstnCarrierStatic[] = _(pstnCarrierStatics)
        .filter((c: IPstnCarrierStatic) => c.name ===  carrier.vendor).value();
      if (pstnCarrierVendorMatch.length > 0) {
        let pstnCarrierStaticContent: IPstnCarrierStatic = new PstnCarrierStatic();
        pstnCarrierStaticContent.logoSrc = pstnCarrierVendorMatch[0].logoSrc;
        pstnCarrier.setPstnCarrierStatic(pstnCarrierStaticContent);
      }
    }
    //Get and add carrier capabilities
    this.PstnService.getCarrierCapabilities(carrier.uuid).then( (capabilities: Array<IPstnCarrierCapability>) => {
      pstnCarrier.setCapabilities(capabilities);
    });
  }

}
