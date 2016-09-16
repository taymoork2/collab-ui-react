import onlineUpgradeModule from './index';

describe('Service: OnlineUpgradeService', () => {
  const ACTIVE = 'ACTIVE';
  const CANCELLED = 'CANCELLED';
  const CANCEL = 'CANCEL';

  beforeEach(function () {
    this.initModules(onlineUpgradeModule);
    this.injectDependencies(
      '$httpBackend',
      '$modal',
      'Authinfo',
      'OnlineUpgradeService',
      'UrlConfig'
    );

    spyOn(this.Authinfo, 'isOnline');
    spyOn(this.Authinfo, 'getSubscriptions').and.returnValue([]);
    spyOn(this.$modal, 'open').and.callThrough();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Non-online org should not force upgrade', () => {
    beforeEach(function () {
      this.Authinfo.isOnline.and.returnValue(false);
    });

    afterEach(function () {
      expect(this.OnlineUpgradeService.shouldForceUpgrade()).toEqual(false);
    });

    it('with all expired subscriptions', function () {
      this.Authinfo.getSubscriptions.and.returnValue([
        getExpiredSubscription(),
        getExpiredSubscription(),
      ]);
    });

    it('with all cancelled subscriptions', function () {
      this.Authinfo.getSubscriptions.and.returnValue([
        getCancelledSubscription(),
        getCancelledSubscription(),
      ]);
    });

    it('with all grace period subscriptions', function () {
      this.Authinfo.getSubscriptions.and.returnValue([
        getGracePeriodSubscription(),
        getGracePeriodSubscription(),
      ]);
    });

    it('with no subscriptions', function () {
      this.Authinfo.getSubscriptions.and.returnValue([]);
    });
  });

  describe('Online org', () => {
    beforeEach(function () {
      this.Authinfo.isOnline.and.returnValue(true);
    });

    describe('Should not force upgrade', () => {
      afterEach(function () {
        expect(this.OnlineUpgradeService.shouldForceUpgrade()).toEqual(false);
      });

      it('with at least one active subscription', function () {
        this.Authinfo.getSubscriptions.and.returnValue([
          getActiveSubscription(),
          getExpiredSubscription(),
          getCancelledSubscription(),
        ]);
      });

      it('with all grace period subscriptions', function () {
        this.Authinfo.getSubscriptions.and.returnValue([
          getGracePeriodSubscription(),
          getGracePeriodSubscription(),
        ]);
      });

      it('with no subscriptions', function () {
        this.Authinfo.getSubscriptions.and.returnValue([]);
      });
    });

    describe('Should force upgrade', () => {
      afterEach(function () {
        expect(this.OnlineUpgradeService.shouldForceUpgrade()).toEqual(true);
      });

      it('with all expired subscriptions', function () {
        this.Authinfo.getSubscriptions.and.returnValue([
          getExpiredSubscription(),
          getExpiredSubscription(),
        ]);
      });

      it('with all cancelled subscriptions', function () {
        this.Authinfo.getSubscriptions.and.returnValue([
          getCancelledSubscription(),
          getCancelledSubscription(),
        ]);
      });

      it('with mix of expired or cancelled subscriptions', function () {
        this.Authinfo.getSubscriptions.and.returnValue([
          getExpiredSubscription(),
          getCancelledSubscription(),
        ]);
      });
    });
  });

  describe('Subscriptions', () => {
    beforeEach(function () {
      this.Authinfo.getSubscriptions.and.returnValue([{
        subscriptionId: '123',
      }, {
        subscriptionId: '456',
      }]);

      installPromiseMatchers();
    });

    const patchPayload = {
      action: CANCEL,
    };

    it('cancelSubscriptions() should invoke PATCH for each subscription', function () {
      this.$httpBackend.expectPATCH(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/subscriptions/123', patchPayload).respond(200);
      this.$httpBackend.expectPATCH(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/subscriptions/456', patchPayload).respond(200);

      let cancelSubscriptionsPromise = this.OnlineUpgradeService.cancelSubscriptions();
      this.$httpBackend.flush();
      expect(cancelSubscriptionsPromise).toBeResolved();
    });

    it('cancelSubscriptions() should reject promise if one PATCH fails', function () {
      this.$httpBackend.expectPATCH(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/subscriptions/123', patchPayload).respond(200);
      this.$httpBackend.expectPATCH(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/subscriptions/456', patchPayload).respond(500);

      let cancelSubscriptionsPromise = this.OnlineUpgradeService.cancelSubscriptions();
      this.$httpBackend.flush();
      expect(cancelSubscriptionsPromise).toBeRejected();
    });

    it('getSubscriptionId() should get the first subscriptionId', function () {
      expect(this.OnlineUpgradeService.getSubscriptionId()).toEqual('123');
    });
  });

  describe('hasCancelledSubscriptions()', () => {
    it('should be true if all subscription statuses are cancelled', function () {
      this.Authinfo.getSubscriptions.and.returnValue([{
        status: CANCELLED,
      }, {
        status: CANCELLED,
      }]);
      expect(this.OnlineUpgradeService.hasCancelledSubscriptions()).toBe(true);
    });

    it('should be false if not all subscription statuses are cancelled', function () {
      this.Authinfo.getSubscriptions.and.returnValue([{
        status: CANCELLED,
      }, {
        status: ACTIVE,
      }]);
      expect(this.OnlineUpgradeService.hasCancelledSubscriptions()).toBe(false);
    });
  });

  describe('Upgrade Modal', () => {
    beforeEach(function () {
      this.OnlineUpgradeService.openUpgradeModal();
    });

    it('openUpgradeModal() should open static modal', function () {
      expect(this.$modal.open).toHaveBeenCalledWith({
        template: '<online-upgrade-modal></online-upgrade-modal>',
        backdrop: 'static',
        keyboard: false,
        type: 'dialog',
      });
      expect(this.OnlineUpgradeService.upgradeModal).toBeDefined();
    });

    it('dismissModal() should dismiss modal', function () {
      spyOn(this.OnlineUpgradeService.upgradeModal, 'dismiss');
      this.OnlineUpgradeService.dismissModal();
      expect(this.OnlineUpgradeService.upgradeModal.dismiss).toHaveBeenCalled();
    });
  });

  function getActiveSubscription() {
    return {
      subscriptionId: '123',
      status: ACTIVE,
      endDate: moment().add(1, 'days'),
    };
  }

  function getCancelledSubscription() {
    return _.assign(getActiveSubscription(), {
      status: CANCELLED,
    });
  }

  function getExpiredSubscription() {
    return _.assign(getActiveSubscription(), {
      endDate: moment().subtract(2, 'days'),
    });
  }

  function getGracePeriodSubscription() {
    return _.assign(getExpiredSubscription(), {
      gracePeriod: 7,
    });
  }
});
