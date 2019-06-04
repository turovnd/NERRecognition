const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

let inputFile = process.argv.indexOf("--index") > -1 ? process.argv[process.argv.indexOf("--index") + 1] : path.resolve("./data/dataset.xlsx");
let outputFile = process.argv.indexOf("--output") > -1 ? process.argv[process.argv.indexOf("--output") + 1] : path.resolve("./data/dataset.json");

try {
    let file = XLSX.readFile(inputFile);
    let worksheet = file.Sheets[file.SheetNames[0]];
    let json = XLSX.utils.sheet_to_json(worksheet, {raw:true});
    for(let i in json) {
        if(json[i].names) {
            json[i].names = json[i].names.split(",").map(item => item.trim());
        }
    }
    fs.writeFileSync(outputFile, JSON.stringify(json, null, 2));
} catch (err) {
    console.error(err)
}
