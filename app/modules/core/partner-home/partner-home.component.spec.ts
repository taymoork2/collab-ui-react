import testModule from './index';

describe('Component: partnerHome', () => {
  const FULL_CARD = 'cs-card--full';
  const DAYS_LEFT = 'partnerHomePage.aria.daysLeft';
  const DAYS_SINCE = 'partnerHomePage.aria.daysSinceExp';
  const HREF = 'href';
  const MESSAGE_FORMAT = 'messageformat';
  const USER_TOTALS = 'partnerHomePage.aria.userTotals';

  const ACTIVE_TRIAL = {
    customerName: 'active Customer',
    customerOrgId: 'orgid',
    daysLeft: 80,
    duration: 90,
    licenses: 25,
    state: 'ACTIVE',
    usage: 18,
  };

  const EXPIRED_TRIAL = _.cloneDeep(ACTIVE_TRIAL);
  EXPIRED_TRIAL.customerName = 'expired Customer';
  EXPIRED_TRIAL.daysLeft = -6;
  EXPIRED_TRIAL.state = 'EXPIRED';

  const WARNING_TRIAL = _.cloneDeep(ACTIVE_TRIAL);
  WARNING_TRIAL.customerName = 'warning Customer';
  WARNING_TRIAL.daysLeft = 10;

  beforeEach(function () {
    // TODO: remove 'Core' once PartnerService is moved to a separate module
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      '$translate',
      '$window',
      'Analytics',
      'CardUtils',
      'FeatureToggleService',
      'Notification',
      'Orgservice',
      'PartnerService',
      'TrialService',
    );

    this.$state.modal = {
      result: this.$q.resolve(true),
    };

    spyOn(this.$state, 'href').and.returnValue(HREF);
    spyOn(this.$state, 'go').and.returnValue(this.$q.resolve(true));
    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.$window, 'open');
    spyOn(this.Analytics, 'trackTrialSteps');
    spyOn(this.CardUtils, 'resize');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.TrialService, 'getTrialsList').and.returnValue(this.$q.resolve(true));
    spyOn(this.TrialService, 'getAddTrialRoute').and.returnValue({
      path: 'path',
      params: {},
    });
    spyOn(this.Orgservice, 'isTestOrg').and.returnValue(this.$q.resolve(false));
    spyOn(this.PartnerService, 'loadRetrievedDataToList').and.returnValue(this.$q.resolve([ACTIVE_TRIAL, EXPIRED_TRIAL, WARNING_TRIAL]));
  });

  describe('Positive Controller Tests - ', function () {
    beforeEach(function () {
      this.compileComponent('partnerHome', {});
    });

    it('should initialize with expected defaults', function () {
      expect(this.controller.showTrialsRefresh).toBe(false);
      expect(this.controller.showExpired).toBe(true);
      expect(this.controller.hcsFeatureToggle).toBe(false);
      expect(this.controller.isCustomerPartner).toBe(false);
      expect(this.controller.isTestOrg).toBe(false);
      expect(this.controller.activeList).toEqual([ACTIVE_TRIAL, WARNING_TRIAL]);
      expect(this.controller.expiredList).toEqual([EXPIRED_TRIAL]);
      expect(this.controller.notifications).toEqual([]);
      expect(this.controller.cardSize).toEqual(FULL_CARD);

      // API Calls
      expect(this.CardUtils.resize).toHaveBeenCalledTimes(2);
    });

    it('ariaTrialLabel should return a translated string', function () {
      expect(this.controller.ariaTrialLabel(ACTIVE_TRIAL)).toEqual(`${ACTIVE_TRIAL.customerName}, ${DAYS_LEFT}, ${USER_TOTALS}`);
      expect(this.$translate.instant).toHaveBeenCalledWith(DAYS_LEFT, {
        count: ACTIVE_TRIAL.daysLeft,
      }, MESSAGE_FORMAT);
      expect(this.$translate.instant).toHaveBeenCalledWith(USER_TOTALS, {
        users: ACTIVE_TRIAL.usage,
        licenses: ACTIVE_TRIAL.licenses,
      });
    });

    it('ariaExpLabel should return a translated string', function () {
      expect(this.controller.ariaExpLabel(EXPIRED_TRIAL)).toEqual(`${EXPIRED_TRIAL.customerName}, ${DAYS_SINCE}, ${USER_TOTALS}`);
      expect(this.$translate.instant).toHaveBeenCalledWith(DAYS_SINCE, {
        count: Math.abs(EXPIRED_TRIAL.daysLeft),
      }, MESSAGE_FORMAT);
      expect(this.$translate.instant).toHaveBeenCalledWith(USER_TOTALS, {
        users: EXPIRED_TRIAL.usage,
        licenses: EXPIRED_TRIAL.licenses,
      });
    });

    it('getProgressStatus should return expected response based on trial status', function () {
      expect(this.controller.getProgressStatus(ACTIVE_TRIAL)).toEqual('success');
      expect(this.controller.getProgressStatus(EXPIRED_TRIAL)).toEqual('danger');
      expect(this.controller.getProgressStatus(WARNING_TRIAL)).toEqual('warning');
    });
  });

  describe('Negative Controller Tests - ', function () {
    it('should display an error notification when TrialService.getTrialsList fails', function () {
      this.TrialService.getTrialsList.and.returnValue(this.$q.reject(false));
      this.compileComponent('partnerHome', {});
      expect(this.Notification.errorResponse).toHaveBeenCalledWith(false, 'partnerHomePage.errGetTrialsQuery');
    });
  });

  describe('View - ', function () {
    // html locators
    const ACTIVE_TRIAL_ROWS = 'div.trial';
    const EXPIRED_TRIAL_ROWS = 'div.trialRow.collapse-both';
    const EXPIRED_DIV = 'div.expired';
    const TRIAL_BUTTON = '#trialAddButton';
    const TRIAL_LICENSE = 'div.trialLicense';

    beforeEach(function () {
      this.compileComponent('partnerHome', {});
    });

    it('should display active and expired trials', function () {
      const activeTrials = this.view.find(ACTIVE_TRIAL_ROWS);
      expect(activeTrials.length).toBe(2);
      expect(activeTrials.last().find('a').html()).toContainText(ACTIVE_TRIAL.customerName);
      expect(activeTrials.last().find(TRIAL_LICENSE).html()).toEqual(` <span class="ng-binding">${ACTIVE_TRIAL.usage}</span>/<span class="ng-binding">${ACTIVE_TRIAL.licenses}</span> `);

      const expiredTrials = this.view.find(EXPIRED_TRIAL_ROWS);
      expect(expiredTrials.length).toBe(1);
      expect(expiredTrials.find('a').html()).toContainText(EXPIRED_TRIAL.customerName);
      expect(expiredTrials.find(EXPIRED_DIV).html()).toEqual(` <span class="ng-binding">${EXPIRED_TRIAL.usage}</span>/<span class="ng-binding">${EXPIRED_TRIAL.licenses}</span> `);
    });

    it('should call openAddTrialModal on Trial button click', function () {
      this.view.find(TRIAL_BUTTON).click();
      this.$scope.$apply();

      expect(this.Analytics.trackTrialSteps).toHaveBeenCalled();
      expect(this.PartnerService.loadRetrievedDataToList).toHaveBeenCalledTimes(2);
    });

    it('should open a new window when an active customers name is clicked', function () {
      this.view.find(ACTIVE_TRIAL_ROWS).last().find('a').click();
      expect(this.$window.open).toHaveBeenCalledWith(HREF);
      expect(this.$state.href).toHaveBeenCalledWith('login', {
        customerOrgId: ACTIVE_TRIAL.customerOrgId,
      });
    });

    it('should open a new window when an expired customers name is clicked', function () {
      this.view.find(EXPIRED_TRIAL_ROWS).find('a').click();
      expect(this.$window.open).toHaveBeenCalledWith(HREF);
      expect(this.$state.href).toHaveBeenCalledWith('login', {
        customerOrgId: EXPIRED_TRIAL.customerOrgId,
      });
    });
  });
});
