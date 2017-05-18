import * as jstz from 'jstimezonedetect';
import { TimeOfDay, DayOfWeek } from 'modules/hercules/hybrid-services.types';

interface IUpgradeSchedule {
  scheduleDays: DayOfWeek[];
  scheduleTime: TimeOfDay;
}

export class HybridServicesI18NService {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public formatTimeAndDate = (upgradeSchedule: IUpgradeSchedule): string => {
    const time = this.labelForTime(upgradeSchedule.scheduleTime);
    let day;
    if (upgradeSchedule.scheduleDays.length === 7) {
      day = this.$translate.instant('weekDays.everyDay', {
        day: this.$translate.instant('weekDays.day'),
      });
    } else {
      day = this.labelForDay(upgradeSchedule.scheduleDays[0]);
    }
    return `${time} ${day}`;
  }


  public getLocalizedReleaseChannel = (channel: string): string => {
    return this.$translate.instant(`hercules.fusion.add-resource-group.release-channel.${channel}`);
  }

  public getTimeSinceText = (timestamp: number): string => {
    let timestampText = moment(timestamp).calendar(moment(), {
      sameElse: 'LL', // e.g. December 15, 2016
    });
    if (_.startsWith(timestampText, 'Last') || _.startsWith(timestampText, 'Today') || _.startsWith(timestampText, 'Tomorrow') || _.startsWith(timestampText, 'Yesterday')) {
      // Lowercase the first letter for some well known English terms (it just looked bad with these uppercase). Other languages are left alone.
      timestampText = timestampText[0].toLowerCase() + timestampText.slice(1);
    }
    return this.$translate.instant('hercules.cloudExtensions.sinceTime', {
      timestamp: timestampText,
    });
  }

  public getLocalTimestamp = (timestamp: number, format?: string): string => {
    let timezone = jstz.determine().name();
    if (timezone === null || _.isUndefined(timezone)) {
      timezone = 'UTC';
    }
    return moment(timestamp).local().tz(timezone).format(format || 'LLL (z)');
  }

  private labelForTime = (time: TimeOfDay): string => {
    const currentLanguage = this.$translate.use();
    if (currentLanguage === 'en_US') {
      return moment(time, 'HH:mm').format('hh:mm A');
    } else {
      return time;
    }
  }

  private labelForDay = (day: DayOfWeek): string => {
    return this.$translate.instant('weekDays.everyDay', {
      day: this.$translate.instant(`weekDays.${day}`),
    });
  }
}

export default angular
  .module('hercules.i18n', [
    require('angular-translate'),
  ])
  .service('HybridServicesI18NService', HybridServicesI18NService)
  .name;
