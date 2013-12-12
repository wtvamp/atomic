﻿using System.Linq;
using AtomicNet;

namespace AtomicNet
{

    public
    abstract
    partial
    class       Configuration : Atom<Configuration>
    {

        public
        partial
        class   ServiceConfigs{}

        public  ServiceConfigs  Services    = new ServiceConfigs();

        public
        static  Configuration   Config      = new Config();

    }

    public  class   Config  : Configuration
    {

    }

}
