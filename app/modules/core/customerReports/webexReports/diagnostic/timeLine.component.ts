import './_timeline.scss';
import * as d3 from 'd3';
import { SearchService, Platforms } from './searchService';

export interface IUniqueData {
  enableStartPoint: boolean;
  x1: number;
  y1: number;
  guestId: string;
  userId: string;
  joinTime: number;
}

class TimeLine implements ng.IComponentController {

  private tip;
  private svg;
  private option;
  private legendInfo;
  private data: any = {};
  private sourceData: any;
  private tabType: string;
  private timeScale: d3;
  private timeFormat: string = 'hh:mm:ss A';
  private chartStart: number;
  private chartEnd: number;
  private markLabel: d3;
  private yPanel: d3;
  private lineColorCls: string[] = ['goodLine', 'fairLine', 'poorLine', ''];

  /* @ngInject */
  public constructor(
    private $element: ng.IRootElementService,
    private SearchService: SearchService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.data = {
      ticks: 0,
      domain: [],
      endTime: 0,
      startTime: 0,
      unitStr: 'Hour:Min',
      xAxisFormat: '%I:%M %p',
      gridVerticalLineNum: 12,
      gridHorizontalLineNum: 7,
      data: [],
    };
    this.option = { width: 960, paddingRight: 25, paddingLeft: 150.5, paddingButtom: 20.5, paddingTop: 0.5, gridHeight: 35.5, top: 30 };
  }

  public $onInit() {
    this.initParameters();
    this.initChart();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { circleColor, lineData } = changes;
    _.debounce(() => {
      if (_.get(circleColor, 'currentValue')) {
        this.updateStartPoints(_.get(circleColor, 'currentValue'));
      }

      if (_.get(lineData, 'currentValue')) {
        this.drawColorLines(_.get(lineData, 'currentValue'));
      }
    }, 500)();
  }

  private initParameters(): void {
    if (!this.sourceData) {
      this.sourceData = {};
    }
    if (!this.sourceData.lines) {
      this.sourceData.lines = [];
    }
    this.data.gridHorizontalLineNum = this.getGridHorizontalLineHum();
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
      const rCount = Math.floor(remainder_ / interval);
      if (rCount >= 1) {
        this.chartStart += rCount * interval;
        this.chartEnd -= rCount * interval;
      }
    }

    this.timeScale = d3.time.scale()
                        .domain([this.chartStart, this.chartEnd])
                        .range([0, this.option.width]);

    this.legendInfo = {
      line: ['Good', 'Fair', 'Poor', 'N/A'],
      circle: ['Good', 'Fair', 'Poor', 'N/A'],
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
    this.markLabel = d3.select('.chartContent').append('div').attr('class', 'markLabel').attr('style', `width: ${this.option.width}px`);
    this.yPanel = d3.select('.chartContent').append('div').attr('class', 'yaxis').attr('style', `height: ${this.option.height}px; top: ${this.option.top}px;`);
    this.tip = d3.select('.timelineSvg').append('div').attr('class', 'timelineTooltip').style('opacity', 0);

    this.drawChartGrid();
    this.drawCrossLine();
    this.xAxis();
    this.yAxis();

    this.drawBaseLines();
    this.drawStartPoints();

    this.setLegend();
  }

  private drawChartGrid(): void {
    const xGridLines: Object[] = [], yGridLines: Object[] = [];
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
      hCount++;
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
      vCount++;
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
      vCount++;
    }
  }

  private getUniqueData(isUnique: boolean): IUniqueData[] {
    if (this.data.data.length <= 0) {
      let data: any = [];
      let y = 0;
      _.forEach(this.sourceData.lines, (item: any, key) => {
        y += this.option.gridHeight;
        const arr = _.map(item, (item_: any) => {
          const x2 = this.timeScale(item_.leaveTime);
          const x1 = this.timeScale(item_.joinTime);
          return _.assignIn({}, item_, { y1: y, y2: y, x2: x2 > x1 ? x2 : x1, x1: x1, filterId: key });
        });
        data = _.concat(data, arr);
      });

      this.data.data = data;
    }
    if (isUnique) {
      return _.uniqBy(this.data.data, 'filterId');
    } else {
      return this.data.data;
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
      .on('mouseover', (item, index) => {
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
          msgArr.push({ key: this.SearchService.getPhoneNumber(item.phoneNumber) });
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
        _.each(this.sourceData.lines[index], lineDetail => {
          duration += lineDetail.duration;
        });
        msgArr.push({ key: this.$translate.instant('webexReports.duration'), value: this.SearchService.toMinOrSec(duration * 1000) });

        this.makeTips({ arr: msgArr }, index * this.option.gridHeight + 50, this.option.paddingLeft - 20 );
      })
      .on('mouseout', () => this.hideTip());
  }

  private detectAndUpdateDevice(item: any, msgArr, index: number) {
    this.SearchService.getRealDevice(item.conferenceID, item.nodeId)
      .then(res => item.device = this.updateDevice(res, msgArr, index));
  }

  private updateDevice(deviceInfo, msgArr, index: number) {
    let device = '';
    if (deviceInfo.completed) {
      if (deviceInfo.items && deviceInfo.items.length > 0) {
        device = deviceInfo.items[0].deviceType;
      } else {
        device = this.$translate.instant('reportsPage.webexMetrics.CMR3DefaultDevice');
      }
      msgArr[1] = { key: device };
      this.makeTips({ arr: msgArr }, index * this.option.gridHeight + 50, this.option.paddingLeft - 20 );
    }
    return device;
  }

  private drawCrossLine(): void {
    const gridHeight = this.data.gridHorizontalLineNum * this.option.gridHeight;
    const crossLine: Object[] = [];
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
    this.markLabel.append('span').attr('class', 'badge').attr('style', `left: ${left4Start}px`).text(this.formatTime(this.data.startTime));
    this.markLabel.append('span').attr('class', 'badge').attr('style', `right: ${left4End_}px`).text(this.formatTime(this.data.endTime));
  }

  private drawBaseLines(): void {
    const baseLines: Object[] = [], containers: Object[] = [];
    let y = 0;
    _.forEach(this.sourceData.lines, (item, yIndex) => {
      y += this.option.gridHeight;
      _.forEach(item, line => {
        baseLines.push({
          x1: this.timeScale(line.joinTime),
          y1: y,
          x2: this.timeScale(line.leaveTime),
          y2: y,
          id: `myLine${line.cid}_${line.nodeId}`,
          start: line.joinTime,
          end: line.leaveTime,
          cls: line.platform === Platforms.TP || (line.sessionType === Platforms.PSTN && this.tabType === 'Audio') ? 'defaultLine' : '',
        });

        containers.push({
          id: `${line.cid}_${line.nodeId}`,
          yIndex: yIndex,
          start: line.joinTime,
          end: line.leaveTime,
        });
      });
    });

    this.drawLine('g.baseLine', baseLines);

    this.renderLineContainer(containers);
  }

  private renderLineContainer(containers: Object[]): void {
    const enterNode = d3.select('g.enterLine');
    const colorNode = d3.select('g.colorLine');
    _.forEach(containers, item => {
      enterNode.append('g').attr({
        id: `myEnter${item['id']}`,
        yIndex: item['yIndex'],
        start: item['start'],
        end: item['end'],
      });
      colorNode.append('g').attr({
        id: `myColor${item['id']}`,
        yIndex: item['yIndex'],
        start: item['start'],
        end: item['end'],
      });
    });
  }

  private drawStartPoints(): void {
    const jmtNode = d3.select('g.jmtPoint');
    const r = 9;
    const data = this.getUniqueData(false);
    _.forEach(data, line => {
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
      let cx_ = cx + r - 1;
      if (cx_ < 9) {
        cx_ = 11;
      }
      g.append('svg:circle').attr({
        r: r,
        cx: cx_,
        cy: y,
      });

      g.on('mouseover', () => {
        const msgArr = [
          { key: this.$translate.instant('reportsPage.webexMetrics.joinMeetingTime') },
          { key: this.$translate.instant('webexReports.notAvailable') },
        ];
        this.makeTips({ arr: msgArr }, y + 12, cx + 158);
      })
      .on('mouseout', () => this.hideTip());
    });
  }

  private updateStartPoints(data: Object[]): void {
    _.forEach(data, (item: any) => {
      let jmtQuality = '';
      const joinMeetingTime = item['joinMeetingTime'];
      if (!(_.isUndefined(joinMeetingTime) || _.isNull(joinMeetingTime))) {
        const jmt = Math.floor(joinMeetingTime * 1);
        const pointNode = d3.select(`#myStartPoint${item.guestId}-${item.userId}-${item.joinTime}`);
        if (pointNode.size()) {
          let cx = pointNode.attr('cx') * 1, cy = pointNode.attr('cy') * 1;

          if (jmt < 10) {
            jmtQuality = 'Good';
            pointNode.selectAll('circle').attr({
              class: 'goodCircle',
              jmtQuality: jmtQuality,
              joinMeetingTime: jmt,
            });
          } else if (jmt >= 10 && jmt <= 20) {
            jmtQuality = 'Fair';
            pointNode.selectAll('circle').remove();
            cx += 2;
            cy -= 1;
            pointNode.append('path').attr({
              d: d3.svg.symbol().type('triangle-up').size(200),
              transform: `translate(${cx}, ${cy})`,
              jmtQuality: jmtQuality,
              joinMeetingTime: jmt,
            }).style('fill', '#ffb400');
          } else {
            jmtQuality = 'Poor';
            pointNode.selectAll('circle').remove();
            cx -= 1;
            cy -= 17 / 2;
            pointNode.append('rect').attr({
              width: 17,
              height: 17,
              rx: 2,
              ry: 2,
              transform: `translate(${cx} , ${cy})`,
              jmtQuality: jmtQuality,
              joinMeetingTime: jmt,
            });
          }

          pointNode.on('mouseover', () => {
            let jmtVal = '';
            jmtVal = this.$translate.instant('time.seconds', { time: jmt }, 'messageformat');

            const msgArr = [
              { key: this.$translate.instant('reportsPage.webexMetrics.joinMeetingTime') + (jmtQuality ? `: ${jmtQuality} ` : '') },
              { key: jmtVal },
            ];

            this.makeTips({ arr: msgArr }, cy + 12, cx + 158);
          })
          .on('mouseout', () => this.hideTip());
        }
      }
    });
  }

  private drawColorLines(lines: Object): void {
    _.forEach(lines, (line, nodeId) => {
      if (line.length) {
        _.forEach(line, lineItem => {
          const nodeId_ = lineItem.cid ? nodeId : `_${nodeId}`;
          const enterNode = d3.select(`#myEnter${nodeId_}`);
          this.drawColorLineSegment(enterNode, lineItem.startTime, lineItem.endTime, 'defaultLine', { nodeId: nodeId_ });

          const colorNode = d3.select(`#myColor${nodeId_}`);
          _.forEach(lineItem.qualities, qualityItem => {
            this.drawColorLineSegment(colorNode, qualityItem.startTime, qualityItem.endTime, this.lineColorCls[qualityItem.quality - 1], { source: qualityItem.source, tooltip: qualityItem.tooltip, nodeId: nodeId_ });
          });
        });
      }
    });
  }

  private drawColorLineSegment(lineNode: d3, startTime: number, endTime: number, cls: string, options: Object = {}): void {
    if (lineNode.size()) {
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
  }

  private drawLine(nodeName: string, data: Object[]): void {
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

  private getGridHorizontalLineHum(): number {
    return this.sourceData.lines.length + 1 > this.data.gridHorizontalLineNum ? this.sourceData.lines.length + 1 : this.data.gridHorizontalLineNum;
  }

  private getCanvasWidth(): number {
    const width = this.$element.find('.timelineSvg').width() - this.option.paddingLeft;
    return width ? width : this.option.width;
  }

  private getCanvasHeight(): number {
    return (this.data.gridHorizontalLineNum * this.option.gridHeight) + this.option.paddingButtom + this.option.paddingTop;
  }

  private formatTime(timestamp: number, format?: string): string {
    format = format ? format : 'hh:mm:ss A';
    return this.SearchService.timestampToDate(timestamp, format);
  }

  private makeTips(msg, top: number, left: number) {
    let template: string = '';
    _.forEach(msg.arr, item => {
      const cls = item.class ? item.class : '';
      const text = item.value ? `: ${item.value}` : '';
      template += `<p class="${cls}"><span>${item.key}</span>${text}</p>`;
    });
    this.showTip(template, top, left);
  }

  private showTip(tooltip, top: number, left: number) {
    if (tooltip) {
      this.tip.html(tooltip).classed('Tooltip-bottom', true).style('display', 'block').style('z-index', 1500);

      const leftOffset = this.tip.style('width').replace('px', '');
      const topOffset = this.tip.style('height').replace('px', '');
      this.tip.transition()
        .duration(500)
        .style('opacity', 1)
        .style('top', () => (top - topOffset) + 'px' ).style('left', () => (left - leftOffset / 2) + 'px' );
    }
  }

  private hideTip() {
    this.tip.transition().duration(500).style('opacity', 0);
  }

  private setLegend(): void {
    const g = d3.select('.timelineSvg').append('div').attr('class', 'legend').attr('style', `min-width: 1100px`);
    this.legendTitle(g);
    g.append('div').attr('class', 'legendCircle').attr('style', 'padding: 0; float: left;');
    g.append('div').attr('class', 'legendLine').attr('style', 'float: right;');
    _.forEach(this.legendInfo.circle, val => {
      const colorZone = d3.select('.legendCircle').append('div');
      const svg = colorZone.append('svg:svg');
      if (val === 'Fair') {
        this.drawTriangle(svg, { x: 10, y: 2 });
      } else if (val === 'Poor') {
        this.drawSquare(svg, { x: 4, y: 2 });
      } else {
        this.drawCircle(svg, val === 'N/A' ? '' : _.toLower(val) + 'Circle', { x: 10, y: 10 });
      }
      svg.append('text').text(val === 'N/A' ? this.$translate.instant('webexReports.notAvailable') : val).attr('transform', `translate(24 , 17)`);
    });

    const qualityLegends = [{ cls: 'goodLine', text: this.$translate.instant('webexReports.good'), width: 80 },
                            { cls: 'fairLine', text: this.$translate.instant('webexReports.fair'), width: 65 },
                            { cls: 'poorLine', text: this.$translate.instant('webexReports.poor'), width: 0 },
                            { cls: 'defaultLine', text: this.$translate.instant('webexReports.notAvailable'), width: 130 },
                            { cls: '', text: `${this.tabType} ${this.$translate.instant('webexReports.notEnabled')}`, width: 155 }];
    _.each(qualityLegends, (legend, index) => {
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
      svg.append('text').text(legend.text).attr('transform', `translate(33 , 17)`);
    });
  }

  private drawCircle(node, class_, pos) {
    return node.append('circle')
    .attr('r', 9)
    .attr('class', class_)
    .attr('transform', `translate(${pos.x}, ${pos.y})`);
  }

  private drawTriangle(node, pos) {
    const middle_point = `${pos.x},${pos.y}`;
    const left_point = `${pos.x - 10},${pos.y + 17}`;
    const right_point = `${pos.x + 10},${pos.y + 17}`;

    return node.append('polygon')
    .attr('points', `${middle_point} ${left_point} ${right_point}`)
    .attr('stroke-linejoin', 'round');
  }

  private drawSquare(node, pos) {
    return node.append('rect')
    .attr('width', 17)
    .attr('height', 17)
    .attr('rx', 2)
    .attr('ry', 2)
    .attr('transform', `translate(${pos.x} , ${pos.y})`);
  }

  private legendTitle(g) {
    g.append('p').text(this.$translate.instant('reportsPage.webexMetrics.joinMeetingTime')).attr('style', 'float: left;').append('i').attr('class', 'icon icon-info-outline')
    .on('mouseover', () => {
      const msgArr = [
        { key: this.$translate.instant('webexReports.timelineChartLegend.joinMeetingTime') },
        { key: this.$translate.instant('webexReports.timelineChartLegend.jmtQuality.good') },
        { key: this.$translate.instant('webexReports.timelineChartLegend.jmtQuality.fair') },
        { key: this.$translate.instant('webexReports.timelineChartLegend.jmtQuality.poor') },
        { key: this.$translate.instant('webexReports.timelineChartLegend.jmtQuality.NA') },
      ];
      const pos = this.$element.find('.legend p i').first().position();
      this.makeTips({ arr: msgArr }, pos.top - 10, pos.left + 17);
    })
    .on('mouseout', () => this.hideTip());

    g.append('p').text(`${this.tabType} Quality`).attr('style', 'float: right;').append('i').attr('class', 'icon icon-info-outline')
    .on('mouseover', () => {
      let msgArr: Object[];
      if (this.tabType === 'Video') {
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
      this.makeTips({ arr: msgArr }, pos.top - 10, pos.left + 17);
    })
    .on('mouseout', () => this.hideTip());
  }
}

export class DgcTimeLineComponent implements ng.IComponentOptions {
  public controller = TimeLine;
  public template = '<div class="timelineSvg"><div class="chartContent"></div></div>';
  public bindings = { sourceData: '<', lineColor: '<', circleColor: '<', tabType: '<', lineData: '<' };
}
