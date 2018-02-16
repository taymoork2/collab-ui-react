import { AdminAuthorizationStatus } from '../services/context-authorization-service';
import contextSettings from './hybrid-context-settings.component';

describe('HybridContextSettingsComponent', function () {

  // let adminAuthStatusSpy, adminSyncSpy;

  beforeEach(function () {
    this.initModules('Core', 'Context', contextSettings);
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

    this.$scope.isAdminAuthorized = false;
    this.$scope.synchronizeButtonTooltip = '';
    this.$scope.isSynchronizationInProgress = false;
  });

  it('should setup admin authorization status correctly when admin is authorized', function () {
    spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus')
      .and.returnValue(this.$q.resolve(AdminAuthorizationStatus.AUTHORIZED));
    this.compileComponent('context-settings', {});
    expect(this.controller.isAdminAuthorized).toBe(true);
    expect(this.controller.synchronizeButtonTooltip).toEqual('');
  });

  it('should setup admin authorization status correctly when admin is unauthorized', function () {
    spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus')
      .and.returnValue(this.$q.resolve(AdminAuthorizationStatus.UNAUTHORIZED));
    this.compileComponent('context-settings');
    expect(this.controller.isAdminAuthorized).toBe(false);
    expect(this.controller.synchronizeButtonTooltip).not.toEqual('');
  });

  it('should setup admin authorization status correctly when admin status is unknown ', function () {
    spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus')
      .and.returnValue(this.$q.resolve(AdminAuthorizationStatus.UNKNOWN));
    this.compileComponent('context-settings');
    expect(this.controller.isAdminAuthorized).toBe(false);
    expect(this.controller.synchronizeButtonTooltip).not.toBeEmpty();
  });

  it('should disable synchronization when sync is in progress', function () {
    this.compileComponent('context-settings');
    this.controller.isSynchronizationInProgress = true;
    this.controller.isAdminAuthorized = true;
    expect(this.controller.disableSynchronization()).toBe(true);
  });

  it('should disable synchronization when admin is not authorized', function () {
    this.compileComponent('context-settings');
    this.controller.isSynchronizationInProgress = false;
    this.controller.isAdminAuthorized = false;
    expect(this.controller.disableSynchronization()).toBe(true);
  });

  it('should show success notification when synchronization is successful', function (done) {
    spyOn(this.ContextAdminAuthorizationService, 'synchronizeAdmins').and.returnValue(this.$q.resolve());
    this.compileComponent('context-settings');
    this.controller.isSynchronizationInProgress = true;
    this.controller.synchronize()
      .then(() => {
        expect(this.Notification.success).toHaveBeenCalledWith('context.dictionary.settingPage.synchronizationSuccessful');
        expect(this.controller.isSynchronizationInProgress).toBe(false);
        done();
      }).catch(done.fail);
    this.$scope.$apply();
  });

  it('should show error notification when synchronization has failed', function (done) {
    this.compileComponent('context-settings');
    spyOn(this.ContextAdminAuthorizationService, 'synchronizeAdmins').and.returnValue(this.$q.reject());
    this.controller.isSynchronizationInProgress = true;
    this.controller.synchronize()
      .then(() => {
        expect(this.Notification.error).toHaveBeenCalledWith('context.dictionary.settingPage.synchronizationFailure');
        expect(this.controller.isSynchronizationInProgress).toBe(false);
        done();
      }).catch(done.fail);
    this.$scope.$apply();
  });
});
