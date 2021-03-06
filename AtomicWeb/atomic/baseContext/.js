(function(global)
{with(namespace("atomic"))
{
    define
    ({
        class:      function BaseContext(){},
        static:     function(base, privileged)
        {return{
            protected:
            {
                instance:   {field: null}
            },
            public:
            {
                byId:       function(id)        { return privileged.instance.byId(id); },
                byClass:    function(className) { return privileged.instance.byClass(className); }
            }
        }},
        instance:   function(base, privileged)
        {return{
            constructor:
            function(document)
            {
                if (privileged.static.instance !== null)    throw new Error("Only one context isntance is permitted per execution.");
                privileged.static.instance  = this;
                Object.defineProperty(atomic, "context", {value: this, configurable: false, writable: false});
                privileged.document         = document;
            },
            protected:
            {
                document:   {field: null}
            },
            public:
            {
                byId:       function(id)        { return privileged.document.getElementById(id); },
                byClass:    function(className) { return privileged.document.getElementsByClassName(className)[0]; }
            }
        }}
    });
}})(this);