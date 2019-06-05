const utils = require('../utils');
const path = require('path');

let inputFile = process.argv.indexOf("--input") > -1 ? process.argv[process.argv.indexOf("--input") + 1] : "./data/dataset.json";
let outputFile = process.argv.indexOf("--output") > -1 ? process.argv[process.argv.indexOf("--output") + 1] : "./data/dataset.csv";
let delimiter = process.argv.indexOf("--delimiter") > -1 ? process.argv[process.argv.indexOf("--delimiter") + 1] : "|";

inputFile = path.resolve(inputFile);
outputFile = path.resolve(outputFile);

let init = async () => {
    let json = await utils.readDataset(inputFile);
    let headers = [];
    json.forEach(item => {
        if (Object.keys(item).length > headers.length) {
            headers = Object.keys(item);
        }
    });
    if (headers.length === 0) {
        throw new Error("Incorrect format of input file: " + inputFile);
    }
    let array = [];
    for (let i in json) {
        array[i] = [];
        for (let j in headers) {
            let value = json[i][headers[j]] || "";
            if (typeof value === "object") {
                array[i].push(value.join(", "))
            } else {
                array[i].push(value)
            }
        }
    }
    array.unshift(headers);
    utils.saveDataset(outputFile, array.map(item => item.join(delimiter)).join('\n'))
};

init();
