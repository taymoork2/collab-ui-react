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
    private $translate: ng.translate.ITranslateService,
  ) {}

  //Get all Carriers
  public getCarriers(): ng.IPromise<any> {
    //Are carriers already loaded
    if (this.PstnModel.isCarrierExists()) {
      return this.$q.resolve(this.PstnModel.getCarriers());
    }
    return this.getCarriersStatic().then((pstnCarrierStatics: IPstnCarrierStatic[]) => {
      return this.getCarriersNetwork(pstnCarrierStatics).then( (pstnCarriers: PstnCarrier[]) => {
        return pstnCarriers;
      });
    });
  }

  //Get all static carrier informantion
  public getCarriersStatic(): ng.IPromise<any[]> {
    return this.getCarriersJson().then(carriers => {
      const pstnCarrierStatics: IPstnCarrierStatic[] = _.map(carriers, (carrier: IPstnCarrierStatic) => {
        const carrierObject = _.cloneDeep(carrier);
        for (let i: number = 0; i < carrierObject .features.length; i++) {
          //translate the feature strings
          carrierObject.features[i] = this.$translate.instant(carrierObject.features[i]);
        }
        carrierObject.note = this.$translate.instant(carrierObject.note);
        return carrierObject;
      });
      return pstnCarrierStatics;
    });
  }

  //Reading static carrier information from status JSON file
  private getCarriersJson(): ng.IPromise<any> {
    return this.$q.resolve(require('./pstnProviders.json'));
  }

  //Get array of carriers from Terminus service
  private getCarriersNetwork(pstnCarrierStatics: IPstnCarrierStatic[]): ng.IPromise<any[]> {
    const pstnCarriers: PstnCarrier[] = new Array<PstnCarrier>();
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
    pstnCarriers: PstnCarrier[],
    pstnCarrierStatics: IPstnCarrierStatic[],
  ): ng.IPromise<any[]> {
    return this.PstnService.listDefaultCarriersV2().then ( (carriers: IPstnCarrierGet[]) => {
      carriers.forEach( (carrier: IPstnCarrierGet) => {
        this.addCarrier(carrier, pstnCarriers, pstnCarrierStatics);
      });
      this.PstnModel.setCarriers(pstnCarriers);
      return this.PstnModel.getCarriers();
    });
  }

  private addCarrier(
    carrier: IPstnCarrierGet,
    pstnCarriers: PstnCarrier[],
    pstnCarrierStatics: IPstnCarrierStatic[],
  ): void {
    const size: number = pstnCarriers.push(new PstnCarrier());
    const pstnCarrier: PstnCarrier = pstnCarriers[size - 1];

    //Save the Network info in the 'pstnCarrier' object
    pstnCarrier.setPstnCarrierGet(carrier);
    // Add static carrier information if match on vendor name and country code
    const pstnCarrierStatic: IPstnCarrierStatic[] = _(pstnCarrierStatics)
        .filter((c: IPstnCarrierStatic) =>
          c.countryCode === carrier.country && c.name ===  carrier.vendor).value();
    if (pstnCarrierStatic.length > 0) {
      pstnCarrier.setPstnCarrierStatic(pstnCarrierStatic[0]);
    } else {
      // If vendor is present, update default with vendor logo
      const pstnCarrierVendorMatch: IPstnCarrierStatic[] = _(pstnCarrierStatics)
        .filter((c: IPstnCarrierStatic) => c.name ===  carrier.vendor).value();
      if (pstnCarrierVendorMatch.length > 0) {
        const pstnCarrierStaticContent: IPstnCarrierStatic = new PstnCarrierStatic();
        pstnCarrierStaticContent.logoSrc = pstnCarrierVendorMatch[0].logoSrc;
        pstnCarrier.setPstnCarrierStatic(pstnCarrierStaticContent);
      }
    }
    //Get and add carrier capabilities
    this.PstnService.getCarrierCapabilities(carrier.uuid).then( (capabilities: IPstnCarrierCapability[]) => {
      pstnCarrier.setCapabilities(capabilities);
    });
  }

}
