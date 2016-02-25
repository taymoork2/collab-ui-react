'use strict';

describe('WebExUserSettingsFactTest', function () {
  var Notification;
  var WebexUserSettingsSvc;

  /**  
    var MyReporter = function () {
      jasmineRequire.JsApiReporter.apply(this, arguments);
    };
    MyReporter.prototype = jasmineRequire.JsApiReporter.prototype;
    MyReporter.prototype.constructor = MyReporter;
    MyReporter.prototype.specDone = function (o) {
      o = o || {};
      if (o.status !== "passed") {
        console.warn("Failed:" + o.fullName + o.failedExpectations[0].message);
      }
    };
    var env = jasmine.getEnv();
    env.addReporter(new MyReporter());
  **/

  beforeEach(module('WebExApp'));

  beforeEach(module(function ($provide) {
    //webExUserSettingsModel.pmr.value
    WebexUserSettingsSvc = {
      'pmr': {
        'isSiteEnabled': true,
        'value': true
      },
      //webExUserSettingsModel.cmr.value
      'cmr': {
        'value': true
      },
      //webExUserSettingsModel.telephonyPriviledge.callInTeleconf.value
      'telephonyPriviledge': {
        "telephonyType": {
          "isWebExAudio": false,
          "isTspAudio": false
        },
        "hybridAudio": {
          "isSiteEnabled": false
        },
        'callInTeleconf': {
          'value': false,
          'selectedCallInTollType': 0,
          'toll': {
            'value': false
          },
          'tollFree': {
            'value': false
          },
          'teleconfViaGlobalCallIn': {
            'isSiteEnabled': false,
            'value': false
          },
          'teleCLIAuthEnabled': {
            'isSiteEnabled': false,
            'value': false
          }
        },
        'callBackTeleconf': {
          'isSiteEnabled': false,
          'value': false,
          'globalCallBackTeleconf': {
            'isSiteEnabled': false,
            'value': false
          }
        },
        'otherTeleconfServices': {
          'isSiteEnabled': false,
          'value': false
        },
        'integratedVoIP': {
          'isSiteEnabled': false,
          'value': false
        }
      },
      'videoSettings': {
        'hiQualVideo': {
          'isSiteEnabled': false,
          'value': false,
          'hiDefVideo': {
            'isSiteEnabled': false,
            'value': false
          }
        }
      },
      "meetingCenter": {
        "id": "MC",
        "serviceType": "MeetingCenter",
        "isSiteEnabled": false
      },
      "trainingCenter": {
        "id": "TC",
        "serviceType": "TrainingCenter",
        "isSiteEnabled": false,
        "handsOnLabAdmin": {
          "value": false,
          "isSiteEnabled": false
        }
      },
      "eventCenter": {
        "id": "EC",
        "serviceType": "EventCenter",
        "isSiteEnabled": false,
        "optimizeBandwidthUsage": {
          "isSiteEnabled": false,
          "value": false
        }
      },
      "supportCenter": {
        "id": "SC",
        "serviceType": "SupportCenter",
        "isSiteEnabled": false
      },
      'disableCancel2': false,
      'isT31Site': false
    };
    $provide.value('WebexUserSettingsSvc', WebexUserSettingsSvc);
  }));

  beforeEach(inject(function (_Notification_) {
    Notification = _Notification_;
    spyOn(Notification, 'notify');
  }));

  it('Does not allow PMR + CMR without callInTeleconf', inject(function (WebExUserSettingsFact) {
    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Allows PMR + CMR with callInTeleconf', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).not.toHaveBeenCalled();
  }));

  it('Does not allow PMR + CMR with WebexAudio but without hybridAudio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Allows PMR + CMR with WebexAudio and hybridAudio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;
    WebexUserSettingsSvc.telephonyPriviledge.hybridAudio.isSiteEnabled = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).not.toHaveBeenCalled();
  }));

  it('Does not allow PMR + CMR with WebexAudio but without hybridAudio and without integratedVoIP for T31', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true; //no hybrid audio or integrated VOIP

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Does not allow PMR + CMR with WebexAudio but with hybridAudio without integratedVoIP for T31', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;
    WebexUserSettingsSvc.telephonyPriviledge.hybridAudio.isSiteEnabled = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Allowa PMR + CMR with WebexAudio but with hybridAudio and integratedVoIP for T31', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;
    WebexUserSettingsSvc.telephonyPriviledge.hybridAudio.isSiteEnabled = true;
    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true;

    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true; //hybrid audio and integrated voip
    expect(Notification.notify).not.toHaveBeenCalled();
  }));

  it('Allowa PMR + CMR with WebexAudio but without hybridAudio and with integratedVoIP for T31', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;

    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true;
    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));
});
