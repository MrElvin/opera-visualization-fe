import React, { Component } from 'react'
import { Spin } from 'antd'
import * as d3 from 'd3'
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey'
import G2 from '@antv/g2'
import { View } from '@antv/data-set'
import echarts from 'echarts'
import axios from 'axios'
import qs from 'qs'
import './index.styl'

const guid = () => {
  const _p8 = i => {
    const p = `${Math.random().toString(16)}000000000`.substr(2, 8)
    return i ? `-${p.substr(0, 4)}-${p.substr(4, 4)}` : p
  }
  return _p8() + _p8(true) + _p8(true) + _p8()
}

// AntV 图片主题色
const COLOR_PLATE_16 = [
  '#1890FF',
  '#41D9C7',
  '#2FC25B',
  '#FACC14',
  '#E6965C',
  '#223273',
  '#7564CC',
  '#8543E0',
  '#5C8EE6',
  '#13C2C2',
  '#5CA3E6',
  '#3436C7',
  '#B381E6',
  '#F04864',
  '#D598D9'
]

// 词云图 G2 相关配置
function getTextAttrs (cfg) {
  return {
    ...cfg.style,
    fillOpacity: cfg.opacity,
    fontSize: cfg.origin._origin.size,
    // fontWeight: 400,
    text: cfg.origin._origin.text,
    textAlign: 'center',
    fontFamily: cfg.origin._origin.font,
    fill: cfg.color,
    textBaseline: 'Alphabetic'
  }
}
G2.Shape.registerShape('point', 'cloud', {
  drawShape (cfg, container) {
    const attrs = getTextAttrs(cfg)
    return container.addShape('text', {
      attrs: {
        ...attrs,
        x: cfg.x,
        y: cfg.y
      }
    })
  }
})

class OverviewPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isSankeyAreaHalf: false,
      sankeyName: '',
      sankeyValue: 0,
      loading: true
    }
    this.relationChart = null
    this.containerRef = React.createRef()
    this.sankeyRef = React.createRef()
    this.wordCloudRef = React.createRef()
    this.relationRef = React.createRef()
  }
  async componentDidMount () {
    const { clientWidth, clientHeight } = this.sankeyRef.current
    await this.drawSankeyDiagram(clientWidth, clientHeight)
    this.setState({ loading: false })
  }
  async getSankeyData () {
    let result = null
    try {
      result = await axios.get(`/api/sankey`)
      return result.data.data
    } catch (err) {
      console.error(err)
      return null
    }
  }
  async drawSankeyDiagram (clientWidth, clientHeight) {
    const that = this
    const sankeyData = await this.getSankeyData()
    const { result } = this.sankeyLayout({
      ...sankeyData,
      width: clientWidth,
      height: clientHeight
    })
    const { nodes, links } = result
    const color = (() => {
      const colors = d3.scaleOrdinal().range(COLOR_PLATE_16)
      return name => colors(name.replace(/ .*/, ''))
    })()

    // 设置画布
    const svg = d3
      .select('#sankey-container')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${clientWidth} ${clientHeight}`)

    // 设置 nodes
    const node = svg
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')')
    node
      .append('rect')
      .attr('height', d => d.y1 - d.y0)
      .attr('width', 15)
      .transition()
      .duration(300)
      .style('fill', d => {
        const result = color(d.name[0])
        return (d.color = result)
      })
      .style('stroke-width', 1)
      .style('stroke', d => d3.rgb(d.color).darker(1))

    // nodes 事件
    svg
      .selectAll('.node')
      .on('click', async function (d) {
        d3.select(this)
          .style('stroke-width', 1)
          .style('stroke', d => d3.rgb(d.color).darker(1))
        that.setState({ loading: true })
        if (!that.state.isSankeyAreaHalf) {
          d3.select('#sankey-container svg').remove()
          that.setState({ isSankeyAreaHalf: true }, async () => {
            const { clientWidth, clientHeight } = that.sankeyRef.current
            that.drawSankeyDiagram(clientWidth, clientHeight)
          })
        }
        // 画出词云图
        await that.drawWordcloudDiagram('node', d)
        await that.drawRelationDiagram('node', d)
        that.setState({ loading: false })
      })
      .on('mouseenter', function (d) {
        d3.select(this)
          .style('stroke-width', 3)
          .style('stroke', d => d3.rgb(d.color).darker(5))
      })
      .on('mouseleave', function (d) {
        d3.select(this)
          .style('stroke-width', 1)
          .style('stroke', d => d3.rgb(d.color).darker(1))
      })
      .on('mousemove', function (d) {
        that.setState({ sankeyName: d.name, sankeyValue: d.value }, () => {
          const [deltaX, deltaY] = d3.mouse(this)
          if (d.type !== 'book') {
            d3.select('.sankey-tooltip')
              .style('left', d.x0 + deltaX + 15 + 'px')
              .style('top', d.y0 + deltaY + 'px')
          } else {
            const isReachBottom = d.y0 + deltaY + 30 > clientHeight
            d3.select('.sankey-tooltip')
              .style('right', deltaX + 15 + 'px')
              .style(
                isReachBottom ? 'bottom' : 'top',
                isReachBottom
                  ? 30 + (clientHeight - d.y0) + deltaY + 'px'
                  : 10 + d.y0 + deltaY + 'px'
              )
          }
        })
      })
      .on('mouseout', d => this.setState({ sankeyName: '', sankeyValue: 0 }))

    // 设置文本
    svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('x', d => (d.x0 < clientWidth / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.x0 < clientWidth / 2 ? 'start' : 'end'))
      .transition()
      .duration(300)
      .style('font', d => {
        const fontSizeMap = {
          period: 10,
          topic: 14,
          book: 8
        }
        return `${fontSizeMap[d.type]}px sans-serif`
      })
      .text(d => `${d.name}`)

    // 设置 links
    const link = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.5)
      .selectAll('.link')
      .data(links)
      .enter()
      .append('g')
      .attr('class', 'link')
      .style('mix-blend-mode', 'multiply')

    const gradient = link
      .append('linearGradient')
      .attr('id', d => {
        d.uid = guid()
        return d.uid
      })
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', d => d.source.x1)
      .attr('x2', d => d.target.x0)

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d => d.source.color)

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d => d.target.color)

    link
      .append('path')
      .transition()
      .duration(300)
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => `url(#${d.uid})`)
      .attr('stroke-width', d => Math.max(1, d.width))

    // links 事件
    svg
      .selectAll('.link path')
      .on('click', async function (d) {
        d3.select(this)
          .transition()
          .duration(300)
          .style('opacity', 1)
        that.setState({ loading: true })
        if (!that.state.isSankeyAreaHalf) {
          d3.select('#sankey-container svg').remove()
          that.setState({ isSankeyAreaHalf: true }, () => {
            const { clientWidth, clientHeight } = that.sankeyRef.current
            that.drawSankeyDiagram(clientWidth, clientHeight)
          })
        }
        // 画出词云图
        await that.drawWordcloudDiagram('link', d)
        await that.drawRelationDiagram('link', d)
        that.setState({ loading: false })
      })
      .on('mouseenter', function (d) {
        d3.select(this)
          .transition()
          .duration(300)
          .style('opacity', 0.5)
      })
      .on('mouseleave', function (d) {
        d3.select(this)
          .transition()
          .duration(300)
          .style('opacity', 1)
      })
      .on('mousemove', function (d) {
        that.setState(
          {
            sankeyName: d.source.name + '-' + d.target.name,
            sankeyValue: d.value
          },
          () => {
            const [deltaX, deltaY] = d3.mouse(this)
            const isReachRight = deltaX + 30 + 15 + 120 > clientWidth
            const isReachBottom = deltaY + 30 > clientHeight
            d3.select('.sankey-tooltip')
              .style(
                isReachRight ? 'right' : 'left',
                (isReachRight ? clientWidth - deltaX + 15 : deltaX + 15) + 'px'
              )
              .style(
                isReachBottom ? 'bottom' : 'top',
                isReachBottom ? 0 : deltaY + 'px'
              )
          }
        )
      })
      .on('mouseout', d => this.setState({ sankeyName: '', sankeyValue: 0 }))
  }
  sankeyLayout ({ nodes, links, width, height }) {
    const { clientWidth, clientHeight } = this.containerRef.current
    const sankey = d3Sankey()
      .nodeWidth(15)
      .extent([[1, 1], [clientWidth - 1, clientHeight - 25]])
      .nodePadding(10)
      .size([width, height])
    return {
      result: sankey({
        nodes: nodes.map(d => Object.assign({}, d)),
        links: links.map(d => Object.assign({}, d))
      })
    }
  }
  async drawWordcloudDiagram (type, clickInfo) {
    const { clientHeight } = this.wordCloudRef.current
    let queryString = null
    if (type === 'node') {
      queryString = qs.stringify({
        filterKey: clickInfo.type,
        filterValue: clickInfo.name
      })
    } else {
      queryString = qs.stringify({
        filterKey: [clickInfo.source.type, clickInfo.target.type],
        filterValue: [clickInfo.source.name, clickInfo.target.name]
      })
    }
    const result = await axios.get(`/api/wordcloud?${queryString}`)
    d3.select('#wordcloud-container div').remove()
    const rawWords = result.data.data
    const words = []
    // const maxWeight = rawWords[0].weight
    // const minWeight = rawWords[rawWords.length - 1].weight
    // const gapRatio = (180 - 10) / (maxWeight - minWeight)
    // 10 + (rawWords[i].weight - minWeight) * gapRatio
    // 把从最高权重到最低权重的范围归一到 10 - 180
    for (let i = 0; i < rawWords.length; i++) {
      words.push({ name: rawWords[i].word, weight: rawWords[i].weight })
    }
    const dv = new View().source(words)
    const range = dv.range('weight')
    const min = range[0]
    const max = range[1]
    dv.transform({
      type: 'tag-cloud',
      fields: ['name', 'weight'],
      font: 'Helvetica',
      padding: 12,
      rotate () {
        let random = ~~(Math.random() * 4) % 4
        if (random === 2) {
          random = 0
        }
        return random * 90
      },
      fontSize (d) {
        return d.value ? ((d.value - min) / (max - min)) * (48 - 24) + 16 : 0
      }
    })
    const chart = new G2.Chart({
      container: 'wordcloud-container',
      forceFit: true,
      height: clientHeight,
      padding: 10
    })
    chart.source(dv, {
      x: { nice: false },
      y: { nice: false }
    })
    chart.legend(false)
    chart.axis(false)
    chart.tooltip({ showTitle: false })
    chart.coord().reflect()
    chart
      .point()
      .position('x*y')
      .shape('cloud')
      .color('name')
      .tooltip('name*value')
    chart.render()
    // WordCloud(this.wordCloudRef.current, {
    //   list: words,
    //   fontFamily: 'Helvetica, Monaco',
    //   fontWeight: 'normal',
    //   color: 'random-dark',
    //   minSize: '12px',
    //   shape: 'square',
    //   weightFactor: 0.01,
    //   gridSize: 4
    // })
  }
  async drawRelationDiagram (type, clickInfo) {
    let queryString = null
    if (type === 'node') {
      queryString = qs.stringify({
        filterKey: clickInfo.type,
        filterValue: clickInfo.name
      })
    } else {
      queryString = qs.stringify({
        filterKey: [clickInfo.source.type, clickInfo.target.type],
        filterValue: [clickInfo.source.name, clickInfo.target.name]
      })
    }
    const result = (await axios.get(`/api/relation?${queryString}`)).data.data
    // 为根节点增加 name 属性
    if (result.children.length) {
      result.children.forEach(v => {
        const subLevel = v.children
        subLevel.forEach(v => {
          v.children.forEach(r => (r.name = r.roleName))
        })
      })
    }
    const option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [
        {
          type: 'tree',
          data: [result],
          top: '2%',
          bottom: '2%',
          layout: 'radial',
          symbol: 'emptyCircle',
          symbolSize: 7,
          initialTreeDepth: 2,
          animationDurationUpdate: 750,
          itemStyle: {
            borderColor: '#1890FF'
          },
          lineStyle: {
            color: '#efefef'
          }
        }
      ]
    }
    if (!this.relationChart) {
      this.relationChart = echarts.init(this.relationRef.current)
    }
    this.relationChart.setOption(option)
  }
  render () {
    return (
      <Spin spinning={this.state.loading} tip='Loading...' size='large'>
        <div id='page-overview-container' ref={this.containerRef}>
          <div
            id='sankey-container'
            ref={this.sankeyRef}
            className={this.state.isSankeyAreaHalf ? 'half' : ''}
          >
            {this.state.sankeyName ? (
              <div className='sankey-tooltip'>
                {this.state.sankeyName}：{this.state.sankeyValue}
              </div>
            ) : null}
          </div>
          {this.state.isSankeyAreaHalf ? (
            <div className='sub-graph-container'>
              <div id='wordcloud-container' ref={this.wordCloudRef} />
              <div id='relation-container' ref={this.relationRef} />
            </div>
          ) : null}
        </div>
      </Spin>
    )
  }
}

export default OverviewPage
