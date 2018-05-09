import * as d3 from 'd3';
import { PartnerSearchService, Platforms } from './partner-search.service';
import { ICallType, IAnyDict, IParticipant, IUniqueData } from './partner-search.interfaces';
import { QualityType, TabType } from './partner-meeting.enum';

interface IDataStore {
  ticks: number;
  domain: d3[];
  endTime: number;
  startTime: number;
  gridVerticalLineNum: number;
  gridHorizontalLineNum: number;
  lineData: object[];
}

interface IGridOption {
  width: number;
  paddingRight: number;
  paddingLeft: number;
  paddingBottom: number;
  paddingTop: number;
  gridHeight: number;
  top: number;
  height?: number;
}

const DEFAULT_RADIUS = 9;
const DEFAULT_RECT_WIDTH = 17;
class TimeLineController implements ng.IComponentController {
  private tip: d3;
  private svg: d3;
  private option: IGridOption;
  private legendInfo: { line: string[]; circle: string[] };
  private data: IDataStore;
  private sourceData: IAnyDict; //TODO use better type
  private tabType: string;
  private timeScale: d3;
  private timeFormat = 'hh:mm:ss A';
  private chartStart: number;
  private chartEnd: number;
  private markLabel: d3;
  private yPanel: d3;
  private lineColorCls = ['goodLine', 'fairLine', 'poorLine', ''];

  /* @ngInject */
  public constructor(
    private $element: ng.IRootElementService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private PartnerSearchService: PartnerSearchService,
  ) {
    this.data = {
      ticks: 0,
      domain: [],
      endTime: 0,
      startTime: 0,
      gridVerticalLineNum: 12,
      gridHorizontalLineNum: 7,
      lineData: [],
    };
    this.option = {
      width: 960,
      paddingRight: 25,
      paddingLeft: 150.5,
      paddingBottom: 20.5,
      paddingTop: 0.5,
      gridHeight: 35.5,
      top: 30,
    };
  }

  public $onInit(): void {
    this.initParameters();
    this.initChart();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { circleColor, lineData } = changes;
    this.$timeout(() => {
      if (_.get(circleColor, 'currentValue')) {
        this.updateStartPoints(_.get(circleColor, 'currentValue'));
      }

      if (_.get(lineData, 'currentValue')) {
        this.drawColorLines(_.get(lineData, 'currentValue'));
      }
    }, 500);
  }

  private initParameters(): void {
    if (!this.sourceData) {
      this.sourceData = {};
    }
    if (!this.sourceData.lines) {
      this.sourceData.lines = [];
    }
    this.data.gridHorizontalLineNum = this.getGridHorizontalLineNum();
    this.data.startTime = this.sourceData.startTime;
    this.data.endTime = this.sourceData.endTime;

    this.option.width = this.getCanvasWidth();
    this.option.height = this.getCanvasHeight();

    this.chartStart = _.floor(this.data.startTime / 1000) * 1000;
    this.chartEnd = _.ceil(this.data.endTime / 1000) * 1000;
    const remainder = (this.chartEnd - this.chartStart) % (60 * 1000);
    if (remainder > 0) {
      const remainder_ = (60 * 1000 - remainder) / 2;
      this.chartStart -= remainder_;
      this.chartEnd += remainder_;
      const interval = (this.chartEnd - this.chartStart) / 12;
      const columnLineCount = Math.floor(remainder_ / interval);
      if (columnLineCount >= 1) {
        this.chartStart += columnLineCount * interval;
        this.chartEnd -= columnLineCount * interval;
      }
    }

    this.timeScale = d3.time.scale()
      .domain([this.chartStart, this.chartEnd])
      .range([0, this.option.width]);

    this.legendInfo = {
      line: [QualityType.GOOD, QualityType.FAIR, QualityType.POOR, QualityType.NA],
      circle: [QualityType.GOOD, QualityType.FAIR, QualityType.POOR, QualityType.NA],
    };
  }

  private initChart(): void {
    this.svg = d3.select('.chartContent')
      .style('padding-left', `${this.option.paddingLeft}px`)
      .style('padding-top', `${this.option.top}px`)
      .append('svg:svg')
      .attr('class', 'xchart')
      .attr('width', this.option.width)
      .attr('height', this.option.height);
    this.svg.append('g').attr('class', 'grid gridHorizontalLine');
    this.svg.append('g').attr('class', 'grid gridVerticalLine');
    this.svg.append('g').attr('class', 'axis axisX');
    this.svg.append('g').attr('class', 'axis axisY');
    this.svg.append('g').attr('class', 'timeLine baseLine');
    this.svg.append('g').attr('class', 'timeLine enterLine');
    this.svg.append('g').attr('class', 'timeLine colorLine');
    this.svg.append('g').attr('class', 'jmt jmtPoint');
    this.svg.append('g').attr('class', 'crossLine startEnd');
    this.markLabel = d3.select('.chartContent')
      .append('div')
      .attr('class', 'markLabel')
      .attr('style', `width: ${this.option.width}px`);
    this.yPanel = d3.select('.chartContent')
      .append('div')
      .attr('class', 'yaxis')
      .attr('style', `height: ${this.option.height}px; top: ${this.option.top}px;`);
    this.tip = d3.select('.timelineSvg')
      .append('div')
      .attr('class', 'timelineTooltip')
      .style('opacity', 0);

    this.drawChartGrid();
    this.drawCrossLine();
    this.xAxis();
    this.yAxis();

    this.drawBaseLines();
    this.drawStartPoints();

    this.setLegend();
  }

  private drawChartGrid(): void {
    const xGridLines: object[] = [], yGridLines: object[] = [];
    let x = 0, y = 0;
    let hCount = 0, vCount = 0;

    while (hCount <= this.data.gridHorizontalLineNum) {
      xGridLines.push({
        x1: 0,
        y1: y,
        x2: this.option.width,
        y2: y,
      });
      y += this.option.gridHeight;
      hCount += 1;
    }

    const hSpace = this.option.width / this.data.gridVerticalLineNum;
    y -= this.option.gridHeight;
    while (vCount <= this.data.gridVerticalLineNum) {
      yGridLines.push({
        x1: x,
        y1: 0,
        x2: x,
        y2: y,
      });
      x += hSpace;
      vCount += 1;
    }

    this.drawLine('g.gridHorizontalLine', xGridLines);
    this.drawLine('g.gridVerticalLine', yGridLines);
  }

  private xAxis(): void {
    const gridHeight = this.data.gridHorizontalLineNum * this.option.gridHeight;
    const hSpace = this.option.width / this.data.gridVerticalLineNum;
    const tInterval = (this.chartEnd - this.chartStart) / this.data.gridVerticalLineNum;
    let vCount = 0;
    const node = d3.select('g.axis.axisX').attr('transform', `translate(0, ${gridHeight})`);
    while (vCount <= this.data.gridVerticalLineNum) {
      let textAnchor = 'middle';
      if (vCount === 0) {
        textAnchor = 'start';
      }
      if (vCount === this.data.gridVerticalLineNum) {
        textAnchor = 'end';
      }
      if (vCount % 2 === 0) {
        const translate = vCount * hSpace;
        const g = node.append('g').attr('transform', `translate(${translate}, 0)`);
        const text = this.formatTime(this.chartStart + tInterval * vCount, this.timeFormat);
        g.append('svg:line').attr('x2', 0).attr('y2', 4);
        g.append('svg:text').attr('x', 0).attr('y', 8).attr('dy', '.71em').attr('style', `text-anchor: ${textAnchor};`).text(text);
      }
      vCount += 1;
    }
  }

  private getUniqueData(isUnique: boolean): object[] {
    if (_.isEmpty(this.data.lineData)) {
      let lineData: object[] = [];
      let y = 0;
      _.forEach(this.sourceData.lines, (line: object, key) => {
        y += this.option.gridHeight;
        const lines: object[] = _.map(line, (line_: any) => {
          const x2 = this.timeScale(line_.leaveTime);
          const x1 = this.timeScale(line_.joinTime);
          return _.assignIn({}, line_, { y1: y, y2: y, x2: x2 > x1 ? x2 : x1, x1: x1, filterId: key });
        });
        lineData = _.concat(lineData, lines);
      });

      this.data.lineData = lineData;
    }
    if (isUnique) {
      return _.uniqBy(this.data.lineData, 'filterId');
    } else {
      return this.data.lineData;
    }
  }

  private yAxis(): void {
    const data = this.getUniqueData(true);
    this.yPanel.selectAll('.yaxis')
      .data(data)
      .enter()
      .append('p')
      .attr('class', 'ellipsis')
      .text((item) => { return item.userName; })
      .append('i')
      .attr('class', (item) => { return `icon ${item.deviceIcon}`; })
      .on('mouseover', (item: IParticipant, index) => {
        const msgArr: {key?: string; value?: string}[] = [];

        msgArr.push({ key: item.userName });
        if (item.platform === Platforms.TP) {
          if (item.device) {
            msgArr.push({ key: item.device });
          } else {
            msgArr.push({ key: this.$translate.instant('webexReports.endPointLoading') });
            this.detectAndUpdateDevice(item, msgArr, index);
          }
        } else if (item.sessionType === Platforms.PSTN) {
          msgArr.push({ key: this.PartnerSearchService.getPhoneNumber(item.phoneNumber) });
          if (item.callType === 'Dial In') {
            msgArr.push({ key: this.$translate.instant('webexReports.callIn'), value: item.callInType });
          } else {
            msgArr.push({ key: this.$translate.instant('webexReports.callBack') });
          }
        } else {
          msgArr.push({ key: item.device });
        }
        msgArr.push({ key: this.$translate.instant('webexReports.joinTime'), value: item.joinTime_ });

        let duration = 0;
        _.forEach(this.sourceData.lines[index], lineDetail => {
          duration += lineDetail.duration;
        });
        msgArr.push({
          key: this.$translate.instant('webexReports.duration'),
          value: this.PartnerSearchService.toMinOrSec(duration * 1000),
        });

        const tipTop = index * this.option.gridHeight + 50;
        const tipLeft = this.option.paddingLeft - 20;
        this.makeTips(msgArr, tipTop, tipLeft);
      })
      .on('mouseout', () => this.hideTip());
  }

  private detectAndUpdateDevice(item: IParticipant, msgArr: object[], index: number) {
    this.PartnerSearchService.getRealDevice(item.conferenceID, item.nodeId)
      .then((res: ICallType) => item.device = this.updateDevice(res, msgArr, index));
  }

  private updateDevice(deviceInfo: ICallType, msgArr: object[], index: number): string {
    let device = '';
    if (!deviceInfo.completed) {
      return device;
    }
    if (!_.isEmpty(deviceInfo.items)) {
      device = deviceInfo.items[0].deviceType;
    } else {
      device = this.$translate.instant('reportsPage.webexMetrics.CMR3DefaultDevice');
    }
    msgArr[1] = { key: device }; //replace loading text to show device info

    const tipTop = index * this.option.gridHeight + 50;
    const tipLeft = this.option.paddingLeft - 20;
    this.makeTips(msgArr, tipTop, tipLeft);
    return device;
  }

  private drawCrossLine(): void {
    const gridHeight = this.data.gridHorizontalLineNum * this.option.gridHeight;
    const crossLine: object[] = [];
    let left4Start = this.timeScale(this.data.startTime) - 3;
    if (left4Start < 0) {
      left4Start = this.timeScale(this.data.startTime);
    }
    const left4End = this.timeScale(this.data.endTime);
    crossLine.push({
      x1: left4Start,
      y1: 0,
      x2: left4Start,
      y2: gridHeight,
    });
    crossLine.push({
      x1: left4End,
      y1: 0,
      x2: left4End,
      y2: gridHeight,
    });
    this.drawLine('g.crossLine', crossLine);

    const left4End_ = this.option.width - left4End;
    this.markLabel
      .append('span')
      .attr('class', 'badge')
      .attr('style', `left: ${left4Start}px`)
      .text(this.formatTime(this.data.startTime));

    this.markLabel
      .append('span')
      .attr('class', 'badge')
      .attr('style', `right: ${left4End_}px`)
      .text(this.formatTime(this.data.endTime));
  }

  private drawBaseLines(): void {
    const baseLines: object[] = [], containers: object[] = [];
    let y = 0;
    _.forEach(this.sourceData.lines, (line, yIndex) => {
      y += this.option.gridHeight;
      _.forEach(line, lineItem => {
        baseLines.push({
          x1: this.timeScale(lineItem.joinTime),
          y1: y,
          x2: this.timeScale(lineItem.leaveTime),
          y2: y,
          id: `myLine${lineItem.cid}_${lineItem.nodeId}`,
          start: lineItem.joinTime,
          end: lineItem.leaveTime,
          cls: lineItem.platform === Platforms.TP ? 'defaultLine' : '',
        });

        containers.push({
          id: `${lineItem.cid}_${lineItem.nodeId}`,
          yIndex: yIndex,
          start: lineItem.joinTime,
          end: lineItem.leaveTime,
        });
      });
    });

    this.drawLine('g.baseLine', baseLines);
    this.renderLineContainer(containers);
  }

  private renderLineContainer(containers: object[]): void {
    const enterNode = d3.select('g.enterLine');
    const colorNode = d3.select('g.colorLine');
    _.forEach(containers, container => {
      enterNode.append('g').attr({
        id: `myEnter${container['id']}`,
        yIndex: container['yIndex'],
        start: container['start'],
        end: container['end'],
      });
      colorNode.append('g').attr({
        id: `myColor${container['id']}`,
        yIndex: container['yIndex'],
        start: container['start'],
        end: container['end'],
      });
    });
  }

  private drawStartPoints(): void {
    const jmtNode = d3.select('g.jmtPoint');
    const data = this.getUniqueData(false);
    _.forEach(data, (line: IUniqueData) => {
      if (!line.enableStartPoint) {
        return;
      }

      const cx = line.x1;
      const y = line.y1;
      const g = jmtNode.append('g').attr({
        id: `myStartPoint${line.guestId}-${line.userId}-${line.joinTime}`,
        cx: cx,
        cy: y,
      });
      let cx_ = cx + DEFAULT_RADIUS - 1;
      if (cx_ < DEFAULT_RADIUS) { // When the radius of the starting point covers the starting line, we will make a fine tuning, so that the radius of the circle will not cover the starting line.
        cx_ = 11;
      }
      g.append('svg:circle').attr({
        r: DEFAULT_RADIUS,
        cx: cx_,
        cy: y,
      });

      g.on('mouseover', () => {
        const msgArr = [
          { key: this.$translate.instant('reportsPage.webexMetrics.joinMeetingTime') },
          { key: this.$translate.instant('webexReports.notAvailable') },
        ];
        const tipTop = y + 12;
        const tipLeft = cx + 158;
        this.makeTips(msgArr, tipTop, tipLeft);
      })
      .on('mouseout', () => this.hideTip());
    });
  }

  private updateStartPoints(joinMeetingDatas: object[]): void {
    _.forEach(joinMeetingDatas, (joinMeetingData: any) => {//TODO use better type
      let jmtQuality = '';
      const joinMeetingTime = joinMeetingData['joinMeetingTime'];
      if (!joinMeetingTime) {
        return;
      }
      const jmt = Math.floor(joinMeetingTime * 1);
      const pointNode = d3.select(`#myStartPoint${joinMeetingData.guestId}-${joinMeetingData.userId}-${joinMeetingData.joinTime}`);
      if (!pointNode.size()) {
        return;
      }

      let cx = pointNode.attr('cx') * 1, cy = pointNode.attr('cy') * 1;
      if (jmt < 10) {
        jmtQuality = QualityType.GOOD;
        this.updatePointNodeGoodQuality(pointNode, { jmt, jmtQuality });
      } else if (jmt >= 10 && jmt <= 20) {
        jmtQuality = QualityType.FAIR;
        cx += 2;
        cy -= 1;
        this.updatePointNodeFairQuality(pointNode, { jmt, jmtQuality, cx, cy });
      } else {
        jmtQuality = QualityType.POOR;
        cx -= 1;
        cy -= DEFAULT_RECT_WIDTH / 2;
        this.updatePointNodePoorQuality(pointNode, { jmt, jmtQuality, cx, cy, rectWidth: DEFAULT_RECT_WIDTH });
      }

      pointNode.on('mouseover', () => {
        let jmtVal = '';
        jmtVal = this.$translate.instant('time.seconds', { time: jmt }, 'messageformat');

        const msgArr = [
          { key: this.$translate.instant('reportsPage.webexMetrics.joinMeetingTime') + (jmtQuality ? `: ${jmtQuality} ` : '') },
          { key: jmtVal },
        ];

        const tipTop = cy + 12;
        const tipLeft = cx + 158;
        this.makeTips(msgArr, tipTop, tipLeft);
      })
      .on('mouseout', () => this.hideTip());
    });
  }

  private updatePointNodeGoodQuality(pointNode: d3, options: {
    jmt: number,
    jmtQuality: string,
  }): void {
    const { jmt, jmtQuality } = options;
    pointNode.selectAll('circle').attr({
      class: 'goodCircle',
      jmtQuality: jmtQuality,
      joinMeetingTime: jmt,
    });
  }

  private updatePointNodeFairQuality(pointNode: d3, options: {
    jmt: number,
    jmtQuality: string,
    cx: number,
    cy: number,
  }): void {
    const { jmt, jmtQuality, cx, cy } = options;
    const DEFAULT_FILL_COLOR = '#ffb400';
    pointNode.selectAll('circle').remove();
    pointNode.append('path').attr({
      d: d3.svg.symbol().type('triangle-up').size(200),
      transform: `translate(${cx}, ${cy})`,
      jmtQuality: jmtQuality,
      joinMeetingTime: jmt,
    }).style('fill', DEFAULT_FILL_COLOR);
  }

  private updatePointNodePoorQuality(pointNode: d3, options: {
    jmt: number,
    jmtQuality: string,
    cx: number,
    cy: number,
    rectWidth?: number,
    rectRadius?: number,
  }): void {
    const { jmt, jmtQuality, cx, cy, rectWidth = DEFAULT_RECT_WIDTH, rectRadius = 2 } = options;
    pointNode.selectAll('circle').remove();
    pointNode.append('rect').attr({
      width: rectWidth,
      height: rectWidth,
      rx: rectRadius,
      ry: rectRadius,
      transform: `translate(${cx} , ${cy})`,
      jmtQuality: jmtQuality,
      joinMeetingTime: jmt,
    });
  }

  private drawColorLines(lines: object): void {
    _.forEach(lines, (line, nodeId) => {
      if (_.isEmpty(line)) {
        return;
      }
      _.forEach(line, lineItem => {
        const nodeId_ = lineItem.cid ? nodeId : `_${nodeId}`;
        const enterNode = d3.select(`#myEnter${nodeId_}`);
        this.drawColorLineSegment(enterNode, lineItem.startTime, lineItem.endTime, 'defaultLine', { nodeId: nodeId_ });

        const colorNode = d3.select(`#myColor${nodeId_}`);
        _.forEach(lineItem.qualities, qualityItem => {
          this.drawColorLineSegment(colorNode, qualityItem.startTime, qualityItem.endTime, this.lineColorCls[qualityItem.quality - 1], { source: qualityItem.source, tooltip: qualityItem.tooltip, nodeId: nodeId_ });
        });
      });
    });
  }

  private drawColorLineSegment(lineNode: d3, startTime: number, endTime: number, cls: string, options: object = {}): void {
    if (!lineNode.size()) {
      return;
    }
    const start = lineNode.attr('start') * 1;
    const end = lineNode.attr('end') * 1;
    if (startTime < start) {
      startTime = start;
    }
    if (endTime > end) {
      endTime = end;
    }
    const yIndex = lineNode.attr('yIndex') * 1;
    const x1 = this.timeScale(startTime);
    const y = (yIndex + 1) * this.option.gridHeight;
    const x2 = this.timeScale(endTime);
    const id = `c_${options['nodeId']}_${startTime}_${endTime}`;
    lineNode.append('svg:line')
      .attr({
        id: id,
        x1: x1,
        y1: y,
        x2: x2,
        y2: y,
        class: cls,
        start: startTime,
        end: endTime,
        source: options['source'],
      })
      .on('mouseover', () => {
        const dx = (x1 + x2) / 2;
        this.showTip(options['tooltip'], y + 16, dx + this.option.paddingLeft);
        d3.select(`#${id}`).attr('style', 'stroke-width: 5;');
      })
      .on('mouseout', () => {
        this.hideTip();
        d3.select(`#${id}`).attr('style', null);
      });
  }

  private drawLine(nodeName: string, data: object[]): void {
    const g = this.svg.select(nodeName);
    return g.selectAll(nodeName)
      .data(data)
      .enter()
      .append('svg:line')
      .attr('x1', item => item.x1)
      .attr('y1', item => item.y1)
      .attr('x2', item => item.x2)
      .attr('y2', item => item.y2)
      .attr('class', item => item.cls ? item.cls : '')
      .attr('id', item => item.id ? item.id : '')
      .attr('start', item => item.start ? item.start : '')
      .attr('end', item => item.end ? item.end : '');
  }

  private getGridHorizontalLineNum(): number {
    return this.sourceData.lines.length + 1 > this.data.gridHorizontalLineNum ? this.sourceData.lines.length + 1 : this.data.gridHorizontalLineNum;
  }

  private getCanvasWidth(): number {
    const width = this.$element.find('.timelineSvg').width() - this.option.paddingLeft;
    return width ? width : this.option.width;
  }

  private getCanvasHeight(): number {
    return (this.data.gridHorizontalLineNum * this.option.gridHeight) + this.option.paddingBottom + this.option.paddingTop;
  }

  private formatTime(timestamp: number, format?: string): string {
    format = format ? format : 'hh:mm:ss A';
    return this.PartnerSearchService.timestampToDate(timestamp, format);
  }

  private makeTips(msgs: { key?: string; value?: string; class?: string; }[], top: number, left: number) {
    const template = _.reduce(msgs, (template_, msg) => {
      const cls = msg.class ? msg.class : '';
      const text = msg.value ? `: ${msg.value}` : '';
      return template_ += `<p class="${cls}"><span>${msg.key}</span>${text}</p>`;
    }, '');
    this.showTip(template, top, left);
  }

  private showTip(tooltip: string, top: number, left: number): void {
    if (!tooltip) {
      return;
    }
    this.tip.html(tooltip)
    .classed('Tooltip-bottom', true)
    .style('display', 'block')
    .style('z-index', 1500);

    const leftOffset = this.tip.style('width').replace('px', '');
    const topOffset = this.tip.style('height').replace('px', '');
    this.tip.transition()
      .duration(500)
      .style('opacity', 1)
      .style('top', () => (top - topOffset) + 'px' )
      .style('left', () => (left - leftOffset / 2) + 'px' );
  }

  private hideTip(): void {
    this.tip.transition().duration(500).style('opacity', 0);
  }

  private setLegend(): void {
    const g = d3.select('.timelineSvg')
      .append('div')
      .attr('class', 'legend')
      .attr('style', `min-width: 1100px`);

    this.legendTitle(g);
    g.append('div')
      .attr('class', 'legendCircle')
      .attr('style', 'padding: 0; float: left;');
    g.append('div')
      .attr('class', 'legendLine')
      .attr('style', 'float: right;');

    _.forEach(this.legendInfo.circle, val => {
      const colorZone = d3.select('.legendCircle').append('div');
      const svg = colorZone.append('svg:svg');
      if (val === QualityType.FAIR) {
        this.drawTriangle(svg, { x: 10, y: 2 });
      } else if (val === QualityType.POOR) {
        this.drawSquare(svg, { x: 4, y: 2 });
      } else {
        this.drawCircle(svg, val === QualityType.NA ? '' : _.toLower(val) + 'Circle', { x: 10, y: 10 });
      }
      svg.append('text')
        .text(val === QualityType.NA ? this.$translate.instant('webexReports.notAvailable') : val)
        .attr('transform', `translate(24 , 17)`);
    });

    const qualityLegends = [{ cls: 'goodLine', text: this.$translate.instant('webexReports.good'), width: 80 },
                            { cls: 'fairLine', text: this.$translate.instant('webexReports.fair'), width: 65 },
                            { cls: 'poorLine', text: this.$translate.instant('webexReports.poor'), width: 0 },
                            { cls: 'defaultLine', text: this.$translate.instant('webexReports.notAvailable'), width: 130 },
                            { cls: '', text: `${this.tabType} ${this.$translate.instant('webexReports.notEnabled')}`, width: 155 }];
    _.forEach(qualityLegends, (legend, index) => {
      const colorZone = d3.select('.legendLine').append('div');
      if (legend.width) {
        colorZone.attr('style', `width: ${legend.width}px`);
      }
      if (index === 1 && this.tabType === 'Video') {
        colorZone.attr('style', 'display: none;');
      }
      const svg = colorZone.append('svg:svg').attr('class', 'lineSvg');
      svg.append('svg:line')
        .attr('class', legend.cls)
        .attr('x1', 3)
        .attr('y1', 14)
        .attr('x2', 28)
        .attr('y2', 14);
      svg.append('text')
        .text(legend.text)
        .attr('transform', `translate(33 , 17)`);
    });
  }

  private drawCircle(node: d3, class_: string, pos: d3): object {
    return node.append('circle')
      .attr('r', DEFAULT_RADIUS)
      .attr('class', class_)
      .attr('transform', `translate(${pos.x}, ${pos.y})`);
  }

  private drawTriangle(node: d3, pos: d3) {
    const middle_point = `${pos.x},${pos.y}`;
    const left_point = `${pos.x - 10},${pos.y + 17}`;
    const right_point = `${pos.x + 10},${pos.y + 17}`;

    return node.append('polygon')
      .attr('points', `${middle_point} ${left_point} ${right_point}`)
      .attr('stroke-linejoin', 'round');
  }

  private drawSquare(node: d3, pos: d3): object {
    return node.append('rect')
      .attr('width', DEFAULT_RECT_WIDTH)
      .attr('height', 17)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('transform', `translate(${pos.x} , ${pos.y})`);
  }

  private legendTitle(g: d3): void {
    g.append('p')
      .text(this.$translate.instant('reportsPage.webexMetrics.joinMeetingTime'))
      .attr('style', 'float: left;')
      .append('i').attr('class', 'icon icon-info-outline')
      .on('mouseover', () => {
        const msgArr = [
          { key: this.$translate.instant('webexReports.timelineChartLegend.joinMeetingTime') },
          { key: this.$translate.instant('webexReports.timelineChartLegend.jmtQuality.good') },
          { key: this.$translate.instant('webexReports.timelineChartLegend.jmtQuality.fair') },
          { key: this.$translate.instant('webexReports.timelineChartLegend.jmtQuality.poor') },
          { key: this.$translate.instant('webexReports.timelineChartLegend.jmtQuality.NA') },
        ];
        const pos = this.$element.find('.legend p i').first().position();

        const tipTop = pos.top - 10;
        const tipLeft = pos.left + 17;
        this.makeTips(msgArr, tipTop, tipLeft);
      })
      .on('mouseout', () => this.hideTip());

    g.append('p')
      .text(this.$translate.instant('webexReports.qualityType', { qualityType: this.tabType }))
      .attr('style', 'float: right;')
      .append('i')
      .attr('class', 'icon icon-info-outline')
      .on('mouseover', () => {
        let msgArr: object[];
        if (this.tabType === TabType.VIDEO) {
          msgArr = [
            { key: this.$translate.instant('webexReports.timelineChartLegend.video') },
            { key: this.$translate.instant('webexReports.timelineChartLegend.videoQuality.poor') },
            { key: this.$translate.instant('webexReports.timelineChartLegend.voipQuality.good') },
          ];
        } else {
          msgArr = [
            { key: this.$translate.instant('webexReports.timelineChartLegend.pstn') },
            { key: this.$translate.instant('webexReports.timelineChartLegend.pstnQuality.good') },
            { key: this.$translate.instant('webexReports.timelineChartLegend.pstnQuality.fair') },
            { key: this.$translate.instant('webexReports.timelineChartLegend.pstnQuality.poor') },
            { key: this.$translate.instant('webexReports.timelineChartLegend.voip') },
            { key: this.$translate.instant('webexReports.timelineChartLegend.voipQuality.good') },
            { key: this.$translate.instant('webexReports.timelineChartLegend.voipQuality.poor') },
            { key: this.$translate.instant('webexReports.timelineChartLegend.voipQuality.fair') },
          ];
        }
        const pos = this.$element.find('.legend p i').last().position();

        const tipTop = pos.top - 10;
        const tipLeft = pos.left + 17;
        this.makeTips(msgArr, tipTop, tipLeft);
      })
      .on('mouseout', () => this.hideTip());
  }
}

export class DgcPartnerTimeLineComponent implements ng.IComponentOptions {
  public controller = TimeLineController;
  public template = require('modules/core/partnerReports/webexReports/diagnostic/dgc-partner-time-line.html');
  public bindings = {
    sourceData: '<',
    lineColor: '<',
    circleColor: '<',
    tabType: '<',
    lineData: '<',
  };
}
