const fs = require('fs');
const axios = require('axios');
const progress = require('progressbar').create();

const inputFile = "./data/dataset.json";
const outputFile = "./data/dataset_stanford.json";
const serverUrl = "http://localhost:9000";

let attempt = 0;

let dataset = null;

let readDataset = () => {
    return new Promise(resolve => {
        try {
            dataset = fs.readFileSync(inputFile).toString( "utf-8" );
            dataset = JSON.parse(dataset);
            resolve()
        } catch(err) {
            throw new Error("Error on reading dataset: " + err.toString());
        }
    })
};

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
    await readDataset();
    let results = [];
    let total = Object.keys(dataset).length;
    progress.step('Dataset Analysis').setTotal(total);
    for (let i in dataset) {
        results.push( await analyzeItem(dataset[i]) );
        // console.log("Step " + i + "/" + total);
        progress.addTick();
    }
    progress.finish();
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
};

init();