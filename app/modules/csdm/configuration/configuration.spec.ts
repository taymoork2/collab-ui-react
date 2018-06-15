import { Configuration } from './configuration';
import configurationModule from '../services/index';

const raw = {
  'audio.input.line[1..1].videoassociation.muteoninactivevideo': {
    configuration: {
      type: 'string', enum: ['Off', 'On'],
    },
  },
  'audio.input.line[1..1].videoassociation.videoinputsource': {
    configuration: {
      type: 'string', enum: ['1', '2'],
    },
  },
  'audio.input.microphone[1..2].echocontrol.dereverberation': {
    configuration: {
      type: 'string', enum: ['Off', 'On'],
    },
  },
  'audio.input.microphone[1..2].echocontrol.mode': {
    configuration: {
      type: 'string', enum: ['Off', 'On'],
    },
  },
  'audio.output.speaker[1..2].level': {
    configuration: {
      type: 'integer',
    },
  },
  'networkservices.snmp.communityname': {
    configuration: {
      type: 'string',
    },
  },
  'networkservices.snmp.host[1..3].address': {
    configuration: {
      type: 'string',
    },
  },
  'networkservices.snmp.mode': {
    configuration: {
      type: 'string', enum: ['Off', 'ReadOnly', 'ReadWrite'],
    },
  },
  'standby.wakeupaction': {
    configuration: {
      type: 'string', enum: ['DefaultCameraPosition', 'None', 'RestoreCameraPosition'],
    },
  },
  'standby.wakeuponmotiondetection': {
    configuration: {
      type: 'string', enum: ['Off', 'On'],

    },
  },
  'systemunit.name': {
    configuration: {
      type: 'string',
    },
  },
  'time.zone': {
    configuration: {
      type: 'string', enum: ['Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa'],
    },
  },
  'userinterface.custommessage': {
    configuration: {
      type: 'string',
    },
  },
  'userinterface.osd.halfwakemessage': {
    configuration: {
      type: 'string',
    },
  },
  'userinterface.osd.output': {
    configuration: {
      type: 'string', enum: ['1'],

    },
  },
  'video.output.connector[1..1].cec.mode': {
    configuration: {
      type: 'string', enum: ['Off', 'On'],
    },
  },
  'video.activespeaker.defaultpipposition': {
    configuration: {
      type: 'string',
      enum: ['CenterLeft', 'CenterRight', 'Current', 'LowerLeft', 'LowerRight', 'UpperCenter', 'UpperLeft', 'UpperRight'],
    },
  },
  'video.input.connector[1..2].cameracontrol.cameraid': {
    configuration: {
      type: 'string', enum: ['1'],

    },
  },
  'video.input.connector[1..2].cameracontrol.mode': {
    configuration: {
      type: 'string', enum: ['Off'],

    },
  },
  'video.input.connector[1..2].inputsourcetype': {
    configuration: {
      type: 'string', enum: ['PC', 'camera', 'document_camera', 'mediaplayer', 'other', 'whiteboard'],

    },
  },
  'video.input.connector[1..2].name': {
    configuration: {
      type: 'string',
    },
  },
  'video.output.connector[1..2].cec.mode': {
    configuration: {
      type: 'string', enum: ['Off', 'On'],

    },
  },
  'video.output.connector[1..2].location.horizontaloffset': {
    configuration: {
      type: 'integer',
    },
  },
  'video.presentation.defaultpipposition': {
    configuration: {
      type: 'string',
      enum: ['CenterLeft', 'CenterRight', 'Current', 'LowerLeft', 'LowerRight', 'UpperCenter', 'UpperLeft', 'UpperRight'],

    },
  },
  'video.selfview.default.fullscreenmode': {
    configuration: {
      type: 'string', enum: ['Current', 'On', 'Off'],

    },
  },
  'video.selfview.default.mode': {
    configuration: {
      type: 'string', enum: ['Current', 'On', 'Off'],

    },
  },
  'video.selfview.default.onmonitorrole': {
    configuration: {
      type: 'string', enum: ['Current', 'First', 'Second'],

    },
  },
  'video.selfview.oncall.duration': {
    configuration: {
      type: 'integer',
    },
  },
  setAtAccountLevelAndEnforced: {
    configuration: {
      type: 'string',
    },
  },
};
describe('Schema', function () {
  beforeEach(function () {
    this.initModules(configurationModule);
    this.injectDependencies('$translate', '$q', '$scope');
    this.configuration = new Configuration(raw);

  });
  describe('segments', function () {
    it('should have a name', function () {
      expect(this.configuration.rootNode.children['video'].name).toBe('video');
    });
    it('should have a key', function () {
      expect(this.configuration.rootNode.children['networkservices'].children['snmp'].children['communityname'].key)
        .toBe('networkservices.snmp.communityname');
    });
    it('should have a level', function () {
      expect(this.configuration.rootNode.children['networkservices'].children['snmp'].children['communityname'].level)
        .toBe(3);
    });
    it('should have 8 children on level 0', function () {
      expect(Object.keys(this.configuration.rootNode.children).length).toBe(8);
    });
    it('video should have 5 children on level 1 (video)', function () {
      expect(Object.keys(this.configuration.rootNode.children['video'].children).length).toBe(5);
    });
    it('video should have 2 children on level 3 (video.input.)', function () {
      expect(Object.keys(this.configuration.rootNode.children['video'].children['input'].children).length).toBe(2);
    });
  });

  describe('values', function () {
    it('should return string value', function () {
      expect(
        this.configuration.rootNode.children['networkservices'].children['snmp'].children['communityname'].value.configuration.type)
        .toBe('string');
    });
    it('should have no children', function () {
      expect(
        this.configuration.rootNode.children['networkservices'].children['snmp'].children['communityname'].children)
        .toBeUndefined();
    });
  });

  describe('suggest', function () {
    it('initial suggestion shows level 1 alphabetically sorted and leaf node after folders', function () {
      const search = {
        selections: [],
        cursor: 1,
        query: '',
      };
      expect(_.map(this.configuration.suggest(search), 'name'))
        .toEqual(
          ['audio', 'snmp', 'setAtAccountLevelAndEnforced', 'standby', 'name', 'zone', 'userinterface', 'video']);
    });
    it('when searching hits are sorted according to hereditary succession', function () {
      const search = {
        selections: [],
        cursor: 1,
        query: 'st',
      };
      expect(_.map(this.configuration.suggest(search), 'name'))
      // todo: need to reverse the search result.
      // rekkefølge:
        .toEqual(['address', 'address', 'address', 'standby', 'name', 'custommessage']);
    });
    describe('When already clicked into <audio> then <input>', function () {
      it('and typed no search term', function () {
        const search = {
          selections: [{ name: 'audio' }, { name: 'input' }],
          cursor: 3,
          query: '',
        };
        expect(_.map(this.configuration.suggest(search), 'name'))
          .toEqual(['videoassociation', 'echocontrol', 'echocontrol']);
      });
      it('and type in input search term: microphone', function () {
        const search = {
          selections: [{ name: 'audio' }, { name: 'input' }],
          cursor: 3,
          query: 'microphone',
        };
        expect(_.map(this.configuration.suggest(search), 'name'))
          .toEqual(['echocontrol', 'echocontrol']);
      });
      it('and click on input node', function () {
        const search = {
          selections: [{ name: 'audio' }, { name: 'input' }],
          cursor: 2,
          query: '',
        };
        expect(_.map(this.configuration.suggest(search), 'name'))
          .toEqual(['input', 'output']);
      });
    });

    describe('collapse/expand suggestions', function () {
      it('should expand suggestions further down the tree if there is only one choice in a node', function () {
        const search = {
          selections: [{ name: 'audio' }, { name: 'input' }],
          cursor: 3,
          query: '',
        };
        expect(_.map(this.configuration.suggest(search), 'name'))
          .toEqual(['videoassociation', 'echocontrol', 'echocontrol']);
      });
      it('should expand suggestions further down the tree if there is only one choice in a node', function () {
        const search = {
          selections: [{ name: 'audio' }, { name: 'input' }],
          cursor: 3,
          query: 'line',
        };
        expect(_.map(this.configuration.suggest(search), 'name'))
          .toEqual(['videoassociation']);
      });
    });
  });
});
