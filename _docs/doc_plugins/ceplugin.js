exports.defineTags = function(dictionary) {

    // tags for module
    dictionary.defineTag("cepluginname", {
        mustHaveValue: true,
        onTagged: function(doclet, tag) {
            doclet.cepluginname = tag.value || true;
        }
    });

    dictionary.defineTag("cepluginshort", {
        mustHaveValue: true,
        onTagged: function(doclet, tag) {
            doclet.cepluginshort = tag.value || true;
        }
    });

    // tags for classes the module extends
    dictionary.defineTag("ceplugin", {
        mustHaveValue: false,
        onTagged: function(doclet, tag) {
            doclet.ceplugin = tag.value || true;
        }
    });

    dictionary.defineTag("ceextends", {
        mustHaveValue: true,
        onTagged: function(doclet, tag) {
            doclet.ceextends = tag.value;
        }
    });

};
