import { IPagingGroup } from './pagingGroup';
import { INumber } from './pgNumber.service';

describe('Service: PagingGroupService', () => {

  let pagingGroups: IPagingGroup[] = [];

  let pg: IPagingGroup = <IPagingGroup> {
    name: 'PG 1',
    number: <INumber> {
      number: '5004',
      uuid: '1234',
    },
    uuid: 'PG 1',
  };

  let pg_edit: IPagingGroup = <IPagingGroup> {
    name: 'PG edit',
    number: <INumber> {
      number: '5005',
      uuid: '1235',
    },
    uuid: 'PG 1',
  };

  beforeEach(function () {
    this.initModules('huron.paging-group');
    this.injectDependencies(
      '$q',
      '$scope',
      'PagingGroupService'
    );
  });

  it('getListOfPagingGroups: should get a paging group list', function () {
    let pagingGroupsActual = undefined;
    this.PagingGroupService.getListOfPagingGroups().then(function(response) {
      pagingGroupsActual = response;
    });
    this.$scope.$digest();
    expect(pagingGroupsActual).toEqual(pagingGroups);
  });

  it('getPagingGroup: should get a paging group', function () {
    this.PagingGroupService.savePagingGroup(pg);
    this.$scope.$digest();
    expect(pg).toEqual(this.PagingGroupService.getPagingGroup('PG 1'));
  });

  it('savePagingGroup: should add a paging group to the list', function () {
    this.PagingGroupService.savePagingGroup(pg);
    expect(this.PagingGroupService.pagingGroups.length).toEqual(1);
    let pagingGroupsActual = undefined;
    this.PagingGroupService.getListOfPagingGroups().then(function(response) {
      pagingGroupsActual = response;
    });
    this.$scope.$digest();
    pagingGroups.push(pg);
    expect(pagingGroupsActual).toEqual(pagingGroups);
  });

  it('updatePagingGroup: should update a paging group from the list', function () {
    this.PagingGroupService.updatePagingGroup(pg_edit);
    expect(this.PagingGroupService.pagingGroups.length).toEqual(1);
    let pagingGroupsActual = undefined;
    this.PagingGroupService.getListOfPagingGroups().then(function(response) {
      pagingGroupsActual = response;
    });
    this.$scope.$digest();
    let index = _.findIndex(pagingGroups, { uuid: pg_edit.uuid });
    pagingGroups.splice(index, 1);
    pagingGroups.splice(index, 0, pg_edit);
    expect(pagingGroupsActual).toEqual(pagingGroups);
  });

  it('deletePagingGroup: should delete a paging group from the list', function () {
    this.PagingGroupService.deletePagingGroup(pg_edit.uuid);
    expect(this.PagingGroupService.pagingGroups.length).toEqual(0);
    let pagingGroupsActual = undefined;
    this.PagingGroupService.getListOfPagingGroups().then(function(response) {
      pagingGroupsActual = response;
    });
    this.$scope.$digest();
    let index = _.findIndex(pagingGroups, { uuid: pg_edit.uuid });
    pagingGroups.splice(index, 1);
    expect(pagingGroupsActual).toEqual(pagingGroups);
  });

});
