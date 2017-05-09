import { IConnectorAlarm } from 'modules/hercules/hybrid-services.types';
import alarmListSection from './index';

describe('Component: AlarmListSectionComponent  ', () => {
  let $componentController, $state, ctrl;

  beforeEach(angular.mock.module('Hercules'));

  beforeEach(function () {
    this.initModules(alarmListSection);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$state_) {
    $componentController = _$componentController_;
    $state = _$state_;
  }

  function cleanup() {
    $componentController = $state = ctrl = undefined;
  }

  function initSpies() {
    spyOn($state, 'go');
  }

  function initController(alarms: IConnectorAlarm[], connectorType: string,
                          newLink: string) {
    ctrl = $componentController('alarmListSection', {}, {
      alarms: alarms,
      connectorType: connectorType,
      newLink: newLink,
    });
  }

  const templateAlarm: IConnectorAlarm = {
    id: '1',
    title: 't',
    firstReported: '1475651563',
    lastReported: '1475753923',
    description: 'd',
    severity: 'warning',
    solution: 'so',
    solutionReplacementValues: [
      {
        text: 't',
        link: 'l',
      },
    ],
  };

  it ('should change state to hybrid-services-connector-sidepanel.alarm-details in goToAlarm() when newLink is true', () => {
    let alarms = [templateAlarm];
    let connectorType = 'c_mgmt';
    let newLink = 'true';
    initController(alarms, connectorType, newLink);
    expect(ctrl).toBeDefined();

    ctrl.goToAlarm(templateAlarm);
    expect($state.go).toHaveBeenCalledWith('hybrid-services-connector-sidepanel.alarm-details', { alarm: templateAlarm });
  });

  it ('should change state to expressway-cluster-sidepanel.alarm-details in goToAlarm() for c_mgmt connector', () => {
    let alarms = [templateAlarm];
    let connectorType = 'c_mgmt';
    let newLink = 'false';
    initController(alarms, connectorType, newLink);
    expect(ctrl).toBeDefined();

    ctrl.goToAlarm(templateAlarm);
    expect($state.go).toHaveBeenCalledWith('expressway-cluster-sidepanel.alarm-details', { alarm: templateAlarm });
  });

  it ('should change state to hds-cluster-details.alarm-details in goToAlarm() for hds_app connector', () => {
    let alarms = [templateAlarm];
    let connectorType = 'hds_app';
    let newLink = 'false';
    initController(alarms, connectorType, newLink);
    expect(ctrl).toBeDefined();

    ctrl.goToAlarm(templateAlarm);
    expect($state.go).toHaveBeenCalledWith('hds-cluster-details.alarm-details', { alarm: templateAlarm });
  });

  it ('should getSeverityIcon returns right icon', () => {
    let alarms = [templateAlarm];
    let connectorType = 'c_mgmt';
    let newLink = 'false';
    initController(alarms, connectorType, newLink);
    expect(ctrl.getSeverityIcon('critical')).toBe('icon icon-error');
    expect(ctrl.getSeverityIcon('error')).toBe('icon icon-priority');
    expect(ctrl.getSeverityIcon('warning')).toBe('icon icon-warning');
    expect(ctrl.getSeverityIcon('alert')).toBe('icon icon-info');
  });

});
