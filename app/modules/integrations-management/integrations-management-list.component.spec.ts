import moduleName from './index';
import { IntegrationsManagementListController } from './integrations-management-list.component';
import { IApplicationUsage, IListOptions, SortOrder, PolicyType, PolicyAction, IGlobalPolicy } from './integrations-management.types';

type Test = atlas.test.IComponentTest<IntegrationsManagementListController,
  {
    $state;
    $timeout;
    IntegrationsManagementFakeService;
    ModalService;
    Notification;
  },
  {
    components: {
    },
  }>;

describe('Component: integrationsManagementList:', () => {

  const integrations = <IApplicationUsage[]>_.cloneDeep(getJSONFixture('integrations/integrations-list.json'));

  const globalAccessPolicy = {
    id: '123',
    orgId: 'orgId',
    name: 'Global Access Policy',
    type: PolicyType.DEFAULT,
    action: PolicyAction.ALLOW,
  };

  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$state',
      '$timeout',
      'IntegrationsManagementFakeService',
      'ModalService',
      'Notification',
    );
    installPromiseMatchers();
    spyOn(this.Notification, 'errorResponse').and.returnValue('');
    spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve() });
    spyOn(this.IntegrationsManagementFakeService, 'listIntegrations').and.returnValue(this.$q.resolve(integrations.slice(0, 3)));
    spyOn(this.IntegrationsManagementFakeService, 'getGlobalAccessPolicy').and.returnValue(this.$q.resolve(globalAccessPolicy));
    spyOn(this.IntegrationsManagementFakeService, 'createGlobalAccessPolicy').and.returnValue(this.$q.resolve(globalAccessPolicy));
    spyOn(this.IntegrationsManagementFakeService, 'updateGlobalAccessPolicy').and.returnValue(this.$q.resolve());
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
      expect((this.controller.gridOptions.data as any[]).length).toBe(3);
      expect(this.IntegrationsManagementFakeService.listIntegrations).toHaveBeenCalledWith(expectedOptions);
      expect(this.controller.listOptions.searchStr).toBeUndefined();
    });
    it('should display empty grid if no integrations are returned', function (this: Test) {
      this.IntegrationsManagementFakeService.listIntegrations.and.returnValue(this.$q.resolve([]));
      initComponent.apply(this);
      expect(this.view.find('cs-grid')).toExist();
      expect((this.controller.gridOptions.data as any[]).length).toBe(0);
      expect(this.Notification.errorResponse).not.toHaveBeenCalled();
    });
    it('should display error notification and empty grid if service call is rejected', function (this: Test) {
      this.IntegrationsManagementFakeService.listIntegrations.and.returnValue(this.$q.reject({}));
      initComponent.apply(this);
      expect(this.view.find('cs-grid').length).toBe(1);
      expect(this.controller.gridOptions.data).toBeUndefined();
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
      this.IntegrationsManagementFakeService.listIntegrations.and.returnValue(this.$q.resolve(integrations.slice(3, 6)));
      this.controller.loadMoreData()
        .then(() => {
          expect(this.IntegrationsManagementFakeService.listIntegrations).toHaveBeenCalledWith(expectedOptions);
          expect((this.controller.gridOptions.data as any[]).length).toBe(6);
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
      const data = this.controller.gridOptions.data as any[];
      expect(this.IntegrationsManagementFakeService.listIntegrations).toHaveBeenCalledWith(expectedOptions);
      expect(data.length).toBe(1);
      expect(data[0].appName).toBe('Found!');
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

  describe('global access policy', () => {
    beforeEach(initComponent);
    it('should get global access policy', function (this: Test) {
      expect(this.controller.globalAccessPolicy).toEqual(globalAccessPolicy);
    });

    it('should create global access policy of none exists', function (this: Test) {
      this.IntegrationsManagementFakeService.getGlobalAccessPolicy.and.returnValue(this.$q.resolve(undefined));
      initComponent.apply(this);
      expect(this.controller.globalAccessPolicyAction).toBe(PolicyAction.DENY);
      expect(this.controller.globalAccessPolicy).toBeUndefined();
      this.IntegrationsManagementFakeService.getGlobalAccessPolicy.and.returnValue(this.$q.resolve(globalAccessPolicy));
      const promise = this.controller.onGlobalAccessChange(PolicyAction.ALLOW);
      promise
        .then(() => {
          expect(this.IntegrationsManagementFakeService.createGlobalAccessPolicy).toHaveBeenCalled();
          expect(this.IntegrationsManagementFakeService.getGlobalAccessPolicy).toHaveBeenCalled();
          expect(this.controller.globalAccessPolicyAction).toBe(PolicyAction.ALLOW);
          expect(this.controller.globalAccessPolicy).toBeDefined();
        })
        .catch(fail);
      expect(promise).toBeResolved();
    });

    it('should update global access policy if one exists', function (this: Test) {
      const policy = <IGlobalPolicy>this.controller.globalAccessPolicy;
      expect(policy.action).toBe(PolicyAction.ALLOW);
      this.controller.globalAccessPolicyAction = PolicyAction.DENY;
      const promise = this.controller.onGlobalAccessChange(PolicyAction.DENY);
      promise
        .then(() => {
          expect(this.IntegrationsManagementFakeService.updateGlobalAccessPolicy).toHaveBeenCalledWith('123', PolicyAction.DENY);
          const policy = this.controller.globalAccessPolicy as IGlobalPolicy;
          expect(policy.action).toBe(PolicyAction.DENY);
          expect(this.controller.globalAccessPolicyAction).toBe(PolicyAction.DENY);
        })
        .catch(fail);
      expect(promise).toBeResolved();
    });

    it('should not update global access policy and should reset the toggle value back if modal confirmation is canceled', function (this: Test) {
      this.ModalService.open.and.returnValue({ result: this.$q.reject() });
      const policy = <IGlobalPolicy>this.controller.globalAccessPolicy;
      expect(policy.action).toBe(PolicyAction.ALLOW);
      this.controller.globalAccessPolicyAction = PolicyAction.DENY;
      const promise = this.controller.onGlobalAccessChange(PolicyAction.DENY);
      promise
        .then(() => {
          expect(this.IntegrationsManagementFakeService.updateGlobalAccessPolicy).not.toHaveBeenCalled();
          const policy = this.controller.globalAccessPolicy as IGlobalPolicy;
          expect(policy.action).toBe(PolicyAction.ALLOW);
          expect(this.controller.globalAccessPolicyAction).toBe(PolicyAction.ALLOW);
        })
        .catch(fail);
      expect(promise).toBeResolved();
    });
  });
});
