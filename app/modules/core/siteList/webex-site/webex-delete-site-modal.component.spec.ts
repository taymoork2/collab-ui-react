import module from './index';
describe('Component: WebexDeleteSiteModalComponent', function () {

  const licenses = getJSONFixture('core/json/authInfo/complexCustomerCases/customerWithCCASPActiveLicenses.json');
  const confServices = licenses.confLicenses;
  const confServicesSub100448 = _.filter(confServices, { billingServiceId: 'Sub100448' });

  beforeEach(function () {
    this.initModules(module);
    this.injectDependencies('$componentController', '$q', '$rootScope', '$scope', 'Config', 'SetupWizardService', 'WebExSiteService');
    this.$scope.fixtures = {
      subscriptionId: 'Sub100448',
      siteUrl: 'cognizanttraining.webex.com',
    };

    initSpies.apply(this);

    this.compileComponent('webexDeleteSiteModal', {
      subscriptionId: 'fixtures.subscriptionId',
      siteUrl: 'fixtures.siteUrl',
    });
  });

  function initSpies() {
    spyOn(this.SetupWizardService, 'updateSitesInActiveSubscription').and.returnValue(this.$q.resolve(true));
    spyOn(this.SetupWizardService, 'getConferenceLicensesBySubscriptionId').and.returnValue(confServicesSub100448);
    spyOn(this.WebExSiteService, 'getAudioPackageInfo').and.returnValue({ audioPackage: 'VoipOnly' });
    spyOn(this.WebExSiteService, 'constructWebexLicensesPayload').and.returnValue({});
    spyOn(this.$rootScope, '$broadcast').and.callThrough();
  }


  describe('when first opened', function () {
    it('should get services for that particular subscription', function () {
      expect(this.SetupWizardService.getConferenceLicensesBySubscriptionId).toHaveBeenCalledWith('Sub100448');
    });
    it('should not have the deleted site in sitesArray', function () {
      expect(this.controller.siteUrl).toBe('cognizanttraining.webex.com');
      expect(_.some(this.controller.conferenceLicensesInSubscription, { siteUrl: 'cognizanttraining.webex.com' })).toBeTruthy();
      expect(_.some(this.controller.sitesArray, { siteUrl: 'cognizanttraining.webex.com' })).toBeFalsy();
    });
  });

  describe('next() function', function () {
    it('should be a call to saveData() which would get audio package, construct an array, and call backend api', function () {
      this.controller.next();
      expect(this.WebExSiteService.getAudioPackageInfo).toHaveBeenCalledWith('Sub100448');
      expect(this.WebExSiteService.constructWebexLicensesPayload).toHaveBeenCalled();
      expect(this.SetupWizardService.updateSitesInActiveSubscription).toHaveBeenCalled();
    });
  });

  describe('Showing the result page', function () {

    it('should have a single enabled close button close after data has been saved', function () {
      this.controller.next();
      this.$scope.$digest();
      const button = this.view.find('.modal-footer').find('button');
      expect(button.length).toBe(1);
      expect(_.includes(button[0].innerHTML, 'common.close')).toBeTruthy();
      expect(button[0].disabled).toBeFalsy();
    });
    it('should have a success text for deletion', function () {
      this.controller.next();
      this.$scope.$digest();
      const bodyHtml = this.view.find('.modal-body')[0].innerHTML;
      expect(_.includes(bodyHtml, 'deleteSiteSuccessModalTitle')).toBeTruthy();
      expect(_.includes(bodyHtml, 'deleteSiteFailureModalTitle')).toBeFalsy();
    });
    it('should have a failure text for deletion', function () {
      this.SetupWizardService.updateSitesInActiveSubscription.and.returnValue(this.$q.reject());
      this.controller.next();
      this.$scope.$digest();
      const bodyHtml = this.view.find('.modal-body')[0].innerHTML;
      expect(_.includes(bodyHtml, 'deleteSiteSuccessModalTitle')).toBeFalsy();
      expect(_.includes(bodyHtml, 'deleteSiteFailureModalTitle')).toBeTruthy();
    });

  });

});

