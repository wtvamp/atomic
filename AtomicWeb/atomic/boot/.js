(function(global)
{
    var primitive                           = {};
    var classCache                          = {};
    var slice                               = Array.prototype.slice;
    var hasOwnPropertyFunction              = Object.prototype.hasOwnProperty;
    var getOwnPropertyNamesFunction         = Object.getOwnPropertyNames;
    var getOwnPropertyDescriptorFunction    = Object.getOwnPropertyDescriptor;
    var definePropertyFunction              = Object.defineProperty;
    var toStringFunction                    = Object.prototype.toString;

    function hasOwnProperty(obj, prop)                          {return hasOwnPropertyFunction.call(obj, prop);}
    function getOwnPropertyNames(obj)                           {return getOwnPropertyNamesFunction(obj);}
    function getOwnPropertyDescriptor(obj, prop)                {return getOwnPropertyDescriptorFunction(obj, prop);}

    function deepFreeze (o)
    {
        var prop, propKey;
        Object.freeze(o);
        for (propKey in o)
        {
            prop    = o[propKey];
            if (!hasOwnProperty(o, propKey) || !(typeof prop === "object") || Object.isFrozen(prop)) continue;
            deepFreeze(prop);
        }
    }

    var primitive   = {};
    var classCache  = {};
    var slice       = Array.prototype.slice;

    function convertArgsToArray(args)                           {return slice.call(args, 0);}
    function defineProperty(obj, propertyName, attributes)      {definePropertyFunction(obj, propertyName, attributes); return obj[propertyName];}
    function defineFunction(obj, functionName, functionBody)    {return defineProperty(obj, functionName, {get: function(){return functionBody;}});}
    defineFunction(Object, "defineFunction", defineFunction);
    defineFunction(Object.prototype, "defineProperty", function(propertyName, attributes){ defineProperty(this, propertyName, attributes); });
    defineFunction(Object.prototype, "defineFunction", function(functionName, functionBody){ defineFunction(this, functionName, functionBody); });
    function exists(item)                                       {return item !== undefined && item !== null;}
    defineFunction(global, "exists", exists);
    function isAFunction(item)                                  {return exists(item) && toStringFunction.call(item) === "[object Function]";}
    function hasProperty(obj, prop)                             {return hasOwnProperty(obj, prop);}
    function extendBaseClass(definition)
    {
        definition.class.prototype  = Object.create((definition.extends||Function).prototype);
        delete definition.class.prototype.constructor;
        defineProperty(definition.class.prototype, "constructor", {value: definition.class});
    }
    function getBaseDefinition(definition)                      {return isAFunction(definition.extends) && exists(definition.extends.__fullName) ? classCache[definition.extends.__fullName] : null;}

    function applyFunctionToInstance(key, item, privileged, derivativeBaseProxy, isPublic)
    {
        item            = item.bind(this);
        if (exists(derivativeBaseProxy))    defineProperty(derivativeBaseProxy, key, {get: function(){return item;}, enumerable: true});
        defineProperty(privileged, key, {get: function(){return item;}, enumerable: true, configurable: true});
        if (isPublic && !hasOwnProperty(this, key))  defineProperty(this, key, {get: function(){return privileged[key];}, configurable: false, enumerable: false});
    }

    function applyFieldToInstance(key, item, privileged, derivativeBaseProxy, isPublic)
    {
        privileged[key] = item.field;

        if (exists(derivativeBaseProxy))
        defineProperty
        (
            derivativeBaseProxy, 
            key, 
            {
                get:        function(){return privileged[key];},
                set:        function(value){privileged[key] = value;},
                enumerable: true
            }
        );

        if (isPublic && !hasOwnProperty(this, key))
        defineProperty
        (
            this, 
            key, 
            {
                get:        function(){return privileged[key];},
                set:        function(value){privileged[key] = value;},
                enumerable: true
            }
        );
    }

    function applyPropertyToInstance(key, item, privileged, derivativeBaseProxy, isPublic)
    {
        if (exists(derivativeBaseProxy))
        {
            defineProperty
            (
                derivativeBaseProxy,
                key,
                {
                    get:            exists(item.property.get) ? item.property.get.bind(this) : undefined,
                    set:            exists(item.property.set) ? item.property.set.bind(this) : undefined,
                    enumerable:     true,
                    configurable:   false
                }
            );

            defineProperty
            (
                privileged,
                key,
                {
                    get:            exists(item.property.get) ? function(){return derivativeBaseProxy[key];} : undefined,
                    set:            exists(item.property.set) ? function(value){derivativeBaseProxy[key] = value;} : undefined,
                    enumerable:     true,
                    configurable:   true
                }
            );
        }
        else
        {
            defineProperty
            (
                privileged,
                key,
                {
                    get:            exists(item.property.get) ? item.property.get.bind(this) : undefined,
                    set:            exists(item.property.set) ? item.property.set.bind(this) : undefined,
                    enumerable:     true,
                    configurable:   false
                }
            );
        }

        if (isPublic && !hasOwnProperty(this, key))
        defineProperty
        (
            this, 
            key, 
            {
                get:            exists(item.property.get) ? function(){return privileged[key];} : undefined,
                set:            exists(item.property.set) ? function(value){privileged[key] = value;} : undefined,
                enumerable:     true,
                configurable:   false
            }
        );
    }

    function canBeAFunction(key, item)                          { if (exists(item) && !isAFunction(item))       throw new Error("An invalid attempt to override a non function " + key + " with a function was encountered."); return true;}
    function canBeAField(key, item)                             { if (exists(item) && isAFunction(item))        throw new Error("An invalid attempt to redefine a function " + key + " with a value was encountered."); return true;}
    function canBeAProperty(key, item)                          { if (exists(item) && !exists(item.property))   throw new Error("An invalid attempt to override a non property " + key + " with a property was encountered."); return true;}

    function applyStructureToInstance(structure, privileged, keysToFreeze, derivativeBaseProxy, isPublic)
    {
        for(var key in structure)
        {
            var keyToFreeze = keysToFreeze[key] = keysToFreeze[key]||{isPublic: isPublic};
            if (exists(keyToFreeze) && keyToFreeze.isPublic !== isPublic)       throw new Error("An invalid attempt to change the access modifier for member " + key + " was encountered.");
            var item            = structure[key];
                    if (isAFunction(item)                   && canBeAFunction(key, keyToFreeze.item))   applyFunctionToInstance.call(this, key, item, privileged, derivativeBaseProxy, isPublic);
            else    if (hasOwnProperty(item, "field")       && canBeAField(key, keyToFreeze.item))      applyFieldToInstance.call   (this, key, item, privileged, derivativeBaseProxy, isPublic);
            else    if (hasOwnProperty(item, "property")    && canBeAProperty(key, keyToFreeze.item))   applyPropertyToInstance.call(this, key, item, privileged, derivativeBaseProxy, isPublic);
            keysToFreeze[key].item  = keyToFreeze.item || item;
        }
    }

    function copyBaseProxyToDerivativeBaseProxy(base, derivativeBaseProxy)
    {
        var key,
            keys    = getOwnPropertyNames(base);

        for(var keyCounter=0; keyCounter<keys.length;keyCounter++)
        if (!hasOwnProperty(derivativeBaseProxy, key = keys[keyCounter]))
        {
            if (isAFunction(base[key])) defineFunction(derivativeBaseProxy, key, base[key]);
            else
            {
                var descriptor  = getOwnPropertyDescriptor(base, key);
                if (exists(descriptor.get) || exists(descriptor.set))   defineProperty(derivativeBaseProxy, key, {get: descriptor.get, set: descriptor.set, enumerable: true, configurable: false});
                else                                                    defineProperty(derivativeBaseProxy, key, {get: function(){return base[key];}, set: function(value){base[key] = value;}, enumerable: true, configurable: true});
            }
        }
    }

    function freezeMembers()
    {
        var descriptor,
            key,
            keys        = getOwnPropertyNames(this);

        for(var keyCounter=0; keyCounter<keys.length;keyCounter++)
        if
        (
            hasOwnProperty(this, key = keys[keyCounter])
            &&
            (descriptor = getOwnPropertyDescriptor(this, key))
            &&
            descriptor.configurable == true
            &&
            (exists(descriptor.get) || exists(descriptor.set))
        )                                                                   defineProperty(this, key, {configurable: false});
    }

    function defineClass(parentName, definition)
    {
        var constructorWrapper  =
        new Function
        (
            "definition",
            "convertArgsToArray",
            "return function " + definition.class.name + "()\n" +
            "{\n" +
            "    var privileged  = {};\n" +
            "    definition.instantiate.call(this, privileged, true, [], convertArgsToArray(arguments), null);\n" +
            "};"
        )(definition, convertArgsToArray);
        defineProperty(definition, "class", {value: constructorWrapper, enumerable: true, writable: false, configurable: false});
        extendBaseClass(definition);
        var baseDefinition      = getBaseDefinition(definition);

        function initializeClass(privileged, topLevel, keysToFreeze, derivativeBaseProxy)
        {
            function defineBaseProxy()
            {
                return  (function()
                        {
                            if (isAFunction(baseStructure.constructor)) baseStructure.constructor.apply(this, convertArgsToArray(arguments)); 
                            baseStructure.constructor = null;
                        }).bind(this);
            }
            var base            = defineBaseProxy.call(this);
            var baseStructure   = baseDefinition !== null ? baseDefinition.initialize.call(this, privileged, false, keysToFreeze, base) : {};
            var structure       = isAFunction(definition.static) ? definition.static(base, privileged) : {};
            if (exists(structure.protected))    applyStructureToInstance.call(this, structure.protected, privileged, keysToFreeze, derivativeBaseProxy, false);
            if (exists(structure.public))       applyStructureToInstance.call(this, structure.public, privileged, keysToFreeze, derivativeBaseProxy, true);
            if (derivativeBaseProxy != null)    copyBaseProxyToDerivativeBaseProxy(base, derivativeBaseProxy);

            if (topLevel)
            {
                freezeMembers.call(this);
                if (isAFunction(structure.constructor))     structure.constructor.call(this);
                if (isAFunction(baseStructure.constructor)) baseStructure.constructor.call(this);
                baseStructure.constructor   = null;
            }
            else
            {
                var originalConstructor = structure.constructor;
                structure.constructor   =
                function()
                {
                    if (isAFunction(originalConstructor))       originalConstructor.apply(this, convertArgsToArray(arguments));
                    if (isAFunction(baseStructure.constructor)) baseStructure.constructor.call(this);
                    baseStructure.constructor   = null;
                }
                return structure;
            }
        }

        function defineInstance(privileged, topLevel, keysToFreeze, args, derivativeBaseProxy)
        {
            function defineBaseProxy()
            {
                return  (function()
                        {
                            if (isAFunction(baseStructure.constructor)) baseStructure.constructor.apply(this, convertArgsToArray(arguments)); 
                            baseStructure.constructor = null;
                        }).bind(this);
            }

            if (topLevel)
            {
                defineProperty(privileged, "static", {value: staticPrivileged, writable: false, configurable: false, enumerable: true});
            }
            var base            = defineBaseProxy.call(this);
            var baseStructure   = baseDefinition !== null ? baseDefinition.instantiate.call(this, privileged, false, keysToFreeze, null, base) : {};
            var structure       = isAFunction(definition.instance) ? definition.instance(base, privileged) : {};
            if (exists(structure.protected))    applyStructureToInstance.call(this, structure.protected, privileged, keysToFreeze, derivativeBaseProxy, false);
            if (exists(structure.public))       applyStructureToInstance.call(this, structure.public, privileged, keysToFreeze, derivativeBaseProxy, true);
            if (derivativeBaseProxy != null)    copyBaseProxyToDerivativeBaseProxy(base, derivativeBaseProxy);

            if (topLevel)
            {
                freezeMembers.call(this);
                if (isAFunction(structure.constructor))     structure.constructor.apply(this, args);
                if (isAFunction(baseStructure.constructor)) baseStructure.constructor.call(this);
                baseStructure.constructor   = null;
            }
            else
            {
                var originalConstructor = structure.constructor;
                structure.constructor   =
                function()
                {
                    if (isAFunction(originalConstructor))       originalConstructor.apply(this, convertArgsToArray(arguments));
                    if (isAFunction(baseStructure.constructor)) baseStructure.constructor.call(this);
                    baseStructure.constructor   = null;
                }
                return structure;
            }
        }

        defineFunction(definition, "initialize", initializeClass);
        defineFunction(definition, "instantiate", defineInstance);
        defineProperty(definition.class, "__fullName", {value: (parentName !== undefined ? parentName + "." : "") + definition.class.name});
        classCache[definition.class.__fullName] = definition;

        var staticPrivileged    = {};
        definition.initialize.call(constructorWrapper, staticPrivileged, true, [], null);

        return constructorWrapper;
    }

    function define(parentName, definition)
    {
        if (isAFunction(definition))
        {
            if (hasProperty(this, definition.name))    throw new Error("Duplicate definition of class/function with function named " + definition.name + " attempted in " + this.name + " namespace.");
            defineFunction(this, definition.name, definition);
        }
        else if(exists(definition.class))
        {
            if (hasProperty(this, definition.class.name))    throw new Error("Duplicate definition of class/function with class named " + definition.class.name + " attempted in " + this.name + " namespace.");
            defineProperty(this, definition.class.name, {value: defineClass(parentName, definition), enumerable: true, writable: false, configurable: false});
        }
    }

    function namespace(namespaceName, parent)
    {
        var self            = function(namespace) {return defineNamespace.call(self, namespace); }
        defineProperty(parent, namespaceName, {value: self});
        defineProperty(self, namespaceName, {value: self});
        defineProperty(self, "__fullName", {value: (this.__fullName !== undefined ? this.__fullName + "." : "") + namespaceName});
        defineFunction(self, "define", define.bind(self, this.__fullName));
        return self;
    }
    function defineNamespace(namespaceName) {return this[namespaceName]||new namespace(namespaceName, this);}

    defineProperty(global, "namespace", {value: defineNamespace.bind(global)});
    defineFunction(global, "convertArgsToArray", convertArgsToArray);
    defineFunction(Function.prototype, "relay", function(args){this.apply(null, convertArgsToArray(args));});
    with(global.namespace("atomic")("is"))
    {
        define(function aFunction(item){return isAFunction(item);});
        define(function aString(item){return exists(item) === true && toStringFunction.call(item) === "[object String]";});
    }

})(this);

(function(global)
{with(namespace("atomic"))
{
    var readyList   = [];
    define
    (
        function ready(handler){readyList.push(handler);}
    );
    function triggerReady()
    {
        while(readyList.length > 0)
        {
            var queuedReadyList = readyList;
            readyList   = [];
            for(var handlerCounter=0;handlerCounter<queuedReadyList.length;handlerCounter++)
            {
                queuedReadyList[handlerCounter](global);
            }
        }
    }
    global.addEventListener("load", triggerReady);

}})(this);