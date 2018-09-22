import { addRoute, Components } from 'meteor/vulcan:core'

import '../components/common/Layout.jsx'
import '../components/crags/CragItem.jsx'
import '../components/crags/CragList.jsx'
import '../components/crags/CragMenu.jsx'
import '../components/climbs/ClimbItem.jsx'
import '../components/climbs/ClimbList.jsx'
import '../components/climbs/ClimbMenu.jsx'
import '../components/climbs/ClimbsNewForm'
import '../components/common/ThreeScene.jsx'
import '../components/common/FrontPage.jsx'

addRoute({ name: 'climbs', path: '/climbs/', componentName: 'ClimbList'});
addRoute({ name: 'crag', path: '/crag/:_id', componentName: 'CragItem'});
addRoute({ name: 'index', path: '/', componentName: 'CragMenu'});
addRoute({ name: 'climbsNew', path: '/climbs/new', componentName: 'ClimbsNewForm'});
