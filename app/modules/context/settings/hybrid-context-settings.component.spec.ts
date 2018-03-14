import { AdminAuthorizationStatus } from '../services/context-authorization-service';

describe('HybridContextSettingsComponent', function () {

  // let adminAuthStatusSpy, adminSyncSpy;
  const invalidAdminType = 'INVALID_ADMIN_TYPE_FOR_MIGRATION';
  beforeEach(function () {
    this.initModules('Context');
    this.injectDependencies(
      '$q',
      '$scope',
      '$translate',
      'ContextAdminAuthorizationService',
      'Notification',
    );
    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');

    this.$scope.isAdminUnauthorized = false;
    this.$scope.isUnknown = true;
    this.$scope.synchronizeButtonTooltip = '';
    this.$scope.isSynchronizationInProgress = false;
  });

  it('should setup admin authorization status correctly when admin is authorized', function () {
    spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus')
      .and.returnValue(this.$q.resolve(AdminAuthorizationStatus.AUTHORIZED));
    this.compileComponent('context-settings', {});
    expect(this.controller.isAdminUnauthorized).toBe(false);
    expect(this.controller.isUnknown).toBe(false);
    expect(this.controller.synchronizeButtonTooltip).toEqual('');
  });

  it('should setup admin authorization status correctly when admin is unauthorized', function () {
    spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus')
      .and.returnValue(this.$q.resolve(AdminAuthorizationStatus.UNAUTHORIZED));
    this.compileComponent('context-settings');
    expect(this.controller.isAdminUnauthorized).toBe(true);
    expect(this.controller.isUnknown).toBe(false);
    expect(this.controller.synchronizeButtonTooltip).not.toBeEmpty();
  });

  it('should setup admin authorization status correctly when admin status is unknown ', function () {
    spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus')
      .and.returnValue(this.$q.resolve(AdminAuthorizationStatus.UNKNOWN));
    this.compileComponent('context-settings');
    expect(this.controller.isAdminUnauthorized).toBe(false);
    expect(this.controller.isUnknown).toBe(true);
    expect(this.controller.synchronizeButtonTooltip).not.toBeEmpty();
  });

  it('should setup admin authorization status correctly when admin status is needs_migration ', function () {
    spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus')
      .and.returnValue(this.$q.resolve(AdminAuthorizationStatus.NEEDS_MIGRATION));
    this.compileComponent('context-settings');
    expect(this.controller.isAdminUnauthorized).toBe(false);
    expect(this.controller.isUnknown).toBe(false);
    expect(this.controller.synchronizeButtonTooltip).toEqual('');
  });

  it('should disable synchronization button when sync is in progress', function () {
    this.compileComponent('context-settings');
    this.controller.isSynchronizationInProgress = true;
    this.controller.isAdminUnauthorized = true;
    expect(this.controller.disableSynchronization()).toBe(true);
  });

  it('should disable synchronization button when admin is not authorized', function () {
    this.compileComponent('context-settings');
    this.controller.isSynchronizationInProgress = false;
    this.controller.isAdminUnauthorized = true;
    this.controller.isUnknown = false;
    expect(this.controller.disableSynchronization()).toBe(true);
  });

  it('should enable synchronization button when migration is needed', function () {
    this.compileComponent('context-settings');
    this.controller.isSynchronizationInProgress = false;
    this.controller.isAdminUnauthorized = false;
    this.controller.isUnknown = false;
    expect(this.controller.disableSynchronization()).toBe(false);
  });

  it('should show success notification when synchronization is successful', function (done) {
    this.compileComponent('context-settings');
    spyOn(this.controller, 'synchronizeAdminsOrMigrateOrganization').and.returnValue(this.$q.resolve());
    this.controller.isSynchronizationInProgress = true;
    this.controller.synchronize()
      .then(() => {
        expect(this.Notification.success).toHaveBeenCalledWith('context.dictionary.settingPage.synchronizationSuccessful');
        expect(this.controller.isSynchronizationInProgress).toBe(false);
        done();
      }).catch(done.fail);
    this.$scope.$apply();
  });

  it('should show error notification when synchronization has failed for invalid admin type', function (done) {
    this.compileComponent('context-settings');
    spyOn(this.controller, 'synchronizeAdminsOrMigrateOrganization').and.returnValue(this.$q.reject({
      data: {
        error: {
          statusText: invalidAdminType,
        },
      },
    }));
    this.controller.isSynchronizationInProgress = true;
    this.controller.synchronize()
      .then(() => {
        expect(this.Notification.error).toHaveBeenCalledWith('context.dictionary.settingPage.invalidAdminType');
        expect(this.controller.isSynchronizationInProgress).toBe(false);
        done();
      }).catch(done.fail);
    this.$scope.$apply();
  });

  it('should show error notification when synchronization has failed for any other reason', function (done) {
    this.compileComponent('context-settings');
    spyOn(this.controller, 'synchronizeAdminsOrMigrateOrganization').and.returnValue(this.$q.reject());
    this.controller.isSynchronizationInProgress = true;
    this.controller.synchronize()
      .then(() => {
        expect(this.Notification.error).toHaveBeenCalledWith('context.dictionary.settingPage.synchronizationFailure');
        expect(this.controller.isSynchronizationInProgress).toBe(false);
        done();
      }).catch(done.fail);
    this.$scope.$apply();
  });

  it('should call function MigrateOrganization if organization needs migration ', function (done) {
    this.compileComponent('context-settings');
    spyOn(this.ContextAdminAuthorizationService, 'isMigrationNeeded').and.returnValue(this.$q.resolve(true));
    spyOn(this.ContextAdminAuthorizationService, 'migrateOrganization').and.returnValue(this.$q.resolve());
    this.controller.synchronizeAdminsOrMigrateOrganization()
      .then(() => {
        expect(this.ContextAdminAuthorizationService.migrateOrganization).toHaveBeenCalled();
        done();
      }).catch(done.fail);
    this.$scope.$apply();
  });

  it('should call function SynchronizeAdmins if organization does not need migration ', function (done) {
    this.compileComponent('context-settings');
    spyOn(this.ContextAdminAuthorizationService, 'isMigrationNeeded').and.returnValue(this.$q.resolve(false));
    spyOn(this.ContextAdminAuthorizationService, 'synchronizeAdmins').and.returnValue(this.$q.resolve());
    this.controller.synchronizeAdminsOrMigrateOrganization()
      .then(() => {
        expect(this.ContextAdminAuthorizationService.synchronizeAdmins).toHaveBeenCalled();
        done();
      }).catch(done.fail);
    this.$scope.$apply();
  });
});
