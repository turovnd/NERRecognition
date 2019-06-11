const path = require('path');
const utils = require('./index');

let inputFile = process.argv.indexOf("--file") > -1 ? process.argv[process.argv.indexOf("--file") + 1] : null;

if(!inputFile) {
    throw new Error("Missed required parameter `--file`")
}

inputFile = path.resolve(inputFile);

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