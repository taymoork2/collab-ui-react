import moduleName from './index';
import { IntegrationsManagementListController } from './integrations-management-list.component';
import { IApplicationUsage, IListOptions, SortOrder } from './integrations-management.types';

type Test = atlas.test.IComponentTest<IntegrationsManagementListController,
  {
    $state;
    $timeout;
    IntegrationsManagementFakeService;
    Notification;
  },
  {
    components: {
    },
  }>;

describe('Component: integrationsManagementList:', () => {

  const integrations = <IApplicationUsage[]>_.cloneDeep(getJSONFixture('integrations/integrations-list.json'));

  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$state',
      '$timeout',
      'IntegrationsManagementFakeService',
      'Notification',
    );
    installPromiseMatchers();
    spyOn(this.Notification, 'errorResponse').and.returnValue('');
    spyOn(this.IntegrationsManagementFakeService, 'listIntegrations').and.returnValue(this.$q.resolve(integrations.slice(0, 3)));
  });

  function initComponent(this: Test) {
    this.compileComponent('integrationsManagementList', {
    });
  }

  describe('initial state', () => {
    it('should display the grid and populate the records without filter or sort upon init', function (this: Test) {
      initComponent.apply(this);
      const expectedOptions = {
        start: 0,
        count: 20,
      };
      expect(this.view.find('cs-grid').length).toBe(1);
      expect(_.get(this.controller.gridOptions, 'data.length')).toBe(3);
      expect(this.IntegrationsManagementFakeService.listIntegrations).toHaveBeenCalledWith(expectedOptions);
      expect(this.controller.listOptions.searchStr).toBeUndefined();
    });
    it('should display empty grid if no integrations are returned', function (this: Test) {
      this.IntegrationsManagementFakeService.listIntegrations.and.returnValue(this.$q.resolve([]));
      initComponent.apply(this);
      expect(this.view.find('cs-grid')).toExist();
      expect(_.get(this.controller.gridOptions, 'data.length')).toBe(0);
      expect(this.Notification.errorResponse).not.toHaveBeenCalled();
    });
    it('should display error notification and empty grid if service call is rejected', function (this: Test) {
      this.IntegrationsManagementFakeService.listIntegrations.and.returnValue(this.$q.reject({}));
      initComponent.apply(this);
      expect(this.view.find('cs-grid').length).toBe(1);

      expect(_.get(this.controller.gridOptions, 'data.length')).toBeUndefined();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });
  });

  describe('basic functions', () => {
    beforeEach(initComponent);
    it('should append records the the existing records if start > 0', function (this: Test) {
      const expectedOptions = {
        start: 20,
        count: 20,
      };
      expect(_.get(this.controller.gridOptions, 'data.length')).toBe(3);
      this.IntegrationsManagementFakeService.listIntegrations.and.returnValue(this.$q.resolve(integrations.slice(3, 6)));
      this.controller.loadMoreData()
        .then(() => {
          expect(this.IntegrationsManagementFakeService.listIntegrations).toHaveBeenCalledWith(expectedOptions);
          expect(_.get(this.controller.gridOptions, 'data.length')).toBe(6);
        })
        .catch(fail);
    });

    it('should search records', function (this: Test) {
      const result = [_.cloneDeep(integrations[0])];
      result[0].appName = 'Found!';
      this.IntegrationsManagementFakeService.listIntegrations.and.returnValue(this.$q.resolve(result.slice(0, 3)));
      this.controller.filterList('findMe');
      this.$timeout.flush();
      const expectedOptions = {
        start: 0,
        count: 20,
        searchStr: 'findMe',
      };
      expect(this.IntegrationsManagementFakeService.listIntegrations).toHaveBeenCalledWith(expectedOptions);
      expect(_.get(this.controller.gridOptions, 'data.length')).toBe(1);
      expect(_.get(this.controller.gridOptions, 'data[0].appName')).toBe('Found!');
    });

    it('should sort records', function (this: Test) {
      const sortCoumns = [{
        field: 'policyAction',
        sort: {
          direction: 'desc',
        },
      }];

      this.controller.sortColumn(sortCoumns);
      const expectedOptions: IListOptions = {
        start: 0,
        count: 20,
        sortBy: 'policyAction',
        sortOrder: SortOrder.DESC,
      };
      expect(this.IntegrationsManagementFakeService.listIntegrations).toHaveBeenCalledWith(expectedOptions);
    });
  });
});
