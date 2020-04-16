import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Input, Select, Divider, Spin } from 'antd'
import axios from 'axios'
import FlowGraph from './flowGraph'

import './index.styl'

const { Search } = Input
const { Option } = Select

const TRADES_TIPS = [
  ['生', '#41599C'],
  ['旦', '#F699B2'],
  ['净', '#70BAEA'],
  ['末', '#A299FC'],
  ['丑', '#F9CE25'],
  ['外', '#72DB98'],
  ['其他', '#dedede']
]

class FlowPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      filterPeriod: '',
      filterTopic: '',
      filterTrade: '',
      searchValue: '',
      topics: ['全部'],
      periods: ['全部'],
      trades: ['全部'],
      flowDataRaw: [],
      flowDataFiltered: []
    }
    this.handlePeriodChange = this.handlePeriodChange.bind(this)
    this.handleTopicChange = this.handleTopicChange.bind(this)
    this.handleTradeChange = this.handleTradeChange.bind(this)
  }
  async componentDidMount () {
    this.setState({ loading: false })
    // const that = this
    // window.addEventListener('resize', that.calculatePaddingGraph)
    await this.search(this.state.searchValue)
  }
  async search (value) {
    this.setState({ loading: true })
    let searchResult = null
    if (!value) {
      searchResult = (await axios.get(`/allFlowData.json`)).data.data
    } else {
      searchResult = (await axios.get(`/api/flow?searchValue=${value}`)).data
        .data
    }
    const trades = [
      ...new Set(
        searchResult
          .map(v => v.roleNameIncluded)
          .reduce((prev, curr) => {
            prev = [...prev, ...curr]
            return prev
          }, [])
      )
    ]
    this.setState({
      loading: false,
      flowDataRaw: searchResult,
      flowDataFiltered: searchResult,
      topics: ['全部', ...new Set(searchResult.map(v => v.operaTopic))],
      periods: ['全部', ...new Set(searchResult.map(v => v.operaPeriod))],
      trades: ['全部', ...trades]
    })
    console.log(searchResult)
  }
  handlePeriodChange (period) {
    let flowDataFiltered = null
    if (period === '全部') {
      flowDataFiltered = this.state.flowDataRaw.slice()
    } else {
      flowDataFiltered = this.state.flowDataRaw.filter(
        v => v.operaPeriod === period
      )
    }
    if (this.state.filterTopic && this.state.filterTopic !== '全部') {
      flowDataFiltered = flowDataFiltered.filter(
        v => v.operaTopic === this.state.filterTopic
      )
    }
    if (this.state.filterTrade && this.state.filterTrade !== '全部') {
      flowDataFiltered = flowDataFiltered.filter(v =>
        v.roleNameIncluded.includes(this.state.filterTrade)
      )
    }
    this.setState({ filterPeriod: period, flowDataFiltered })
  }
  handleTopicChange (topic) {
    let flowDataFiltered = null
    if (topic === '全部') {
      flowDataFiltered = this.state.flowDataRaw.slice()
    } else {
      flowDataFiltered = this.state.flowDataRaw.filter(
        v => v.operaTopic === topic
      )
    }
    if (this.state.filterPeriod && this.state.filterPeriod !== '全部') {
      flowDataFiltered = flowDataFiltered.filter(
        v => v.operaPeriod === this.state.filterPeriod
      )
    }
    if (this.state.filterTrade && this.state.filterTrade !== '全部') {
      flowDataFiltered = flowDataFiltered.filter(v =>
        v.roleNameIncluded.includes(this.state.filterTrade)
      )
    }
    this.setState({ filterTopic: topic, flowDataFiltered })
  }
  handleTradeChange (trade) {
    let flowDataFiltered = null
    if (trade === '全部') {
      flowDataFiltered = this.state.flowDataRaw.slice()
    } else {
      flowDataFiltered = this.state.flowDataRaw.filter(v =>
        v.roleNameIncluded.includes(trade)
      )
    }
    if (this.state.filterTopic && this.state.filterTopic !== '全部') {
      flowDataFiltered = flowDataFiltered.filter(
        v => v.operaTopic === this.state.filterTopic
      )
    }
    if (this.state.filterPeriod && this.state.filterPeriod !== '全部') {
      flowDataFiltered = flowDataFiltered.filter(
        v => v.operaPeriod === this.state.filterPeriod
      )
    }
    this.setState({ filterTrade: trade, flowDataFiltered })
  }
  render () {
    const { periods, topics, trades, flowDataFiltered } = this.state
    return (
      <Spin spinning={this.state.loading} tip='Loading...' size='large'>
        <div className='page-flow-container'>
          <div className='page-flow-top-content'>
            <Search
              className='page-flow-search'
              placeholder='请输入剧本名称'
              enterButton='搜索'
              // onSearch={value => this.search(value)}
              // onChange={e => this.searchChange(e)}
              // value={this.state.searchValue}
            />
            <div className='page-flow-select-container'>
              <span className='page-flow-select-span'>筛选行当</span>
              <Select
                className='page-flow-select'
                onChange={this.handleTradeChange}
                placeholder='按京剧行当筛选'
                value={this.state.filterTrade}
              >
                {trades.map(v => (
                  <Option key={v} value={v}>
                    {v}
                  </Option>
                ))}
              </Select>
              <span className='page-flow-select-span'>筛选主题</span>
              <Select
                className='page-flow-select'
                onChange={this.handleTopicChange}
                placeholder='按剧本主题筛选'
                value={this.state.filterTopic}
              >
                {topics.map(v => (
                  <Option key={v} value={v}>
                    {v}
                  </Option>
                ))}
              </Select>
              <span className='page-flow-select-span'>筛选时期</span>
              <Select
                className='page-flow-select'
                onChange={this.handlePeriodChange}
                placeholder='按剧本时期筛选'
                value={this.state.filterPeriod}
              >
                {periods.map(v => (
                  <Option key={v} value={v}>
                    {v}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className='page-flow-trades-tips-container'>
            <div className='page-flow-trades-tips-wrap'>
              {TRADES_TIPS.map((trade, index) => (
                <div key={index} className='page-flow-trades-tip'>
                  <div
                    className='page-flow-trade-tip-box'
                    style={{ backgroundColor: `${trade[1]}` }}
                  />
                  <span className='page-flow-trade-tip-text'>{trade[0]}</span>
                </div>
              ))}
            </div>
            <div className='list-count'>
              共 {this.state.flowDataFiltered.length} 条
            </div>
          </div>
          <Divider className='page-flow-divider' />
          <div className='page-flow-list'>
            {flowDataFiltered.map((data, index) => (
              <FlowGraph
                flowData={data.flowData}
                key={data.operaId}
                operaId={data.operaId}
                operaName={data.operaName}
                readWords={data.readWords}
                singWords={data.singWords}
                index={index + 1}
              />
            ))}
          </div>
        </div>
      </Spin>
    )
  }
}

export default withRouter(FlowPage)
