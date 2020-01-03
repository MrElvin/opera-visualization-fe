import React, { Component } from 'react'
import { Input, Select, Divider, Spin } from 'antd'

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
      topics: ['全部'],
      periods: ['全部'],
      trades: ['全部']
    }
  }
  componentDidMount () {
    this.setState({ loading: false })
  }
  handlePeriodChange () {}
  handleTopicChange () {}
  render () {
    const { periods, topics, trades } = this.state
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
          <Divider className='page-flow-divider' />
          <div className='page-flow-list'>
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
            <div className='test' />
          </div>
        </div>
      </Spin>
    )
  }
}

export default FlowPage
