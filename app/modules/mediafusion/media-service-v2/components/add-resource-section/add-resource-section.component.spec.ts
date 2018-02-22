/*import addResourceSection from './index';

//type Test = atlas.test.IComponentTest<AddResourceSectionController, {}, {}>;

describe('Component: AddResourceSectionComponent:', () => {
  let $componentController, $state, $scope, $q, HybridServicesClusterService, HybridServicesExtrasService,
    MediaServiceActivationV2, MediaClusterServiceV2;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(angular.mock.module('addResourceSection'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$state_, _$q_, $rootScope, _HybridServicesClusterService_, _HybridServicesExtrasService_,_MediaServiceActivationV2_,_MediaClusterServiceV2_) {
    $componentController = _$componentController_;
    $state = _$state_;
    $q = _$q_;
    $scope = $rootScope.$new();
    HybridServicesClusterService = _HybridServicesClusterService_;
    HybridServicesExtrasService = _HybridServicesExtrasService_;
    MediaServiceActivationV2 = _MediaServiceActivationV2_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
  }

  function cleanup() {
    $componentController = $scope = $q = HybridServicesClusterService = MediaServiceActivationV2 = MediaClusterServiceV2 = undefined;
  }

  function initSpies() {
    const clusters = [{
      id: 'a050fcc7-9ade-4790-a06d-cca596910421',
      name: 'MFA_TEST2',
      targetType: 'mf_mgmt',
      connectors: [{
        state: 'running',
        hostname: 'doesnothavecalendar.example.org',
      }],
    }];
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve(
      clusters,
    ));
    spyOn(HybridServicesClusterService, 'preregisterCluster').and.returnValue($q.resolve({
      id: '12345',
    }));
    spyOn(this.HybridServicesExtrasService, 'addPreregisteredClusterToAllowList').and.returnValue(this.$q.resolve({}));
    spyOn(MediaServiceActivationV2, 'enableMediaService');
    spyOn(MediaServiceActivationV2, 'enableMediaServiceEntitlements');
    spyOn(MediaClusterServiceV2, 'getPropertySets').and.returnValue($q.resolve({
      data: {
        propertySets: [],
      },
    }));
    //spyOn(MediaClusterServiceV2, 'createPropertySet').and.returnValue($q.resolve(respnse));
    //spyOn(MediaClusterServiceV2, 'updatePropertySetById').and.returnValue($q.resolve(respnse));
  };

  /*describe('primary behaviors (view):', () => {
    it('...', function (this: Test) {
      // TODO: implement
    });
  });

  describe('primary behaviors (controller):', () => {
    it('...', function (this: Test) {
      // TODO: implement
    });
  });
});*/

