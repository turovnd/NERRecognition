const axios = require('axios');
const path = require('path');
const progress = require('progressbar').create();
const utils = require('../utils');

let inputFile = process.argv.indexOf("--input") > -1 ? process.argv[process.argv.indexOf("--input") + 1] : "./data/dataset.json";
let outputFile = process.argv.indexOf("--output") > -1 ? process.argv[process.argv.indexOf("--output") + 1] : "./data/dataset_stanford.json";

inputFile = path.resolve(inputFile);
outputFile = path.resolve(outputFile);

const serverUrl = "http://localhost:9000";

let attempt = 0;

let matchNames = (arr1, arr2) => {
    for (let i in arr2) {
        if (arr1.indexOf(arr2[i].text) === -1) {
            return false
        }
    }
    return true;
};

let makeRequest = async (content) => {
    return axios.post( serverUrl, content, {
        params: {
            properties: {
                annotators: "ner"
            },
            pipelineLanguage: "de"
        }
    }).then(resp => {
        return resp.data
    }).catch(err => {
        console.error(err.toString());
        return null;
    })
};

let analyzeItem = async (item) => {
    let response = await makeRequest(item["comment"]);
    if (!response && attempt < 10) {
        attempt++;
        return analyzeItem(item)
    }
    let entities = [];
    for (let i in response.sentences) {
        if (response.sentences[i] && response.sentences[i].entitymentions && response.sentences[i].entitymentions.length) {
            entities = entities.concat(response.sentences[i].entitymentions)
        }
    }
    attempt = 0;
    let nerArr = entities.filter(item => item.ner === "PERSON") || [];

    if (item["has person"] === "-") {
        return Object.assign({
            type: nerArr.length > 0 ? "FP" : "TN",
            ner_names: nerArr.map(item => item.text)
        }, item);
    } else {
        return Object.assign({
            type: matchNames(item.names, nerArr) ? "TP" : "FN",
            ner_names: nerArr.map(item => item.text)
        }, item);
    }
};


let init = async () => {
    let dataset = await utils.readDataset(inputFile);
    let results = [];
    progress.step('Dataset Analysis').setTotal(dataset.length);
    for (let i in dataset) {
        results.push( await analyzeItem(dataset[i]) );
        progress.addTick();
    }
    progress.finish();
    await utils.saveDataset(outputFile, JSON.stringify(results, null, 2));
};

init();