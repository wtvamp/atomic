﻿using System;
using System.Web;
using AtomicStack;

namespace AtomicStack.IIS
{

    public  class IISHttpContext : HostContext
    {

        private static  HttpContext         currentContext                      { get { return HttpContext.Current; } }

        private         HttpContext         _context                            = null;
        internal        HttpContext         context                             { get { return this._context; } }

        private         IISHttpApplication  _application                        = null;
        private         IISHttpApplication  application                         { get { return HostApplication.CreateIfNeeded(ref this._application, context); } }

        private         IISHttpRequest      _request                            = null;
        private         IISHttpRequest      request                             { get { return HostRequest.CreateIfNeeded(ref this._request, this); } }

        private         IISHttpHandler      handler                             = null;

        public                              IISHttpContext(HttpContext context, IISHttpHandler handler)
        {
            Throw<ArgumentNullException>.If(context==null, "context");
            Throw<ArgumentNullException>.If(handler==null, "handler");

            this._context   = context;
            this.handler    = handler;
        }


        public
        override        Exception[]         AllErrors                           { get { return this.context.AllErrors; } }

        public
        override        HostApplication     ApplicationInstance                 { get { return this.application; } }

        public
        override        Exception           Error                               { get { return this.context.Error; } }

        public
        override        HostHandler         Handler                             { get { return this.handler; } }

        public override HostRequest Request
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public override HostResponse Response
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public override HostServerUtility Server
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public override DateTime Timestamp
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public override HostPrincipal User
        {
            get
            {
                throw new NotImplementedException();
            }
        }
    }

}
