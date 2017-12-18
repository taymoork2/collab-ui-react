import './_timeline.scss';
import * as d3 from 'd3';
import * as moment from 'moment';

class TimeLine implements ng.IComponentController {

  private tip;
  private svg;
  private option;
  private legendInfo;
  private time2line;
  private coordinate;
  private data: any = {};
  private sourceData: any;

  /* @ngInject */
  public constructor(
    private $element: ng.IRootElementService,
  ) {
    this.data = {
      ticks: 0,
      domain: [],
      endTime: 0,
      startTime: 0,
      xAxisFormat: '%I:%M %p',
      gridVerticalLineNum: 12,
      gridHorizontalLineNum: 7,
    };
    this.option = { width: 960, paddingRight: 25, paddingLeft: 160.5, paddingButtom: 50.5, paddingTop: 0.5, gridHeight: 35.5 };
  }

  public $onInit() {
    this.initParameters();

    this.axis();
    this.gridVerticalLine();
    this.gridHorizontalLine();
    this.drawLine();
    this.showUser();
    this.legend();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { circleColor, lineColor, otherPara } = changes;
    _.debounce(() => {
      if (_.get(lineColor, 'currentValue')) {
        d3.selectAll('.lineQos').remove();
        this.setLineColor(_.get(lineColor, 'currentValue'));
      }

      if (_.get(circleColor, 'currentValue')) {
        this.setCircleColor(_.get(circleColor, 'currentValue'));
      }

      if (_.get(otherPara, 'currentValue')) { // TODO, will discuss with backend to optimize the response data
        const arr = _.get(otherPara, 'currentValue');
        let arrLine = [];
        _.forEach(this.data.data, (item) => {
          if (arr[item.nodeId]) {
            let startx = 0;
            _.forEach(arr[item.nodeId], (item_) => {
              const endZone = this.time2line(this.timestampToDate(item_.endTime));
              const endPoint = this.time2line(this.timestampToDate(item_.timestamp));
              const startZone = this.time2line(this.timestampToDate(item_.startTime));
              if ( item.leaveTime < item_.endTime  || endPoint < item.start + 19 ) {
                return true;
              }
              let classKey = 3;
              const audioMos = _.parseInt(item_.audioMos);
              if ( audioMos > 3 ) {
                classKey = 0;
              } else if ( audioMos < 3 && audioMos > 0 ) {
                classKey = 2;
              }
              const class_ = this.legendInfo.line[classKey] === 'N/A' ? '' : _.lowerCase(this.legendInfo.line[classKey]) + 'Line';

              item_.y = item.y;
              item_.class = class_;
              item_.end = endPoint;
              item_.endZone = endZone;
              item_.startZone = startZone;
              item_.quality = this.legendInfo.line[classKey];

              if (!startx || (startx < item_.startZone && startx > item_.endZone)) {
                item_.start = item_.startZone + 19;
              } else {
                item_.start = startx;
              }
              arrLine = _.concat(arrLine, item_);
              startx = item_.end;
            });
          }
        });

        const g = this.svg.append('g').attr('class', 'timeLine pstn');
        g.selectAll('.pstn')
          .data(arrLine)
          .enter()
          .append('svg:line')
          .attr('x1', item => item.start)
          .attr('y1', item => item.y)
          .attr('x2', item => item.end)
          .attr('y2', item => item.y)
          .attr('class', item => item.class)
          .attr('id', item => `myPstn${item.nodeId}`)
          .on('mouseover', (item) => {
            const msgArr = [
              { key: `${item.type} Quality: `, value: item.quality },
              { key: `MOS score: `, value: item.audioMos },
              { key: `Call Type: `, value: item.callType },
              { key: 'Packet Loss: ', value: item.packetLost },
            ];
            this.makeTips({ arr: msgArr });
          })
          .on('mouseout', () => this.tip.transition().duration(500).style('opacity', 0));
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
      endY: this.option.height - this.option.paddingButtom,
      endX: this.option.width - this.option.paddingRight,
    };
    this.option.gridWidth = (this.coordinate.endX - this.coordinate.x) / this.data.gridVerticalLineNum;

    this.setDomain();
    this.svg = d3.select('.timelineSvg')
      .append('svg:svg')
      .attr('width', this.option.width)
      .attr('height', this.option.height);
    this.tip = d3.select('.timelineSvg').append('div')
      .attr('class', 'timelineTooltip')
      .style('opacity', 0);

    this.legendInfo = {
      line: ['Good', 'Fair', 'Poor', 'N/A'],
      circle: ['Good', 'Fair', 'Poor', 'N/A'],
    };
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

  private setDomain(): void {
    const duration = this.data.endTime - this.data.startTime;
    const ruler: number = this.setRuler(duration / 1000) * 1000;
    const tickNum = _.ceil(duration / ruler);

    this.data.ruler = ruler;
    this.data.ticks = this.setTicks(tickNum);

    const startTime = _.floor(this.data.startTime / ruler) * ruler;
    const endTime = startTime + (ruler * this.data.ticks);
    this.data.domain = [this.timestampToDate(startTime), this.timestampToDate(endTime)];
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

  private gridVerticalLine(): void {
    const data: Object[] = [];
    let x = this.coordinate.x - this.option.gridWidth;
    while ( x < this.coordinate.endX) {
      x += this.option.gridWidth;
      data.push({ x1: x, y1: this.coordinate.y, x2: x, y2: this.coordinate.endY });
    }
    this.dataToline({ data: data, append: 'svg:line', class: 'gridVerticalLine' });
  }

  private axis(): void {
    const timeRange = d3.time.scale()
      .domain(this.data.domain)
      .range([this.coordinate.x, this.coordinate.endX]);
    this.time2line = timeRange;
    this.preData();

    const xAxis = d3.svg.axis()
      .scale(timeRange)
      .orient('bottom')
      .ticks(this.data.ticks)
      .tickSize(3, 0)
      .tickFormat(d3.time.format(this.data.xAxisFormat));

    this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${this.coordinate.endY})`)
      .call(xAxis);
  }

  private preData(): void {
    let y = this.coordinate.y;
    let data: any = [];
    _.map(this.sourceData.lines, (item: any, key) => {
      y += this.option.gridHeight;
      const arr = _.map(item, (item_: any) => {
        return _.assignIn({}, item_, {
          y: y,
          filterId: key,
          end: this.time2line(this.timestampToDate(item_.leaveTime)),
          start: this.time2line(this.timestampToDate(item_.joinTime)),
        });
      });
      data = _.concat(data, arr);
    });
    this.data.data = data;
  }

  private drawLine(): void {
    const lines = this.data.data;
    const g = this.svg.append('g').attr('class', 'timeLine');
    g.selectAll('.timeLine')
      .data(lines)
      .enter()
      .append('svg:line')
      .attr('x1', item => item.start)
      .attr('y1', item => item.y)
      .attr('x2', item => item.end)
      .attr('y2', item => item.y)
      .attr('id', item => `myLine${item.nodeId}`);

    this.drawCircle();
  }

  private drawCircle(): void {
    const circles = this.data.data;
    const g = this.svg.append('g').attr('class', 'circleStart');
    g.selectAll('.circleStart')
      .data(circles)
      .enter()
      .append('circle')
      .attr('class', 'myDot')
      .attr('r', 9)
      .attr('cx', item => item.start + 8 )
      .attr('cy', item => item.y )
      .attr('id', item => `myDot${item.guestId}-${item.userId}-${item.joinTime}`)
      .on('mouseover', item => {
        const circleId = `#myDot${item.guestId}-${item.userId}-${item.joinTime}`;
        const endpoint = item.browser_ + ' on ' + item.platform_;
        const jmtQuality = this.$element.find(circleId).attr('jmtQuality');
        const joinMeetingTime = this.$element.find(circleId).attr('joinMeetingTime');
        const key = jmtQuality ? `${jmtQuality} ` : '';
        const msgArr = [
          { key: key + 'Join Meeting Time: ', value: joinMeetingTime ? `${joinMeetingTime} Seconds` : 'N/A' },
          { key: 'Endpoint: ', value: endpoint },
        ];
        const top = item.y + this.$element.find('.timelineSvg').offset().top;
        const left = item.start + this.$element.find('.timelineSvg').offset().left;

        this.makeTips({ arr: msgArr }, { top: top, left: left });
      })
      .on('mouseout', () => this.tip.transition().duration(500).style('opacity', 0));
  }

  private makeTips(msg, option: Object|undefined = undefined) {
    let template: string = '';
    this.tip.classed('Tooltip-bottom', true);
    _.forEach(msg.arr, (item) => {
      template += `<p class="${item.class ? item.class : ''}"><span>${item.key}</span> ${item.value}</p>`;
    });
    this.tip.html(template);

    const leftOffset = this.tip.style('width').replace('px', '');
    const topOffset = this.tip.style('height').replace('px', '');
    const left = option ? _.get(option, 'left') : d3.event.clientX;
    const top = option ? _.parseInt(_.get(option, 'top')) - 20 : d3.event.clientY - 9;

    this.tip.transition()
      .duration(500)
      .style('opacity', 1)
      .style('display', 'block')
      .style('z-index', 1025)
      .style('top', () => (top - topOffset) + 'px' )
      .style('left', () => (left - leftOffset / 2) + 'px' );
  }

  private showUser(): void {
    const data = _.uniqBy(this.data.data, 'filterId');
    const g = this.svg.append('g').attr('class', 'showUser');
    g.selectAll('.showUser')
      .data(data)
      .enter()
      .append('text')
      .text(item => _.truncate(item.userName, { length: 12 }))
      .attr('id', item => `myUser${item.nodeId}`)
      .attr('transform', item => `translate(${this.coordinate.x - 9} , ${item.y})`)
      .on('mouseover', item => {
        const msgArr = [
          { key: 'User Name: ', value: item.userName },
          { key: 'Platform: ', value: item.platform_ },
        ];
        this.makeTips({ arr: msgArr });
      })
      .on('mouseout', () => this.tip.transition().duration(500).style('opacity', 0));
  }

  private legend(): void {
    let xStart = 0;
    const x = this.coordinate.x;
    const y = this.coordinate.endY + 9;
    const colorG = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(130 , 0)`)
      .append('g')
      .attr('class', 'circle');
    colorG.append('text')
      .attr('transform', `translate(${xStart + x} , ${y + 32})`)
      .text('Join Meeting Time: ');
    xStart += 70;

    _.forEach(this.legendInfo.circle, function (val) {
      xStart += 70;
      colorG.append('circle')
        .attr('r', 9)
        .attr('class', val === 'N/A' ? '' : _.toLower(val) + 'Circle')
        .attr('transform', `translate(${xStart + x} , ${y + 28})`);

      colorG.append('text').text(val).attr('transform', `translate(${xStart + x + 20} , ${y + 32})`);
    });
    this.lineMsgTips();
  }

  private lineMsgTips(): void {
    const colorG = this.svg.select('.legend').append('g').attr('class', 'line');
    const y = this.coordinate.endY + 38;

    let xStart = 430;
    colorG.append('text')
      .attr('transform', `translate(${xStart + this.coordinate.x} , ${y + 4})`)
      .text('Meeting Quality: ');
    xStart += 193;
    _.forEach(this.legendInfo.line, (val) => {
      xStart += 100;
      colorG.append('svg:line')
        .attr('class', val === 'N/A' ? '' : _.toLower(val) + 'Line')
        .attr('x1', xStart)
        .attr('y1', y)
        .attr('x2', xStart + 30)
        .attr('y2', y);

      colorG.append('text')
        .text(val)
        .attr('transform', `translate(${xStart + 45} , ${y + 4})`);
    });
  }

  private setCircleColor(data) {
    _.forEach(data, (item) => {
      const dotId = `${item.guestId}-${item.userId}-${item.joinTime}`;
      const classKey = _.parseInt(item.jmtQuality) - 1;
      const class_ = this.legendInfo.circle[classKey] === 'N/A' ? '' : _.lowerCase(this.legendInfo.circle[classKey]) + 'Circle';
      d3.select(`#myDot${dotId}`)
      .attr('class', class_)
      .attr('joinMeetingTime', item.joinMeetingTime)
      .attr('jmtQuality', this.legendInfo.circle[_.parseInt(item.jmtQuality) - 1]);
    });
  }

  private setLineColor(data) {
    let arr: any = [];
    _.forEach(this.data.data, (item) => {
      if (data[item.nodeId]) {
        arr = _.concat(arr, this.getQosData(data[item.nodeId], item.start + 20, item.y));
      }
    });
    const g = this.svg.append('g').attr('class', 'timeLine lineQos');
    g.selectAll('.timeLine')
    .data(arr)
    .enter()
    .append('svg:line')
    .attr('x1', item => item.start)
    .attr('y1', item => item.y)
    .attr('x2', item => item.end)
    .attr('y2', item => item.y)
    .attr('class', item => item.class_)
    .attr('id', item => `${item.qosId}`)
    .on('mouseover', (item) => {
      const msgArr = [
        { key: `${item.type} Quality:`, value: this.legendInfo.line[_.parseInt(item.dataQuality) - 1] },
        { key: `Latency:`, value: item.latency },
        { key: 'Packet Loss:', value: _.round(item.packageLossRate * 100, 2) + ` %` },
      ];
      this.makeTips({ arr: msgArr });
    })
    .on('mouseout', () => this.tip.transition().duration(500).style('opacity', 0));
  }

  private getQosData(data, startx, y) {
    let data_: any = [];
    _.forEach(data, (item) => {
      const end = this.time2line(this.timestampToDate(item.timeStamp));
      if (end < startx) {
        return true;
      }
      const classKey = _.parseInt(item.dataQuality) - 1;
      const class_ = this.legendInfo.line[classKey] === 'N/A' ? '' : _.lowerCase(this.legendInfo.line[classKey]) + 'Line';
      const newItem = _.assign(item, { start: startx, end: end, y: y, class_: class_, qosId: `qosId${item.nodeId}-${startx}-${end}` });
      data_ = _.concat(data_, newItem);

      startx = end;
    });

    return data_;
  }

  private setRuler(time): number {
    const rulerArr = [[1800, 0, 300], [10800, 1800, 900], [21600, 10800, 1800], [43200, 21600, 3600], [86400, 43200, 7200]];
    let ruler = 300;
    _.forEach(rulerArr, (item) => {
      if (time <= item[0] && time > item[1]) {
        ruler = item[2];
        return false;
      }
    });
    return ruler;
  }

  private timestampToDate(timestamp): Date {
    const offset = this.sourceData.offset ? this.sourceData.offset : '+00:00';
    const utcTime = moment(timestamp).utc().format('YYYY-MM-DD HH:mm:ss');
    const dateStr = moment.utc(utcTime).utcOffset(offset).format('YYYY-MM-DD HH:mm:ss');
    return moment(dateStr).toDate();
  }

  private setTicks(tick: number): number {
    let tickNum = 4;
    if (tick > 4 ) {
      tickNum = tick > 6 ? 12 : 6;
    }
    return tickNum;
  }

  private dataToline(option) {
    const g = this.svg.append('g').attr('class', option.class);
    g.selectAll(`.${option.class}`)
      .data(option.data)
      .enter()
      .append(option.append)
      .attr('x1', item => item.x1)
      .attr('y1', item => item.y1)
      .attr('x2', item => item.x2)
      .attr('y2', item => item.y2);
  }
}

export class DgcTimeLineComponent implements ng.IComponentOptions {
  public controller = TimeLine;
  public template = '<div class="timelineSvg"></div>';
  public bindings = { sourceData: '<', lineColor: '<', circleColor: '<', otherPara: '<' };
}
