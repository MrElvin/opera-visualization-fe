import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import { Tooltip, Popover, Icon } from 'antd'

import './fingerGraph.styl'

const SQUARE_WIDTH = 30
const SQUARE_PER_LINE = 12

class FingerGraph extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fingerData: this.props.fingerData,
      popoverContent: []
    }
    this.fingerRef = React.createRef()
    this.titleClickHandler = this.titleClickHandler.bind(this)
  }
  componentDidMount () {
    this.drawFingerGraph()
  }
  componentDidUpdate (_, prevState) {
    if (
      this.props.fingerData.fingerData.length !==
      prevState.fingerData.fingerData.length
    ) {
      this.setState({ fingerData: this.props.fingerData })
      this.drawFingerGraph()
    }
  }
  drawFingerGraph () {
    const data = this.props.fingerData
    const { operaId, fingerData, lengthRange, varianceRange } = data
    d3.select(`#finger${operaId} svg`).remove()
    const svg = d3.select(`#finger${operaId}`).append('svg')
    const { clientWidth, clientHeight } = this.fingerRef.current
    svg.attr('width', clientWidth).attr('height', clientHeight)
    // 颜色映射函数
    const [minLength, maxLength] = [
      Math.floor(lengthRange[0]),
      Math.ceil(lengthRange[1])
    ]
    const diff = maxLength - minLength
    const colorDomain = [minLength, minLength + 0.5 * diff, maxLength]
    const colorRange = ['#3f51b1', '#efefef', '#f18271']
    const colorScale = d3
      .scaleLinear()
      .domain(colorDomain)
      .range(colorRange)
    // 绘制矩形
    for (let i = 0; i < fingerData.length; i++) {
      const currentData = fingerData[i]
      const x = (i % SQUARE_PER_LINE) * SQUARE_WIDTH
      const y = Math.floor(i / SQUARE_PER_LINE) * SQUARE_WIDTH
      const color = colorScale(currentData.sentenceAverageLength)
      const that = this
      svg
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', SQUARE_WIDTH)
        .attr('height', SQUARE_WIDTH)
        .attr('fill', color)
        .attr('square-color', color)
        .style('cursor', 'pointer')
        .on('mouseover', function (d) {
          d3.select(this)
            .style('stroke-width', 1)
            .style('stroke', d => d3.rgb(color).darker(1))
          that.setState({
            popoverContent: currentData.sentenceContent
          })
        })
        .on('mouseout', function (d) {
          d3.select(this).style('stroke-width', 0)
          that.setState({ popoverContent: [] })
        })
    }
    // 绘制曲线
    // 1. 生成绘制曲线所需要的数据
    const lineData = []
    let index = 0
    while (index < fingerData.length) {
      const slice = fingerData.slice(index, index + SQUARE_PER_LINE)
      const tempResult = []
      for (let i = 0; i < slice.length; i++) {
        const x = (i % SQUARE_PER_LINE) * SQUARE_WIDTH + SQUARE_WIDTH / 2
        const y = slice[i].sentenceVariance
        tempResult.push({ x, y })
      }
      lineData.push(tempResult)
      index += SQUARE_PER_LINE
    }
    // 2. 确定每一组的 domain 范围和 range 范围
    // 3. 利用 d3 完成绘制曲线和圆点
    const [minVariance, maxVariance] = [
      Math.floor(varianceRange[0]) - 10,
      Math.ceil(varianceRange[1]) + 10
    ]
    const varianceDomain = [minVariance, maxVariance]
    for (let i = 0; i < lineData.length; i++) {
      const currentData = lineData[i]
      currentData.unshift({ x: 0, y: minVariance })
      currentData.push({
        x: (currentData.length - 1) * SQUARE_WIDTH,
        y: minVariance
      })
      const x = d3
        .scaleLinear()
        .domain([0, SQUARE_PER_LINE * SQUARE_WIDTH])
        .range([0, SQUARE_PER_LINE * SQUARE_WIDTH])
      const y = d3
        .scaleLinear()
        .domain(varianceDomain)
        .range([SQUARE_WIDTH * (i + 1), SQUARE_WIDTH * i])
      const line = d3
        .line()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .curve(d3.curveCardinal)
      svg
        .selectAll(`path.line${i}`)
        .data([currentData])
        .enter()
        .append('path')
        .attr('class', `line${i}`)
        .attr('d', d => line(d))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.2)
        .attr('fill', 'none')
      // 绘制圆点
      svg
        .append('g')
        .selectAll(`circle.dot${i}`)
        .data(currentData.slice(1, currentData.length - 1))
        .enter()
        .append('circle')
        .attr('class', `dot${i}`)
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .attr('r', 2.5)
        .attr('fill', '#ffffff')
        .attr('fill-opacity', 1)
    }
  }
  titleClickHandler () {
    this.props.history.push(`/opera/${this.state.fingerData.operaId}`)
  }
  render () {
    const data = this.state.fingerData
    const popover = this.state.popoverContent
    const titleClickHandler = this.titleClickHandler
    return (
      <div className='finger-graph-container'>
        <div className='finger-graph-top-container'>
          {data.isSingOpera.result ? (
            <Icon type='star' theme='twoTone' twoToneColor='#eb2f96' />
          ) : null}
          <Tooltip title={data.operaName}>
            <div onClick={titleClickHandler} className='finger-graph-name'>
              {data.operaName}
            </div>
          </Tooltip>
        </div>
        <Popover
          placement='leftTop'
          content={
            popover.length ? (
              <div>
                {popover.map((content, index) => (
                  <p className='popover-para' key={index}>
                    {content}
                  </p>
                ))}
              </div>
            ) : (
              ''
            )
          }
          title='台词内容'
          trigger='click'
        >
          <div
            className='finger-graph-content'
            id={'finger' + data.operaId}
            ref={this.fingerRef}
            style={{
              width: SQUARE_PER_LINE * SQUARE_WIDTH + 'px',
              height:
                Math.ceil(data.fingerData.length / SQUARE_PER_LINE) *
                  SQUARE_WIDTH +
                'px'
            }}
          />
        </Popover>
      </div>
    )
  }
}

FingerGraph.propTypes = {
  fingerData: PropTypes.object
}

// export default FingerGraph
export default withRouter(FingerGraph)
