import esaDisclaimerModule from './index';
import { ESA_DISCLAIMER_ACCEPT } from '../pstn.const';

describe('Component: esaDisclaimerComponent', () => {
  const ORG_ID = '222-555-6543';
  const USER_ID = '333-444-5678';

  beforeEach(function() {
    this.initModules(esaDisclaimerModule);
    this.injectDependencies(
      'Authinfo',
      '$rootScope',
      '$scope',
      'HuronConfig',
      '$httpBackend',
      'Notification',
    );
    initDependencySpies.apply(this);
    installPromiseMatchers();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function initDependencySpies() {
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(ORG_ID);
    spyOn(this.Authinfo, 'getUserId').and.returnValue(USER_ID);
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.$rootScope, '$broadcast').and.callThrough();
    this.$scope.onDismiss = jasmine.createSpy('onDismiss');
  }

  function initComponent() {
    this.compileComponent('ucEsaDisclaimer', { onDismiss: 'onDismiss()' });
  }

  describe('Controller', () => {
    beforeEach(function() {
      initComponent.apply(this);
    });

    it('should call Terminus Customer PUT API on Agree', function () {
      let putPayload = { e911Signee : USER_ID };
      this.$httpBackend.expectPUT(this.HuronConfig.getTerminusUrl() + '/customers/' + ORG_ID, putPayload).respond(200);
      let promise = this.controller.onAgreeClick();

      promise.then(() => {
        expect(this.$rootScope.$broadcast).toHaveBeenCalledWith(ESA_DISCLAIMER_ACCEPT);
        expect(this.$scope.onDismiss).toHaveBeenCalled();
        expect(this.Notification.errorResponse).not.toHaveBeenCalled();
      });

      expect(promise).toBeResolved();
    });

    it('should notify error if Terminus Customer PUT call returns error', function () {
      let putPayload = { e911Signee : USER_ID };
      this.$httpBackend.expectPUT(this.HuronConfig.getTerminusUrl() + '/customers/' + ORG_ID, putPayload).respond(500);
      let promise = this.controller.onAgreeClick();

      promise.then(() => {
        expect(this.$rootScope.$broadcast).not.toHaveBeenCalledWith();
        expect(this.$scope.onDismiss).toHaveBeenCalled();
        expect(this.Notification.errorResponse).toHaveBeenCalled();
      });

      expect(promise).toBeResolved();
    });

    it('should not call Terminus Customer PUT if cancel button is clicked', function () {
      this.controller.onDismissClick();

      expect(this.$scope.onDismiss).toHaveBeenCalled();
      expect(this.$rootScope.$broadcast).not.toHaveBeenCalledWith();
      expect(this.Notification.errorResponse).not.toHaveBeenCalled();
    });
  });

});
