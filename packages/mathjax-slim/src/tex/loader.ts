import type { TexPackage } from "../mathjax.js";

export const texLoaders: Record<TexPackage, () => Promise<unknown>> = {
  action: () =>
    import("@mathjax/src/js/input/tex/action/ActionConfiguration.js"),
  ams: () => import("@mathjax/src/js/input/tex/ams/AmsConfiguration.js"),
  amscd: () => import("@mathjax/src/js/input/tex/amscd/AmsCdConfiguration.js"),
  bbm: () => import("@mathjax/src/js/input/tex/bbm/BbmConfiguration.js"),
  bboldx: () =>
    import("@mathjax/src/js/input/tex/bboldx/BboldxConfiguration.js"),
  bbox: () => import("@mathjax/src/js/input/tex/bbox/BboxConfiguration.js"),
  begingroup: () =>
    import("@mathjax/src/js/input/tex/begingroup/BegingroupConfiguration.js"),
  boldsymbol: () =>
    import("@mathjax/src/js/input/tex/boldsymbol/BoldsymbolConfiguration.js"),
  braket: () =>
    import("@mathjax/src/js/input/tex/braket/BraketConfiguration.js"),
  bussproofs: () =>
    import("@mathjax/src/js/input/tex/bussproofs/BussproofsConfiguration.js"),
  cancel: () =>
    import("@mathjax/src/js/input/tex/cancel/CancelConfiguration.js"),
  cases: () => import("@mathjax/src/js/input/tex/cases/CasesConfiguration.js"),
  centernot: () =>
    import("@mathjax/src/js/input/tex/centernot/CenternotConfiguration.js"),
  color: () => import("@mathjax/src/js/input/tex/color/ColorConfiguration.js"),
  colortbl: () =>
    import("@mathjax/src/js/input/tex/colortbl/ColortblConfiguration.js"),
  colorv2: () =>
    import("@mathjax/src/js/input/tex/colorv2/ColorV2Configuration.js"),
  configmacros: () =>
    import(
      "@mathjax/src/js/input/tex/configmacros/ConfigMacrosConfiguration.js"
    ),
  dsfont: () =>
    import("@mathjax/src/js/input/tex/dsfont/DsfontConfiguration.js"),
  empheq: () =>
    import("@mathjax/src/js/input/tex/empheq/EmpheqConfiguration.js"),
  enclose: () =>
    import("@mathjax/src/js/input/tex/enclose/EncloseConfiguration.js"),
  extpfeil: () =>
    import("@mathjax/src/js/input/tex/extpfeil/ExtpfeilConfiguration.js"),
  gensymb: () =>
    import("@mathjax/src/js/input/tex/gensymb/GensymbConfiguration.js"),
  html: () => import("@mathjax/src/js/input/tex/html/HtmlConfiguration.js"),
  mathtools: () =>
    import("@mathjax/src/js/input/tex/mathtools/MathtoolsConfiguration.js"),
  mhchem: () =>
    import("@mathjax/src/js/input/tex/mhchem/MhchemConfiguration.js"),
  newcommand: () =>
    import("@mathjax/src/js/input/tex/newcommand/NewcommandConfiguration.js"),
  noerrors: () =>
    import("@mathjax/src/js/input/tex/noerrors/NoErrorsConfiguration.js"),
  noundefined: () =>
    import("@mathjax/src/js/input/tex/noundefined/NoUndefinedConfiguration.js"),
  physics: () =>
    import("@mathjax/src/js/input/tex/physics/PhysicsConfiguration.js"),
  setoptions: () =>
    import("@mathjax/src/js/input/tex/setoptions/SetOptionsConfiguration.js"),
  tagformat: () =>
    import("@mathjax/src/js/input/tex/tagformat/TagFormatConfiguration.js"),
  texhtml: () =>
    import("@mathjax/src/js/input/tex/texhtml/TexHtmlConfiguration.js"),
  textcomp: () =>
    import("@mathjax/src/js/input/tex/textcomp/TextcompConfiguration.js"),
  textmacros: () =>
    import("@mathjax/src/js/input/tex/textmacros/TextMacrosConfiguration.js"),
  unicode: () =>
    import("@mathjax/src/js/input/tex/unicode/UnicodeConfiguration.js"),
  units: () => import("@mathjax/src/js/input/tex/units/UnitsConfiguration.js"),
  upgreek: () =>
    import("@mathjax/src/js/input/tex/upgreek/UpgreekConfiguration.js"),
  verb: () => import("@mathjax/src/js/input/tex/verb/VerbConfiguration.js"),
};
