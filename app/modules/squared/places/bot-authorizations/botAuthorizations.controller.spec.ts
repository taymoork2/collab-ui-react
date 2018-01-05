describe('Controller: BotAuthorizationsController', () => {

  let $controller, controller, AuthorizationService, DirectoryService, $q, scope, Notification, $translate;

  function initController() {
    controller = $controller('BotAuthorizationsController', {
      accountId: 'cisUuid',
      ownerType: 'place',
      accountDisplayName: 'displayName',
      $q: $q,
      AuthorizationService: AuthorizationService,
      DirectoryService: DirectoryService,
      Notification: Notification,
      $translate: $translate,
    });
    scope.$digest();
  }
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Squared'));
  beforeEach(inject((_$q_,
                     _$controller_,
                     _AuthorizationService_,
                     _DirectoryService_,
                     _Notification_,
                     _$translate_, _$rootScope_) => {
    $q = _$q_;
    $controller = _$controller_;
    AuthorizationService = _AuthorizationService_;
    DirectoryService = _DirectoryService_;
    Notification = _Notification_;
    $translate = _$translate_;
    scope = _$rootScope_;
  }));

  beforeEach(() => {
    spyOn(AuthorizationService, 'getRoles').and.returnValue($q.resolve([{ id: 'x', name: 'role' }]));
    spyOn(AuthorizationService, 'getRoleName').and.returnValue($q.resolve('role'));
    spyOn(DirectoryService, 'getAccount').and.returnValue($q.resolve({ type: 'MACHINE', name: 'account' }));
  });

  describe('no authorizations', () => {
    beforeEach(() => {
      spyOn(AuthorizationService, 'getAuthorizations').and.returnValue($q.resolve([]));
      initController();
    });

    it('should show no authorizations.', () => {
      expect(controller.showNoResults()).toBeTruthy();
    });
  });

  describe('with authorizations', () => {
    beforeEach(() => {
      const authorizations = [
        { id: '1', subject: { id: '1', grant: { id: '1' }, target: { id: '1' } } },
        { id: '2', subject: { id: '2', grant: { id: '2' }, target: { id: '2' } } },
      ];
      spyOn(AuthorizationService, 'getAuthorizations').and.returnValue($q.resolve(authorizations));
      initController();
    });

    describe('list authorizations', () => {
      it('should show result', () => {
        expect(controller.showResults()).toBe(true);
      });
      it('should show two authorizations.', () => {
        expect(controller.authorizations.length).toBe(2);
      });
      it('should show add button', () => {
        expect(controller.showAdd()).toBe(true);
      });
      it('should not show add row', () => {
        expect(controller.isCollapsed).toBe(true);
      });
    });

    describe('add authorization', () => {
      beforeEach(() => {
        controller.startAdding();
      });
      it('should show add row', () => {
        expect(controller.isCollapsed).toBe(false);
      });
      it('should not show add button', () => {
        expect(controller.showAdd()).toBe(false);
      });
    });

    describe('cancel add authorization', () => {
      beforeEach(() => {
        controller.startAdding();
        controller.cancelAdding();
      });
      it('should not show add row', () => {
        expect(controller.isCollapsed).toBe(true);
      });
      it('should show add button', () => {
        expect(controller.showAdd()).toBe(true);
      });
    });

    describe('delete authorization', () => {
      it('should show one authorization.', () => {
        controller.delete('1').then(() => {
          expect(controller.authorizations.length).toBe(1);
        });
      });
    });
  });
});
