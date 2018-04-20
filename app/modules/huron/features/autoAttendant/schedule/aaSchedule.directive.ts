class AAScheduleDirective implements ng.IDirective {
  public template = require('./aaSchedule.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const AAScheduleDirectiveFactory: ng.IDirectiveFactory = () => new AAScheduleDirective();

angular
  .module('uc.autoattendant')
  .directive('aaSchedule', AAScheduleDirectiveFactory);
