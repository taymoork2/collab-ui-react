describe('Component: addHybridResourceButton ', () => {

  let $componentController, $modal, $q, ctrl;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$modal_, _$q_) {
    $componentController = _$componentController_;
    $modal = _$modal_;
    $q = _$q_;
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

  function initController(isPartnerAdmin: boolean, hasPartnerRegistrationFeatureToggle: boolean) {
    ctrl = $componentController('addHybridResourceButton', {
      Authinfo: {
        isCustomerLaunchedFromPartner: () => isPartnerAdmin,
      },
      FeatureToggleService: {
        supports: () => $q(hasPartnerRegistrationFeatureToggle),
      },
    });
  }

  it ('should launch the provided modal window when the user is a customer admin', () => {
    initController(false, false);
    ctrl.$onInit();
    ctrl.modalWindowOptions = {
      templateUrl: 'example/path/to/template',
    };
    ctrl.openAddResourceModal();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(ctrl.modalWindowOptions));
  });

  it ('should launch a different modal if the user is partner admin logged into a customer org', () => {
    initController(true, false);
    ctrl.$onInit();
    ctrl.openAddResourceModal();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
      templateUrl: 'modules/hercules/service-specific-pages/components/add-resource/partnerAdminWarning.html',
      type: 'dialog',
    }));
  });

  it ('should launch the provided modal window if the user is partner admin logged into a customer org and has the feature toggle', () => {
    initController(true, true);
    ctrl.$onInit();
    ctrl.modalWindowOptions = {
      templateUrl: 'example/path/to/template',
    };
    ctrl.openAddResourceModal();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(ctrl.modalWindowOptions));
  });

});
