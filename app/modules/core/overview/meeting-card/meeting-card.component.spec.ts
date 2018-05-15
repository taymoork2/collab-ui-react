import testModule from 'modules/core/overview/license-card/index';
import { OverviewEvent } from 'modules/core/overview/overview.keys';
import { WebexProvisioningEvent } from 'modules/core/overview/provisioning.keys';

describe('Component: licenseCard', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$q',
      '$rootScope',
      '$scope',
      'LicenseCardHelperService',
      'UrlConfig',
    );

    this.pendingMeetings = [{ status: WebexProvisioningEvent.STATUS_PENDING_PARM, productName: WebexProvisioningEvent.WEBEX_PRODUCT_NAME }];
    this.meetingsProvisioning = [{ status: WebexProvisioningEvent.STATUS_PENDING_PROV, productName: WebexProvisioningEvent.WEBEX_PRODUCT_NAME }];
  });

  function initComponent(): void {
    this.compileComponent('meetingCard', {});
  }

  describe('View:', function () {
    // HTML elements to detect displayed content
    const OVERVIEW_MEETINGS_SETUP_MESSAGE = '.meetings-detail-spacing';
    const OVERVIEW_MEETINGS_SETUP_WARNING = '.icon.icon-warning.warning-specs';
    const OVERVIEW_MEETINGS_PROVISIONING = '.icon.icon-priority.priority-specs';

    it('should display webex meetings not setup after broadcasts', function () {
      initComponent.call(this);
      this.$rootScope.$emit(OverviewEvent.MEETING_SETTINGS_PROVISIONING_STATUS, this.pendingMeetings);
      this.$scope.$apply();

      expect(this.controller.needsWebExSetup).toBe(true);
      expect(this.view.find(OVERVIEW_MEETINGS_SETUP_MESSAGE).first().html()).toEqual('overview.cards.meeting.meetingsNotSetUp');
      expect(this.view).toContainElement(OVERVIEW_MEETINGS_SETUP_WARNING);
    });

    it('should display that meetings are being provisioned', function () {
      initComponent.call(this);
      this.$rootScope.$emit(OverviewEvent.MEETING_SETTINGS_PROVISIONING_STATUS, this.meetingsProvisioning);
      this.$scope.$apply();

      expect(this.controller.isProvisioning).toBe(true);
      expect(this.view.find(OVERVIEW_MEETINGS_SETUP_MESSAGE).html()).toEqual('overview.cards.meeting.serviceProvisioning');
      expect(this.view).toContainElement(OVERVIEW_MEETINGS_PROVISIONING);
    });
  });
});
