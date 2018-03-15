import moduleName from './index';

describe('UserStatusMessagesComponentCtrl', () => {

  let $componentController, $q, $scope, HybridServicesClusterService, HybridServicesClusterStatesService, ResourceGroupService;

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  afterEach(cleanup);

  function cleanup() {
    $componentController = $q = $scope = HybridServicesClusterService = HybridServicesClusterStatesService = ResourceGroupService = undefined;
  }

  function dependencies (_$componentController_, _$q_, _$rootScope_, _HybridServicesClusterService_, _HybridServicesClusterStatesService_, _ResourceGroupService_) {
    $componentController = $scope = _$componentController_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    HybridServicesClusterService = _HybridServicesClusterService_;
    HybridServicesClusterStatesService = _HybridServicesClusterStatesService_;
    ResourceGroupService = _ResourceGroupService_;
  }

  function initSpies() {
    spyOn(ResourceGroupService, 'getAll');
    spyOn(ResourceGroupService, 'resourceGroupHasEligibleCluster');
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve({}));
    spyOn(HybridServicesClusterStatesService, 'getServiceStatusDetails');
  }

  function initController(messages?, humanReadable = true, resourceGroupId?) {
    const ctrl = $componentController('userStatusMessages', {}, {
      humanReadable: humanReadable,
      resourceGroupId: resourceGroupId,
    });
    ctrl.$onChanges({
      messages: {
        currentValue: messages || {},
      },
    });
    $scope.$apply();
    return ctrl;
  }

  it('should not try to override if there are multiple messages', () => {
    const messages = [{
      key: 'das.noOperationalConnector',
    }, {
      key: 'das.noOperationalConnector',
    }];
    initController(messages);
    expect(ResourceGroupService.getAll).not.toHaveBeenCalled();
  });

  it('should not try to override unless the message is in a predefined list of messages', () => {
    const messages = [{
      key: 'not.a.key.we.know.about',
    }];
    initController(messages);
    expect(ResourceGroupService.getAll).not.toHaveBeenCalled();
  });

  it('should not try to override if humanReadable is set to false', () => {
    ResourceGroupService.getAll.and.returnValue($q.resolve([]));
    ResourceGroupService.resourceGroupHasEligibleCluster.and.returnValue($q.resolve(true));
    HybridServicesClusterStatesService.getServiceStatusDetails.and.returnValue({ name: 'impaired' });
    const messages = [{
      key: 'das.noOperationalConnector',
    }];
    const ctrl = initController(messages, false);
    expect(ctrl.messages[0]).toEqual(jasmine.objectContaining({
      key: 'das.noOperationalConnector',
    }));
  });

  it('should just default back to keeping the original message if something goes wrong', () => {
    ResourceGroupService.getAll.and.returnValue($q.reject({}));
    const messages = [{
      key: 'das.noOperationalConnector',
    }];
    const ctrl = initController(messages);
    expect(ctrl.messages[0]).toEqual(jasmine.objectContaining({ key: 'das.noOperationalConnector' }));
  });

  it('should override if there are resource groups in the org, there are not eligible clusters, and the user is *not* in a resource group', () => {
    ResourceGroupService.getAll.and.returnValue($q.resolve([{ dummy: 'group' }]));
    ResourceGroupService.resourceGroupHasEligibleCluster.and.returnValue($q.resolve(false));
    const messages = [{
      key: 'das.noOperationalConnector',
    }];
    const ctrl = initController(messages, true);
    expect(ctrl.messages[0]).toEqual(jasmine.objectContaining({
      description: 'hercules.userStatusMessages.custom.noClusterFoundAndNoCurrentResourceGroup.description',
    }));
  });

  it('should override if there are resource groups in the org, there are not eligible clusters, and the user is in a resource group', () => {
    ResourceGroupService.getAll.and.returnValue($q.resolve([{ dummy: 'group' }]));
    ResourceGroupService.resourceGroupHasEligibleCluster.and.returnValue($q.resolve(false));
    const messages = [{
      key: 'das.noOperationalConnector',
    }];
    const ctrl = initController(messages, true, 'some resourceGroupId');
    expect(ctrl.messages[0]).toEqual(jasmine.objectContaining({
      description: 'hercules.userStatusMessages.custom.noClusterFoundAndUserIsInResourceGroup.description',
    }));
  });

  it('should override if there are resource groups in the org, there are eligible clusters, and the user is *not* in a resource group', () => {
    ResourceGroupService.getAll.and.returnValue($q.resolve([{ dummy: 'group' }]));
    ResourceGroupService.resourceGroupHasEligibleCluster.and.returnValue($q.resolve(true));
    HybridServicesClusterStatesService.getServiceStatusDetails.and.returnValue({ name: 'outage' });
    const messages = [{
      key: 'das.noOperationalConnector',
    }];
    const ctrl = initController(messages, true, 'some resourceGroupId');
    expect(ctrl.messages[0]).toEqual(jasmine.objectContaining({
      description: 'hercules.userStatusMessages.custom.serviceIsNotOperationalInResourceGroup.description',
    }));
  });

  it('should override if there are resource groups in the org, there are *not* eligible clusters, and the user is *not* in a resource group', () => {
    ResourceGroupService.getAll.and.returnValue($q.resolve([{ dummy: 'group' }]));
    ResourceGroupService.resourceGroupHasEligibleCluster.and.returnValue($q.resolve(true));
    HybridServicesClusterStatesService.getServiceStatusDetails.and.returnValue({ name: 'outage' });
    const messages = [{
      key: 'das.noOperationalConnector',
    }];
    const ctrl = initController(messages, true);
    expect(ctrl.messages[0]).toEqual(jasmine.objectContaining({
      description: 'hercules.userStatusMessages.custom.serviceIsNotOperationalUserNotInResourceGroup.description',
    }));
  });

  it('should override if there are resource groups in the org, there are *not* eligible clusters, and the user is in a resource group', () => {
    ResourceGroupService.getAll.and.returnValue($q.resolve([{ dummy: 'group' }]));
    ResourceGroupService.resourceGroupHasEligibleCluster.and.returnValue($q.resolve(true));
    HybridServicesClusterStatesService.getServiceStatusDetails.and.returnValue({ name: 'outage' });
    const messages = [{
      key: 'das.noOperationalConnector',
    }];
    const ctrl = initController(messages, true, 'some resourceGroupId');
    expect(ctrl.messages[0]).toEqual(jasmine.objectContaining({
      description: 'hercules.userStatusMessages.custom.serviceIsNotOperationalInResourceGroup.description',
    }));
  });

  it('should override if there are *not* resource groups in the org, there are *not* eligible clusters', () => {
    ResourceGroupService.getAll.and.returnValue($q.resolve([]));
    ResourceGroupService.resourceGroupHasEligibleCluster.and.returnValue($q.resolve(false));
    const messages = [{
      key: 'das.noOperationalConnector',
    }];
    const ctrl = initController(messages, true);
    expect(ctrl.messages[0]).toEqual(jasmine.objectContaining({
      description: 'hercules.userStatusMessages.custom.noClusterFoundAndNoResourceGroupInOrganization.description',
    }));
  });

  it('should override if there are *not* resource groups in the org, there are *not* eligible clusters, and we have an outage', () => {
    ResourceGroupService.getAll.and.returnValue($q.resolve([]));
    ResourceGroupService.resourceGroupHasEligibleCluster.and.returnValue($q.resolve(true));
    HybridServicesClusterStatesService.getServiceStatusDetails.and.returnValue({ name: 'outage' });
    const messages = [{
      key: 'das.noOperationalConnector',
    }];
    const ctrl = initController(messages, true);
    expect(ctrl.messages[0]).toEqual(jasmine.objectContaining({
      description: 'hercules.userStatusMessages.custom.serviceIsNotOperationalInOrganization.description',
    }));
  });

  it('should override if there are *not* resource groups in the org, there are *not* eligible clusters, and we have impaired service', () => {
    ResourceGroupService.getAll.and.returnValue($q.resolve([]));
    ResourceGroupService.resourceGroupHasEligibleCluster.and.returnValue($q.resolve(true));
    HybridServicesClusterStatesService.getServiceStatusDetails.and.returnValue({ name: 'impaired' });
    const messages = [{
      key: 'das.noOperationalConnector',
    }];
    const ctrl = initController(messages, true);
    expect(ctrl.messages[0]).toEqual(jasmine.objectContaining({
      description: 'hercules.userStatusMessages.custom.serviceIsImpairedInOrganization.description',
    }));
  });

});
