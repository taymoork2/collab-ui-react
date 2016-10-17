import { IPagingGroup } from './pagingGroup';

export class PagingGroupService {

  private pagingGroups: IPagingGroup[] = [];

  /* @ngInject */
  constructor(private $q: ng.IQService) {
  }

  public getListOfPagingGroups(): ng.IPromise<IPagingGroup[]> {
    return this.$q.resolve(this.pagingGroups);
  }

  public getPagingGroup(pgId: string): IPagingGroup {
    return _.find(this.pagingGroups, { uuid: pgId });
  }

  public savePagingGroup(pg: IPagingGroup) {
    this.pagingGroups.push(pg);
  }

  public deletePagingGroup(pgId: string) {
    let index = _.findIndex(this.pagingGroups, { uuid: pgId });
    this.pagingGroups.splice(index, 1);
  }

  public updatePagingGroup(pg: IPagingGroup) {
    let index = _.findIndex(this.pagingGroups, { uuid: pg.uuid });
    this.pagingGroups.splice(index, 1);
    this.pagingGroups.splice(index, 0, pg);
  }

}
