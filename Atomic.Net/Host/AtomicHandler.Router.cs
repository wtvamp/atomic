﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AtomicNet
{

    public
    abstract
    partial     class   AtomicHandler : Atom<AtomicHandler>
    {

        public
        abstract
        partial     class   Router : Component<Router, Router.Args, Router.Config>
        {

            internal
            static      Router                  Instance;

            static  Router()
            {
                #warning Hardcoding Default Router here until we have the abstract factory implementation and configuration complete
                Router.Instance = new DefaultRouter(null);
                return;

                AtomicHandler.Router.Locator.Create(Configuration.Config.Services.AtomicHandlerRouter.SubclassKey, Configuration.Config.Services.AtomicHandlerRouter.args)
                .WhenDone(router=>Router.Instance = router, ex=>{throw ex;});
            }

            public
            abstract    Promise<AtomicHandler>  Map(string url);

            public      Router(Args args) : base(args) {}

        }

    }

}
