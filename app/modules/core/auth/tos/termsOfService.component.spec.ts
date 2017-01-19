import tosModule from './index';

describe('TermsOfService', () => {

  beforeEach(function () {
    this.initModules(tosModule);
    this.injectDependencies(
      '$httpBackend',
      '$state',
      'Auth',
      'TOSService',
      '$q',
      '$window',
      '$scope',
      '$modal',
    );
    initDependencySpies.apply(this);
    initComponent.apply(this);

    installPromiseMatchers();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function initDependencySpies() {
    spyOn(this.Auth, 'logout').and.callFake(angular.noop);
    spyOn(this.$state, 'go').and.callFake(angular.noop);
    spyOn(this.$modal, 'open').and.returnValue(true);
    spyOn(this.TOSService, 'dismissModal').and.callFake(angular.noop);
    spyOn(this.TOSService, 'acceptTOS').and.returnValue(this.$q.when());
    spyOn(this.TOSService, 'hasAcceptedTOS').and.returnValue(false);
    this.$window.frames['tos-frame'] = {
      document: '<html><head><body></body></head></html>',
    };
  }

  function initComponent() {
    this.compileComponent('termsOfService', {});
  }

  ////////////////

  describe('Controller', function () {

    describe('agree()', function () {

      it('should record the ToS agreement ', function () {
        let promise = this.controller.agree();
        promise
          .then(() => {
            expect(this.TOSService.dismissModal).toHaveBeenCalled();
            expect(this.$state.go).toHaveBeenCalledWith('login', Object({}), Object({ reload: true }));
          });
        expect(promise).toBeResolved();
      });

    });

    describe('disagree()', function () {

      it('should log out', function () {
        this.controller.disagree();
        expect(this.Auth.logout).toHaveBeenCalled();
        expect(this.$modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
          template: '<h1 translate="termsOfService.loggingOut"></h1>',
          backdrop: 'static',
          keyboard: false,
          type: 'dialog',
        }));
      });

    });
  });

  ///////////////////

  describe('Component', function () {

    const AGREE_BTN = 'button.btn--primary';
    const AGREE_BTN_TEXT = 'span[translate="termsOfService.disagree"]';
    const DISAGREE_BTN = 'button.btn--default';
    const DISAGREE_BTN_TEXT = 'span[translate="termsOfService.agree"]';

    beforeEach(function () {
      spyOn(this.controller, 'agree');
      spyOn(this.controller, 'disagree');
    });

    it('should have Agree and Disagree buttons', function () {
      expect(this.view.find(DISAGREE_BTN).find(AGREE_BTN_TEXT)).toHaveLength(1);
      expect(this.view.find(AGREE_BTN).find(DISAGREE_BTN_TEXT)).toHaveLength(1);
    });

    it('should call $ctrl.disagree when disagree button is pressed', function () {
      let btn = this.view.find(DISAGREE_BTN);
      btn.click();
      expect(this.controller.disagree).toHaveBeenCalled();
    });

    it('should disable agree button when $ctrl.hasReadAggreement is false', function () {
      this.controller.hasReadAggreement = false;
      this.$scope.$apply();

      let btn = this.view.find(AGREE_BTN);
      expect(btn).toBeDisabled();
      expect(this.controller.agree).not.toHaveBeenCalled();
    });

    it('should call $ctrl.agree when $ctrl.hasReadAggreement is true and agree button clicked', function () {
      this.controller.hasReadAggreement = true;
      this.$scope.$apply();

      let btn = this.view.find(AGREE_BTN);
      expect(btn).not.toBeDisabled();
      btn.click();
      expect(this.controller.agree).toHaveBeenCalled();
    });
  });
});
