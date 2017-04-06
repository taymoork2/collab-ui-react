import { IPagingGroup, INumberData } from 'modules/huron/features/pagingGroup/pagingGroup';
import { PagingNumberService } from 'modules/huron/features/pagingGroup/pgNumber.service';

interface IPagingGroupResource extends ng.resource.IResourceClass<ng.resource.IResource<IPagingGroup>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IPagingGroup>>;
}

export class PagingGroupService {

  private pgRes: IPagingGroupResource;

  /* @ngInject */
  constructor(private $resource: ng.resource.IResourceService,
              private HuronConfig,
              private $q: ng.IQService,
              private Authinfo,
              private PagingNumberService: PagingNumberService) {
    this.pgRes = <IPagingGroupResource>this.$resource(this.HuronConfig.getPgUrl() + '/customers/:customerId/pagingGroups/:groupId', {},
      {
        update: {
          method: 'PUT',
        },
      });
  }

  public getListOfPagingGroups(): ng.IPromise<IPagingGroup[]> {
    return this.pgRes.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise.then((response) => {
      let pgs = _.map(_.get(response, 'pagingGroups', []));
      let promises: Array<ng.IPromise<any>> = [];
      _.forEach(pgs, (pg: any): void => {
        if (pg.extension === undefined && pg.extensionUUID) {
          promises.push(this.PagingNumberService.getNumberExtension(pg.extensionUUID).then(
            (data: INumberData) => {
              pg.extension = data.extension;
            }));
        }
      });

      return this.$q.all(promises).then(() => {
        return pgs;
      });
    });
  }

  public getPagingGroup(groupId: string): ng.IPromise<IPagingGroup> {
    return this.pgRes.get({
      customerId: this.Authinfo.getOrgId(),
      groupId: groupId,
    }).$promise;
  }

  public savePagingGroup(pg: IPagingGroup) {
    return this.pgRes.save({
      customerId: this.Authinfo.getOrgId(),
    }, pg).$promise;
  }

  public updatePagingGroup(pg: IPagingGroup) {
    return this.pgRes.update({
      customerId: this.Authinfo.getOrgId(),
      groupId: pg.groupId,
    }, pg).$promise;
  }

  public deletePagingGroup(groupId: string) {
    return this.pgRes.delete({
      customerId: this.Authinfo.getOrgId(),
      groupId: groupId,
    }).$promise;
  }
}
