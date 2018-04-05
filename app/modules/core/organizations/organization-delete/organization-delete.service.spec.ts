import organizationDeleteModule from './index';

describe('Service: OrganizationDeleteService', () => {

  beforeEach(function () {
    this.initModules(organizationDeleteModule);
    this.injectDependencies(
      '$modal',
      '$q',
      'Authinfo',
      'DirSyncService',
      'FeatureToggleService',
      'OrganizationDeleteService',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    spyOn(this.$modal, 'open').and.callThrough();
  });

  describe('Org Deletion', function () {
    let canDelete;
    it('should allow an online org with no paid subscriptions to be deleted', function () {
      spyOn(this.FeatureToggleService, 'atlasOnlineDeleteOrgGetStatus').and.returnValue(this.$q.resolve(true));
      spyOn(this.Authinfo, 'isOnlineOnlyCustomer').and.returnValue(true);
      spyOn(this.Authinfo, 'isOnlinePaid').and.returnValue(false);
      spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(false);
      this.OrganizationDeleteService.canOnlineOrgBeDeleted()
        .then((result) => {
          canDelete = result;
        });
      this.$scope.$apply();
      expect(canDelete).toBe(true);
    });

    it('should not allow an online org with a paid subscription to be deleted', function () {
      spyOn(this.FeatureToggleService, 'atlasOnlineDeleteOrgGetStatus').and.returnValue(this.$q.resolve(true));
      spyOn(this.Authinfo, 'isOnlineOnlyCustomer').and.returnValue(true);
      spyOn(this.Authinfo, 'isOnlinePaid').and.returnValue(true);
      spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(false);
      this.OrganizationDeleteService.canOnlineOrgBeDeleted()
        .then((result) => {
          canDelete = result;
        });
      this.$scope.$apply();
      expect(canDelete).toBe(false);
    });

    it('should not allow an org with both online and enterprise to be deleted', function () {
      spyOn(this.FeatureToggleService, 'atlasOnlineDeleteOrgGetStatus').and.returnValue(this.$q.resolve(true));
      spyOn(this.Authinfo, 'isOnlineOnlyCustomer').and.returnValue(false);
      spyOn(this.Authinfo, 'isOnlinePaid').and.returnValue(false);
      spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(false);
      this.OrganizationDeleteService.canOnlineOrgBeDeleted()
        .then((result) => {
          canDelete = result;
        });
      this.$scope.$apply();
      expect(canDelete).toBe(false);
    });

    it('should not allow an online org to be deleted if the feature toggle is not set', function () {
      spyOn(this.FeatureToggleService, 'atlasOnlineDeleteOrgGetStatus').and.returnValue(this.$q.resolve(false));
      spyOn(this.Authinfo, 'isOnlineOnlyCustomer').and.returnValue(true);
      spyOn(this.Authinfo, 'isOnlinePaid').and.returnValue(false);
      spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(false);
      this.OrganizationDeleteService.canOnlineOrgBeDeleted()
        .then((result) => {
          canDelete = result;
        });
      this.$scope.$apply();
      expect(canDelete).toBe(false);
    });

    it('should not allow an online org to be deleted if it is dir-synced', function () {
      spyOn(this.FeatureToggleService, 'atlasOnlineDeleteOrgGetStatus').and.returnValue(this.$q.resolve(true));
      spyOn(this.Authinfo, 'isOnlineOnlyCustomer').and.returnValue(true);
      spyOn(this.Authinfo, 'isOnlinePaid').and.returnValue(false);
      spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(true);
      this.OrganizationDeleteService.canOnlineOrgBeDeleted()
        .then((result) => {
          canDelete = result;
        });
      this.$scope.$apply();
      expect(canDelete).toBe(false);
    });
  });

  describe('Org Deletion Modal', function () {
    beforeEach(function () {
      this.OrganizationDeleteService.openOrgDeleteModal('organizationDeleteModal.title.deleteAccount');
    });

    it('openOrgDeleteModal() should open static modal', function () {
      expect(this.$modal.open).toHaveBeenCalledWith({
        template: '<organization-delete-modal dismiss="$dismiss()" l10n-title="organizationDeleteModal.title.deleteAccount"></organization-delete-modal>',
        backdrop: 'static',
        keyboard: false,
      });
      expect(this.OrganizationDeleteService.deleteModal).toBeDefined();
    });

    it('dismissOrgDeleteModal() should dismiss modal', function () {
      spyOn(this.OrganizationDeleteService.deleteModal, 'dismiss');
      this.OrganizationDeleteService.dismissOrgDeleteModal();
      expect(this.OrganizationDeleteService.deleteModal.dismiss).toHaveBeenCalled();
    });
  });
});
