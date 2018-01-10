export interface IRHtmCustomer {
  id?: string;
  name: string;
}

export class HtmCustomer implements IRHtmCustomer {
  public id?: string;
  public name: string;

  constructor(htmCustomer: IRHtmCustomer = {
    name: '',
  }) {
    this.id = htmCustomer.id;
    this.name = htmCustomer.name;
  }
}

const ANALYTICS: string = 'Analytics';
const CAMELOT: string = 'Camelot';
const IPPHONE: string = 'IPPhone';

export interface IRAnalytics {
  Host: string;
  Port: string;
}

export interface IRCamelot {
  Name: string;
  TFTP: string;
  camelotContainerIp: string;
}

export interface IRIpPhone {
  Name: string;
  Lines: string[];
  IP: string;
  device_type: string;
}

export interface IRHtmResource {
  id?: string;
  resourceId: string;
  resourceType: string;
  param: IRAnalytics | IRCamelot | IRIpPhone | string;
}

export class HtmResource {
  public id?: string;
  public name: string;
  public type: string;
  public analytics?: IRAnalytics;
  public camelot?: IRCamelot;
  public ipPhone?: IRIpPhone;

  constructor(htmResource: IRHtmResource = {
    resourceId: '',
    resourceType: ANALYTICS,
    param: {
      Host: 'Unknown',
      Port: 'Unknown',
    },
  }) {
    this.id = htmResource.id;
    this.name = htmResource.resourceId;
    this.type = htmResource.resourceType;

    switch (this.type) {
      case ANALYTICS:
        this.analytics = <IRAnalytics>htmResource.param;
        break;
      case CAMELOT:
        this.camelot = <IRCamelot>htmResource.param;
        break;
      case IPPHONE:
        this.ipPhone = <IRIpPhone>htmResource.param;
        break;
    }
  }
}

export interface IRHtmBuildingBlocks {
  id?: string;
  buildingBlockId: number;
  step: string;
  description: string;
  resourceTypeReq: string;
  buildingBlockType: string;
}

export class HtmBuildingBlocks implements IRHtmBuildingBlocks {
  public id?: string;
  public buildingBlockId: number;
  public step: string;
  public description: string;
  public resourceTypeReq: string;
  public buildingBlockType: string;

  constructor(htmBuildingBlocks: IRHtmBuildingBlocks = {
    buildingBlockId: 0,
    step: '',
    description: '',
    resourceTypeReq: '',
    buildingBlockType: '',
  }) {
    this.id = htmBuildingBlocks.id;
    this.buildingBlockId = htmBuildingBlocks.buildingBlockId;
    this.step = htmBuildingBlocks.step;
    this.description = htmBuildingBlocks.description;
    this.resourceTypeReq = htmBuildingBlocks.resourceTypeReq;
    this.buildingBlockType = htmBuildingBlocks.buildingBlockType;
  }
}

export interface IRHtmTest {
  id?: string;
  name: string;
  index: number;
  blocks: IRHtmBuildingBlocks[];
}

export class HtmTest implements IRHtmTest {
  public id?: string;
  public name: string;
  public index: number;
  public blocks: IRHtmBuildingBlocks[];

  constructor(htmTest: IRHtmTest = {
    name: '',
    index: 0,
    blocks: [],
  }) {
    this.id = htmTest.id;
    this.name = htmTest.name;
    this.index = htmTest.index;
    this.blocks = htmTest.blocks;
  }

  public getRTest(): IRHtmTest {
    return {
      id: this.id,
      name: this.name,
      index: this.index,
      blocks: this.blocks,
    } as IRHtmTest;
  }
}

export interface IRHtmSuite {
  id?: string;
  name: string;
  tests: IRHtmTest[] | string[];
}

export class HtmSuite implements IRHtmSuite {
  public id?: string;
  public name: string;
  public tests: HtmTest[];

  constructor(htmSuite: IRHtmSuite = {
    name: '',
    tests: [],
  }) {
    this.id = htmSuite.id;
    this.name = htmSuite.name;
    if (!_.isEmpty(htmSuite.tests)) {
      this.tests = [];
      for (let i: number = 0; i < htmSuite.tests.length; i++) {
        this.tests.push(new HtmTest(<IRHtmTest>htmSuite.tests[i]));
      }
    }
  }

  public getRSuite(): IRHtmSuite {
    const suite: IRHtmSuite = {
      name: this.name,
      tests: [],
    };
    if (this.tests) {
      const tests: string[] = [];
      for (let i: number = 0; i < this.tests.length; i++) {
        if (this.tests[i].id) {
          tests.push(<string>this.tests[i].id);
        }
      }
      suite.tests = tests;
    }
    if (this.id) {
      suite['id'] = this.id;
    }
    return suite;
  }
}

export interface IRHtmTestResults {
  id?: string;
  name: string;
  stuff: string;
}

export class HtmTestResults implements IRHtmTestResults {
  public id?: string;
  public name: string;
  public stuff: string;

  constructor(htmTestResults: IRHtmTestResults = {
    name: '',
    stuff: '',
  }) {
    this.id = htmTestResults.id;
    this.name = htmTestResults.name;
    this.stuff = htmTestResults.stuff;
  }
}

export interface IRSuiteMap {
  id: string;
  customerId: string;
  testscheduleId: string;
  testsuiteId: string;
  index: number;
}

export interface IRTestMap {
  id: string;
  customerId: string;
  testscheduleId: string;
  testId: string;
  index: number;
}

export interface IRHtmSchedule {
  id?: string;
  name: string;
  schedule: string;
  isImmediate: boolean;
  testSuiteMap?: IRSuiteMap[] | string;
  testMap?: IRTestMap[] | string;
}

export class HtmSchedule implements IRHtmSchedule {
  public id?: string;
  public name: string;
  public schedule: string;
  public isImmediate: boolean;
  public testSuiteMap: IRSuiteMap[];
  public testMap: IRTestMap[];
  public scheduleEntities: string; //Comma Seperated

  constructor(htmSchedule: IRHtmSchedule = {
    name: '',
    schedule: '',
    isImmediate: false,
  }) {
    this.id = htmSchedule.id;
    this.name = htmSchedule.name;
    this.schedule = htmSchedule.schedule;
    this.isImmediate = htmSchedule.isImmediate;
    if (!_.isEmpty(htmSchedule.testSuiteMap)) {
      if (_.isArray(htmSchedule.testSuiteMap)) {
        this.testSuiteMap = htmSchedule.testSuiteMap!;
      } else {
        const ids: string[] = htmSchedule.testSuiteMap!.split(',');
        let map: IRSuiteMap;
        for (let i: number = 0; i < ids.length; i++) {
          map = {
            id: ids[i],
          } as IRSuiteMap;
          this.testSuiteMap.push(map);
        }
      }
    } else {
      this.testSuiteMap = [];
    }
    if (!_.isEmpty(htmSchedule.testMap)) {
      this.testMap = <IRTestMap[]>htmSchedule.testMap!;
    } else {
      this.testMap = [];
    }
    this.scheduleEntities = '';
  }

  public getRSchedule(): any {
    const schedule = {
      name: this.name,
      schedule: this.schedule,
      isImmediate: this.isImmediate,
      testSuiteMap: '',
      testMap: '', //HACK to fix demo
    };
    if (this.id) {
      schedule['id'] = this.id;
    }
    if (!_.isEmpty(this.testSuiteMap)) {
      for (let i: number = 0; i < this.testSuiteMap.length; i++) {
        schedule.testSuiteMap += this.testSuiteMap[i].testsuiteId;
        if (i + 1 < this.testSuiteMap.length) {
          schedule.testSuiteMap += ',';
        }
      }
    }
    return schedule as IRHtmSchedule;
  }
}

export interface IRHtmTestDefinition {
  id?: string;
  name: string;
  customerId: string;
  resourceTypesRequired: string;
}

export class HtmTestDefinition {
  public id?: string;
  public name: string;
  public customerId: string;
  public resourceTypesRequired: string;

  constructor(testDefinition: IRHtmTestDefinition = {
    name: '',
    customerId: '',
    resourceTypesRequired: '',
  }) {
    this.id = testDefinition.id;
    this.name = testDefinition.name;
    this.customerId = testDefinition.customerId;
    this.resourceTypesRequired = testDefinition.resourceTypesRequired;
  }
}

export const SETUP_NOT_COMPLETE = {
  serviceId: '',
  setup: false,
  status: 'setupNotComplete',
  cssClass: 'disabled',
};

export const SETUP_COMPLETE = {
  serviceId: '',
  setup: true,
  status: 'operational',
  cssClass: 'success',
};

export enum State {
  Loading = 'LOADING',
  Show = 'SHOW',
  Reload = 'RELOAD',
  New = 'NEW',
}
