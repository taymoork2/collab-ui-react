import HybridServicesResourceGroupSelectorComponent from './index';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { IResourceGroupOptionPair } from 'modules/hercules/services/resource-group.service';

describe('HybridServicesResourceGroupSelectorComponent', () => {

  let $componentController, $httpBackend, $q, $scope, ctrl, ResourceGroupService, USSService;

  const manchesterGroup: IResourceGroupOptionPair = {
    label: 'number one',
    value: 'man-united',
  };
  const liverpoolGroup: IResourceGroupOptionPair = {
    label: 'number two',
    value: 'liverpool',
  };

  beforeEach(angular.mock.module('Hercules'));

  beforeEach(function () {
    this.initModules(HybridServicesResourceGroupSelectorComponent);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$httpBackend_, _$q_, $rootScope, _ResourceGroupService_, _USSService_) {
    $componentController = _$componentController_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $scope = $rootScope;
    ResourceGroupService = _ResourceGroupService_;
    USSService = _USSService_;
  }

  function cleanup() {
    $componentController = ctrl = $httpBackend = $scope = ResourceGroupService = USSService = undefined;
  }

  function initSpies() {
    spyOn(ResourceGroupService, 'getAllAsOptions').and.returnValue($q.resolve([manchesterGroup, liverpoolGroup]));
    spyOn(ResourceGroupService, 'resourceGroupHasEligibleCluster').and.returnValue($q.resolve(true));
    spyOn(USSService, 'getUserProps');
  }

  function initController(resourceGroupId: string | null = null, serviceId: HybridServiceId = 'squared-fusion-uc') {
    ctrl = $componentController('hybridServicesResourceGroupSelector', {}, {
      userId: '1234',
      resourceGroupId: resourceGroupId,
      serviceId: serviceId,
    });
    ctrl.$onInit();
    $scope.$apply();
  }

  it('should set the selected resource group to the user\'s current resource group when initializing', () => {
    initController('man-united', 'squared-fusion-cal');
    expect(ctrl.selectedResourceGroup).toBe(manchesterGroup);
  });

  it('should go to USS and look up the resource group if none is provided, and set it as selected', () => {
    USSService.getUserProps.and.returnValue($q.resolve({
      resourceGroups: {
        'squared-fusion-cal': 'man-united',
        'squared-fusion-uc': 'liverpool',
      },
    }));
    initController(null, 'squared-fusion-cal');
    expect(ctrl.selectedResourceGroup).toBe(manchesterGroup);
  });

  it('should differentiate between different resource groups for different services', () => {
    USSService.getUserProps.and.returnValue($q.resolve({
      resourceGroups: {
        'squared-fusion-cal': 'man-united',
        'squared-fusion-uc': 'liverpool',
      },
    }));
    initController(null, 'squared-fusion-uc');
    expect(ctrl.selectedResourceGroup).toBe(liverpoolGroup);
  });

  it('should set the selected resource group to "none" if none can be found', () => {
    USSService.getUserProps.and.returnValue($q.resolve({
      resourceGroups: {
        'squared-fusion-cal': 'arsenal',
        'squared-fusion-uc': '',
      },
    }));
    initController(null, 'squared-fusion-uc');
    expect(ctrl.selectedResourceGroup).toEqual({
      label: 'hercules.resourceGroups.noGroupSelected',
      value: '',
    });
  });

  it('should show a reset option if the current resource group cannot be found in the list of options', () => {
    ResourceGroupService.resourceGroupHasEligibleCluster.and.returnValue($q.resolve(false));
    USSService.getUserProps.and.returnValue($q.resolve({
      resourceGroups: {
        'squared-fusion-uc': 'tottenham',
      },
    }));
    initController('tottenham', 'squared-fusion-uc');
    expect(ctrl.cannotFindResourceGroup).toBe(true);
  });

  it('should warn if there are no connectors of the correct type found in the selected resource group', () => {
    ResourceGroupService.resourceGroupHasEligibleCluster.and.returnValue($q.resolve(false));
    initController('man-united', 'squared-fusion-cal');
    expect(ctrl.showGroupIsEmptyWarning).toBe(true);
  });

});
