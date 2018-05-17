import bulkEnableVmModule from './index';
describe('Component: bulkEnableVm', () => {
  const commonUsers = getJSONFixture('huron/json/settings/bulkEnableVm/commonusers.json');
  const services = ['VOICE', 'COMMON'];
  beforeEach(function () {
    this.initModules(bulkEnableVmModule);
    this.injectDependencies('$scope', 'BulkEnableVmService', 'Authinfo',
      'UserListService',
      'UserServiceCommon', '$q', '$httpBackend', 'UserCsvService', 'FeatureToggleService');
    this.$scope.scope = this.$scope;
  });
  function initComponent() {
    this.compileComponent('ucBulkEnableVm', {
      scope: 'scope',
    });
  }

  describe('Component: bulkEnableVm', () => {
    beforeEach(function () {
      spyOn(this.BulkEnableVmService, 'getSparkCallUserCountRetry').and.returnValue(this.$q.resolve(4));
      spyOn(this.BulkEnableVmService, 'getUsersRetry');
      spyOn(this.BulkEnableVmService, 'getUserServicesRetry');
      spyOn(this.BulkEnableVmService, 'getUserSitetoSiteNumberRetry');
      spyOn(this.BulkEnableVmService, 'enableUserVmRetry');
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
    });
    describe('Voicemail for all users enabled', () => {
      beforeEach(function () {
        this.BulkEnableVmService.getUsersRetry.and.returnValue(this.$q.resolve(commonUsers));
        this.BulkEnableVmService.getUserServicesRetry.and.returnValue(this.$q.resolve(services));
        this.BulkEnableVmService.getUserSitetoSiteNumberRetry.and.returnValue(this.$q.resolve('123456'));
        this.BulkEnableVmService.enableUserVmRetry.and.returnValue(this.$q.resolve());
      });
      beforeEach(initComponent);
      it('Voicemail enable counters are updated correctly', function () {
        expect(this.$scope).toBeDefined();
        expect(this.controller.usersVoicemailFailedCount).toEqual(0);
        expect(this.controller.offset).toEqual(4);
        expect(this.controller.usersVoicemailUpdatedCount).toEqual(4);
      });

      it('Voicemail enable invokes correct service calls', function () {
        expect(this.BulkEnableVmService.getUserServicesRetry).toHaveBeenCalledTimes(4);
        expect(this.BulkEnableVmService.getUserSitetoSiteNumberRetry).toHaveBeenCalledTimes(4);
        expect(this.BulkEnableVmService.enableUserVmRetry).toHaveBeenCalledTimes(4);
      });
    });

    describe('Voicemail for users not updated when users list is empty', () => {
      beforeEach(function () {
        this.BulkEnableVmService.getUsersRetry.and.returnValue(this.$q.resolve([]));
        this.BulkEnableVmService.getUserServicesRetry.and.returnValue(this.$q.resolve(services));
        this.BulkEnableVmService.getUserSitetoSiteNumberRetry.and.returnValue(this.$q.resolve('123456'));
      });
      beforeEach(initComponent);
      it('Voicemail is not updated for users', function () {
        expect(this.controller.usersVoicemailFailedCount).toEqual(0);
        expect(this.controller.offset).toEqual(0);
        expect(this.controller.usersVoicemailUpdatedCount).toEqual(0);
      });

      it('Voicemail enable does not invoke any service calls', function () {
        expect(this.BulkEnableVmService.getUserServicesRetry).toHaveBeenCalledTimes(0);
        expect(this.BulkEnableVmService.getUserSitetoSiteNumberRetry).toHaveBeenCalledTimes(0);
      });
    });

    describe('Voicemail enable with 503 returned for user update', () => {
      beforeEach(function () {
        const error = {
          status: 503,
          statusText: 'User Not Found',
          config: { headers: { TrackingID: 'Atlas_122ea2dafea3444555_Service Unavailable' } },
        };
        this.BulkEnableVmService.getUsersRetry.and.returnValue(this.$q.resolve(commonUsers));
        this.BulkEnableVmService.getUserServicesRetry.and.returnValue(this.$q.reject(error));
        this.BulkEnableVmService.getUserSitetoSiteNumberRetry.and.returnValue(this.$q.resolve('123456'));
      });
      beforeEach(initComponent);
      it('Voicemail enable updates the error array when 503 is returned', function () {
        expect(this.controller.usersVoicemailFailedCount).toEqual(4);
        expect(this.controller.userErrorArray.length).toEqual(4);
        expect(this.controller.offset).toEqual(4);
        expect(this.controller.usersVoicemailUpdatedCount).toEqual(0);
        expect(this.BulkEnableVmService.getUserServicesRetry).toHaveBeenCalledTimes(4);
        expect(this.BulkEnableVmService.getUserSitetoSiteNumberRetry).toHaveBeenCalledTimes(0);
      });
    });

    describe('Voicemail enable with 404 returned for user service GET', () => {
      beforeEach(function () {
        const error = {
          status: 404,
          statusText: 'User Not Found',
          config: { headers: { TrackingID: 'Atlas_122ea2dafea3444555_Service Unavailable' } },
        };
        this.BulkEnableVmService.getUsersRetry.and.returnValue(this.$q.resolve(commonUsers));
        this.BulkEnableVmService.getUserServicesRetry.and.returnValue(this.$q.reject(error));
        this.BulkEnableVmService.getUserSitetoSiteNumberRetry.and.returnValue(this.$q.resolve('123456'));
      });
      beforeEach(initComponent);
      it('Voicemail enable does not updates the error array when 404 is returned', function () {
        expect(this.controller.usersVoicemailFailedCount).toEqual(0);
        expect(this.controller.userErrorArray.length).toEqual(0);
        expect(this.controller.offset).toEqual(4);
        expect(this.controller.usersVoicemailUpdatedCount).toEqual(0);
        expect(this.BulkEnableVmService.getUserServicesRetry).toHaveBeenCalledTimes(4);
        expect(this.BulkEnableVmService.getUserSitetoSiteNumberRetry).toHaveBeenCalledTimes(0);
      });
    });

    describe('Voicemail enable with 404 returned for user Update', () => {
      beforeEach(function () {
        const error = {
          status: 404,
          statusText: 'User Not Found',
          config: { headers: { TrackingID: 'Atlas_122ea2dafea3444555_Service Unavailable' } },
        };
        this.BulkEnableVmService.getUsersRetry.and.returnValue(this.$q.resolve(commonUsers));
        this.BulkEnableVmService.getUserSitetoSiteNumberRetry.and.returnValue(this.$q.resolve('123456'));
        this.BulkEnableVmService.getUserServicesRetry.and.returnValue(this.$q.resolve(services));
        this.BulkEnableVmService.enableUserVmRetry.and.returnValue(this.$q.reject(error));
      });
      beforeEach(initComponent);
      it('Voicemail enable does not updates the error array when 404 is returned', function () {
        expect(this.controller.usersVoicemailFailedCount).toEqual(0);
        expect(this.controller.userErrorArray.length).toEqual(0);
        expect(this.controller.offset).toEqual(4);
        expect(this.controller.usersVoicemailUpdatedCount).toEqual(0);
        expect(this.BulkEnableVmService.getUserServicesRetry).toHaveBeenCalledTimes(4);
        expect(this.BulkEnableVmService.getUserSitetoSiteNumberRetry).toHaveBeenCalledTimes(4);
      });
    });
  });

  describe('component: bulkEnableVm', () => {
    beforeEach(function () {
      this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users?filter=active%20eq%20true%20and%20entitlements%20eq%20%22ciscouc%22&attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,linkedTrainSiteNames,licenseID,userSettings,userPreferences&count=1000')
        .respond({});
      this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me')
        .respond({});
    });
    describe('Bulk enable VM progress bar', () => {
      beforeEach(initComponent);

      it('should show uploadProgressComponent when processProgress is less than 100', function () {
        expect(this.view.find('div#uploadProgressComponent')).not.toHaveClass('ng-hide');
        expect(this.view.find('span#progressLabel')).toExist();
        expect(this.view.find('span#cancelLabel')).not.toExist();
        expect(this.view.find('span#progress')).toExist();
        expect(this.view.find('span#progress')).toHaveText('0%');
        expect(this.view.find('div#cancelProgress')).not.toHaveClass('ng-hide');
      });

      it('should show progress when processProgress is less than 100', function () {
        this.controller.processProgress = 20;
        this.$scope.$apply();
        expect(this.view.find('div#uploadProgressComponent')).not.toHaveClass('ng-hide');
        expect(this.view.find('span#progressLabel')).toExist();
        expect(this.view.find('span#cancelLabel')).not.toExist();
        expect(this.view.find('span#progress')).toExist();
        expect(this.view.find('span#progress')).toHaveText('20%');
        expect(this.view.find('div#cancelProgress')).not.toHaveClass('ng-hide');
      });

      it('should not show uploadProgressComponent when processProgress is 100', function () {
        this.controller.processProgress = 100;
        this.$scope.$apply();
        expect(this.view.find('div#uploadProgressComponent')).toHaveClass('ng-hide');
      });
    });

    describe('Bulk enable VM result stats', () => {
      beforeEach(initComponent);

      it('should not show results if progress is 100', function () {
        this.controller.processProgress = 100;
        this.$scope.$apply();
        expect(this.view.find('div#resultStats')).toHaveClass('ng-hide');
      });

      it('should not show results if progress is 100 and there are no errors', function () {
        this.controller.processProgress = 100;
        this.controller.userErrorArray = [];
        this.$scope.$apply();
        expect(this.view.find('div#resultStats')).toHaveClass('ng-hide');
      });

      it('should show results if progress is less than 100', function () {
        this.controller.processProgress = 20;
        this.controller.userErrorArray = [];
        this.controller.usersVoicemailUpdatedCount = 150;
        this.$scope.$apply();
        expect(this.view.find('div#resultStats')).not.toHaveClass('ng-hide');
        expect(this.view.find('div#updatedUsersStats').find('.total')).toHaveText('150');
      });

      it('should show results if there are errors', function () {
        this.controller.processProgress = 100;
        this.controller.userErrorArray = [{
          userId: 'testUserId',
          errorMsg: 'failed to fetch user',
          trackingID: 'TrackingID',
        }];
        this.$scope.$apply();
        expect(this.view.find('div#resultStats')).not.toHaveClass('ng-hide');
        expect(this.view.find('div#errorUsersStats').find('.total')).toHaveText('1');
      });

    });

    describe('Bulk enable VM result list', () => {
      beforeEach(initComponent);

      it('should not show results if error list is empty', function () {
        this.controller.userErrorArray = [];
        this.$scope.$apply();
        expect(this.view.find('div#errorList')).not.toExist();
        expect(this.view.find('span#headerRow')).not.toExist();
        expect(this.view.find('span#headerErrorMessage')).not.toExist();
      });

      it('should show results if error list is not empty', function () {
        this.controller.userErrorArray = [{
          userId: 'testUserId1',
          statusText: 'failed to fetch user',
          trackingID: 'TrackingID1',
        },
        {
          userId: 'testUserId2',
          statusText: 'failed to fetch user',
          trackingID: 'TrackingID2',
        }];
        this.$scope.$apply();
        expect(this.view.find('div#errorList')).toExist();
        expect(this.view.find('span#headerRow')).toExist();
        expect(this.view.find('span#headerErrorMessage')).toExist();

        // verify table data
        const errorRecords = this.view.find('div#errorList').find('.row');
        expect(errorRecords.length).toBe(2);
        _.forEach(errorRecords, (element, index: number) => {
          expect(element.getElementsByClassName('columns small-4 center error-row')[0]).toHaveText('testUserId' + (index + 1));
          expect(element.getElementsByClassName('columns small-8 error-desc')[0]).toHaveText('failed to fetch user' + ' ' + 'TrackingID' + (index + 1));
        });
      });

    });

    describe('Bulk enable VM success', () => {
      beforeEach(initComponent);

      it('should not show success icon if the progress is not 100', function () {
        this.controller.processProgress = 99;
        this.$scope.$apply();
        expect(this.view.find('div#success')).toHaveClass('ng-hide');
      });

      it('should not show success icon if there are errors', function () {
        this.controller.processProgress = 100;
        this.controller.userErrorArray = [{
          userId: 'testUserId',
          errorMsg: 'failed to fetch user',
          trackingID: 'TrackingID',
        }];
        this.$scope.$apply();
        expect(this.view.find('div#success')).toHaveClass('ng-hide');
      });

      it('should show success icon if there are no errors and progress is 100', function () {
        this.controller.processProgress = 100;
        this.controller.userErrorArray = [];
        this.$scope.$apply();
        expect(this.view.find('div#success')).not.toHaveClass('ng-hide');
      });

    });

    describe('Bulk enable VM cancel process', () => {
      beforeEach(initComponent);

      it('should show cancel icon is the process is in progress', function () {
        this.controller.processProgress = 30;
        this.$scope.$apply();
        expect(this.view.find('div#cancelProgress')).not.toHaveClass('ng-hide');
      });

      it('should set isCancelledByUser once the cancel button is clicked', function () {
        this.controller.processProgress = 30;
        this.$scope.$apply();
        expect(this.view.find('span#progressLabel')).toExist();
        expect(this.view.find('span#cancelLabel')).not.toExist();
        expect(this.controller.isCancelledByUser).not.toBeTruthy();
        spyOn(this.controller, 'onCancelProcess').and.callThrough();
        this.view.find('div#cancelProgress').find('.icon-close').click();
        this.$scope.$apply();
        expect(this.controller.onCancelProcess).toHaveBeenCalled();
        expect(this.controller.isCancelledByUser).toBeTruthy();
        expect(this.view.find('span#progressLabel')).not.toExist();
        expect(this.view.find('span#cancelLabel')).toExist();
      });
    });
  });
});
