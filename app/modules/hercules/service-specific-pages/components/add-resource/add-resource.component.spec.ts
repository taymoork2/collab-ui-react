describe('Component: addHybridResourceButton ', () => {

  let $componentController, $modal, $q, ctrl, $rootScope;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$modal_, _$q_, _$rootScope_) {
    $componentController = _$componentController_;
    $modal = _$modal_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }

  function cleanup() {
    $componentController = $modal = $q = ctrl = undefined;
  }

  function initSpies() {
    spyOn($modal, 'open').and.returnValue({
      result: {
        finally: () => {
        },
      },
    });
  }

  function initController(isPartnerAdmin: boolean) {
    ctrl = $componentController('addHybridResourceButton', {
      Authinfo: {
        isCustomerLaunchedFromPartner: () => isPartnerAdmin,
      },
    });
    ctrl.allowPartnerRegistration = true;
  }

  it ('should launch the provided modal window when the user is a customer admin', () => {
    initController(false );
    ctrl.$onInit();
    $rootScope.$apply();
    ctrl.modalWindowOptions = {
      template: '<div>example template</div>',
    };
    ctrl.openAddResourceModal();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(ctrl.modalWindowOptions));
  });

  it ('should launch the provided modal window if the user is partner admin logged into a customer org', () => {
    initController(true );
    ctrl.$onInit();
    $rootScope.$apply();
    ctrl.modalWindowOptions = {
      template: '<div>example template</div>',
    };
    ctrl.openAddResourceModal();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(ctrl.modalWindowOptions));
  });

});
