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
    spyOn(this.IntegrationsManagementFakeService, 'listIntegrations').and.callFake((options: IListOptions) => {
      const start: number = _.get(options, 'start', 0);
      let count: number = _.get(options, 'count', 0);
      //override with smaller default so that we can have smaller test data
      if (count === 20) {
        count = 3;
      }
      let result = integrations;
      if (!_.get(options, 'searchStr')) {
        result = integrations;
      } else {
        result = [_.cloneDeep(integrations[0])];
        result[0].appName = 'Found!';
      }
      return this.$q.resolve(result.slice(start, (start + count)));
    });
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
      expect(this.controller.gridData.length).toBe(3);
      expect(_.get(this.controller.gridOptions, 'data.length')).toBe(3);
      expect(this.IntegrationsManagementFakeService.listIntegrations).toHaveBeenCalledWith(expectedOptions);
      expect(this.controller.listOptions.searchStr).toBeUndefined();
    });
    it('should display empty grid if no integrations are returned', function (this: Test) {
      this.IntegrationsManagementFakeService.listIntegrations.and.returnValue(this.$q.resolve([]));
      initComponent.apply(this);
      expect(this.view.find('cs-grid').length).toBe(1);
      expect(_.get(this.controller.gridOptions, 'data.length')).toBe(0);
      expect(this.Notification.errorResponse).not.toHaveBeenCalled();
    });
    it('should display error notification and empty grid if service call is rejected', function (this: Test) {
      this.IntegrationsManagementFakeService.listIntegrations.and.returnValue(this.$q.reject({}));
      initComponent.apply(this);
      expect(this.view.find('cs-grid').length).toBe(1);
      expect(this.controller.gridData.length).toBe(0);
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
      this.controller.loadMoreData();
      expect(this.IntegrationsManagementFakeService.listIntegrations).toHaveBeenCalledWith(expectedOptions);
      expect(this.controller.gridData.length).toBe(3);
    });

    it('should search records', function (this: Test) {
      this.controller.filterList('findMe');
      this.$timeout.flush();
      const expectedOptions = {
        start: 0,
        count: 20,
        searchStr: 'findMe',
      };
      expect(this.IntegrationsManagementFakeService.listIntegrations).toHaveBeenCalledWith(expectedOptions);
      expect(this.controller.gridData.length).toBe(1);
      expect(this.controller.gridData[0].appName).toBe('Found!');
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
      expect(this.controller.gridData.length).toBe(3);
    });
  });
});
