 "use strict";

// allows you to search the online user list by username
const onlineUserSearch = (config) => {
    
    // these are new methods that will be added to the extended class
    let extension = {
        search: function(input) {

            // an empty array of users we found
            var returnList = [];

            // for every user that the parent chat knows about
            for(var key in this.parent.users) {

                // see if that user username includes the input text 
                if(this.parent.users[key].data.state.username.indexOf(input) > -1) {
                    // if it does, add it to the list of returned users
                    returnList.push(this.parent.users[key]);
                }

            }

            // return all found users
            return returnList;

        }
    }

    // add this plugin to the Chat classes
    return {
        namespace: 'onlineUserSearch',
        extends: {
            GroupChat: extension,
            GlobalChat: extension
        }
    }

}

if(typeof module !== "undefined") {
    module.exports = onlineUserSearch;
} else {
    window.OCF.plugin.onlineUserSearch = onlineUserSearch;
}
