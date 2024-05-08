// for ref https://www.unitjuggler.com/convert-frequency-from-MHz-to-ms(p).html
  // Both domains have an object to store conversion values and display names.
  // Alertiantive approach might be use conversion value as key.
  //  t = {1: "ps", 1000: "ns"}; curUnit = t.find("ns"); smallerUnit = t[curUnit/1000];
/* *************************************************************************************** */

// const to prevent reasignment, freez to prevent changing any parameters
const _tDomain = Object.freeze( { 
    name: "Time Domain",
    h: {value: 3_600*1_000_000_000, prettyName: "Hours"},
    m: {value:    60*1_000_000_000, prettyName: "Minutes"},
    s: {value:       1_000_000_000, prettyName: "Seconds"},
    ms:{value:           1_000_000, prettyName: "Milli Seconds"},
    us:{value:               1_000, prettyName: "Micro Seconds"},
    ns:{value:                   1, prettyName: "Nano Seconds"},
    /*ps:{value:              1, prettyName: "Pico Seconds"},*/
    baseUnit: "ns",
    get units() { // now only used in main as a lookup / crappy iterator.
        return ["h", "m", "s", "ms", "us", "ns"];
    },
    switchDomains() { return _fDomain; },
});

const _fDomain = Object.freeze( {
    // how best to deal with MHz vs mHz?
    //translations: {hz: ["hz","Hz", "hertz"]},
    //translations: {mHz: millihz, MHz: mhz, hertz: hz}, // use 'in' keyword
    name: "Frequency Domain",
    ghz:{value: 1_000*1_000_000*1_000, prettyName: "GigaHertz"},
    mhz:{value:       1_000_000*1_000, prettyName: "MegaHertz"},
    khz:{value:           1_000*1_000, prettyName: "KiloHertz"},
    hz: {value:                 1_000, prettyName: "Hertz"},
    millihz:{value:                 1, prettyName: "MilliHertz"},
    /*uhz: {value:       1, prettyName: "MicroHertz"},*/
    /*nhz: {value:          1, prettyName: "NanoHertz"},*/
    /*phz: {value:             1, prettyName: "PicoHertz"},*/
    baseUnit: "millihz",
    get units() {
        return ["ghz", "mhz", "khz", "hz", "millihz"];
    },
    switchDomains() { return _tDomain; },
});

const _conversionFactor = 1_000_000_000_000;
//conversionFactor = () => { return (_tDomain.s.value * _fDomain.hz.value); }

// global calculation function for converting between units
const _calc = (val, oldUnit, newUnit, debug = false) => {
    if(oldUnit in _tDomain)
        var oldDomain = _tDomain;
    else if(oldUnit in _fDomain)
        var oldDomain = _fDomain;
    else
        return NaN; // error

    if(newUnit in oldDomain)
        return _calcSameDomain(val, oldUnit, oldDomain, newUnit, debug);
    else
        return _calcDiffDomain(val, oldUnit, oldDomain, newUnit, oldDomain.switchDomains(), debug);
}

const _calcSameDomain = (val, oldUnit, oldDomain, newUnit, debug = false) => {
    let temp = NaN;
    try {
        temp = (val * oldDomain[oldUnit].value) / oldDomain[newUnit].value;
    } catch (error) {
        console.error(error);
    }

    if (debug) {
        console.log(`%cSameCalc ${val}${oldUnit} to ${newUnit}`,"color: blue");
        console.log(`\t${val} x ${oldDomain[oldUnit].value} / ${oldDomain[newUnit].value} = ${temp}`);
    }
    return temp; 
}
const _calcDiffDomain = (val, oldUnit, oldDomain, newUnit, newDomain, debug = false) => {
    if (debug) {
        console.group();  
        console.log(`%cDiffCalc ${val}${oldUnit} to ${newUnit}`,"color: blue");
        let toBase =   _calc(val, oldUnit, oldDomain.baseUnit, true);
        let oneOver= 1 / toBase;
        let m2m = oneOver * _conversionFactor; 
        let fromBaseOtherDomain
                    = _calc(m2m, newDomain.baseUnit, newUnit, true);

        console.log(`%c${val}${oldUnit} -> ${toBase}${oldDomain.baseUnit}`,"color: orange");
        console.log(`%c1 / ${toBase}${oldDomain.baseUnit} = ${oneOver}`,"color: orange");
        console.log(`%coneOver * 1,000,000,000,000 = ${m2m}`,"color: orange");
        console.log(`%c${m2m}${newDomain.baseUnit} -> ${fromBaseOtherDomain}${newUnit}`,"color: orange");
        console.groupEnd();
    }
    let temp = _calc(
        ((1 / _calc(val, oldUnit, oldDomain.baseUnit)) * _conversionFactor),
        newDomain.baseUnit, 
        newUnit
    ) 
    return temp; 
}

// Find the unit at the end of a string
function _findUnit(str) {
    let strSplit = str.trim().split(/([A-Za-z]+)/, 4); // split numerals, limit 4
    // this regex: /(\d+)/ doesn't work as well as it splits floats

    let haveVal, haveUnit = false;
    let domainObj = _tDomain; // just to start somewhere 
    let err = null;

    // iterate through the split.  ideal scenario will be [numeral][text]
    for ( let i = 0; i < strSplit.length; i++ ) {
        if(haveVal && haveUnit)
            break; // done once we believe we have user's input

        let stri = strSplit[i].trim().toLowerCase();
        if(stri == "") // skip null strings
            continue;

        // test for numeral
        if(/^[-+]?[0-9]*\.?[0-9]+/.test(stri) && !haveVal)
            haveVal = parseFloat(stri.split(/\s/)[0]);
        else {
            if(stri in _tDomain) {
                haveUnit = stri;
                domainObj = _tDomain;
            }
            else if(stri in _fDomain) {
                haveUnit = stri;
                domainObj = _fDomain;
            }
        }
    }
    if(!haveVal || !haveUnit)
        err = `unable to parse input '${str}'`;

    return {
        error: err, // null if no parse error
        val: haveVal,
        domain: domainObj,
        unit: haveUnit,
    };
}

// API for this conversion tool
export const conversion_app = ( () => {
    const state = {
		result: {
            error: null, // null if no parse error
            val: 0,
            domain: _tDomain,
            unit: _tDomain.baseUnit,
        },
        update(str) { this.result = _findUnit(str); return(this); },
        get error()  { return this.result.error;  },
        get value()  { return this.result.val;    },
        get domain() { return this.result.domain; },
        get unit()   { return this.result.unit;   },
        get otherDomain() { return this.result.domain.switchDomains(); },
        /*get domainUnits() { return this.result.domain.units; }*/
        calc(newUnit, print=false) { return _calc(this.result.val, this.result.unit, newUnit, print).toFixed(2); }
    };

    const timeUnits = _tDomain.units;
    const frequencyUnits = _fDomain.units;

    return {state, timeUnits, frequencyUnits}
} );