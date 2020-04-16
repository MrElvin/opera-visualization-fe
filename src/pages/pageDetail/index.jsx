import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import { Spin } from 'antd'

import './index.styl'

class DetailPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      detailData: null,
      loading: true
    }
  }
  async componentDidMount () {
    /* eslint-disable react/prop-types */
    const operaId = this.props.match.params.id
    const detailData = (await axios.get(`/api/detail?operaId=${operaId}`)).data
      .data
    console.log('detailData: ', detailData)
    this.setState({ detailData, loading: false })
  }
  render () {
    const { detailData, loading } = this.state
    let roleList = []
    let lyricList = []
    let roleMap = {}
    let ORDER_MAP = {
      生: 1,
      旦: 2,
      净: 3,
      末: 4,
      丑: 5,
      外: 6,
      其他: 7
    }
    let COLOR_MAP = {
      生: '#41599C',
      旦: '#F699B2',
      净: '#70BAEA',
      末: '#A299FC',
      丑: '#F9CE25',
      外: '#72DB98',
      其他: '#DEDEDE'
    }
    if (detailData) {
      const roles = detailData.operaRoleUse
      const lyrics = detailData.operaLyric
      roles.forEach(v => {
        v.order = ORDER_MAP[v.operaRoleName]
        v.color = COLOR_MAP[v.operaRoleName]
      })
      roleList = roles.sort((a, b) => a.order - b.order)
      let nowRole = null
      for (let i = 0; i < lyrics.length; i++) {
        const lyric = lyrics[i]
        if (lyric.speakerName === nowRole) {
          lyricList.push({
            id: lyric.id,
            speakerName: '',
            speakType: lyric.speakType,
            lyricContent: lyric.lyricContent
          })
        } else {
          lyricList.push({
            id: lyric.id,
            speakerName: lyric.speakerName,
            speakType: lyric.speakType,
            lyricContent: lyric.lyricContent
          })
          nowRole = lyric.speakerName
        }
      }
    }
    return (
      <Spin spinning={loading} tip='Loading...' size='large'>
        {detailData ? (
          <div className='detail-page-container'>
            <div className='detail-page-header-container'>
              <div className='detail-page-header-title'>
                {detailData.operaInfo.operaName.replace(/[《》]/g, '')}
              </div>
              <div className='detail-page-header-other'>
                {detailData.operaInfo.operaPeriod +
                  '时期 - ' +
                  detailData.operaInfo.operaTopic +
                  '主题 - 选自《' +
                  detailData.operaInfo.operaBook +
                  '》'}
              </div>
            </div>
            <div className='detail-page-divider' />
            <div className='detail-page-brief-container'>
              <p className='detail-page-brief-title'>剧本概要：</p>
              {detailData.operaInfo.operaBrief
                ? detailData.operaInfo.operaBrief
                : '无'}
            </div>
            <div className='detail-page-role-container'>
              <p className='detail-page-role-title'>角色信息：</p>
              <div className='detail-page-role-list'>
                {roleList.map((role, index) => (
                  <div key={index} className='detail-page-role-item'>
                    <div
                      className='detail-page-role-item-trade'
                      style={{ backgroundColor: role.color }}
                    >
                      {role.operaRoleName}
                    </div>
                    <div>{role.roleName}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className='detail-page-divider' />
            <div className='detail-page-lyrics-container'>
              <div className='detail-page-lyrics-list'>
                {lyricList.map(lyric => (
                  <div key={lyric.id} className='detail-page-lyrics-item'>
                    <div className='detail-page-lyrics-item-speaker'>
                      {lyric.speakerName}
                    </div>
                    <div className='detail-page-lyrics-item-type'>
                      {lyric.speakType}
                    </div>
                    <div className='detail-page-lyrics-item-content'>
                      {lyric.lyricContent}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className='detail-page-container' />
        )}
      </Spin>
    )
  }
}

export default withRouter(DetailPage)
