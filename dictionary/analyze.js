const path = require('path');
const progress = require('progressbar').create();
const utils = require('../utils');

const dictNames = [
    path.resolve("./source/dictionary_names.csv"),
    path.resolve("./source/dictionary_surnames.csv")
];

let inputFile = process.argv.indexOf("--input") > -1 ? process.argv[process.argv.indexOf("--input") + 1] : "./data/dataset.json";
let outputFile = process.argv.indexOf("--output") > -1 ? process.argv[process.argv.indexOf("--output") + 1] : "./data/dataset_dictionary.json";

inputFile = path.resolve(inputFile);
outputFile = path.resolve(outputFile);

let matchNames = (arr1, arr2) => {
    for (let i in arr2) {
        if (arr1.indexOf(arr2[i]) === -1) {
            return false
        }
    }
    return true;
};

let analyzeItem = async (dictionary, data) => {
    data["comment"] = data["comment"] || "";
    let words = data["comment"].split(" ").map(item => item.trim());
    let nerArr = [];
    words.forEach(word => {
        if (dictionary.indexOf( word ) !== -1) {
            nerArr.push(word)
        }
    });
    if (data["has person"] === "-") {
        return Object.assign({
            type: nerArr.length > 0 ? "FP" : "TN",
            ner_names: nerArr.map(item => item)
        }, data);
    } else {
        return Object.assign({
            type: matchNames(data.names, nerArr) ? "TP" : "FN",
            ner_names: nerArr.map(item => item)
        }, data);
    }
};

let init = async () => {
    let dictionary = await utils.readDictionaries(dictNames);
    let dataset = await utils.readDataset(inputFile);
    let results = [];
    progress.step('Dataset Analysis').setTotal(dataset.length);
    for (let i in dataset) {
        results.push( await analyzeItem(dictionary, dataset[i]) );
        progress.addTick();
    }
    progress.finish();
    await utils.saveDataset(outputFile, JSON.stringify(results, null, 2));
};

init();