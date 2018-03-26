import './_timeline.scss';
import * as d3 from 'd3';
import * as moment from 'moment';
import { SearchService } from './searchService';

class TimeLine implements ng.IComponentController {

  private tip;
  private svg;
  private option;
  private legendInfo;
  private time2line;
  private coordinate;
  private data: any = {};
  private sourceData: any;
  private callLegsData: any;
  private tabType: string;

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
    };
    this.option = { width: 960, paddingRight: 25, paddingLeft: 150.5, paddingButtom: 20.5, paddingTop: 0.5, gridHeight: 35.5 };
  }

  public $onInit() {
    if (!this.sourceData) { return; }
    this.addFnToD3();
    this.initParameters();

    this.setDomain();
    this.drawStartEndLine();
    this.xAxis();
    this.drawLines();
    this.yAxis();
    this.setLegend();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    if (!this.sourceData) { return; }
    const { circleColor, lineColor, pstnData, cmrData, callLegsData } = changes;
    _.debounce(() => {
      if (_.get(lineColor, 'currentValue')) {
        this.setLineColor(_.get(lineColor, 'currentValue'));
      }

      if (_.get(circleColor, 'currentValue')) {
        this.updateGraph(_.get(circleColor, 'currentValue'));
      }

      if (_.get(pstnData, 'currentValue')) {
        this.lineSegment(_.get(pstnData, 'currentValue'), 'pstn');
      }

      if (_.get(cmrData, 'currentValue')) {
        this.lineSegment(_.get(cmrData, 'currentValue'), 'cmr');
      }

      if (_.get(callLegsData, 'currentValue')) {
        this.updateCallLegsLine(_.get(callLegsData, 'currentValue'));
      }
    }, 500)();
  }

  private initParameters(): void {
    this.option.width = this.getCanvasWidth();
    this.data.endTime = this.sourceData.endTime;
    this.data.startTime = this.sourceData.startTime;
    this.data.gridHorizontalLineNum = this.getGridHorizontalLineHum();
    this.option.height = this.getCanvasHeight();
    this.coordinate = {
      x: this.option.paddingLeft,
      y: this.option.paddingTop,
      endX: this.option.width - this.option.paddingRight,
      endY: this.option.height - this.option.paddingButtom,
    };
    this.option.gridWidth = (this.coordinate.endX - this.coordinate.x) / this.data.gridVerticalLineNum;

    this.svg = d3.select('.timelineSvg').append('svg:svg').attr('width', this.option.width).attr('height', this.option.height);
    this.tip = d3.select('.timelineSvg').append('div').attr('class', 'timelineTooltip').style('opacity', 0);
    this.legendInfo = {
      line: ['Good', 'Fair', 'Poor', 'N/A'],
      circle: ['Good', 'Fair', 'Poor', 'N/A'],
    };
  }

  private drawStartEndLine() {
    const start = this.time2line(this.timestampToDate(this.sourceData.startTime));
    const end = this.time2line(this.timestampToDate(this.sourceData.endTime));
    const data = [
      { x1: end, y1: this.coordinate.y, x2: end, y2: this.coordinate.endY },
      { x1: start, y1: this.coordinate.y, x2: start, y2: this.coordinate.endY },
    ];
    this.dataToline({ data: data, append: 'svg:line', class: 'startEnd' });
    const g = d3.select('.timelineSvg').insert('div', 'svg').attr('class', 'seFlag')
    .attr('style', `width: ${end - start + 4}px; margin-left: ${start - 2}px; top: -${this.option.gridHeight / 2}px; line-height: 18px;`);
    g.append('span').attr('class', 'badge').text(this.stampToDate(this.sourceData.startTime, 'hh:mm A'));
    g.append('span').attr('class', 'badge').text(this.stampToDate(this.sourceData.endTime, 'hh:mm A'));
  }

  private getGridHorizontalLineHum(): number {
    return this.sourceData.lines.length + 1 > this.data.gridHorizontalLineNum ? this.sourceData.lines.length + 1 : this.data.gridHorizontalLineNum;
  }

  private getCanvasWidth(): number {
    const width = this.$element.find('.timelineSvg').width();
    return width ? width : this.option.width;
  }

  private getCanvasHeight(): number {
    return (this.data.gridHorizontalLineNum * this.option.gridHeight) + this.option.paddingButtom + this.option.paddingTop;
  }

  private drawGrid(tickSize, ticks) {
    this.gridHorizontalLine();
    this.gridVerticalLine(tickSize, ticks);
  }

  private gridHorizontalLine(): void {
    const data: Object[] = [];
    let y = this.coordinate.y;
    while (y <= this.coordinate.endY) {
      data.push({ x1: this.coordinate.x, y1: y, x2: this.coordinate.endX, y2: y });
      y  += this.option.gridHeight;
    }
    this.dataToline({ data: data, append: 'svg:line', class: 'gridHorizontalLine' });
  }

  private gridVerticalLine(tickSize, ticks): void {
    let i = 0;
    const data: Object[] = [];
    while (i <= 12) {
      const tickPoint = ticks[0] + tickSize * i * 0.5;
      if (tickPoint <= ticks[_.size(ticks) - 1]) {
        const x = this.time2line(this.timestampToDate(tickPoint));
        data.push({ x1: x, y1: this.coordinate.y, x2: x, y2: this.coordinate.endY });
      }
      i++;
    }
    this.dataToline({ data: data, append: 'svg:line', class: 'gridVerticalLine' });
  }

  private showUnitStr() {
    d3.select('.yaxis')
    .append('div')
    .attr('class', 'unitStr')
    .text(this.data.unitStr);
  }

  private setDomain(): void {
    const interval = this.getInterval();
    const ticks = this.getTicks(interval);
    this.data.domain = [this.timestampToDate(ticks[0]), this.timestampToDate(ticks[_.size(ticks) - 1])];
    this.time2line = d3.time.scale()
    .domain(this.data.domain)
    .range([this.coordinate.x, this.coordinate.endX]);

    this.data.tickValues = _.map(ticks, item => this.timestampToDate(item));
    this.drawGrid(interval, ticks);
  }

  private xAxis(): void {
    this.preData();
    const xAxis = d3.svg.axis()
      .scale(this.time2line)
      .orient('bottom')
      .tickSize(3, 0)
      .tickValues(this.data.tickValues)
      .tickFormat(d3.time.format(this.data.xAxisFormat));

    this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${this.coordinate.endY})`)
      .call(xAxis);
    this.svg.selectAll('.tick:last-of-type text').attr('x', -8);
  }

  private preData(): void {
    let y = this.coordinate.y;
    let data: any = [];
    _.map(this.sourceData.lines, (item: any, key) => {
      y += this.option.gridHeight;
      const arr = _.map(item, (item_: any) => {
        const x2 = this.time2line(this.timestampToDate(item_.leaveTime));
        const x1 = this.time2line(this.timestampToDate(item_.joinTime)) + 13;
        const cls = ( this.callLegsData && this.callLegsData[item_.nodeId]) ? 'defaultLine' : '';
        return _.assignIn({}, item_, { y1: y, y2: y, x2: x2 > x1 ? x2 : x1, x1: x1, filterId: key, cls: cls });
      });
      data = _.concat(data, arr);
    });
    this.data.data = data;
  }

  private drawLines(): void {
    const node = this.dataToline({ data: this.data.data, append: 'svg:line', class: 'timeLine' });
    node.attr('id', (item) => `myLine${item.nodeId}`);

    this.drawStartGraph();
  }

  private drawStartGraph(): void {
    const circles = this.data.data;
    const g = this.svg.append('g').attr('class', 'startPoint');
    const stopX = this.time2line(this.timestampToDate(this.sourceData.endTime));
    g.selectAll('.startPoint')
      .data(circles)
      .enter()
      .append('circle')
      .attr('r', 9)
      .attr('transform', item => `translate(${item.x1 > stopX ? stopX : item.x1}, ${item.y1})`)
      .attr('id', item => `myDot${item.guestId}-${item.userId}-${item.joinTime}`)
      .on('mouseover', item => {
        const circleId = `#myDot${item.guestId}-${item.userId}-${item.joinTime}`;
        const jmtQuality = this.$element.find(circleId).attr('jmtQuality');
        const joinMeetingTime = this.$element.find(circleId).attr('joinMeetingTime');
        let jmtVal = 'Not Available';
        if (!_.isUndefined(joinMeetingTime)) {
          jmtVal = _.parseInt(joinMeetingTime) <= 1 ? `${joinMeetingTime} Second` : `${joinMeetingTime} Seconds`;
        }

        const msgArr = [
          { key: this.$translate.instant('reportsPage.webexMetrics.joinMeetingTime') + (jmtQuality ? `: ${jmtQuality} ` : '') },
          { key: jmtVal },
        ];

        this.makeTips({ arr: msgArr }, item.y1 - 16, item.x1 - 2);
      })
      .on('mouseout', () => this.hideTips());
  }

  private makeTips(msg, top: number, left: number) {
    let template: string = '';
    _.forEach(msg.arr, item => {
      template += `<p class="${item.class ? item.class : ''}"><span>${item.key}</span> ${item.value ? item.value : ''}</p>`;
    });

    this.tip.html(template).classed('Tooltip-bottom', true).style('display', 'block').style('z-index', 1500);

    const leftOffset = this.tip.style('width').replace('px', '');
    const topOffset = this.tip.style('height').replace('px', '');
    this.tip.transition()
      .duration(500)
      .style('opacity', 1)
      .style('top', () => (top - topOffset) + 'px' ).style('left', () => (left - leftOffset / 2) + 'px' );
  }

  private yAxis(): void {
    const tollFreeData = {};
    const data = _.uniqBy(this.data.data, 'filterId');
    const g = d3.select('.timelineSvg').insert('div', 'svg').attr('class', 'yaxis').attr('style', `height: ${this.option.height}px`);
    g.selectAll('.yaxis')
      .data(data)
      .enter()
      .append('p')
      .attr('class', 'ellipsis')
      .on('mouseover', item => {
        const msgArr = [
          { key: item.userName },
          { key: 'Join Time: ', value: item.joinTime_ },
          { key: 'Duration: ', value: _.round(item.duration / 60) + ' Min' },
        ];

        if (!item.device) {
          this.detectAndUpdateDevice(item, msgArr);
        } else {
          msgArr.splice(1, 0, { key: item.device });
          this.getPSTNCallInType(tollFreeData, msgArr, item);
        }

        this.makeTips({ arr: msgArr }, item.y1 - 15, this.option.paddingLeft - 40 );
      })
      .on('mouseout', () => this.hideTips()).text(item => `${item.userName}`).append('i').attr('class', item => `icon ${item.deviceIcon}`);

    this.showUnitStr();
  }

  private detectAndUpdateDevice(item: any, msgArr) {
    if (item.platform === '10') {
      this.SearchService.getRealDevice(item.conferenceID, item.nodeId)
        .then( res => item.device = this.updateDevice(res, item, msgArr) );
    }
  }

  private updateDevice(deviceInfo, item, msgArr) {
    if (deviceInfo.items && deviceInfo.items.length > 0) {
      const device = deviceInfo.items[0].deviceType;
      msgArr.splice(1, 0, { key: device });
      this.makeTips({ arr: msgArr }, item.y1 - 15, this.option.paddingLeft - 40 );
      return device;
    }

    return '';
  }

  private getPSTNCallInType(tollFreeData, msgArr, item): void {
    if (item.device === 'IP Phone' || item.device === 'Phone') {
      msgArr.splice(1, 1);
      if (!tollFreeData[item.userName]) {
        if (!tollFreeData[item.userName + 'startTime'] || new Date().getTime() - tollFreeData[item.userName + 'startTime'] > 1000) {
          tollFreeData[item.userName + 'startTime'] = new Date().getTime();
          this.SearchService.getPSTNCallInType(item.conferenceID, item.nodeId).then((res: any) => {
            if (res.completed && res.items && res.items.length > 0 && res.items[0]) {
              tollFreeData[item.userName] = res.items[0].pstnCallInType;
              msgArr.splice(1, 0, { key: 'Call in: ', value: res.items[0].pstnCallInType });
              this.makeTips({ arr: msgArr }, item.y1 - 15, this.option.paddingLeft - 40 );
              tollFreeData[item.userName + 'startTime'] = 0;
            }
          });
        }
      } else {
        msgArr.splice(1, 0, { key: 'Call in: ', value: tollFreeData[item.userName] });
      }
    }
    this.makeTips({ arr: msgArr }, item.y1 - 15, this.option.paddingLeft - 40 );
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

  private preLineSegData(arr, type) { //TODO, will discuss with backend to optimize the response data
    let arrLine = [];
    _.forEach(arr, (item, key) => {
      const data: any = _.find(this.data.data, { nodeId: key });
      let startx = _.get(data, 'x1', 0) - 4;
      const leaveTime = _.get(data, 'leaveTime', 0);

      _.map(item, (item_: any) => {
        const endZone = this.time2line(this.timestampToDate(item_.endTime));
        const endPoint = this.time2line(this.timestampToDate(item_.timestamp));
        const startZone = this.time2line(this.timestampToDate(item_.startTime));
        item_.endTime = (item_.endTime > leaveTime) ? leaveTime : item_.endTime;

        if ( leaveTime < item_.endTime  || endPoint < _.get(data, 'x1', 0) + 14 ) { // out of the line
          item_.endTime = leaveTime;
          return true;
        }

        if (endPoint > _.get(data, 'x2', 0) || startx > _.get(data, 'x2', 0)) {
          return true;
        }

        const lineSeg = _.assignIn({}, item_, { x1: startx, y1: _.get(data, 'y1', 0), x2: endPoint, y2: _.get(data, 'y2', 0), msgArr: this.setMsg(_.assign({}, item_, data), type), class: _.lowerFirst(`${item_.quality}Line`) });
        lineSeg.x = (startx < startZone || startx > endZone) ? startZone + 19 : lineSeg.x;
        arrLine = _.concat(arrLine, lineSeg);
        startx = endPoint;
      });
    });
    return arrLine;
  }

  private lineSegment(arr, type) {
    const data = this.preLineSegData(arr, type);
    const node = this.dataToline({ data: data, append: 'svg:line', class: type });
    node.attr('class', item => item.class).attr('id', item => `my${type}${item.nodeId}`)
      .on('mouseover', (item) => {
        this.makeTips({ arr: item.msgArr }, item.y1 - 8, item.x1);
      })
      .on('mouseout', () => this.hideTips());

    this.coverLine(data);
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
      svg.append('text').text(val === 'N/A' ? 'Not Available' : val).attr('transform', `translate(24 , 17)`);
    });

    const qualityLegends = [{ cls: 'goodLine', text: 'Good', width: 80 },
                            { cls: 'fairLine', text: 'Fair', width: 65 },
                            { cls: 'poorLine', text: 'Poor', width: 0 },
                            { cls: 'defaultLine', text: 'Not Available', width: 130 },
                            { cls: '', text: `${this.tabType} Not Enabled`, width: 155 }];
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

  private legendTitle(g) {
    g.append('p').text(this.$translate.instant('reportsPage.webexMetrics.joinMeetingTime')).attr('style', 'float: left;').append('i').attr('class', 'icon icon-info-outline')
    .on('mouseover', () => {
      const msgArr = [
        { key: `<p class="text-center">Join Meeting Time is<br>calculated in seconds.<br>Good: < 10 seconds<br>Fair: 10-20 seconds<br>Poor: > 20 seconds<br>Not Available: No information</p>` },
      ];
      const pos = this.$element.find('.legend p i').first().position();
      this.makeTips({ arr: msgArr }, pos.top - 10, pos.left + 17);
    })
    .on('mouseout', () => this.hideTips());
    g.append('p').text(`${this.tabType} Quality`).attr('style', 'float: right;').append('i').attr('class', 'icon icon-info-outline')
    .on('mouseover', () => {
      let msg = '';
      if (this.tabType === 'Video') {
        msg = `<p class="text-center">Video quality are measures <br>with latency and packet loss.<br>
        Packet loss > 5.0% or latency > 400ms = Poor<br>
        If neither of the above, then the quality is Good</p>`;
      } else {
        msg = `<p class="text-center">PSTN quality is measured by a MOS Score. <br>
        Scores of 4.0-5.0 are Good, <br>
        3.0-3.9 are Fair and below 3.0 are Poor.<br>
        VoIP quality are measures<br> with latency and packet loss.<br>
        Packet loss < 3.0% and latency < 300ms = Good<br>
        Packet loss > 5.0% and latency > 400ms = Poor<br>
        If neither of the above, then the quality is Fair</p>`;
      }
      const msgArr = [
        { key: msg },
      ];
      const pos = this.$element.find('.legend p i').last().position();
      this.makeTips({ arr: msgArr }, pos.top - 10, pos.left + 17);
    })
    .on('mouseout', () => this.hideTips());
  }

  private updateGraph(data) {
    const node = d3.select('.startPoint');
    node.moveToFront();
    _.forEach(data, (item) => {
      const classKey = this.getJoinMeetingQualityIndex(item);
      const dotId = `#myDot${item.guestId}-${item.userId}-${item.joinTime}`;
      const nodeData: any = _.find(this.data.data, { guestId: item.guestId, userId: item.userId, joinTime: item.joinTime });
      const nodey = _.get(nodeData, 'y1', 0);
      const nodex = _.get(nodeData, 'x1', 0);

      let newS: any = undefined;
      if (classKey === 0) {
        d3.select(dotId)
        .attr('class', 'goodCircle')
        .attr('joinMeetingTime', item.joinMeetingTime)
        .attr('jmtQuality', this.legendInfo.circle[classKey]);
      } else if (classKey === 1) {
        d3.select(dotId).remove();
        newS = this.drawTriangle(node, { x: nodex, y: nodey - 9 });
      } else if (classKey === 2) {
        d3.select(dotId).remove();
        newS = this.drawSquare(node, { x: nodex - 6, y: nodey - 9 });
      }

      if (newS) {
        newS.on('mouseover', () => {
          const qualityKey = this.getJoinMeetingQualityIndex(item);
          const quality = this.legendInfo.circle[qualityKey] === 'N/A' ? '' : this.legendInfo.circle[qualityKey];
          const msgArr = [
            { key: this.$translate.instant('reportsPage.webexMetrics.joinMeetingTime') + (quality ? `: ${quality} ` : '') },
            { key: item.joinMeetingTime ? `${item.joinMeetingTime} Seconds` : 'Not Available' },
          ];

          this.makeTips({ arr: msgArr }, nodey - 16, nodex);
        })
        .on('mouseout', () => this.hideTips());
      }
    });
  }

  private updateCallLegsLine(data) {
    _.each(data, (isDefault, nodeId) => {
      if (isDefault) {
        d3.select(`#myLine${nodeId}`)
          .attr('class', 'defaultLine');
      }
    });
  }

  private getJoinMeetingQualityIndex(data) {
    let index = 3;
    if (!(_.isUndefined(data.joinMeetingTime) || _.isNull(data.joinMeetingTime))) {
      const jmt = data.joinMeetingTime * 1;
      if (jmt < 10) {
        index = 0;
      } else if (jmt >= 10 && jmt <= 20) {
        index = 1;
      } else {
        index = 2;
      }
    }
    return index;
  }

  private setLineColor(data) {
    let arr: any = [];
    _.forEach(data, (item, key) => {
      const nodeData = _.find(this.data.data, { nodeId: key });
      arr = _.concat(arr, this.getQosData(item, _.get(nodeData, 'x1', 0) + 14, _.get(nodeData, 'y1', 0)));
    });

    const node = this.dataToline({ data: arr, append: 'svg:line', class: 'lineQos' });
    node.attr('class', item => item.class_).attr('id', item => `${item.qosId}`)
    .on('mouseover', item => {
      const msgArr = [
        { key: `${item.type} Quality:`, value: this.legendInfo.line[_.parseInt(item.dataQuality) - 1] },
        { key: `Latency:`, value: item.latency * 1 > 999 ? '> 1 Second' : item.latency + ' ms' },
        { key: 'Packet Loss:', value: item.packageLossRate * 100 > 9.9 ? '> 10%' : _.round(item.packageLossRate * 100, 2) + `%` },
      ];
      this.makeTips({ arr: msgArr }, item.y1 - 10, item.x1 + (item.x2 - item.x1) / 2);
    })
    .on('mouseout', () => this.hideTips());
  }

  private getQosData(data, startx, y) {
    let data_: any = [];
    _.forEach(data, (item) => {
      let timestamp = item.timeStamp;
      if (timestamp > this.data.endTime) {
        timestamp = this.data.endTime;
      }
      const end = this.time2line(this.timestampToDate(timestamp));
      if (end < startx) {
        return true;
      }
      const classKey = _.parseInt(item.dataQuality) - 1;
      const class_ = this.legendInfo.line[classKey] === 'N/A' ? '' : _.lowerCase(this.legendInfo.line[classKey]) + 'Line';
      const newItem = _.assign(item, { x1: startx, x2: end, y1: y, y2: y, class_: class_, qosId: `qosId${item.nodeId}-${startx}-${end}` });
      data_ = _.concat(data_, newItem);

      startx = end;
    });

    return data_;
  }

  private stampToDate(timestamp, formatStr: string = 'YYYY-MM-DD HH:mm:ss'): string {
    const offset = this.sourceData.offset ? this.sourceData.offset : '+00:00';
    const utcTime = moment(timestamp).utc().format('YYYY-MM-DD HH:mm:ss');
    const dateStr = moment.utc(utcTime).utcOffset(offset).format(formatStr);
    return dateStr;
  }
  private timestampToDate(timestamp): Date {
    const dateStr = this.stampToDate(timestamp);
    return moment(dateStr).toDate();
  }

  private dataToline(option, node = undefined) {
    const g = node ? node : this.svg.append('g').attr('class', option.class);
    return g.selectAll(`.${option.class}`)
      .data(option.data)
      .enter()
      .append(option.append)
      .attr('x1', item => item.x1)
      .attr('y1', item => item.y1)
      .attr('x2', item => item.x2)
      .attr('y2', item => item.y2)
      .attr('class', item => item.cls ? item.cls : '');
  }

  private hideTips() {
    this.tip.transition().duration(500).style('opacity', 0);
  }

  private coverLine(arrLine) {
    d3.select('.startPoint').moveToFront();
    const data =  _.filter(arrLine, (item: any) => item.quality === 'Poor' );
    const coverLine = d3.select('.timelineSvg svg').insert('g', '.pstn').attr('class', 'coverLine');
    this.dataToline({ data: data, append: 'svg:line', class: 'coverLine' }, coverLine);
  }

  private setMsg(item, type) {
    const typeObj = {
      pstn: [
        { key: `${item.type} Quality: `, value: item.quality },
        { key: `MOS Score: `, value: item.audioMos },
        { key: `Call Type: `, value: item.callType },
      ],
      cmr: [
        { key: `${item.type} Quality: `, value: item.quality },
        { key: `Loss Rate: `, value: _.round(item.lossRate * 100, 2) + `%` },
        { key: 'Jitter: ', value: _.parseInt(item.jitter) === 1 ? `${item.jitter} Millisecond` : `${item.jitter} Milliseconds` },
      ],
    };

    return typeObj[type];
  }

  private getInterval(): number {
    let i = 1;
    let startTime = 0;
    const unit = this.getUnit();
    let interval = unit;
    while (startTime + interval * 6 < this.sourceData.endTime) {
      interval = i <= 5 ? i * unit : (i - 5) * 5 * unit;
      startTime = _.floor(this.sourceData.startTime / interval) * interval;
      i += 1;
    }
    return interval;
  }

  private getUnit() {
    const duration = this.sourceData.endTime - this.sourceData.startTime;
    let unit = 60 * 1000;
    if (duration <= 55 * 6 * 1000) {
      unit = 1 * 1000;
      this.data.unitStr = 'Hour:Min:Sec';
      this.data.xAxisFormat = '%I:%M:%S %p';
    }
    return unit;
  }

  private getTicks(tickSize) {
    let i = 1;
    const sourceStartTime = _.floor(this.sourceData.startTime / tickSize) * tickSize;
    let startTime = sourceStartTime;
    let endTime = startTime + tickSize * 6;
    while (i <= 12) {
      startTime = startTime + 0.5 * tickSize < this.sourceData.startTime ? startTime + 0.5 * tickSize : startTime;
      endTime = endTime - 0.5 * tickSize > this.sourceData.endTime ? endTime - 0.5 * tickSize : endTime;
      i++;
    }

    i = 0;
    const tickValues = [startTime];
    while (i < 6) {
      const tickPoint = sourceStartTime + tickSize * i;
      if (tickPoint > startTime && tickPoint < endTime) {
        tickValues.push(tickPoint);
      }
      i++;
    }
    tickValues.push(endTime);
    return tickValues;
  }

  private addFnToD3() {
    d3.selection.prototype.moveToFront = function() {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    };
  }
}

export class DgcTimeLineComponent implements ng.IComponentOptions {
  public controller = TimeLine;
  public template = '<div class="timelineSvg"></div>';
  public bindings = { sourceData: '<', lineColor: '<', circleColor: '<', pstnData: '<', cmrData: '<', callLegsData: '<', tabType: '<' };
}
