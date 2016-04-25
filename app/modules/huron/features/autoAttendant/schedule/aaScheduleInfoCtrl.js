(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAScheduleInfoCtrl', AAScheduleInfoCtrl);

  /* @ngInject */
  function AAScheduleInfoCtrl($scope, AAICalService, AACalendarService, AAModelService, AAUiModelService, $translate) {

    var vm = this;
    /* schedule model  */
    vm.dayGroup = [{
      label: '',
      hours: []
    }];
    vm.schedule = "";
    vm.openHours = [];
    vm.holidays = [];
    vm.activate = activate;
    vm.laneTitle = '';
    vm.isOpenClosed = isOpenClosed;
    vm.isClosed = isClosed;
    vm.isHolidays = isHolidays;
    vm.formatDate = formatDate;
    vm.formatTime = formatTime;
    vm.isStartTimeSet = false;

    $scope.$on('ScheduleChanged', function () {
      if (vm.aaModel.aaRecord.scheduleId) {
        populateScheduleHours();
      }
    });

    vm.scheduleClass = 'aa-panel-body';

    function populateScheduleHours() {
      vm.dayGroup = [];
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = AAUiModelService.getUiModel();
      populateHours();
    }

    function getHoursInfo() {
      var consolidateDate = {
        year: 2016,
        month: 3,
        date: 11
      };
      //Prepares a list of days and the corresponding Open/Closed hours
      vm.days = angular.copy(AAICalService.getDefaultDayHours());
      _.forEach(vm.openhours, function (hour) {
        var dayhour = {
          starttime: 0,
          endtime: 0
        };
        dayhour.starttime = moment(hour.starttime).set(consolidateDate);
        dayhour.endtime = moment(hour.endtime).set(consolidateDate);
        _.forEach(hour.days, function (wday, index) {
          if (wday.active) {
            addUniqueHours(vm.days[index], dayhour);
          }
        });
      });

      _.each(vm.days, function (day) {
        //order the hours of each day by starttime
        day.hours.sort(function (a, b) {
          return (a.starttime - b.starttime);
        });
      });

      //consolidate mulitple Hours if necessary
      _.each(vm.days, function (day) {
        consolidateHours(day.hours);
      });

      if (vm.schedule === 'closedHours') {
        getClosedHours(vm.days);
      }

      getFormattedOpenhours();
    }

    function addUniqueHours(day, dayhour) {
      if (!_.where(day.hours, dayhour).length) {
        day.hours.push(angular.copy(dayhour));
      }
    }

    function is24HoursOpen(hour) {
      var hh = moment().set('hour', '00').set('minute', '00').format('hh:mm a');
      var endhh = moment().set('hour', '23').set('minute', '59').format('hh:mm a');
      return (moment(hour.starttime).format('hh:mm a') === hh &&
        moment(hour.endtime).format('hh:mm a') === endhh);
    }

    function consolidateHours(hours) {
      var range1, range2;
      for (var i = 0; i < hours.length; i++) {
        if (hours.length === 1) {
          return;
        }

        for (var j = i + 1; j < hours.length;) {
          var s1 = hours[i].starttime;
          var e1 = hours[i].endtime;
          range1 = moment().range(s1, e1);
          var s2 = hours[j].starttime;
          var e2 = hours[j].endtime;
          range2 = moment().range(s2, e2);
          if (range1.overlaps(range2) || range1.intersect(range2)) {
            var range3 = range1.add(range2);
            hours[i].starttime = range3.start;
            hours[i].endtime = range3.end;
            hours.splice(j, 1);
          } else if (range2.contains(s1) && range2.contains(e1)) {
            hours[i].starttime = s2;
            hours[i].endtime = e2;
            hours.splice(j, 1);
          } else if (range1.contains(s2) && range1.contains(e2)) {
            hours.splice(j, 1);
          } else if (range2.contains(e1)) {
            hours[i].starttime = s1;
            hours[i].endtime = e2;
            hours.splice(j, 1);
          } else {
            break;
          }
        }
      }
      return;
    }

    function getFormattedOpenhours(hour, dayhour) {
      if (vm.schedule === 'openHours') {
        _.each(vm.days, function (day) {
          _.each(day.hours, function (hour) {
            hour.starttime = moment(hour.starttime).format('hh:mm a');
            hour.endtime = moment(hour.endtime).format('hh:mm a');
          });
        });
      }
    }

    function getClosedHours() {
      var hh = moment().set('hour', '00').set('minute', '00').format('hh:mm a');
      var endhh = moment().set('hour', '23').set('minute', '59').format('hh:mm a');
      var dayhour = {
        starttime: 0,
        endtime: 0
      };
      var closedHours = angular.copy(AAICalService.getDefaultDayHours());
      _.each(vm.days, function (day, index) {
        if (angular.isUndefined(day.hours) || day.hours.length === 0) {
          //Inactive days will have all day closed 12:00am  - 11:59pm
          dayhour.starttime = hh;
          dayhour.endtime = endhh;
          addUniqueHours(closedHours[index], dayhour);
        }
        _.each(day.hours, function (hour, i) {
          var numberOfHours = day.hours.length;
          if (!is24HoursOpen(hour)) {
            var starttime = moment(hour.starttime).subtract(1, 'm').format('hh:mm a');
            var endtime = moment(hour.endtime).add(1, 'm').format('hh:mm a');
            if (!i && moment(hour.starttime).format('hh:mm a') !== hh) {
              //First interval starts at 12:00AM if it is not part of open hours
              dayhour.starttime = hh;
              dayhour.endtime = starttime;
              addUniqueHours(closedHours[index], dayhour);
            }
            if (i + 1 < numberOfHours) {
              dayhour.starttime = endtime;
              dayhour.endtime = moment(day.hours[i + 1].starttime).subtract(1, 'm').format('hh:mm a');
              addUniqueHours(closedHours[index], dayhour);
            }
            if (i + 1 === numberOfHours && moment(hour.endtime).format('hh:mm a') !== endhh) {
              //last interval ends with 11:59pm if it is not part of open hours
              dayhour.starttime = endtime;
              dayhour.endtime = endhh;
              addUniqueHours(closedHours[index], dayhour);
            }
          }
        });
      });
      vm.days = angular.copy(closedHours);
    }

    function prepareDayHourReport() {

      //Groups the days together in a range if the hours are same.
      vm.dayGroup = [];
      var indices = [];
      var indexListed = [];
      var numberofdays = 1;
      _.forEach(vm.days, function (wday, index) {
        var hour1 = wday.hours;
        var isIndexPresent = _.contains(indexListed, index);
        if (hour1.length && hour1[0].starttime && hour1[0].endtime && !isIndexPresent) {
          var range = {
            hours: [],
            label: ''
          };
          indices = [];
          indices.push(index);
          indexListed.push(index);
          range.hours = angular.copy(hour1);
          for (var i = index + 1; i < vm.days.length; i++) {
            var hour2 = vm.days[i].hours;
            if (hour1.length && hour2.length && hour1.length === hour2.length) {
              if (angular.equals(hour1, hour2)) {
                indices.push(i);
                indexListed.push(i);
              }
            }
          }
          if (indices.length >= 1) {
            var len = indices.length;
            var dayLabel = '';
            if (len > 1 && (indices[len - 1] - indices[0]) === len - 1) {
              dayLabel = (vm.days[indices[0]].label) + ' - ' + (vm.days[indices[len - 1]].label);
            } else {
              _.each(indices, function (index) {
                if (dayLabel !== '') {
                  dayLabel = dayLabel + ', ';
                  numberofdays = numberofdays++;
                }
                dayLabel = dayLabel + (vm.days[index].label);
              });
            }
            range.label = dayLabel;
            vm.dayGroup.push(range);
          }
        }

      });
      if (numberofdays >= 2) {
        vm.scheduleClass = 'aa-schedule-body';
      }

    }

    function populateHours() {
      if (vm.aaModel.aaRecord.scheduleId) {
        AACalendarService.readCalendar(vm.aaModel.aaRecord.scheduleId).then(function (data) {
          var calhours = AAICalService.getHoursRanges(data);
          vm.openhours = angular.copy(calhours.hours);
          vm.holidays = calhours.holidays;
          vm.scheduleClass = (angular.isDefined(vm.holidays) && vm.holidays.length) ? 'aa-schedule-body' : 'aa-panel-body';

          getScheduleTitle();

          if (angular.isDefined(vm.holidays) && vm.holidays.length) {
            vm.isStartTimeSet = isStartTimePresent();
          }

          if (vm.isOpenClosed() && angular.isDefined(vm.openhours) && vm.openhours.length) {
            getHoursInfo();
            prepareDayHourReport();
          }
        });
      }
    }

    function getScheduleTitle() {
      if (vm.schedule === 'openHours') {
        vm.laneTitle = $translate.instant('autoAttendant.scheduleOpen');
      } else if (vm.schedule === 'closedHours' && vm.ui.holidaysValue === 'closedHours') {
        vm.laneTitle = $translate.instant('autoAttendant.scheduleClosedHolidays');
      } else if (vm.schedule === 'closedHours') {
        vm.laneTitle = $translate.instant('autoAttendant.scheduleClosed');
      } else if (vm.schedule === 'holidays') {
        vm.laneTitle = $translate.instant('autoAttendant.scheduleHolidays');
      }
    }

    function isOpenClosed() {
      return (vm.schedule === 'openHours' || (vm.schedule === 'closedHours'));
    }

    function isClosed() {
      return (vm.schedule === 'closedHours' && (vm.holidays));
    }

    function isHolidays() {
      return (vm.schedule === 'holidays' && angular.isDefined(vm.holidays) && vm.holidays.length) || (vm.schedule === 'closedHours' && vm.ui.holidaysValue === 'closedHours');
    }

    function formatTime(tt) {
      return (tt) ? moment(tt).format('h:mm a') : 0;
    }

    function formatDate(dt) {
      return (moment(dt).format('MMM') === 'May') ? moment(dt).format('MMM DD, YYYY') : moment(dt).format('MMM. DD, YYYY');
    }

    function isStartTimePresent() {
      var flag = false;
      _.each(vm.holidays, function (day) {
        if (day.starttime) {
          flag = true;
        }
      });
      return flag;
    }

    function activate() {
      vm.schedule = $scope.schedule;
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = AAUiModelService.getUiModel();
      populateHours();
    }

    activate();
  }
})();
