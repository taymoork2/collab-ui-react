import testModule from './index';

describe('Componenent: deleteExternalNumber', () => {
  const CANCEL_BUTTON = '#cancelButton';
  const DELETE_BUTTON = 'button.btn.btn--negative';
  const ORG_ID = '12345';
  const EXTERNAL_NUMBER = '15679021234';

  const numberInfo = {
    orgId: ORG_ID,
    externalNumber: EXTERNAL_NUMBER,
    apiImplementation: 'INTELEPEER',
  };

  beforeEach(function() {
    this.initModules(testModule);
    this.injectDependencies(
      '$scope',
      '$q',
      '$translate',
      'Notification',
      'ExternalNumberService',
    );

    this.$scope.dismiss = jasmine.createSpy('dismiss');
    this.$scope.refreshFn = jasmine.createSpy('refreshFn');

    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorResponse');
  });

  function initComponent() {
    this.$scope.numberInfo = _.cloneDeep(numberInfo);

    this.compileComponent('deleteExternalNumber', {
      numberInfo: 'numberInfo',
      refreshFn: 'refreshFn()',
      dismiss: 'dismiss()',
    });

    this.$scope.$apply();
  }

  describe('after modal launched', function () {
    beforeEach(initComponent);

    it('should have cancel and delete number buttons', function () {
      expect(this.view.find(CANCEL_BUTTON)).toExist();
      expect(this.view.find(DELETE_BUTTON)).toExist();
    });

    it('should have correct warning message if the pstn carrier is not BYOP', function() {
      expect(this.controller.deleteConfirmationMessage).toBe(this.$translate.instant('linesPage.deleteNumberTextBase',
        { isApiImplementationSwivel: 'linesPage.deleteNumberTextStandard' }));
    });

    it('should not call Delete API if cancel on Modal', function () {
      spyOn(this.ExternalNumberService, 'deleteNumber');
      this.view.find(CANCEL_BUTTON).click();
      expect(this.ExternalNumberService.deleteNumber).not.toHaveBeenCalled();
      expect(this.Notification.errorResponse).not.toHaveBeenCalled();
      expect(this.$scope.dismiss).toHaveBeenCalled();
    });

    it('should call Delete API if confirm delete on Modal', function () {
      spyOn(this.ExternalNumberService, 'deleteNumber').and.returnValue(this.$q.resolve(true));
      this.view.find(DELETE_BUTTON).click();
      expect(this.ExternalNumberService.deleteNumber).toHaveBeenCalledWith(ORG_ID, { number: EXTERNAL_NUMBER, uuid: null });
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.$scope.refreshFn).toHaveBeenCalled();
      expect(this.$scope.dismiss).toHaveBeenCalled();
    });

    it('should notify error if delete fails', function () {
      spyOn(this.ExternalNumberService, 'deleteNumber').and.returnValue(this.$q.reject());
      this.view.find(DELETE_BUTTON).click();
      expect(this.ExternalNumberService.deleteNumber).toHaveBeenCalledWith(ORG_ID, { number: EXTERNAL_NUMBER, uuid: null });
      expect(this.Notification.errorResponse).toHaveBeenCalled();
      expect(this.$scope.dismiss).toHaveBeenCalled();
    });
  });

  describe('carrier is BYOP', function () {
    it('should have correct warning message if the pstn carrier is BYOP', function() {
      this.$scope.numberInfo = _.cloneDeep(numberInfo);
      this.$scope.numberInfo.apiImplementation = 'SWIVEL';

      this.compileComponent('deleteExternalNumber', {
        numberInfo: 'numberInfo',
        refreshFn: 'refreshFn()',
        dismiss: 'dismiss()',
      });
      this.$scope.$apply();

      expect(this.controller.deleteConfirmationMessage).toBe(this.$translate.instant('linesPage.deleteNumberTextBase',
        { isApiImplementationSwivel: 'linesPage.deleteNumberTextBYOP' }));
    });
  });

});
