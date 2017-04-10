import { AlarmDetailsSidepanelCtrl } from './alarm-details-sidepanel.component';

describe('Component: AlarmDetailsSidepanel', () => {

  let $scope, $componentController, controller: AlarmDetailsSidepanelCtrl;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));

  function dependencies(_$componentController_, $rootScope) {
    $scope = $rootScope.$new();
    $componentController = _$componentController_;
  }

  function initController(alarm) {
    controller = $componentController('alarmDetailsSidepanel', { $scope: $scope }, { alarm: alarm });
    controller.$onChanges({
      alarm: {
        previousValue: undefined,
        currentValue: alarm,
        isFirstChange() {
          return true;
        },
      },
    });
    $scope.$apply();
  }

  it('should deal with no alarm solution', () => {
    initController({});
    expect(controller.alarm.alarmSolutionElements).toBeUndefined();
  });

  it('should deal with a solution with no replacement values', () => {
    initController({ solution: 'This solution has no replacement values' });
    expect(controller.alarm.alarmSolutionElements.length).toBe(1);
    expect(controller.alarm.alarmSolutionElements[0].text).toEqual('This solution has no replacement values');
    expect(controller.alarm.alarmSolutionElements[0].link).toBeUndefined();
  });

  it('should deal with a solution with a non-link replacement value', () => {
    initController(
      {
        solution: 'This solution has one %s replacement value without a link',
        solutionReplacementValues: [
          { text: 'Foo' },
        ],
      });
    expect(controller.alarm.alarmSolutionElements.length).toBe(3);
    expect(controller.alarm.alarmSolutionElements[0].text).toEqual('This solution has one ');
    expect(controller.alarm.alarmSolutionElements[0].link).toBeUndefined();
    expect(controller.alarm.alarmSolutionElements[1].text).toEqual('Foo');
    expect(controller.alarm.alarmSolutionElements[1].link).toBeUndefined();
    expect(controller.alarm.alarmSolutionElements[2].text).toEqual(' replacement value without a link');
    expect(controller.alarm.alarmSolutionElements[2].link).toBeUndefined();
  });

  it('should deal with a solution with multiple replacement values', () => {
    initController(
      {
        solution: 'This solution %s has two %s replacement values',
        solutionReplacementValues: [
          { text: 'Foo', link: 'https://foo.com' },
          { text: 'Bar', link: 'https://bar.com' },
        ],
      });
    expect(controller.alarm.alarmSolutionElements.length).toBe(5);
    expect(controller.alarm.alarmSolutionElements[0].text).toEqual('This solution ');
    expect(controller.alarm.alarmSolutionElements[0].link).toBeUndefined();
    expect(controller.alarm.alarmSolutionElements[1].text).toEqual('Foo');
    expect(controller.alarm.alarmSolutionElements[1].link).toEqual('https://foo.com');
    expect(controller.alarm.alarmSolutionElements[2].text).toEqual(' has two ');
    expect(controller.alarm.alarmSolutionElements[2].link).toBeUndefined();
    expect(controller.alarm.alarmSolutionElements[3].text).toEqual('Bar');
    expect(controller.alarm.alarmSolutionElements[3].link).toEqual('https://bar.com');
    expect(controller.alarm.alarmSolutionElements[4].text).toEqual(' replacement values');
    expect(controller.alarm.alarmSolutionElements[4].link).toBeUndefined();
  });
});
