﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AtomicNet;

public
abstract    class   Atomic<tAtomic> : Atom<tAtomic> where tAtomic : Atomic<tAtomic>
{

    internal
    static      bool    IsPreloading    { get { return Loader.IsPreloading; } }

    static              Atomic()
    {
    }

    internal
    static      void    Boot()          { /* Do nothing.  The static constructor will take care of everything. */ }

}

public      class   Atomic : Atomic<Atomic>
{

    public
    static  bool    IsStillBooting  { get; private set; }

}