
let extraJsonChildren = (element, arrayChildren = {}) => {
    let json = {};
    let tagName = element.tagName.toLowerCase();

    let keys = Object.keys(arrayChildren);
    let newKeys = keys.filter(key => {
        if (key.indexOf(tagName) !== -1) {
            return key
        }
    });

    let indiceContinue = newKeys.length;
    tagName = `${tagName}[${indiceContinue}]`;

    json[tagName] = {};
    json[tagName]["attribute"] = {};

    let atributes = Array.from(element.attributes);
    atributes.forEach(attr => {
        json[tagName]["attribute"][attr.name] = attr.value
    });

    let text = Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent)
    .join('');

    json[tagName]["innerText"] = text.trim();

    let children = Array.from(element.children);
    let newJson = {};

    children.forEach(child => {
        console.log(newJson);
        newJson = {
            ...newJson,
            ...extraJsonChildren(child, newJson)
        };
    });

    json[tagName] = {
        ...json[tagName],
        ...newJson
    }

    return json;
}

let extraJson = (indice) => {
    let content = document.querySelector(indice);
    arrayChildren = Array.from(content.children);
    let jsonExtract = {};
    arrayChildren.forEach(element => {
        let newJson = extraJsonChildren(element, jsonExtract);
        jsonExtract = {
            ...jsonExtract,
            ...newJson
        };
    });

    return jsonExtract;
}

// let jsonExtract = extraJson(".app-search");
// console.log(jsonExtract, "extraJson");
// console.log(JSON.stringify(jsonExtract), "stringJson");