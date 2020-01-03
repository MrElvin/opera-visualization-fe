import React, { Component } from 'react'
import { HashRouter as Router } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from '@/layouts/Sidebar'
import Routes from '@/routes'

import './App.styl'

const { Content } = Layout

class App extends Component {
  render () {
    return (
      <Router>
        <Layout className='app-layout-container'>
          <Layout>
            <Sidebar />
            <Layout>
              <Content className='app-layout-content'>
                <Routes />
              </Content>
              {/* <Footer className='app-footer'>
                京剧剧本可视化系统-张博-HCI实验室
              </Footer> */}
            </Layout>
          </Layout>
        </Layout>
      </Router>
    )
  }
}

export default App
