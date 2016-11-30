"use strict";

const onlineUserSearch = (config) => {
    
    let searcher = {
        search: function(input) {

            var returnList = [];

            for(var key in this.parent.users) {

                if(this.parent.users[key].data.state.username.indexOf(input) > -1) {
                    returnList.push(this.parent.users[key]);
                }

            }

            return returnList;

        }
    }

    return {
        namespace: 'onlineUserSearch',
        extends: {
            GroupChat: searcher,
            GlobalChat: searcher
        }
    }

}

if(typeof module !== "undefined") {
    module.exports = onlineUserSearch;
} else {
    window.OCF.plugin.onlineUserSearch = onlineUserSearch;
}
