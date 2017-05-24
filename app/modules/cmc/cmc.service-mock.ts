import { ICmcOrgStatusResponse } from './cmc.interface';

export class CmcServiceMock {

  private random_happenin = 0;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $q: ng.IQService,
  ) {
  }

  public mockOrgStatus(orgId: string): ng.IPromise<ICmcOrgStatusResponse> {
    this.$log.debug('orgId', orgId);
    let errorMock = {
      message: 'Invalid OrgId',
      errors: [
        {
          description: 'The orgid is not found',
        },
      ],
      trackingId: 'CMC_e7a4c176-0ffa-4de0-9534-88d9ccfc7c71',
    };

    let okMock: ICmcOrgStatusResponse = {
      status: 'ok',
      details: {
        providers: {
          mobileProvider: {
            id: 'mobileProvider_id',
            name: 'Ericsson Mock',
            description: 'mobileProvider_description',
            address: 'mobileProvider_address',
            authName: 'mobileProvider_authName',
            url: 'mobileProvider_url',
            passthroughHeaders: ['headerXyz'],
          },
          ucProvider: {
            id: 'ucProvider_id',
            name: 'Telstra Mock',
            description: 'ucProvider_description',
            address: 'ucProvider_address',
            authName: 'ucProvider_authName',
            url: 'ucProvider_url',
          },
        },
      },
    };

    let nokMock: ICmcOrgStatusResponse = {
      status: 'error',
      details: {
        providers: {
          mobileProvider: {
            id: 'mobileProvider_id',
            name: 'Ericsson Mock',
            description: 'mobileProvider_description',
            address: 'mobileProvider_address',
            authName: 'mobileProvider_authName',
            url: 'mobileProvider_url',
            passthroughHeaders: ['headerXyz'],
          },
          ucProvider: {
            id: 'ucProvider_id',
            name: 'Telstra Mock',
            description: 'ucProvider_description',
            address: 'ucProvider_address',
            authName: 'ucProvider_authName',
            url: 'ucProvider_url',
          },
        },
      },
      issues: [
        {
          code: 2003,
          message: 'Call Service Aware is not provisioned for this org.',
        },
      ],
    };
    this.random_happenin += 1;
    this.$log.info('radom', this.random_happenin);
    switch (this.random_happenin % 6) {
      case 0:
        return this.$q.resolve(okMock);
      case 1:
        return this.$q.resolve(okMock);
      case 2:
        return this.$q.resolve(nokMock);
      case 3:
        return this.$q.resolve(nokMock);
      case 4:
        return this.$q.resolve(nokMock);
      case 5:
        return this.$q.reject(errorMock);
    }
    return this.$q.resolve(okMock);
  }

}
