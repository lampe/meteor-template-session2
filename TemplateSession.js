/**
Template helpers

@module package template-store2
**/


/**
The `TemplateSession` provides reactive variables for template instances.

Note! The reactive variables, are not preserved over hot code reloads, like the Meteor `Session` object does.


To set and get properties inside template helpers, hooks and events do as follow:

    // set a property
    TemplateSession.set('myProperty', 'myValue');

    // to get it inside a helper, or callback
    TemplateSession.get('myProperty');


@class TemplateSession
@constructor
**/
TemplateSession = {

    /**
    Gets the current template instance and returns also the correct keys and values.

    @method _getTemplateInstance
    @param {Object} givenTemplate            the current template
    @param {String} key                 the given key
    @param {Mixed} value                the value to set
    @return {String} The generated key name.
    **/
    _getTemplateInstance: function(givenTemplate, key, value){
        var template = null;

        try {
            template = Blaze.currentView;
            value = key;
            key = givenTemplate;

        } catch(e) {
            // if it couldn't get the template, check if a template instance was given.
            if(givenTemplate.hasOwnProperty('__view__'))
                template = givenTemplate.__view__;
            else
                throw new Error('TemplateSession works only from withing template helpers, hooks or events');
        }
        // move on view up if its a #with, #if or #unless
        while(template.name.indexOf('Template.') === -1 && template.parentView) {
            template = template.parentView;
        }

        // make sure the template session object exists
        if(template && !template._templateSession)
            template._templateSession = {};

        // create Reactive var, if not existing
        if(template && !template._templateSession[key])
            template._templateSession[key] = new Blaze.ReactiveVar(value);


        // build the keyname
        return {
            key: key,
            value: value,
            template: template
        };
    },


    // PUBLIC

    /**
    When get is called we create a `Deps.Dependency.depend()` for that key in the store.

    @method get
    @param {Object} template            the current template
    @param {String} propertyName     The name of the property you want to get. Should consist of the `'templateName->myPropertyName'`
    @return {Mixed} The stored value.
    **/
    get: function (template, propertyName) {
        var values = TemplateSession._getTemplateInstance(template, propertyName);

        return values.template._templateSession[values.key].get();
    },


    /**
    When set is called every depending reactive function where `TemplateSession.get()` with the same key is called will rerun.

    @method set
    @param {Object} template            the current template
    @param {String} propertyName     The name of the property you want to get. Should consist of the `'templateName->myPropertyName'`
    @param {String|Object} value     If the value is a string with `rerun`, then it will be rerun all dependent functions where get `TemplateInstance.get()` was called.
    @return undefined
    **/
    set: function (template, propertyName, value) {
        var values = TemplateSession._getTemplateInstance(template, propertyName, value);

        values.template._templateSession[values.key].set(values.value);
    }

};
