'use strict';

describe('Component: Fieldset SidePanel', function () {

  var ctrl, $componentCtrl;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Context'));
  beforeEach(inject(dependencies));
  // need to cleanup here to prevent more memory leaks
  afterAll(function () {
    ctrl = $componentCtrl = undefined;
  });

  function dependencies(_$componentController_) {
    $componentCtrl = _$componentController_;
  }

  function initController(fieldset) {
    ctrl = $componentCtrl('contextFieldsetsSidepanel', {}, {
      fieldset: fieldset,
    });
    ctrl.$onInit();
  }
  it('should have fieldset id, description, field list and lastupdated date', function () {
    initController({
      'orgId': 'd06308f8-c24f-4281-8b6f-03f672d34231',
      'description': 'aaa custom fieldset with some description',
      'fields': [
        'AAA_TEST_FIELD',
        'Agent_ID',
        'AAA_TEST_FIELD4',
      ],
      'publiclyAccessible': false,
      'fieldDefinitions': [
        {
          'id': 'AAA_TEST_FIELD',
          'lastUpdated': '2017-02-02T17:12:33.167Z',
        },
        {
          'id': 'AAA_TEST_FIELD4',
          'lastUpdated': '2017-02-02T21:22:35.106Z',
        },
        {
          'id': 'Agent_ID',
          'lastUpdated': '2017-01-23T16:48:50.021Z',
        },
      ],
      'refUrl': '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
      'id': 'aaa_custom_fieldset',
      'lastUpdated': '2017-02-10T19:37:36.998Z',
    });
    expect(ctrl.lastUpdated).not.toBeNull();
    expect(ctrl.fields.length).toBe(3);
    expect(ctrl.fieldset.id).toEqual('aaa_custom_fieldset');
    expect(ctrl.fieldset.description).toEqual('aaa custom fieldset with some description');
  });
});
