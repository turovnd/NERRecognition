const fs = require('fs');

const inputFile = "./data/dataset_stanford.json";

let dataset = null;

let matrix = {
    TP : 0, FP : 0, FN : 0, TN : 0
};

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


let init = async () => {
    await readDataset();
    for (let i in dataset) {
        if (matrix[dataset[i].type] !== undefined) {
            matrix[dataset[i].type]++;
        }
    }
    console.log(JSON.stringify(matrix));
    let recall = matrix["TP"] / (matrix["TP"] + matrix["FN"]);
    let precision = matrix["TP"] / (matrix["TP"] + matrix["FP"]);
    let FMeasure = 2 * recall * precision / ( recall + precision );
    console.log("Recall: " + recall);
    console.log("Precision: " + precision);
    console.log("FMeasure: " + FMeasure);
};

init();