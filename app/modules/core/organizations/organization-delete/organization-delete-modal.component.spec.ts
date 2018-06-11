import organizationDeleteModule from './index';

describe('Component: organizationDeleteModal', () => {
  const DELETE_BUTTON = '#deleteButton';
  const CONTINUE_BUTTON = '#continueButton';
  const BACK_BUTTON = '#backButton';
  const ORG_ID = '12345';
  const DELETE_STATUS_URL = 'https://atlas.webex.com/admin/api/v1/organizations/123/deleteTasks/456';

  beforeEach(function () {
    this.initModules(organizationDeleteModule);
    this.injectDependencies(
      '$controller',
      '$httpBackend',
      '$modal',
      '$rootScope',
      '$q',
      '$scope',
      'Analytics',
      'Auth',
      'Authinfo',
      'Notification',
      'OrganizationDeleteService',
      'UrlConfig',
    );
    this.userCountUrl = this.UrlConfig.getAdminServiceUrl() + 'organizations/12345/users';
    initSpies.call(this);
    initComponent.call(this);
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function initSpies() {
    spyOn(this.Auth, 'logout');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(ORG_ID);
    spyOn(this.Authinfo, 'isOnlineCustomer').and.returnValue(true);
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.Analytics, 'trackEvent');

    this.$httpBackend.expectGET(this.userCountUrl).respond(200, {
      totalResults: 1,
    });
  }

  function initComponent() {
    this.compileComponent('organizationDeleteModal', {
      l10nTitle: 'Delete Account',
    });
  }

  describe('select action to perform on users', () => {
    it('should show the single-user-move text', function () {
      this.controller.action = this.controller.actions.MOVE;
      this.view.find(CONTINUE_BUTTON).click();
      this.$httpBackend.flush();

      expect(this.controller.checkBoxText = this.controller.checkBoxTextList.onlineSingleUserMove);
      expect(this.controller.state).toBe(this.controller.states.DELETE_ORG);
    });

    it('should show the multi-user-delete text', function () {
      this.$httpBackend.expectGET(this.userCountUrl).respond(200, {
        totalResults: 2,
      });
      initComponent.call(this);
      this.controller.action = this.controller.actions.DELETE;
      this.view.find(CONTINUE_BUTTON).click();
      this.$httpBackend.flush();

      expect(this.controller.checkBoxText = this.controller.checkBoxTextList.onlineMultiUserDelete);
      expect(this.controller.state).toBe(this.controller.states.DELETE_ORG);
    });
  });

  describe('click Back button after selecting the user action', () => {
    it('should move back to the first step', function () {
      this.controller.state = this.controller.states.DELETE_ORG;
      this.controller.action = this.controller.actions.MOVE;
      this.view.find(BACK_BUTTON).click();
      this.$httpBackend.flush();

      expect(this.controller.state).toBe(this.controller.states.USER_ACTION);
    });
  });

  describe('successful deletion', () => {
    beforeEach(function () {
      spyOn(this.OrganizationDeleteService, 'deleteOrg').and.returnValue(this.$q.resolve(DELETE_STATUS_URL));
      spyOn(this.OrganizationDeleteService, 'verifyOrgDelete').and.returnValue(this.$q.resolve());
      spyOn(this.controller, 'openAccountClosedModal');
      spyOn(this.controller, 'deleteOrgSuccess').and.callThrough();
    });

    it('should open the Account Closed modal after successful deletion', function () {
      this.controller.action = this.controller.actions.MOVE;
      this.view.find(DELETE_BUTTON).click();
      this.$httpBackend.flush();

      expect(this.controller.openAccountClosedModal).toHaveBeenCalled();
    });

    it('should verify delete status with location url', function () {
      this.view.find(DELETE_BUTTON).click();
      this.$httpBackend.flush();

      expect(this.OrganizationDeleteService.verifyOrgDelete).toHaveBeenCalledWith(DELETE_STATUS_URL);
      expect(this.controller.deleteOrgSuccess).toHaveBeenCalled();
    });
  });

  describe('deletion failure', () => {
    beforeEach(function () {
      spyOn(this.OrganizationDeleteService, 'deleteOrg').and.returnValue(this.$q.resolve(DELETE_STATUS_URL));
      spyOn(this.OrganizationDeleteService, 'verifyOrgDelete').and.returnValue(this.$q.reject());
      spyOn(this.controller, 'openAccountClosedModal');
    });

    it('should show failure notification on failed delete verification', function () {
      this.view.find(DELETE_BUTTON).click();
      this.$httpBackend.flush();

      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('should show failure notification on failed org deletion', function () {
      this.OrganizationDeleteService.deleteOrg.and.returnValue(this.$q.reject(''));
      this.view.find(DELETE_BUTTON).click();
      this.$httpBackend.flush();

      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('should not open the Account Closed modal after failed deletion', function () {
      this.view.find(DELETE_BUTTON).click();
      this.$httpBackend.flush();

      expect(this.controller.openAccountClosedModal).not.toHaveBeenCalled();
    });

  });
});
