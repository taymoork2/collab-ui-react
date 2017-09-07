'use strict';

describe('UserManageEmailSuppressController', function () {
  ///////////////////

  function init() {
    this.initModules('Core');
    this.injectDependencies('$scope', '$stateParams', '$controller', 'Analytics', 'Orgservice', '$q');

    this.$state = {
      modal: {
        dismiss: jasmine.createSpy('dismiss').and.returnValue(true),
      },
      go: jasmine.createSpy('go'),
    };

    spyOn(this.Analytics, 'trackAddUsers');
  }

  function initController() {
    this.controller = this.$controller('UserManageEmailSuppressController', {
      $scope: this.$scope,
      $state: this.$state,
      $stateParams: this.$stateParams,
      Analytics: this.Analytics,
      Orgservice: this.Orgservice,
    });
    this.$scope.$apply();
  }

  function initSpies() {
    this.mock = {};
    this.mock.adminOrg = {
      success: true,
      data: {
        isOnBoardingEmailSuppressed: true,
        licenses: [{
          licenseId: 'CO_1234',
        }],
      },
    };
    spyOn(this.Orgservice, 'getAdminOrgAsPromise').and.returnValue(this.$q.resolve(this.mock.adminOrg));

    initController.apply(this);
  }

  beforeEach(init);

  it('should init with expected responses and default values', function () {
    this.$stateParams.manageType = 'manual';
    this.$stateParams.prevState = 'users.manage.org';
    initSpies.apply(this);

    expect(this.controller.isEmailSuppressed).toBeTruthy();
    expect(this.controller.isSparkCallEnabled).toBeTruthy();
    expect(this.controller.dataLoaded).toBeTruthy();
  });

  it('should cancel modal', function () {
    this.$stateParams.manageType = 'manual';
    this.$stateParams.prevState = 'users.manage.org';
    initSpies.apply(this);

    expect(this.$state.modal.dismiss).toHaveBeenCalledTimes(0);
    this.controller.cancelModal();
    expect(this.$state.modal.dismiss).toHaveBeenCalledTimes(1);
    expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
  });

  it('should go to users.add on next', function () {
    this.$stateParams.manageType = 'manual';
    this.$stateParams.prevState = 'users.manage.org';
    initSpies.apply(this);

    this.controller.onNext();
    expect(this.$state.go).toHaveBeenCalledWith('users.add');
    expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.NEXT, this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL);
  });

  it('should go to users.manage.org on back', function () {
    this.$stateParams.manageType = 'manual';
    this.$stateParams.prevState = 'users.manage.org';
    initSpies.apply(this);

    this.controller.onBack();
    expect(this.$state.go).toHaveBeenCalledWith('users.manage.org');
  });
});
