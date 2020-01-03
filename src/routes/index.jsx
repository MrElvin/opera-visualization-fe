import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import loadable from '@/components/loadable'

const PageList = loadable(() => import('@/pages/pageList'))
const PageOverview = loadable(() => import('@/pages/pageOverview'))
const PageFingerPrint = loadable(() => import('@/pages/pageFingerPrint'))
const PageFlow = loadable(() => import('@/pages/pageFlow'))

class Routes extends Component {
  render () {
    return (
      <Switch>
        <Route exact path='/list' component={PageList} />
        <Route exact path='/overview' component={PageOverview} />
        <Route exact path='/finger' component={PageFingerPrint} />
        <Route exact path='/flow' component={PageFlow} />
        <Route component={PageList} />
      </Switch>
    )
  }
}

export default Routes
