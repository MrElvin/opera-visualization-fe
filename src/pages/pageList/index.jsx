import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import { Pagination, Typography, Table, Tag, Tooltip, Button } from 'antd'

import './index.styl'

const { Title, Text } = Typography

const TABLE_LIMIT = 20
const TAG_COLOR_MAP = {
  儿女缠绵: 'magenta',
  军事风云: 'red',
  政治斗争: 'orange',
  世俗生活: 'blue',
  草莽英雄: 'geekblue',
  神话传说: 'purple'
}

const toolTipComponent = text => (
  <Tooltip placement='topLeft' title={text}>
    {text}
  </Tooltip>
)

const overflowStyle = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  cursor: 'pointer'
}

const genOperaColumns = react => {
  return [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      onCell: () => {
        return {
          style: {
            cursor: 'pointer'
          }
        }
      },
      render: text => <span className='page-list-table-id-column'>{text}</span>
    },
    {
      title: '编号',
      dataIndex: 'operaId',
      key: 'operaId',
      width: 100,
      onCell: () => {
        return {
          style: {
            cursor: 'pointer'
          }
        }
      }
    },
    {
      title: '剧本名称',
      dataIndex: 'operaName',
      key: 'operaName',
      width: 150,
      onCell: () => {
        return {
          style: {
            maxWidth: 150,
            ...overflowStyle
          }
        }
      },
      render: toolTipComponent
    },
    {
      title: '剧本时代',
      dataIndex: 'operaPeriod',
      width: 80,
      onCell: () => {
        return {
          style: {
            maxWidth: 80,
            cursor: 'pointer'
          }
        }
      }
    },
    {
      title: '剧本选材',
      dataIndex: 'operaBook',
      width: 100,
      onCell: () => {
        return {
          style: {
            maxWidth: 100,
            cursor: 'pointer'
          }
        }
      }
    },
    {
      title: '剧本主题',
      dataIndex: 'operaTopic',
      width: 90,
      onCell: () => {
        return {
          style: {
            maxWidth: 90,
            cursor: 'pointer'
          }
        }
      },
      render: text => <Tag color={TAG_COLOR_MAP[`${text}`]}>{text}</Tag>
    },
    {
      title: '剧本简介',
      dataIndex: 'operaBrief',
      ellipsis: true,
      width: 500,
      onCell: () => {
        return {
          style: {
            maxWidth: 500,
            ...overflowStyle
          }
        }
      },
      render: toolTipComponent
    },
    {
      title: '剧本来源',
      dataIndex: 'operaSource',
      ellipsis: true,
      width: 200,
      onCell: () => {
        return {
          style: {
            maxWidth: 200,
            ...overflowStyle
          }
        }
      }
    },
    {
      title: '详情',
      key: 'detail',
      width: 80,
      render: (_, record) => {
        const clickHandler = function (record) {
          react.props.history.push(`/opera/${record.operaId}`)
        }.bind(react, record)
        return (
          /* eslint-disable react/jsx-no-bind */
          <Button type='dashed' size='small' onClick={clickHandler}>
            详情
          </Button>
          /* eslint-enable react/jsx-no-bind */
        )
      }
    }
  ]
}

const setOperasId = (operas, currentPage, limit) => {
  let startIndex = (currentPage - 1) * limit + 1
  for (let i = 0; i < operas.length; i++) {
    operas[i].id = startIndex + i
  }
}

class ListPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      operaList: [],
      totalOperas: 0,
      currentPage: 1,
      isTableLoading: true,
      tableScrollY: 0
    }
    this.onChange = this.onChange.bind(this)
    this.resize = this.resize.bind(this)
  }
  async componentDidMount () {
    const result = await this.getOperaList(this.state.currentPage)
    setOperasId(result.data.operas, this.state.currentPage, TABLE_LIMIT)
    this.setState({
      operaList: result.data.operas,
      totalOperas: result.data.totalCount,
      isTableLoading: false
    })
    this.onScreenChange()
    this.resize()
  }
  async onChange (pageNumber) {
    const result = await this.getOperaList(pageNumber)
    setOperasId(result.data.operas, pageNumber, TABLE_LIMIT)
    this.setState({
      operaList: result.data.operas,
      totalOperas: result.data.totalCount,
      currentPage: pageNumber,
      isTableLoading: false
    })
  }
  onScreenChange () {
    window.addEventListener('resize', this.resize)
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.resize)
  }
  resize () {
    const { clientHeight } = document.body
    const tableScrollY = clientHeight - 150
    this.setState({ tableScrollY })
  }
  async getOperaList (page, limit = TABLE_LIMIT) {
    try {
      this.setState({ isTableLoading: true })
      const result = await axios.get(`/api/list?page=${page}&limit=${limit}`)
      return result.data
    } catch (err) {
      console.error(err)
    }
  }
  render () {
    return (
      <div className='page-list-container'>
        <Title className='page-list-title' level={4}>
          本系统共计收录京剧剧本{' '}
          <Text className='page-list-title-strong'>
            {this.state.totalOperas}
          </Text>{' '}
          部
        </Title>
        <Table
          className='page-list-table'
          align='left'
          size='middle'
          loading={this.state.isTableLoading}
          defaultExpandAllRows
          pagination={false}
          columns={genOperaColumns(this)}
          dataSource={this.state.operaList}
          rowKey={'operaId'}
          scroll={{ y: this.state.tableScrollY }}
        />
        <p className='page-list-pagination-tip'>
          每页 <strong>{TABLE_LIMIT}</strong> 条数据
        </p>
        <Pagination
          className='page-list-pagination'
          pageSize={TABLE_LIMIT}
          defaultCurrent={this.state.currentPage}
          total={this.state.totalOperas}
          onChange={this.onChange}
        />
      </div>
    )
  }
}

export default withRouter(ListPage)
