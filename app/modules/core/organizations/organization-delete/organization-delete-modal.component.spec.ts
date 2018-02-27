import organizationDeleteModule from './index';

describe('Component: organizationDeleteModal', () => {
  const DELETE_BUTTON = '.btn.btn--negative';
  const CANCEL_BUTTON = '.btn.btn--default';

  beforeEach(function () {
    this.initModules(organizationDeleteModule);
    this.injectDependencies(
      '$modal',
      '$q',
      '$scope',
      'Auth',
      'Authinfo',
      'Notification',
      'Orgservice',
    );
    spyOn(this.Auth, 'logout');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorResponse');
  });

  beforeEach(function () {
    this.compileComponent('organizationDeleteModal', {});
  });

  describe('successful deletion', () => {
    beforeEach(function () {
      spyOn(this.Orgservice, 'deleteOrg').and.returnValue(this.$q.resolve({ status: 200 }));
    });

    xit('should show success notification after successful deletion', function () {
      this.view.find(DELETE_BUTTON).click();
      this.$scope.$apply();

      expect(this.Orgservice.deleteOrg).toHaveBeenCalled();
      expect(this.state).toHaveBeenCalled();
    });

    xit('should log out after successful deletion', function () {
      this.view.find(DELETE_BUTTON).click();
      this.$scope.$apply();

      expect(this.Orgservice.deleteOrg).toHaveBeenCalled();
      expect(this.Auth.logout).toHaveBeenCalled();
    });
  });

  describe('deletion failure', () => {
    beforeEach(function () {
      spyOn(this.Orgservice, 'deleteOrg').and.returnValue(this.$q.reject({ status: 404 }));
    });

    it('should show failure notification after failed deletion', function () {
      this.view.find(DELETE_BUTTON).click();
      this.$scope.$apply();

      expect(this.Orgservice.deleteOrg).toHaveBeenCalled();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('should not log out after failed deletion', function () {
      this.view.find(DELETE_BUTTON).click();
      this.$scope.$apply();

      expect(this.Orgservice.deleteOrg).toHaveBeenCalled();
      expect(this.Auth.logout).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    beforeEach(function () {
      spyOn(this.Orgservice, 'deleteOrg');
    });

    it('should show failure notification after failed deletion', function () {
      this.view.find(CANCEL_BUTTON).click();
      this.$scope.$apply();

      expect(this.Orgservice.deleteOrg).not.toHaveBeenCalled();
    });
  });
});
