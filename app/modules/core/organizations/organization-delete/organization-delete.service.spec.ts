import organizationDeleteModule from './index';
import { OrgDeleteStatus } from 'modules/core/shared/org-service/org-service.types';

describe('Service: OrganizationDeleteService', () => {
  const DELETE_STATUS_URL = 'https://atlas.webex.com/admin/api/v1/organizations/123/deleteTasks/456';

  beforeEach(function () {
    this.initModules(organizationDeleteModule);
    this.injectDependencies(
      '$interval',
      '$modal',
      '$q',
      'Auth',
      'Authinfo',
      'DirSyncService',
      'FeatureToggleService',
      'OrganizationDeleteService',
      'Orgservice',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    spyOn(this.$modal, 'open').and.callThrough();
    spyOn(this.OrganizationDeleteService, 'cancelDeleteVerify').and.callThrough();
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

    it('should return status location url', function () {
      let statusUrl = '';
      spyOn(this.Orgservice, 'deleteOrg').and.returnValue(this.$q.resolve({
        location: DELETE_STATUS_URL,
      }));

      this.OrganizationDeleteService.deleteOrg('123', true)
        .then(url => {
          statusUrl = url;
        });
      this.$scope.$apply();

      expect(statusUrl).toBe(DELETE_STATUS_URL);
    });

  });

  describe('Verify org delete', () => {
    beforeEach(function () {
      spyOn(this.Auth, 'getClientAccessToken').and.returnValue(this.$q.resolve( 'token123'));
    });

    it('should succeed verification', function () {
      let success = false;
      spyOn(this.Orgservice, 'getDeleteStatus').and.returnValue(this.$q.resolve(OrgDeleteStatus.COMPLETE));

      this.OrganizationDeleteService.verifyOrgDelete(DELETE_STATUS_URL)
        .then(() => {
          success = true;
        });
      this.$scope.$apply();
      this.$interval.flush(1500);
      this.$interval.flush(1500);

      expect(success).toBe(true);
      expect(this.OrganizationDeleteService.cancelDeleteVerify).toHaveBeenCalled();
      expect(this.Orgservice.getDeleteStatus).toHaveBeenCalledTimes(1);
    });

    it('should fail verification', function () {
      let failure = false;
      spyOn(this.Orgservice, 'getDeleteStatus').and.returnValue(this.$q.resolve(OrgDeleteStatus.FAILED));

      this.OrganizationDeleteService.verifyOrgDelete(DELETE_STATUS_URL)
        .catch(() => {
          failure = true;
        });
      this.$scope.$apply();
      this.$interval.flush(1500);

      expect(failure).toBe(true);
      expect(this.OrganizationDeleteService.cancelDeleteVerify).toHaveBeenCalled();
    });

    it('should fail after 30 seconds of status checks', function () {
      let failure = false;
      spyOn(this.Orgservice, 'getDeleteStatus').and.returnValue(this.$q.when(''));

      this.OrganizationDeleteService.verifyOrgDelete(DELETE_STATUS_URL)
        .catch(() => {
          failure = true;
        });
      this.$scope.$apply();
      this.$interval.flush(30000);

      expect(failure).toBe(true);
    });

    it('should not delete org when status check fails', function () {
      let failure = false;
      spyOn(this.Orgservice, 'getDeleteStatus').and.returnValue(this.$q.reject());

      this.OrganizationDeleteService.verifyOrgDelete(DELETE_STATUS_URL)
        .catch(() => {
          failure = true;
        });
      this.$scope.$apply();
      this.$interval.flush(1500);

      expect(failure).toBe(true);
      expect(this.OrganizationDeleteService.cancelDeleteVerify).toHaveBeenCalled();
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
