'use strict';

describe('ContextFieldsetsSidepanelFieldListCtrl', function () {
  var $controller, controller, $scope;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Context'));
  beforeEach(inject(dependencies));

  afterAll(function () {
    $controller = controller = $scope = undefined;
  });

  function dependencies($rootScope, _$controller_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
  }

  function initController(fields) {
    controller = $controller('ContextFieldsetsSidepanelFieldListCtrl', {
      $scope: $scope,
      fields: fields,
    });
  }
  it('should be defined.', function () {
    initController();
    expect(controller).toBeDefined();
    expect(controller.fields).not.toExist();
  });
  it('should set the fields and fieldInfo', function () {
    initController(
      [
        {
          id: 'AAA_TEST_FIELD',
          dataType: 'string',
          lastUpdated: '2017-02-02T17:12:33.167Z',
        },
        {
          id: 'AAA_TEST_FIELD4',
          dataType: 'string',
          lastUpdated: '2017-02-02T21:22:35.106Z',
        },
        {
          id: 'AAA_Agent_ID',
          dataType: 'string',
          lastUpdated: '2017-01-23T16:48:50.021Z',
        },
      ]
    );
    expect(controller).toBeDefined();
    expect(controller.fields.length).toBe(3);
    expect(controller.fields[0].id).toEqual('AAA_TEST_FIELD');
    var fieldInfo = controller.fields[0].fieldInfo;
    expect(fieldInfo).toContain('context.dictionary.fieldPage.unencrypted');
    expect(fieldInfo).toContain('context.dictionary.dataTypes.string');
  });
});
