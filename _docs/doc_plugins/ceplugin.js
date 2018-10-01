exports.defineTags = function(dictionary) {
    dictionary.defineTag("ceplugin", {
        mustHaveValue: false,
        onTagged: function(doclet, tag) {
            doclet.ceplugin = tag.value || true;
        }
    });
};
