import React from 'react'
import Loadable from 'react-loadable'
import { Spin } from 'antd'

/**
 * 按需加载
 *
 * @param {*} loader
 */
const lazyLoad = loader =>
  Loadable({
    loader,
    loading: () => <Spin size='large' delay={200} />
  })

export default lazyLoad
