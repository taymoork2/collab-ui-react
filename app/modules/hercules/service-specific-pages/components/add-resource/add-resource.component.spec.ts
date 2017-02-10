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

  function initController(isPartnerAdmin: boolean) {
    ctrl = $componentController('addHybridResourceButton', {
      Authinfo: {
        isCustomerLaunchedFromPartner: () => isPartnerAdmin,
      },
    });
  }

  it ('should launch the provided modal window when the user is a customer admin', () => {
    initController(false);
    ctrl.$onInit();
    ctrl.modalWindowOptions = {
      templateUrl: 'example/path/to/template',
    };
    ctrl.openAddResourceModal();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(ctrl.modalWindowOptions));
  });

  it ('should launch a different modal if the user is partner admin logged into a customer org', () => {
    initController(true);
    ctrl.$onInit();
    ctrl.openAddResourceModal();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
      templateUrl: 'modules/hercules/service-specific-pages/components/add-resource/partnerAdminWarning.html',
      type: 'dialog',
    }));
  });

});
