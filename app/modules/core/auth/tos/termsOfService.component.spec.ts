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
    spyOn(this.Auth, 'logout').and.callFake(_.noop);
    spyOn(this.$state, 'go').and.callFake(_.noop);
    spyOn(this.$modal, 'open').and.returnValue(true);
    spyOn(this.TOSService, 'dismissModal').and.callFake(_.noop);
    spyOn(this.TOSService, 'acceptTOS').and.returnValue(this.$q.when());
    spyOn(this.TOSService, 'hasAcceptedTOS').and.returnValue(false);
    this.$window.frames['tos-frame'] = {
      document: document.implementation.createHTMLDocument('tos-frame'),
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

    it('should have content in the ToS iframe', function () {
      let iframeDoc = <Document>this.$window.frames['tos-frame'].document;
      let iframe = $(iframeDoc);
      expect(iframe.find('.heading img')).toExist();
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

    it('should disable decline button and show accept as loading button after accepting while waiting for acceptTOS to complete', function () {
      this.controller.hasReadAggreement = true;
      this.$scope.$apply();
      let acceptBtn = this.view.find(AGREE_BTN);
      let disagreeBtn = this.view.find(DISAGREE_BTN);

      expect(acceptBtn).not.toBeDisabled();
      expect(disagreeBtn).not.toBeDisabled();

      this.controller.acceptingToS = true;
      this.$scope.$apply();

      expect(acceptBtn).toBeDisabled();
      expect(disagreeBtn).toBeDisabled();
    });

    // note - this test does not work in PhantomJS :(
    xit('should only enable Accept button when user has scrolled to bottom of ToS', function () {
      let btn = this.view.find(AGREE_BTN);

      expect(this.controller.hasReadAggreement).toBeFalsy();
      expect(btn).toBeDisabled();

      // trigger a scroll event to recalc if we have scrolled to the bottom
      // since iframe container height will be bigger then the content height (0),
      // this acts as if the user scrolled to the bottom of the ToS
      this.view.find('.tos-container').height(500);
      let frame = this.$window.frames['tos-frame'];
      let iframeDoc = <Document>frame.document;
      let scrollEvent = iframeDoc.createEvent('CustomEvent'); // MUST be 'CustomEvent'
      scrollEvent.initCustomEvent('scroll', false, false, null);
      iframeDoc.dispatchEvent(scrollEvent);

      expect(this.controller.hasReadAggreement).toBeTruthy();
      expect(btn).not.toBeDisabled();

    });
  });
});
