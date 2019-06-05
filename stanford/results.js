const path = require('path');
const utils = require('../utils');

const inputFile = path.resolve("./data/dataset_stanford.json");

let matrix = {
    TP : 0, FP : 0, FN : 0, TN : 0
};

let init = async () => {
    let dataset = await utils.readDataset(inputFile);
    for (let i in dataset) {
        if (matrix[dataset[i].type] !== undefined) {
            matrix[dataset[i].type]++;
        }
    }
    let recall = matrix["TP"] / (matrix["TP"] + matrix["FN"]);
    let precision = matrix["TP"] / (matrix["TP"] + matrix["FP"]);
    let FMeasure = 2 * recall * precision / ( recall + precision );
    console.log(JSON.stringify(matrix));
    console.log("Recall: " + recall);
    console.log("Precision: " + precision);
    console.log("FMeasure: " + FMeasure);
};

init();