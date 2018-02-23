class HybridMediaUpgradeScheduleCtrl implements ng.IComponentController {
  public formData: any;
  public formOptions: any;
  public upgradeSchedule: any;
  public errorMessage: string = '';
  private KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  private onUpgradeScheduleUpdate: Function;


  public upgradeScheduleTitle = {
    title: 'mediaFusion.easyConfig.upgradeschedule',
  };

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private TimezoneService,
  ) { }

  public onInit() {
    this.formOptions = {
      day: this.getDayOptions(),
      time: this.getTimeOptions(),
      timeZone: this.getTimeZoneOptions(),
    };
    this.formData = {
      scheduleTime: this.formOptions.time[3],
      scheduleTimeZone: this.formOptions.timeZone[393],
      scheduleDay: this.formOptions.day[0],
    };
    this.$scope.$watch(() => {
      return this.formData;
    }, (newValue, oldValue) => {
      if (_.isEmpty(oldValue) || newValue === oldValue) {
        return;
      }
      if (_.isFunction(this.onUpgradeScheduleUpdate)) {
        this.onUpgradeScheduleUpdate({ someData: { upgradeSchedule: this.formData } });
      } else {
        this.onUpgradeScheduleUpdate({ someData: { upgradeSchedule: this.formData } });
      }
    }, true);
  }

  private labelForTime(time) {
    const currentLanguage = this.$translate.use();
    if (currentLanguage === 'en_US') {
      return moment(time, 'HH:mm').format('hh:mm A');
    } else {
      return time;
    }
  }

  private getTimeOptions() {
    const values = _.range(0, 24).map((time: number) => {
      return _.padStart(time.toString(), 2, '0') + ':00';
    });
    return _.map(values, (value) => {
      return {
        label: this.labelForTime(value),
        value: value,
      };
    });
  }

  private labelForDay(day) {
    return this.$translate.instant('weekDays.everyDay', {
      day: this.$translate.instant('weekDays.' + day),
    });
  }

  private getDayOptions() {
    const currentLanguage = this.$translate.use();
    const days: any = _.map(this.KEYS, (day) => {
      return {
        label: this.labelForDay(day),
        value: day,
      };
    });
    // if USA, put Sunday first
    return (currentLanguage === 'en_US') ? [days.pop()].concat(days) : days;
  }

  private labelForTimezone(zone): string {
    const map = this.TimezoneService.getCountryMapping();
    return map[zone] + ': ' + zone;
  }

  private getTimeZoneOptions() {
    const timezones = moment.tz.names()
      .filter((zone) => {
        const map = this.TimezoneService.getCountryMapping();
        return map[zone];
      })
      .map((zone) => {
        return {
          label: this.labelForTimezone(zone),
          value: zone,
        };
      })
      .sort((a, b) => {
        return a['label'].localeCompare(b['label']);
      });
    return timezones;
  }

}

export class HybridMediaUpgradeScheduleComponent implements ng.IComponentOptions {
  public controller = HybridMediaUpgradeScheduleCtrl;
  public template = require('./hybrid-media-upgrade-schedule.tpl.html');
  public bindings = {
    onUpgradeScheduleUpdate: '&?',
  };
}
