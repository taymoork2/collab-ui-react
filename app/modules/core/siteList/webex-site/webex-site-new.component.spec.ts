import module from './index';
import { EventNames } from './webex-site.constants';

describe('Component: WebexSiteNewComponent', function () {

  beforeEach(function () {
    this.initModules(module);
    this.injectDependencies('$componentController', '$q', '$rootScope', '$scope', '$translate', 'Config', 'TrialWebexService');
    this.$scope.fixtures = {
      sitesArray: [{
        siteUrl: 'abc.dmz.webex.com',
        timezone: '1',
        keepExistingSite: true,
      }, {
        siteUrl: 'site2.dmz.webex.com',
        timezone: '1',
        setupType: 'TRANSFER',
      }],
      audioPackage: 'TSP',
      audioPartnerName: 'Some Dude',
    };

    initSpies.apply(this);

    this.compileComponent('webexSiteNew', {
      audioPackage: 'fixtures.audioPackage',
      sitesArray: this.$scope.fixtures.sitesArray,
      onSitesAdd: 'onSitesAddFn(sites, isValid)',
      onValidationStatusChange: 'onValidationStatusChangeFn(isValid)',
      onSendTracking: 'onSendTrackingFn(event, properties)',
      audioPartnerName: 'fixtures.audioPartnerName',
    });
  });

  function initSpies() {
    this.$scope.onSitesAddFn = jasmine.createSpy('onSitesAddFn');
    this.$scope.onValidationStatusChangeFn = jasmine.createSpy('onValidationStatusChangeFn');
    this.$scope.onSendTrackingFn = jasmine.createSpy('onSendTrackingFn');
    spyOn(this.TrialWebexService, 'validateSiteUrl').and.returnValue(this.$q.resolve(this.$q.resolve({ isValid: true, errorCode: 'validSite' })));
    spyOn(this.$translate, 'instant').and.callThrough();
  }

  describe('When first opened', () => {
    it('should display the existing sites which can not be deleted', function () {
      this.controller.$onInit();
      expect(this.view.find('webex-site-new-display').length).toBe(2);
      expect(_.includes(this.view.find('webex-site-new-display')[0].innerHTML, 'abc.dmz.webex.com')).toBeTruthy();
      expect(_.includes(this.view.find('webex-site-new-display')[1].innerHTML, 'site2.dmz.webex.com')).toBeTruthy();
      expect(_.includes(this.view.find('webex-site-new-display')[0].innerHTML, 'delete-site')).toBeFalsy();
      expect(_.includes(this.view.find('webex-site-new-display')[1].innerHTML, 'delete-site')).toBeFalsy();
    });
  });

  describe('upon click of the Validate button in site setup', () => {
    let siteUrl;
    beforeEach(function () {
      siteUrl = 'testSiteHere';
      this.controller.newSitesArray = [];
      this.controller.siteModel.siteUrl = siteUrl;
      this.controller.siteModel.timezone = 'someTimeZoneHere';
      this.controller.siteModel.setupType = 'undefined';
    });

    it('should call validateWebexSiteUrl() and if VALID add the site the sitesArray', function () {
      this.view.find('button').click().trigger('change');
      this.$scope.$digest();
      expect(this.TrialWebexService.validateSiteUrl).toHaveBeenCalledWith(siteUrl.concat('.webex.com'), 'ATLAS_SERVICE_SETUP');
      const hasAddedSite = _.some(this.controller.newSitesArray, { siteUrl: siteUrl });
      expect(hasAddedSite).toBe(true);
      expect(this.controller.disableValidateButton).toBe(false);
      expect(this.$scope.onSendTrackingFn).toHaveBeenCalledWith('A new site was added', { siteUrl: 'testSiteHere.webex.com', timezoneSelected: 'someTimeZoneHere' });
    });

    it('should call validateWebexSiteUrl() and if INVALID isError  should be TRUE and site should not be added', function () {
      this.TrialWebexService.validateSiteUrl.and.returnValue(this.$q.resolve({ isValid: false, errorCode: 'invalidSite' }));
      this.view.find('button').click().trigger('change');
      this.$scope.$digest();
      expect(this.TrialWebexService.validateSiteUrl).toHaveBeenCalledWith(siteUrl.concat('.webex.com'), 'ATLAS_SERVICE_SETUP');
      expect(this.controller.newSitesArray.length).toBe(0);
      expect(this.controller.error.isError).toBe(true);
      expect(this.$scope.onValidationStatusChangeFn).not.toHaveBeenCalled();
    });

    it('site will not validate with duplicate site url', function () {
      spyOn(this.controller, 'showError');
      this.controller.newSitesArray = [{
        siteUrl,
        timezone: '1',
        setupType: 'TRANSFER',
      }];
      this.view.find('button').click().trigger('change');
      this.$scope.$digest();
      const sites = _.filter(this.controller.newSitesArray, { siteUrl: siteUrl });
      expect(sites.length).toBe(1);
      expect(this.controller.showError).toHaveBeenCalledWith('firstTimeWizard.meetingSettingsError.duplicateSite', 'URL');
    });

    it('site will not validate without setup type selected', function () {
      this.controller.siteModel.setupType = undefined;
      this.view.find('button').click().trigger('change');
      this.$scope.$digest();
      const hasAddedSite = _.some(this.controller.newSitesArray, { siteUrl: siteUrl });
      expect(hasAddedSite).toBe(false);
    });

    it('site WILL validate with type selected but not have a setupType if it\'s not LEGACY', function () {
      this.controller.siteModel.setupType = 'undefined';
      this.view.find('button').click().trigger('change');
      this.$scope.$digest();
      const addedSite = _.find(this.controller.newSitesArray, { siteUrl: siteUrl });
      expect(addedSite).toBeDefined();
      expect(addedSite['setupType']).not.toBeDefined();
    });

    it('site will validate with type selected and set setup type if it IS LEGACY', function () {
      this.controller.siteModel.setupType = this.Config.setupTypes.legacy;
      this.view.find('button').click().trigger('change');
      this.$scope.$digest();
      const addedSite = _.find(this.controller.newSitesArray, { siteUrl: siteUrl });
      expect(addedSite).toBeDefined();
      expect(addedSite['setupType']).toEqual(this.Config.setupTypes.legacy);
    });
  });

  describe('adding site upon succesfull validation', () => {
    beforeEach(function () {
      this.controller.newSitesArray = [];
      this.controller.siteModel.siteUrl = 'testSiteHere';
      this.controller.siteModel.timezone = 'someTimeZoneHere';
      this.controller.siteModel.setupType = 'undefined';
      this.view.find('button').click().trigger('change');
      this.$scope.$digest();
    });

    it('should add the site to the list with the \'delete\' button ', function () {
      expect(this.$scope.onValidationStatusChangeFn).toHaveBeenCalledWith(true);
      expect(_.includes(this.view.find('webex-site-new-display')[2].innerHTML, 'delete-site')).toBeTruthy();
    });
    it('should fire onValidationStatusChange function with isValid true', function () {
      expect(this.$scope.onValidationStatusChangeFn).toHaveBeenCalledWith(true);
    });
  });

  describe('deleting site', () => {
    beforeEach(function () {
      this.controller.newSitesArray = [{
        siteUrl: 'abc.dmz.webex.com',
        timezone: '1',
      },
      {
        siteUrl: 'abd.dmz.webex.com',
        timezone: '1',
      },
      ];
    });

    it('should remove site from site list', function () {
      this.controller.removeSite(0);
      expect(this.controller.newSitesArray.length).toBe(1);
      expect(this.$scope.onValidationStatusChangeFn).toHaveBeenCalledWith(true);
    });

    it('should trigger onValidationChange with argument \'false\' if the last added site is deleted', function () {
      this.controller.removeSite(0);
      this.controller.removeSite(0);
      expect(this.controller.newSitesArray.length).toBe(0);
      expect(this.$scope.onValidationStatusChangeFn).toHaveBeenCalledWith(false);
    });
  });

  describe('analytics', () => {
    it('should call analytics upon succesfull validation', function() {
      this.compileComponent('webexSiteNew', {
        audioPackage: 'fixtures.audioPackage',
        sitesArray: this.$scope.fixtures.sitesArray,
        onSitesAdd: 'onSitesAddFn(sites, isValid)',
        onValidationStatusChange: 'onValidationStatusChangeFn(isValid)',
        onSendTracking: 'onSendTrackingFn(event, properties)',
        audioPartnerName: 'fixtures.audioPartnerName',
      });

      const siteUrl = 'testSiteHere';
      this.controller.newSitesArray = [];
      this.controller.siteModel.siteUrl = siteUrl;
      this.controller.siteModel.timezone = 'someTimeZoneHere';
      this.controller.siteModel.setupType = 'undefined';
      this.view.find('button').click().trigger('change');
      this.$scope.$digest();
      expect(this.TrialWebexService.validateSiteUrl).toHaveBeenCalledWith(siteUrl.concat('.webex.com'), 'ATLAS_SERVICE_SETUP');
      expect(this.TrialWebexService.validateSiteUrl).toHaveBeenCalledWith(siteUrl.concat('.webex.com'), 'ATLAS_SERVICE_SETUP');
      expect(this.$scope.onSendTrackingFn).toHaveBeenCalledWith('A new site was added', { siteUrl: 'testSiteHere.webex.com', timezoneSelected: 'someTimeZoneHere' });

    });
  });

  describe('on SITES ADD event', () => {
    it('should call the callback function passing to it the valid sites', function () {
      this.controller.newSitesArray = [{
        siteUrl: 'abc.dmz.webex.com',
        timezone: '1',
      }];
      this.$rootScope.$broadcast(EventNames.ADD_SITES);
      expect(this.$scope.onSitesAddFn).toHaveBeenCalledWith(this.controller.newSitesArray, true);
    });
  });
});

