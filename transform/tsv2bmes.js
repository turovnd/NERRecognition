const fs = require('fs');
const path = require('path');

let inputFile = process.argv.indexOf("--input") > -1 ? process.argv[process.argv.indexOf("--input") + 1] : "./NCRFpp/data/source/NER-de-train.tsv";
let outputFile = process.argv.indexOf("--output") > -1 ? process.argv[process.argv.indexOf("--output") + 1] : "./NCRFpp/data/bmes/NER-de-train.bmes";

inputFile = path.resolve(inputFile);
outputFile = path.resolve(outputFile);

let data = fs.readFileSync(inputFile).toString("utf-8");

let results = [];
let array = data.split("\n");
let isSinglePer = false;

for (let i = 0; i < array.length; i++) {
    let arr = array[i].split('\t');
    if (arr[0] === "#") {
        results.push([])
    }
    else if (arr[0] !== "#" && arr[0] !== "") {
        if (arr[2].search("I-PER") !== -1) {
            arr[2] = "E-PER"
        } else if (arr[2].search("I-LOC") !== -1) {
            arr[2] = "E-LOC"
        } else if (arr[2].search("I-ORG") !== -1) {
            arr[2] = "E-ORG"
        } else if (arr[2].search("I-OTH") !== -1) {
            arr[2] = "E-MISC"
        }


        if (arr[2].search("B-PER") !== -1) {
            arr[2] = "B-PER"
        } else if (arr[2].search("B-LOC") !== -1) {
            arr[2] = "B-LOC"
        } else if (arr[2].search("B-ORG") !== -1) {
            arr[2] = "B-ORG"
        } else if (arr[2].search("B-OTH") !== -1) {
            arr[2] = "B-MISC"
        }

        if(isSinglePer && arr[2] === "O")
        {
            switch (isSinglePer) {
                case "B-PER":
                    results[results.length - 1][1] = "S-PER"; break
                case "B-LOC":
                    results[results.length - 1][1] = "S-LOC"; break
                case "B-ORG":
                    results[results.length - 1][1] = "S-ORG"; break
                default:
                    results[results.length - 1][1] = "S-MISC"; break
            }
        }
        isSinglePer = [ "B-PER", "B-LOC", "B-ORG", "B-MISC" ].indexOf( arr[2] ) !== -1 ? arr[2] : false;
        results.push([arr[1], arr[2]]);
    }
}
results.shift();
fs.writeFileSync(outputFile, results.map(item => item.join(" ")).join("\n"));