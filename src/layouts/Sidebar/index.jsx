import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Layout, Menu, Icon } from 'antd'

import Style from './index.module.styl'
import MenuList from '@/menu.json'

const { Sider } = Layout

class Sidebar extends Component {
  state = {
    collapsed: false
  }
  onCollapse = (collapsed, type) => {
    this.setState({ collapsed })
  }
  render () {
    return (
      <Sider
        collapsible
        breakpoint='lg'
        width={200}
        onCollapse={this.onCollapse}
        collapsed={this.state.collapsed}
      >
        <div className={Style.titleContainer}>
          {this.state.collapsed ? (
            <Icon type='heart' theme='twoTone' />
          ) : (
            <span>京剧剧本可视化系统</span>
          )}
        </div>
        <Menu theme='dark' mode='inline' defaultSelectedKeys={['LIST']}>
          {MenuList.map(menu => (
            <Menu.Item key={menu.key}>
              <Link to={menu.routeName}>
                <Icon type={menu.iconType} />
                <span>{menu.name}</span>
              </Link>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
    )
  }
}

export default Sidebar
