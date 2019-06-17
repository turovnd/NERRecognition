const utils = require('../utils');
const path = require('path');

let inputFile = process.argv.indexOf("--input") > -1 ? process.argv[process.argv.indexOf("--input") + 1] : "./data/dataset.json";
let outputFile = process.argv.indexOf("--output") > -1 ? process.argv[process.argv.indexOf("--output") + 1] : "./data/dataset.bmes";

inputFile = path.resolve(inputFile);
outputFile = path.resolve(outputFile);

let init = async () => {
    let json = await utils.readDataset(inputFile);
    let array = [];
    for (let i in json) {
        if (json[i]['comment']) {
            let data = json[i]['comment'].trim().split(" ");
            let names = json[i]['names'] ? json[i]['names'].map(item => item.split(" ")).reduce((a,b) => a.concat(b)) : [];
            for (let o = 0; o < data.length; o++) {
                if (names.indexOf(data[o]) !== -1) {
                    // Check if single
                    if (names.indexOf(data[o-1]) !== -1) {
                        array.push(data[o] + " " + "E-PER");
                    } else if (names.indexOf(data[o+1]) === -1) {
                        array.push( data[o] + " " + "S-PER");
                    } else {
                        array.push( data[o] + " " + "B-PER");
                    }
                } else {
                    array.push( data[o] + " " + "O")
                }
            }
        }
        array.push( "" );
    }
    utils.saveDataset(outputFile, array.join('\n'))
};

init();
