import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { AccessibilityService } from 'modules/core/accessibility';

const webexAction = {
  PERSONAL_ROOM: 'Cisco Webex Personal Room (or @webex:myroom)',
  TEAMS_SPACE: 'Cisco Webex Teams Space (or @webex:space)',
};

const meetAction = {
  PERSONAL_ROOM: 'Cisco Webex Personal Room (or @meet:myroom)',
  TEAMS_SPACE: 'Cisco Webex Teams Space (or @meet:space)',
  TMS_MEETING: 'Cisco TelePresence Management Suite',
};

class KeywordsSectionCtrl implements ng.IComponentController {
  public generalSectionTexts = {
    title: 'common.keywords',
  };

  public defaultCalendarWebexActionOptions: string[] = Object.keys(webexAction).map(function(type) {
    return webexAction[type];
  });
  public defaultCalendarWebexAction = '';
  public defaultCalendarActionSelectPlaceholder = this.$translate.instant('hercules.settings.defaultCalendarActionSelectPlaceholder');
  public defaultCalendarMeetActionOptions: string[] = Object.keys(meetAction).map(function(type) {
    return meetAction[type];
  });
  public defaultCalendarMeetAction = '';

  public searchable = true;
  public hasCalsvcDefaultActionFeatureToggle = false;
  public setFocus: boolean;

  private serviceId: HybridServiceId;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $translate: ng.translate.ITranslateService,
    private AccessibilityService: AccessibilityService,
    private FeatureToggleService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) {}

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { serviceId } = changes;
    if (serviceId && serviceId.currentValue) {
      this.init(serviceId.currentValue);
    }
    if (this.setFocus) {
      this.AccessibilityService.setFocus(this.$element, 'tags-input input');
    }
  }

  private init(serviceId: HybridServiceId) {
    if (serviceId === 'squared-fusion-o365') {
      serviceId = 'squared-fusion-cal';
    }
    this.serviceId = serviceId;
    this.ServiceDescriptorService.getOrgSettings()
      .then(orgSettings => {
        if (orgSettings.defaultCalendarWebexAction !== undefined) {
          if (orgSettings.defaultCalendarWebexAction === 'NONE') { // backward compatibility
            this.defaultCalendarWebexAction = webexAction['PERSONAL_ROOM'];
          } else {
            this.defaultCalendarWebexAction = webexAction[orgSettings.defaultCalendarWebexAction];
          }
        }
        if (orgSettings.defaultCalendarMeetAction !== undefined) {
          if (orgSettings.defaultCalendarMeetAction === 'NONE') { // backward compatibility
            this.defaultCalendarMeetAction = meetAction['TEAMS_SPACE'];
          } else {
            this.defaultCalendarMeetAction = meetAction[orgSettings.defaultCalendarMeetAction];
          }
        }
      });
    this.FeatureToggleService.calsvcDefaultActionGetStatus()
      .then(support => {
        this.hasCalsvcDefaultActionFeatureToggle = support;
      });
  }

  public isCalendarService() {
    return this.serviceId === 'squared-fusion-cal' || this.serviceId === 'squared-fusion-gcal';
  }

  private getEnumKey(enumType, value) {
    return Object.keys(enumType).filter(function(k) {
      return value === enumType[k];
    }).pop() || '';
  }

  public setDefaultCalendarAction() {
    this.ServiceDescriptorService.setDefaultCalendarAction(this.getEnumKey(webexAction, this.defaultCalendarWebexAction),
                                                           this.getEnumKey(meetAction, this.defaultCalendarMeetAction))
      .then(() => this.Notification.success('hercules.settings.defaultCalendarActionSavingSuccess'))
      .catch(error => this.Notification.errorWithTrackingId(error, 'hercules.settings.defaultCalendarActionSavingError'));
  }
}

export class KeywordsSectionComponent implements ng.IComponentOptions {
  public controller = KeywordsSectionCtrl;
  public template = require('modules/hercules/keywords-section/keywords-section.html');
  public bindings = {
    serviceId: '<',
    setFocus: '<?',
  };
}
