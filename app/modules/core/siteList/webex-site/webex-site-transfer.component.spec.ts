import module from './index';
describe('Component: WebexSiteTransferComponent', function () {
  const transferCodeResponse = {
    siteList: [{
      siteUrl: 'abc.dmz.webex.com',
      timezone: '1',
    }],
  };

  beforeEach(function () {
    this.initModules(module);
    this.injectDependencies('$componentController', '$q', '$rootScope', '$scope', 'Notification', 'SetupWizardService');
    this.$scope.fixtures = {
      introCopy: 'some Copy',
      currentSubscription: 'sub123',
    };

    initSpies.apply(this);

    this.compileComponent('webexSiteTransfer', {
      currentSubscription: 'fixtures.currentSubscription',
      introCopy: 'fixtures.introCopy',
      onValidationStatusChange: 'onValidationChangedFn(isValid)',
      onSitesReceived: 'onSitesReceivedFn(sites, transferCode, isValid)',
    });
  });

  function initSpies() {
    this.$scope.onValidationChangedFn = jasmine.createSpy('onValidationChangedFn');
    this.$scope.onSitesReceivedFn = jasmine.createSpy('onSitesReceivedFn');
    spyOn(this.SetupWizardService, 'validateTransferCodeBySubscriptionId').and.returnValue(this.$q.resolve({ data: transferCodeResponse } ));
    spyOn(this.SetupWizardService, 'validateTransferCode').and.returnValue(this.$q.resolve({ data: transferCodeResponse } ));
    spyOn(this.SetupWizardService, 'validateTransferCodeDecorator').and.callThrough();
    spyOn(this.Notification, 'errorWithTrackingId');
  }

  describe('When first opened', () => {
    it('shoud have unchecked transfer code input and other hidden', function () {
      expect(_.includes(this.view[0].innerHTML, 'some Copy')).toBe(true);
      expect(this.view.find('input#has-transfer-code')[0].checked).toBeFalsy();
      expect(this.view.find('input').length).toBe(1);
    });

    it('should display transfer code inputs when transfer code checkbox checked', function () {
      $(this.view.find('input#has-transfer-code')).click().trigger('change');
      this.$scope.$digest();
      expect(this.view.find('input').length).toBe(3);
    });
  });

  describe('data validation', () => {
    beforeEach(function () {
      $(this.view.find('input#has-transfer-code')).click().trigger('change');
      this.$scope.$digest();
    });

    it('should send the validation callback with FALSE if either transferSiteUrl or transferSiteCode is not empty and TRUE if both are filled in or empty', function () {
      this.controller.transferSiteCode = '123';
      this.controller.siteTransferUrl = '';
      this.controller.checkValidTransferData();
      expect(this.$scope.onValidationChangedFn).toHaveBeenCalledWith(false);
      this.controller.transferSiteCode = '';
      this.controller.checkValidTransferData();
      expect(this.$scope.onValidationChangedFn).toHaveBeenCalledWith(true);
      this.controller.siteTransferUrl = 'www';
      this.controller.transferSiteCode = '123';
      this.controller.checkValidTransferData();
      expect(this.$scope.onValidationChangedFn).toHaveBeenCalledWith(true);
    });
  });

  describe('when validation function is called', () => {
    beforeEach(function () {
      this.controller.showTransferCodeInput = true;
      this.controller.transferSiteUrl = 'mywebexsite.webex.com';
      this.controller.transferSiteCode = '12345678';
      this.controller.currentSubscription = 'sub123';
      this.$scope.$apply();
      this.controller.sitesArray = [];
    });

    it('should call SetupWizardService.validateTransferCodeBySubscriptionId() when there is a subscription', function () {
      this.controller.processNext();
      this.$scope.$digest();
      expect(this.SetupWizardService.validateTransferCodeBySubscriptionId).toHaveBeenCalledWith({
        siteUrl: 'mywebexsite.webex.com',
        transferCode: '12345678',
      }, 'sub123', undefined);
      expect(this.SetupWizardService.validateTransferCode).not.toHaveBeenCalled();
    });
    it('should call SetupWizardService.validateTransferCode() when there is no subscription', function () {
      this.controller.currentSubscription = null;
      this.controller.processNext();
      this.$scope.$digest();
      expect(this.SetupWizardService.validateTransferCodeBySubscriptionId).not.toHaveBeenCalled();
      expect(this.SetupWizardService.validateTransferCode).toHaveBeenCalledWith({
        siteUrl: 'mywebexsite.webex.com',
        transferCode: '12345678',
      });
    });

    it('should pass the returned sites in the callback function when the code is valid', function () {
      this.controller.processNext();
      this.$scope.$digest();
      expect(this.SetupWizardService.validateTransferCodeBySubscriptionId).toHaveBeenCalledWith({
        siteUrl: 'mywebexsite.webex.com',
        transferCode: '12345678',
      }, 'sub123', undefined);
      expect(this.controller.sitesArray.length).toBe(1);
      expect(this.controller.sitesArray[0].setupType).toBe('TRANSFER');
      expect(this.$scope.onSitesReceivedFn).toHaveBeenCalledWith(this.controller.sitesArray, this.controller.transferSiteCode, true);
    });

    it('should call the callback function with no sites and the last argument false when code is invalid', function () {
      this.SetupWizardService.validateTransferCodeBySubscriptionId.and.returnValue(this.$q.resolve({ data: { status: 'INVALID' } }));
      this.controller.processNext();
      this.$scope.$digest();
      expect(this.SetupWizardService.validateTransferCodeBySubscriptionId).toHaveBeenCalledWith({
        siteUrl: 'mywebexsite.webex.com',
        transferCode: '12345678',
      }, 'sub123', undefined);
      expect(this.controller.sitesArray.length).toBe(0);
      expect(this.$scope.onSitesReceivedFn).toHaveBeenCalledWith(null, null, false);
    });

    it('should display a notification error if api returns an error with no matching error code', function () {
      const rejectResponse = {
        data: { status: 400, errorCode: null },
      };
      this.SetupWizardService.validateTransferCodeBySubscriptionId.and.returnValue(this.$q.reject(rejectResponse));
      this.controller.processNext();
      this.$scope.$digest();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(rejectResponse, 'firstTimeWizard.transferCodeError');
    });

    it('should display a "site invalid" error by the input if the error code equals 400304', function () {
      const rejectResponse = {
        data: { status: 400, errorCode: 400304 },
      };
      this.SetupWizardService.validateTransferCodeBySubscriptionId.and.returnValue(this.$q.reject(rejectResponse));
      this.controller.processNext();
      this.$scope.$digest();
      expect(this.controller.error.errorMsg).toBe('firstTimeWizard.transferCodeInvalidSite');
    });

    it('should display a "code invalid" error by the input if the error code equals 400303', function () {
      const rejectResponse = {
        data: { status: 400, errorCode: 400303 },
      };
      this.SetupWizardService.validateTransferCodeBySubscriptionId.and.returnValue(this.$q.reject(rejectResponse));
      this.controller.processNext();
      this.$scope.$digest();
      expect(this.controller.error.errorMsg).toBe('firstTimeWizard.transferCodeInvalidError');
    });
  });
});
