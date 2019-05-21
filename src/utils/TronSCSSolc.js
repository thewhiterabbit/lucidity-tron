import * as wrapper from 'solc/wrapper'

function loadScript(name, url) {
    return new Promise((resolve)=>{
        var script = document.getElementById("lucidity-ide-" + name);
        if (script != null) {
            script.parentElement.removeChild(script);
        }
    
        script = document.createElement("script")
        script.type = "text/javascript";
        script.setAttribute("id", "lucidity-ide-" + name);
    
        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" ||
                    script.readyState == "complete") {
                    script.onreadystatechange = null;
                    resolve();
                }
            };
        } else {  //Others
            script.onload = function () {
                resolve();
            };
        }
    
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    })
}

export function loadVersion(version) {
    return new Promise(async (resolve, reject) => {
        try {
            delete window.Module
            // NOTE: workaround some browsers
            window.Module = undefined
            var url = (version.indexOf("tron")>-1?"https://omofomo.io/tron-solc-bin/":"https://ethereum.github.io/solc-bin/bin/") + version;
            await loadScript("solc", url);
            var solc = wrapper(window.Module);
            resolve(solc);
        }
        catch (e) {
            reject(e);
        }
    })
}

export function getVersions() {
    return new Promise(async (resolve, reject) => {
        try {
            var url = "https://ethereum.github.io/solc-bin/bin/list.js";
            var urlTron = "https://omofomo.io/tron-solc-bin/list.js";
            await loadScript("solc-versions", url);
            await loadScript("tron-solc-verison",urlTron);
                // After loads global variables called "soljsonSources" and "soljsonReleases"
                let soljsonReleases=Object.assign({},window.tronSoljsonReleases,window.soljsonReleases);
                resolve(soljsonReleases);
        }
        catch (e) {
            reject(e);
        }
    })
}

export function getAllVersions() {
    return new Promise(async (resolve, reject) => {
        try {
            var url = "https://ethereum.github.io/solc-bin/bin/list.js";
            var urlTron = "https://omofomo.io/tron-solc-bin/list.js";
            await loadScript("solc-versions", url);
            await loadScript("tron-solc-verison",urlTron);
                // After loads global variables called "soljsonSources" and "soljsonReleases"
                let allSoljsonSources = window.tronSoljsonSources.concat(window.soljsonSources);
                let allSoljsonFormat={};
                allSoljsonSources.forEach((i)=>{
                    allSoljsonFormat[i.substr(0,i.length-3)]=i;
                })
                resolve(allSoljsonFormat);
        }
        catch (e) {
            reject(e);
        }
    })
}

