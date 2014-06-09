// initial variables
Session.set("selectedLabel", null)

// subscriptions
Meteor.subscribe("labels");
Meteor.subscribe("climbs");
Meteor.subscribe("boulders");
Meteor.subscribe("users");

// scene manipulation functions (probably should be in climbsim.js)
function colorAllClimbsWhite() {
    $(threeScene.children).each(function () {
        if (this instanceof THREE.Line) {
            this.material.color.set('white');
        }
    })
}

// template definitions
Template.controlPanel.helpers({
    labels: function () {
        return Labels.find();
    },
    users: function () {
        return Meteor.users.find();
    },
    models3D: function () {
        $('select').val(Session.get('loadedBoulder'));
        return Boulders.find();
    },
    climbs: function () {
        boulder = Boulders.findOne({
            name: Session.get('loadedBoulder')
        });
        if (typeof boulder !== 'undefined') {
            return Labels.find({
                refers_to_boulder: boulder._id,
                refers_to_type: 'climb'
            });
        }
    },
})

Template.controlPanel.events({
    "change #boulderList": function (e, tmpl) {
        Session.set("loadedBoulder", e.target.value)
    },
    "mouseenter .ctrlPnlClimb": function (e, tmpl) {
        label = Labels.findOne(e.currentTarget.id)
        Session.set("selectedLabel", label._id)
    },
    "change #filterDisplay": function (e){
        var filterInputData = $(e.currentTarget).serializeArray() 
        Session.set("filter", filterInputData);
        Deps.flush();
        Climbsim.positionLabelIcons();
    },
    "mousedown #submitClimbshareFeedback": function(){    
        if (Meteor.userId()){
            Feedback.insert({
                content:$('#climbshareFeedback textarea').val(),
                createdBy:Meteor.userId(),
                createdOn:TimeSync.serverTime()
            })
            alert("Feedback submitted.")
        }
        else{
            alert("Please log in to submit feedback.")
        }
    }
})
Template.labels3D.labels = function () {
    loadedBoulder = Boulders.findOne({
        name: Session.get('loadedBoulder')
    });
    if (typeof (loadedBoulder) !== 'undefined') {
        return Labels.find({
            "refers_to_boulder": loadedBoulder._id
        });
    };
}
Template.labels3D.helpers({
    labels: function () {
        boulder = Boulders.findOne({
            name: Session.get('loadedBoulder')
        });
//             // if we don't have a boulder set, no point in showing any labels
        if (!boulder) {return []};
        var displayFilterData = Session.get('filter');
        if (!!displayFilterData){
            // massage control panel show / hide form data into an array
            var displayFilterArray = displayFilterData.map(function(obj){return obj.name});
        }
        else{
            // set initial values in case DOM isn't available yet            
            var displayFilterData=[{name:'createdBy',value:'everyone'}]
            var displayFilterArray=['climb','warning','other'];
        }
        if (!!boulder) {
            // have "other" checkbox control display of labels with no type yet
            if ($.inArray('other', displayFilterArray) > -1){
                displayFilterArray.push(null); 
            }
            var createdBy = undefined;
            displayFilterData.forEach(function(obj){
                if(obj.name == "createdBy"){
                    createdBy = obj.value
                }})
            if (!createdBy || createdBy === "everyone"){
                    createdBy = {$exists:true}
            }
            if ($.inArray('climb', displayFilterArray) > -1){
                // TODO should share a function with the initial climb loading
                Climbs.find({boulder_id:boulder._id}).map(Climbsim.loadClimb);
            } else {
                Climbsim.removeAllClimbs();
            };
            return Labels.find({
                refers_to_boulder: boulder._id,
                refers_to_type: { '$in' : displayFilterArray },
                createdBy: createdBy
            });
    }},
    username: function () {
        var user = Meteor.users.findOne(this.createdBy);
        if (user) {
            return user.username || user.profile.name || user.profile.username;
        } else {
            return this.createdBy;
        }
    },
    typeIcon: function (){
        return '/img/'+this.refers_to_type+'.png'
    },
    climb: function (){
        return this.refers_to_type == 'climb'
    },
    selected: function (value){
        if (this.refers_to_type == null && value == 'other'){
            return 'selected'
        }
        else{
            return (value == this.refers_to_type ? 'selected' : '')
        }
    },
    editable: function (){
        return this.createdBy === Meteor.userId() ? "true" : "false";
    }
});

Template.labels3D.events({
    'mouseenter .label3D': function (event) {
        Session.set("selectedLabel", event.currentTarget.id);
        //             moved to Deps.autorun
        //             $(event.currentTarget).addClass('selected');
        //             $(event.currentTarget).children('.hidden').fadeIn();
    },
    'mouseleave .label3D': function (event) {
        console.log($(':focus'))
        if (!($(':focus').is($('select.labelType')))){
            Session.set("selectedLabel", undefined);
        }
    },
    'click .deleteButton': function (event) {
        Labels.remove($(event.currentTarget).parents('.label3D').attr('id'));
    },
    'input .label3Dcontent': function(event) {
        event.preventDefault();
        console.log('changed');
        if (settings.showTyping){
            Labels.update(
            $(event.currentTarget).parents('.label3D').attr('id'),
            {$set:{content:event.currentTarget.textContent}});
        }
    },
    'keydown .label3Dcontent': function(event){
        console.log(event.which)
        // Handle presses of the return key as ending input rather than 
        // starting a new line
        if (event.which == 13){
            $(event.currentTarget).blur();
        Labels.update(
            $(event.currentTarget).parents('.label3D').attr('id'),
            {$set:{content:event.currentTarget.textContent}});                
        }
    },
    'change .labelType': function(event, tmpl){
        Labels.update(this._id, {$set:{refers_to_type:event.currentTarget.value}})
        event.target.blur();
    }
})

Template.toolbox.events({
    'click #addNewClimb': function(){
        if (Session.get('mouseTool') === 'addVertexToClimb'){
            Session.set('mouseTool','addLabel');
        }
        else{
            Session.set('mouseTool','addNewClimb');
        }
    }
})

Accounts.ui.config({
        passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
    })