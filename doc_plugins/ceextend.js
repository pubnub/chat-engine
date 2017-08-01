exports.defineTags = function(dictionary) {
    dictionary.defineTag("ceextends", {
        mustHaveValue: true,
        onTagged: function(doclet, tag) {
            doclet.ceextends = tag.value;
        }
    });
};
