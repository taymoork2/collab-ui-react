export class HybridServicesFlag {
  constructor(public readonly name: string, public readonly raised: boolean) {
  }
}

interface IResource extends
  ng.resource.IResourceClass<ng.resource.IResource<HybridServicesFlag>> {

  patch: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
  multiGet: ng.resource.IResourceMethod<ng.resource.IResource<{items: HybridServicesFlag[]}>>;
}

export class HybridServicesFlagService {
  private readonly resource: IResource;

  /* @ngInject */
  constructor($resource: ng.resource.IResourceService,
              UrlConfig: any,
              private readonly Authinfo,
  ) {
    this.resource = <IResource>$resource(
      `${UrlConfig.getFlagServiceUrl()}/organizations/:orgId/flags/:flagName`,
      {},
      {
        patch: { method: 'PATCH' },
        multiGet: { method: 'GET' },
      });
  }

  public readFlag(flagName: string, orgId = this.Authinfo.getOrgId()): ng.IPromise<HybridServicesFlag> {
    return this.resource
      .get({
        orgId: orgId,
        flagName: flagName,
      })
      .$promise
      .then(f => new HybridServicesFlag(f.name, f.raised));
  }

  public readFlags(flagNames: string[], orgId = this.Authinfo.getOrgId()): ng.IPromise<HybridServicesFlag[]> {
    return this.resource
      .multiGet({
        orgId: orgId,
        name: flagNames,
      })
      .$promise
      .then(f => _.map(f.items, (item) => new HybridServicesFlag(item.name, item.raised)));
  }

  private setFlag(flagName: string, raised: boolean, orgId = this.Authinfo.getOrgId()): ng.IPromise<void>  {
    return this.resource
      .patch({
        orgId: orgId,
        flagName: flagName,
      },
        new HybridServicesFlag(flagName, raised))
      .$promise;
  }

  public raiseFlag(flagName: string, orgId = this.Authinfo.getOrgId()): ng.IPromise<void> {
    return this.setFlag(flagName, true, orgId);
  }

  public lowerFlag(flagName: string, orgId = this.Authinfo.getOrgId()): ng.IPromise<void> {
    return this.setFlag(flagName, false, orgId);
  }
}

import * as ngResourceModuleName from 'angular-resource';
import * as UrlConfigModuleName from 'modules/core/config/urlConfig';
import * as AuthinfoModuleName from 'modules/core/scripts/services/authinfo';

export default angular
  .module('hercules.hybrid-services-flag-service', [
    ngResourceModuleName,
    AuthinfoModuleName,
    UrlConfigModuleName,
  ])
  .service('HybridServicesFlagService', HybridServicesFlagService)
  .name;
