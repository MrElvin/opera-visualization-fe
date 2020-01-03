import React, { Component } from 'react'
import { Input, Select, Divider, Spin, Radio } from 'antd'
import axios from 'axios'
import FingerGraph from './fingerGraph'

import './index.styl'

const { Search } = Input
const { Option } = Select

class FingerPrintPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      paddingGraphNumber: 0,
      fingerDataRaw: [],
      fingerDataFiltered: [],
      topics: ['全部'],
      periods: ['全部'],
      searchValue: '',
      filterPeriod: '',
      filterTopic: '',
      loading: true,
      squareAmount: 250
    }
    this.calculatePaddingGraph = this.calculatePaddingGraph.bind(this)
    this.handlePeriodChange = this.handlePeriodChange.bind(this)
    this.handleTopicChange = this.handleTopicChange.bind(this)
    this.squareAmountChange = this.squareAmountChange.bind(this)
  }
  async componentDidMount () {
    const that = this
    window.addEventListener('resize', that.calculatePaddingGraph)
    this.search(this.state.searchValue)
  }
  calculatePaddingGraph () {
    const clientWidth = document.body.clientWidth
    const calculateNumber = clientWidth >= 1672 ? 4 : 3
    if (this.state.fingerDataFiltered.length) {
      const paddingCount =
        calculateNumber -
        (this.state.fingerDataFiltered.length % calculateNumber)
      if (paddingCount !== this.state.paddingGraphNumber) {
        this.setState({ paddingGraphNumber: paddingCount })
      }
    }
  }
  async search (value) {
    this.setState({ loading: true })
    const searchResult = (await axios.get(
      `/api/finger?searchValue=${value}&squareAmount=${this.state.squareAmount}`
    )).data.data
    this.setState(
      {
        fingerDataRaw: searchResult,
        fingerDataFiltered: searchResult,
        topics: ['全部', ...new Set(searchResult.map(v => v.operaTopic))],
        periods: ['全部', ...new Set(searchResult.map(v => v.operaPeriod))],
        filterPeriod: '',
        filterTopic: '',
        loading: false
      },
      () => this.calculatePaddingGraph()
    )
  }
  searchChange (e) {
    e.persist()
    this.setState({ searchValue: e.target.value })
  }
  squareAmountChange (e) {
    this.setState({ squareAmount: e.target.value }, () =>
      this.search(this.state.searchValue)
    )
  }
  handlePeriodChange (period) {
    let fingerDataFiltered = null
    if (period === '全部') {
      fingerDataFiltered = this.state.fingerDataRaw.slice()
    } else {
      fingerDataFiltered = this.state.fingerDataRaw.filter(
        v => v.operaPeriod === period
      )
    }
    if (this.state.filterTopic && this.state.filterTopic !== '全部') {
      fingerDataFiltered = fingerDataFiltered.filter(
        v => v.operaTopic === this.state.filterTopic
      )
    }
    this.setState({ filterPeriod: period, fingerDataFiltered })
  }
  handleTopicChange (topic) {
    let fingerDataFiltered = null
    if (topic === '全部') {
      fingerDataFiltered = this.state.fingerDataRaw.slice()
    } else {
      fingerDataFiltered = this.state.fingerDataRaw.filter(
        v => v.operaTopic === topic
      )
    }
    if (this.state.filterPeriod && this.state.filterPeriod !== '全部') {
      fingerDataFiltered = fingerDataFiltered.filter(
        v => v.operaPeriod === this.state.filterPeriod
      )
    }
    this.setState({ filterTopic: topic, fingerDataFiltered })
  }
  render () {
    const { fingerDataFiltered, topics, periods } = this.state
    return (
      <Spin spinning={this.state.loading} tip='Loading...' size='large'>
        <div className='page-finger-container'>
          <div className='page-finger-top-content'>
            <Search
              className='page-finger-search'
              placeholder='请输入剧本名称'
              enterButton='搜索'
              onSearch={value => this.search(value)}
              onChange={e => this.searchChange(e)}
              value={this.state.searchValue}
            />
            <div className='page-finger-select-container'>
              <span className='page-finger-radio-span'>每格字数</span>
              <Radio.Group
                onChange={this.squareAmountChange}
                value={this.state.squareAmount}
                className='page-finger-radio'
              >
                <Radio value={100}>100</Radio>
                <Radio value={250}>250</Radio>
                <Radio value={500}>500</Radio>
              </Radio.Group>
              {topics.length > 1 || periods.length > 1 ? (
                <>
                  <span className='page-finger-select-span'>筛选主题</span>
                  <Select
                    className='page-finger-select'
                    onChange={this.handleTopicChange}
                    value={this.state.filterTopic}
                  >
                    {topics.map(v => (
                      <Option key={v} value={v}>
                        {v}
                      </Option>
                    ))}
                  </Select>
                  <span className='page-finger-select-span'>筛选时期</span>
                  <Select
                    className='page-finger-select'
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
                </>
              ) : null}
            </div>
          </div>
          <div className='page-finger-gradient-container'>
            <span>短</span>
            <div className='page-finger-gradient' />
            <span>长</span>
          </div>
          <Divider className='page-finger-divider' />
          <div className='page-finger-list'>
            {fingerDataFiltered.map(data => (
              <FingerGraph fingerData={data} key={data.operaId} />
            ))}
            {new Array(this.state.paddingGraphNumber)
              .fill('')
              .map((_, index) => (
                <div key={index} className='page-finger-padding' />
              ))}
          </div>
        </div>
      </Spin>
    )
  }
}

export default FingerPrintPage
