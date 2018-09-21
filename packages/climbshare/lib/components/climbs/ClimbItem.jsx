import React from 'react'
import { Components, registerComponent, withSingle } from 'meteor/vulcan:core'

const ClimbItem = (props, context) => {
    return (
        <div>
            <Components.ThreeScene documentId={props.params._id} />
            <Components.ClimbMenu />
        </div>
    );
};

registerComponent({name:'ClimbItem', component: ClimbItem });