export interface ITerminus extends ng.resource.IResource<any> {}

export interface ITerminusResource extends ng.resource.IResourceClass<ITerminus> {
  update(parameters: any, payload: any): ITerminus;
}

export interface IGenericResource<T> extends ng.resource.IResourceClass<T & ng.resource.IResource<T>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export interface IE911Address {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

export interface INumber {
  number: string;
  network: string;
  e911: string;
  e911Address: IE911Address;
}

export interface INumberOrder extends ITerminus {
  uuid: string;
  description: string;
  type: string;
  numberType: string;
  status: string;
  carrier: string;
  operation: string;
  carrierOrderId: string;
  carrierBatchId: string;
  created: string;
  completed: string;
  attributes: any;
  numbers: INumber[];
}

export class TerminusService {
  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
  ) {}

  public customer(): ITerminusResource {
    return <ITerminusResource> this.$resource(this.HuronConfig.getTerminusUrl() + '/customers/:customerId', {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  public customerV2(): ITerminusResource {
    return <ITerminusResource> this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId', {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  public customerTrialsV2(): ITerminusResource {
    return <ITerminusResource> this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId/trials', {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  public customerCarriers(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusUrl() + '/customers/:customerId/carriers/', {});
  }

  public customerCarrierDid(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusUrl() + '/customers/:customerId/carriers/:carrierId/did/:type', {}, {});
  }

  public customerPortV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/orders/ports', {}, {});
  }

  public customerOrder(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusUrl() + '/customers/:customerId/orders/:orderId', {}, {});
  }

  public customerOrderV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId/orders/:orderId', {}, {});
  }

  public customerNumberV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/:number', {}, {});
  }

  public customerNumberE911V2(): ITerminusResource {
    return <ITerminusResource> this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/:number/e911', {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  public customerNumbersOrderV2(): ng.resource.IResourceClass<INumberOrder> {
    return <ng.resource.IResourceClass<INumberOrder>> this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/orders/:orderId', {}, {});
  }

  public customerNumbersOrderBlockV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/orders/blocks', {}, {});
  }

  public customerNumbersOrderPortV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/orders/ports', {}, {});
  }

  public customerNumberReservationV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId/numbers/reservations/:reservationId', {}, {
      save: {
        headers: {
          'Access-Control-Expose-Headers': 'Location',
        },
        method: 'POST',
      },
    });
  }

  public customerSite<T>(): IGenericResource<T> {
    return <IGenericResource<T>>this.$resource(this.HuronConfig.getTerminusUrl() + '/customers/:customerId/sites/:siteId', {}, {
      save: {
        headers: {
          'Access-Control-Expose-Headers': 'Location',
        },
        method: 'POST',
      },
    });
  }

  public customerLocations<T>(): IGenericResource<T> {
    return <IGenericResource<T>>this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId/locations/:locationId', {}, {
      save: {
        headers: {
          'Access-Control-Expose-Headers': 'Location',
        },
        method: 'POST',
      },
    });
  }

  public customerLocationAddresses<T>(): IGenericResource<T> {
    return <IGenericResource<T>> this.$resource(this.HuronConfig.getTerminusV2Url() + '/customers/:customerId/locations/:locationId/addresses/:addressId', {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  public carrier(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusUrl() + '/carriers/:carrierId', {});
  }

  public carriersV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/carriers');
  }

  public carrierE911LookupV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/carriers/:carrierId/e911/lookup', {}, {});
  }

  public carrierNumberV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/carriers/:carrierId/numbers', {}, {});
  }

  public carrierNumbersCountV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/carriers/:carrierId/numbers/count', {}, {});
  }

  public carrierCapabilitiesV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/carriers/:carrierId/capabilities', {}, {
      query: {
        method: 'GET',
        isArray: true,
        cache: true,
      },
    });
  }

  public resellerV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/resellers/:resellerId', {}, {});
  }

  public resellerCarrierV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/resellers/:resellerId/carriers/:carrierId', {}, {});
  }

  public resellerCarrierNumbersReservationV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/resellers/:resellerId/carriers/:carrierId/numbers/reservations', {}, {
      save: {
        headers: {
          'Access-Control-Expose-Headers': 'Location',
        },
        method: 'POST',
      },
    });
  }

  public resellerNumberReservationV2(): ng.resource.IResourceClass<ng.resource.IResource<any>>  {
    return this.$resource(this.HuronConfig.getTerminusV2Url() + '/resellers/:resellerId/numbers/reservations/:reservationId', {}, {});
  }
}

export default angular
  .module('huron.pstn.terminus-service', [
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('TerminusService', TerminusService)
  .name;
