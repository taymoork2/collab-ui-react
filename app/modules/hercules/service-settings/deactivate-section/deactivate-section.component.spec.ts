import deactivateSection from './deactivate-section.component';

describe('Component: DeactivateSection ', () => {

  let $componentController, $scope, $state, $q;

  beforeEach(function () {
    this.initModules(deactivateSection);
  });

  beforeEach(inject(function (_$componentController_, _$state_, $rootScope, _$q_) {
    $componentController = _$componentController_;
    $state = _$state_;
    $scope = $rootScope.$new();
    $q = _$q_;
  }));

  it('redirects to the services overview page when the admin has confirmed deletion', () => {

    let MockModalService = {
      open: () => {
        return {
          result: $q.resolve(true),
        };
      },
    };
    spyOn($state, 'go');

    let ctrl = $componentController('deactivateSection', {
      $modal: MockModalService,
      $state: $state,
    });

    ctrl.confirmDisable();
    $scope.$apply();
    expect($state.go).toHaveBeenCalledWith('services-overview');

  });

});
