import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Tooltip, Icon } from 'antd'
import * as d3 from 'd3'

import './flowGraph.styl'

const COLOR_MAP = {
  生: '#41599C',
  旦: '#F699B2',
  净: '#70BAEA',
  末: '#A299FC',
  丑: '#F9CE25',
  外: '#72DB98',
  其他: '#DEDEDE'
}

const flatten = arr => {
  const result = []
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      result.push(arr[i][j])
    }
  }
  return result
}

class FlowGraph extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.flowRef = React.createRef()
    this.titleClickHandler = this.titleClickHandler.bind(this)
  }
  componentDidMount () {
    this.drawFlowGraph()
  }
  drawFlowGraph () {
    const { flowData, operaId } = this.props
    const FILL_OPACITY = 0.25
    const LINE_TENSION = 0.01
    // 删掉之前绘制的 svg
    d3.select(`#flow${operaId} svg`).remove()
    // 增加这一次绘制的 svg
    const svg = d3.select(`#flow${operaId}`).append('svg')
    const { clientWidth, clientHeight } = this.flowRef.current
    svg.attr('width', clientWidth).attr('height', clientHeight)
    // 绘制曲线
    // 1. 生成绘制曲线所需要的数据
    const lineData = this.genLineData(clientWidth, flowData)
    if (!lineData.length) return
    // 2. 确定 x 轴的 domain 范围和 range 范围
    const rangeX = [1, clientWidth - 1]
    const domainX = [0, clientWidth]
    // 3. 确定 y 轴的 domain 范围和 range 范围
    const rangeY = [clientHeight - 1, 1]
    const domainY = [
      0,
      flatten(lineData.slice()).sort((a, b) => b.y - a.y)[0].y
    ]
    // 4. x 坐标生成函数
    const x = d3
      .scaleLinear()
      .domain(domainX)
      .range(rangeX)
    // 5. y 坐标生成函数
    const y = d3
      .scaleLinear()
      .domain(domainY)
      .range(rangeY)
    // 6. 曲线生成函数
    const line = d3
      .line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveCardinal.tension(LINE_TENSION))
    // var curves = ['curveBasis', 'curveBundle', 'curveCardinal', 'curveLinear', 'curveStep', 'curveStepBefore']
    // 7. 绘制曲线
    svg
      .selectAll(`path.line`)
      .data(lineData)
      .enter()
      .append('path')
      .attr('class', `line`)
      .attr('d', d => line(d))
      .attr('stroke', d => COLOR_MAP[d[d.length - 1].roleName])
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('fill', 'none')
    svg
      .selectAll(`path.area`)
      .data(lineData)
      .enter()
      .append('path')
      .attr('class', `area`)
      .attr(
        'd',
        d3
          .area()
          .curve(d3.curveCardinal.tension(0.1))
          .x(d => x(d.x))
          .y0(y(0))
          .y1(d => y(d.y))
      )
      .attr('fill', d => COLOR_MAP[d[d.length - 1].roleName])
      .attr('fill-opacity', FILL_OPACITY)
    // 8. 获取插值数据
    const interPointsData = this.genInterPointsData(lineData)
    // 9. 绘制插值曲线
    svg
      .selectAll(`path.interline`)
      .data(interPointsData)
      .enter()
      .append('path')
      .attr('class', `interline`)
      .attr('d', d => line(d))
      .attr('stroke', d => COLOR_MAP[d[d.length - 1].roleName])
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('fill', 'none')
    svg
      .selectAll(`path.interlineArea`)
      .data(interPointsData)
      .enter()
      .append('path')
      .attr('class', `interlineArea`)
      .attr(
        'd',
        d3
          .area()
          .curve(d3.curveCardinal.tension(0.1))
          .x(d => x(d.x))
          .y0(y(0))
          .y1(d => y(d.y))
      )
      .attr('fill', d => COLOR_MAP[d[d.length - 1].roleName])
      .attr('fill-opacity', FILL_OPACITY)
  }
  genInterPointsData (lineData) {
    const result = []
    for (let i = 0; i < lineData.length - 1; i++) {
      const prevArray = lineData[i]
      const currArray = lineData[i + 1]
      const leftPoint = prevArray[prevArray.length - 1]
      const rightPoint = currArray[0]
      const mid = {
        x: (leftPoint.x + rightPoint.x) / 2,
        y: (leftPoint.y + rightPoint.y) / 2,
        roleName: rightPoint.roleName
      }
      const temp = [leftPoint, mid, rightPoint]
      result.push(temp)
    }
    return result
  }
  genLineData (totalWidth, flowData) {
    if (!flowData) return []
    flowData.unshift({
      lyricValue: 0,
      speakerRoleName: flowData[0].speakerRoleName
    })
    const data = []
    const gap = totalWidth / (flowData.length - 1)
    const Point = function (x, y, r) {
      this.x = x
      this.y = y
      this.roleName = r
    }
    let lastRoleName = ''
    let temp = []
    for (let i = 0; i < flowData.length; i++) {
      const p = new Point(
        i * gap,
        flowData[i].lyricValue,
        flowData[i].speakerRoleName
      )
      if (lastRoleName === p.roleName) {
        temp.push(p)
      } else {
        lastRoleName = p.roleName
        if (temp.length) {
          data.push(temp)
        }
        temp = [p]
      }
    }
    if (temp.length) {
      data.push(temp)
    }
    return data
  }
  titleClickHandler () {
    this.props.history.push(`/opera/${this.props.operaId}`)
  }
  render () {
    const { operaId, operaName, index, singWords, readWords } = this.props
    const titleClickHandler = this.titleClickHandler
    return (
      <div className='flow-graph-container'>
        <p className='flow-graph-index'>{index}</p>
        <Tooltip title={operaName}>
          <p onClick={titleClickHandler} className='flow-graph-title'>
            {operaName.replace(/[《》]/g, '')}
          </p>
        </Tooltip>
        <div
          className='flow-graph-content'
          id={'flow' + operaId}
          ref={this.flowRef}
        />
        {singWords > readWords ? (
          <Icon
            type='fire'
            theme='twoTone'
            twoToneColor='#eb2f96'
            className='flow-icon'
          />
        ) : null}
      </div>
    )
  }
}

FlowGraph.propTypes = {
  flowData: PropTypes.array,
  operaId: PropTypes.string,
  operaName: PropTypes.string,
  singWords: PropTypes.number,
  readWords: PropTypes.number,
  index: PropTypes.number
}

// export default FlowGraph
export default withRouter(FlowGraph)
