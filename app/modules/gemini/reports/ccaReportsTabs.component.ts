import './reports.scss';
import { ReportsChartService } from './reportsChartService';
const CHARTS = require('./charts.config');

class CcaReportsTabs implements ng.IComponentController {
  private data_;

  public tabs;
  public chartsData;
  private csvData: any = [];

  private today: string;
  public endDate: string;
  public startDate: string;
  public endDateFormat: string;
  public startDateFormat: string;
  public errMsg: any = {};
  public dateRange: any = {};
  public storeData: any = {};

  public KPIData = {};
  public data: any = {};
  public loading: boolean = true;
  public filterEnable: boolean = false;

  /* @ngInject */
  public constructor(
    private Analytics,
    private $q: ng.IQService,
    private ReportsChartService: ReportsChartService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.errMsg = { datePicker: '' };
  }

  public $onInit(): void {
    this.tabs = [
      {
        state: `gemReports.group({ name: 'usage' })`,
        title: `gemini.reportsChart.reportTab.usage`,
      },
      {
        state: `gemReports.group({ name: 'peakPorts' })`,
        title: `gemini.reportsChart.reportTab.peakPorts`,
      },
      {
        state: `gemReports.group({ name: 'participants' })`,
        title: `gemini.reportsChart.reportTab.participants`,
      },
      {
        state: `gemReports.group({ name: 'typesSize' })`,
        title: `gemini.reportsChart.reportTab.typesSize`,
      },
    ];

    this.getFilterData();
    this.initDateRange();
    this.Analytics.trackEvent(this.ReportsChartService.featureName, {});
  }

  private initDateRange() {
    this.today = moment().format('YYYY-MM-DD');
    this.startDate = moment().subtract('days', 97).format('YYYY-MM-DD');

    this.endDate = moment().subtract('days', 4).format('YYYY-MM-DD');
    this.storeData.endDate = this.endDate;
    this.storeData.startDate = this.startDate;
    this.dateRange.start = {
      lastEnableDate: this.endDate,
      firstEnableDate: this.startDate,
    };
    this.endDateFormat = moment(this.endDate).format('MMMM Do, YYYY');
    this.dateRange.end = this.dateRange.start;
  }

  public onChangeDate() {
    this.dateRange.end = {
      lastEnableDate: this.endDate,
      firstEnableDate: this.startDate,
    };
    if (this.startDate === this.storeData.startDate && this.endDate === this.storeData.endDate) {
      return ;
    }
    this.errMsg.datePicker = '';
    this.storeData.endDate = this.endDate;
    this.storeData.startDate = this.startDate;
    if (moment(this.startDate).unix() > moment(this.endDate).unix()) {
      this.errMsg.datePicker = this.$translate.instant('webexReports.end-date-tooltip');
    }
    this.setParameters();
    this.endDateFormat = moment(this.endDate).format('MMMM Do, YYYY');
    this.startDateFormat = moment(this.startDate).format('MMMM Do, YYYY');
  }


  public onCustomer() {
    this.clearData(['account', 'site', 'session']);
    const orgId = _.get(this.data, 'customerSelected.value');
    const data = _.find(this.data_, { orgId: orgId });

    this.accountOptions(_.get(data, 'accounts', []));
    this.siteOptions(this.getAllSites());
    this.sessionOptions(this.getAllSessionTypes());
    this.setParameters();
  }

  public onAccount() {
    this.clearData(['site', 'session']);
    const accountId = _.get(this.data, 'accountSelected.value');
    const data = _.find(this.data.accountData, { accountId: accountId });
    const siteData = data ? _.get(data, 'sites', []) : this.getAllSites();

    this.siteOptions(siteData);
    this.sessionOptions(this.getAllSessionTypes());
    this.setParameters();
  }

  public onDuration() {
    if (_.get(this.data, 'durationSelected.value') === 'customer') {
      _.set(this.data, 'dateEnable', true);
    } else {
      _.set(this.data, 'dateEnable', false);
    }
    this.setParameters();
  }

  public onSites() {
    this.clearData(['session']);
    const siteId = _.get(this.data, 'siteSelected.value');
    const data = _.find(this.data.siteData, { siteId: siteId });
    const sessionData = data ? _.get(data, 'meetingTypes', []) : this.getAllSessionTypes();

    this.sessionOptions(sessionData);
    this.setParameters();
  }

  public onSession() {
    this.setParameters();
  }

  private getFilterData() {
    this.ReportsChartService.getFilterData()
      .then((res: any) => {
        this.data_ = res;
        this.filterEnable = true;
        this.customerOptions();
        this.initParameters();
      });
  }

  private customerOptions() {
    const data = _.map(this.data_, (item: any) => {
      return { label: item.orgName, value: item.orgId };
    });
    _.set(this.data, 'customerOptions', data);
  }

  private accountOptions(data) {
    const data_ = _.map(data, (item: any) => {
      return { value: item.accountId, label: item.accountName };
    });
    data_.unshift({ value: '', label: this.$translate.instant('gemini.reportsChart.filter.allAccounts') });
    this.data.accountSelected = data_[0];

    _.set(this.data, 'accountData', data);
    _.set(this.data, 'accountOptions', data_);
    this.getAllSites();
  }

  private siteOptions(data) {
    const data_ = _.map(data, (item: any) => {
      return { value: item.siteId, label: item.siteUrl };
    });
    data_.unshift({ value: '', label: this.$translate.instant('gemini.reportsChart.filter.allSites') });
    this.data.siteSelected = data_[0];

    _.set(this.data, 'siteData', data);
    _.set(this.data, 'siteOptions', data_);
  }

  private sessionOptions(data) {
    if (!data.length) {
      return;
    }
    this.data.sessionOptions = _.map(data, (item: any) => _.assignIn({}, { label: item.name, value: item.type }) );
  }

  private getAllSites() {
    let sites = [];
    _.forEach(this.data.accountData, (item) => {
      sites = _.concat(sites, _.get(item, 'sites'));
    });
    return sites;
  }

  private getAllSessionTypes() {
    let sessionTypes = [];
    const sites = _.get(this.data, 'siteData');
    _.forEach(sites, (item) => {
      sessionTypes = _.concat(sessionTypes, _.get(item, 'meetingTypes'));
    });
    return _.uniqBy(sessionTypes, 'name');
  }

  private initParameters() {
    this.data.sessionSelected = [];
    this.data.durationOptions = [
      { label: this.$translate.instant('gemini.reportsChart.filter.last12Months'), value: 'M12' },
      { label: this.$translate.instant('gemini.reportsChart.filter.last6Months'), value: 'M6' },
      { label: this.$translate.instant('gemini.reportsChart.filter.last90Days'), value: 'D90' },
      { label: this.$translate.instant('gemini.reportsChart.filter.last45Days'), value: 'D45' },
      { label: this.$translate.instant('gemini.reportsChart.filter.custom'), value: 'customer' },
    ];
    this.data.durationSelected = this.data.durationOptions[0];
    this.data.customerSelected = this.data.customerOptions[0];
    this.data.sitePlaceholder = this.$translate.instant('gemini.reportsChart.filter.allSites');
    this.data.accountPlaceholder = this.$translate.instant('gemini.reportsChart.filter.allAccounts');
    this.data.sessionPlaceholder = this.$translate.instant('gemini.reportsChart.filter.allSesstionTypes');
    this.startDateFormat = moment(this.startDate).subtract('months', 12).format('MMMM Do, YYYY');
    this.onCustomer();
  }

  private clearData( arr ) {
    _.forEach(arr, (item) => {
      this.data[item + 'Options'] = [];
      this.data[item + 'Selected'] = [];
    });
  }

  private setParameters() {
    const duration: any = _.get(this.data, 'durationSelected.value', '');
    const customerDuration = {
      endDate: this.endDate,
      startDate: this.startDate,
    };
    const durationData = {
      customer: {
        number: 93,
        unit : 'days',
      },
      M12: {
        number: 12,
        unit : 'months',
      },
      M6: {
        number: 6,
        unit : 'months',
      },
      D90: {
        number: 90,
        unit : 'days',
      },
      D45: {
        number: 45,
        unit : 'days',
      },
    };

    const durationItem: any = _.get(durationData, duration);
    this.startDateFormat = moment().subtract(durationItem.unit, durationItem.number).format('MMMM Do, YYYY');
    const customerId = _.get(this.data, 'customerSelected.value', '');
    const customer = _.find(this.data_, { orgId: customerId });
    const spAccountId = _.get(customer, 'spAccountId', '');

    const data = {
      customerId: customerId,
      spAccountId: spAccountId,
      siteId: _.get(this.data, 'siteSelected.value', ''),
      accountId: _.get(this.data, 'accountSelected.value', ''),
      sessionTypes: _.map(this.data.sessionSelected, (item: any) => item.value),
    };

    _.forEach(data, (item, key: string) => {
      if (!item.length) {
        _.unset(data, key);
      }
    });

    duration !== 'customer' ? _.set(data, 'requestDate.duration', duration) : _.set(data, 'requestDate', customerDuration);
    this.onChangeOption(data);
  }

  public onChangeOption(data) {
    this.loading = true;
    this.getKPIData(data);
    this.getChartsData(data);
  }

  private getKPIData(data) {
    const url = 'growth';
    const KPIkey = ['hostGrowth', 'meetingGrowth', 'audioGrowth', 'audioPortGrowth', 'videoGrowth', 'videoPortGrowth'];
    this.ReportsChartService.getChartData(url, data)
      .then((res: any) => {
        this.KPIData = _.map(KPIkey, (item: any) => {
          const oneKPI: any = _.find(res.result, { name: item });
          return oneKPI ? _.assignIn({}, oneKPI, { flag: _.includes(oneKPI.value, '-') }) : { name: item, value: '--' };
        });
      });
  }

  private getChartsFunction(data) {
    const data_ = {};
    _.forEach(CHARTS, (item) => {
      if (!_.get(data_, item.group)) {
        data_[item.group] = {};
      }
      data_[item.group][item.url] = {};
    });
    this.chartsData = data_;
    return _.map(CHARTS, (item: any) => {
      return this.ReportsChartService.getChartData(item.url, data)
        .then(res => _.assignIn({}, item, { data: res }))
        .catch(() => _.assignIn({}, item, { data: {} }));
    });
  }

  private getChartsData(data) {
    const promises = this.getChartsFunction(data);
    this.$q.all(promises)
      .then((res) => {
        _.forEach(res, (item) => {
          this.chartsData[item.group][item.url] = item;
          this.csvData.push(item);
          this.loading = false;
        });
      });
  }

  public getExportCSV() {
    return this.ReportsChartService.reportChartExportCSV(this.csvData);
  }
}

export class CcaReportsTabsComponent implements ng.IComponentOptions {
  public controller = CcaReportsTabs;
  public templateUrl = 'modules/gemini/reports/ccaReportsTabs.html';
}
