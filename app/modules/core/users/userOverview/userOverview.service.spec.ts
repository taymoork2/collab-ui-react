import testModule from './index';

describe('Service: UserOverviewService', () => {

  beforeEach(function () {
    this.initModules(testModule, 'WebExApp', 'Sunlight', 'Huron');
    this.injectDependencies(
      '$httpBackend',
      'UserOverviewService',
      'WebExUtilsFact',
      'Auth',
      '$q',
      '$rootScope',
      'Config',
      'SunlightConfigService',
      'ServiceSetup',
    );

    this.pristineUser = _.cloneDeep(getJSONFixture('core/json/currentUser.json'));
    this.updatedUser = _.cloneDeep(this.pristineUser);
    this.$rootScope.services = _.cloneDeep(getJSONFixture('squared/json/services.json'));
    this.isCIEnabledSiteSpy = spyOn(this.WebExUtilsFact, 'isCIEnabledSite').and.returnValue(true);
    this.isOnlineOrgSpy = spyOn(this.Auth, 'isOnlineOrg').and.returnValue(this.$q.resolve(false));
    this.SunlightConfigServiceSpy = spyOn(this.SunlightConfigService, 'getUserInfo').and.returnValue(this.$q.resolve());
    this.languages = _.cloneDeep(getJSONFixture('huron/json/settings/languages.json'));
    this.ServiceSetupSpy = spyOn(this.ServiceSetup, 'getAllLanguages').and.returnValue(this.$q.resolve(this.languages));

    installPromiseMatchers();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getUser()', () => {

    beforeEach(function () {
      this.$httpBackend.whenGET(/.*\/userid.*/g).respond(200, this.updatedUser);

      this.invitationsGetSpy = this.$httpBackend.whenGET(/.*\invitations.*/g).respond(200, {
        effectiveLicenses: [],
      });
    });

    describe('initial response', () => {

      it('should reject if getUser has an error', function () {
        this.$httpBackend.expectGET(/.*\/badf00d.*/g).respond(404);
        let promise = this.UserOverviewService.getUser('badf00d');
        this.$httpBackend.flush();
        expect(promise).toBeRejected();
      });

      it('should parse valid user result into user and sqEntitlements', function () {

        let promise = this.UserOverviewService.getUser('userid')
          .then((userData) => {
            let expectedUser = _.merge(this.updatedUser, {
              pendingStatus: true,
            });
            expect(userData.user).toEqual(jasmine.objectContaining(expectedUser));

            expect(userData.sqEntitlements).toEqual(jasmine.objectContaining({
              squaredRoomModeration: false,
              messengerInterop: false,
              squaredSyncUp: false,
              squaredFusionMgmt: false,
              squaredFusionUC: false,
              spark: false,
              squaredCallInitiation: true,
              webExSquared: true,
              squaredOnBehalfOf: false,
              squaredFusionCal: false,
            }));
          });
        this.$httpBackend.flush();
        expect(promise).toBeResolved();
      });
    });

    describe('updateTrainSiteNames', () => {

      it('should not initialize trainSiteNames when not supplied', function () {

        expect(this.updatedUser.trainSiteName).not.toBeDefined();
        let promise = this.UserOverviewService.getUser('userid')
          .then((userData) => {
            expect(userData.user.trainSiteNames).not.toBeDefined();
          });
        this.$httpBackend.flush();

        expect(promise).toBeResolved();
        expect(promise).not.toBeRejected();
      });

      it('should not remove trainSiteNames when isCIEnabledSite is true', function () {

        this.updatedUser.trainSiteNames = ['testSite'];
        this.isCIEnabledSiteSpy.and.returnValue(true);

        let promise = this.UserOverviewService.getUser('userid');
        this.$httpBackend.flush();
        expect(promise).toBeResolvedWith(jasmine.objectContaining({
          user: jasmine.objectContaining({
            trainSiteNames: ['testSite'],
          }),
        }));

      });

      it('should remove trainSiteNames when isCIEnabledSite is false', function () {

        this.updatedUser.trainSiteNames = ['testSite'];
        this.isCIEnabledSiteSpy.and.returnValue(false);

        let promise = this.UserOverviewService.getUser('userid');
        this.$httpBackend.flush();
        expect(promise).toBeResolvedWith(jasmine.objectContaining({
          user: jasmine.objectContaining({
            trainSiteNames: [],
          }),
        }));
      });

    });

    describe('getAccountStatus', () => {

      it('should reject getUser if there is an error fetching data', function () {
        // reject call to Auth.IsOnlineOrg()
        this.isOnlineOrgSpy.and.returnValue(this.$q.reject());

        let promise = this.UserOverviewService.getUser('userid');
        this.$httpBackend.flush();
        expect(promise).toBeRejected();
      });

      it('should set pendingStatus true if entitlements is empty', function () {
        // if no entitlements, the  user is always pending
        this.updatedUser.entitlements = [];

        let promise = this.UserOverviewService.getUser('userid');
        this.$httpBackend.flush();
        expect(promise).toBeResolvedWith(jasmine.objectContaining({
          user: jasmine.objectContaining({
            pendingStatus: true,
          }),
        }));
      });

      it('should set pendingStatus true if user not signed up, not online, and not ciscouc entitled', function () {
        // mark as not an active user
        _.remove(this.updatedUser.entitlements, (n) => { return n === 'ciscouc'; });
        this.updatedUser.userSettings = [];

        let promise = this.UserOverviewService.getUser('userid');
        this.$httpBackend.flush();
        expect(promise).toBeResolvedWith(jasmine.objectContaining({
          user: jasmine.objectContaining({
            pendingStatus: true,
          }),
        }));
      });

      it('should set pendingStatus false when userSettings contain spark.signUpDate', function () {
        _.remove(this.updatedUser.entitlements, (n) => { return n === 'ciscouc'; });

        // set this to mark an active user
        this.updatedUser.userSettings = ['{ spark.signUpDate: 1470262687261 }'];

        let promise = this.UserOverviewService.getUser('userid');
        this.$httpBackend.flush();
        expect(promise).toBeResolvedWith(jasmine.objectContaining({
          user: jasmine.objectContaining({
            pendingStatus: false,
          }),
        }));
      });

      it('should set pendingStatus false when Auth.isOnlineOrg is true', function () {
        this.isOnlineOrgSpy.and.returnValue(this.$q.resolve(true));
        _.remove(this.updatedUser.entitlements, (n) => { return n === 'ciscouc'; });
        this.updatedUser.userSettings = [];

        let promise = this.UserOverviewService.getUser('userid');
        this.$httpBackend.flush();
        expect(promise).toBeResolvedWith(jasmine.objectContaining({
          user: jasmine.objectContaining({
            pendingStatus: false,
          }),
        }));
      });

      it('should set pendingStatus false when user has entitlement "ciscouc"', function () {
        this.isOnlineOrgSpy.and.returnValue(this.$q.resolve(false));
        this.updatedUser.userSettings = [];
        this.updatedUser.entitlements.push('ciscouc');

        let promise = this.UserOverviewService.getUser('userid');
        this.$httpBackend.flush();
        expect(promise).toBeResolvedWith(jasmine.objectContaining({
          user: jasmine.objectContaining({
            pendingStatus: false,
          }),
        }));

      });

    });

    describe('updateInvitationStatus', () => {

      beforeEach(function () {
        this.invitationsGetSpy.respond(200, {
          effectiveLicenses: [
            { id: 'MS_93b3e7f5-f17b-xxxx-xxxx-473bd1846a5a', idOperation: 'ADD' },
            { id: 'CD_93b3e7f5-f17b-xxxx-yyyy-473bd1846a5a', idOperation: 'ADD' },
            { id: 'CF_93b3e7f5-f17b-xxxx-zzzz-473bd1846a5a', idOperation: 'ADD' },
          ],
        });
      });

      it('should not set invitations if entitlements exist for user', function () {
        let promise = this.UserOverviewService.getUser('userid')
          .then((userData) => {
            expect(userData.user.entitlements).not.toHaveLength(0);
            expect(userData.user.invitations).not.toBeDefined();
          });
        this.$httpBackend.flush();
        expect(promise).toBeResolved();
      });

      it('should set invitations object from Casandra effectiveLicenses', function () {
        this.updatedUser.entitlements = [];
        this.updatedUser.roles = [this.Config.backend_roles.spark_synckms, this.Config.backend_roles.ciscouc_ces];
        let promise = this.UserOverviewService.getUser('userid')
          .then((userData) => {
            expect(userData.user.entitlements).toHaveLength(0);
            expect(userData.user.invitations).toBeDefined();

            expect(userData.user.invitations.ms).toBeTruthy();
            expect(userData.user.invitations.cf).toEqual('CF_93b3e7f5-f17b-xxxx-zzzz-473bd1846a5a');
            expect(userData.user.invitations.cc).toBeTruthy();
          });
        this.$httpBackend.flush();
        expect(promise).toBeResolved();
      });

      it('should not fail if user has no invitations', function () {
        this.updatedUser.entitlements = undefined;
        this.invitationsGetSpy.respond(404);
        let promise = this.UserOverviewService.getUser('userid');
        expect(promise).toBeResolved();
      });
    });

    describe('getUserPreferredLanguage()', () => {
      it('should get user preferred language from languages list', function () {
        let languageCode = 'en_US';
        let languageLabel = 'English (United States)';
        let promise = this.UserOverviewService.getUserPreferredLanguage(languageCode)
          .then(userPreferredLanguage => {
            expect(userPreferredLanguage).toBeDefined();
            expect(userPreferredLanguage.value).toEqual(languageCode);
            expect(userPreferredLanguage.label).toEqual(languageLabel);
          });
        expect(promise).toBeResolved();
      });
    });
  });
});
