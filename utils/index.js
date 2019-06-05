const fs = require('fs');

let _readDataset = (file) => {
    return new Promise(resolve => {
        try {
            let dataset = fs.readFileSync(file).toString( "utf-8" );
            dataset = JSON.parse(dataset);
            resolve(dataset)
        } catch(err) {
            throw new Error("Error on reading file: " + file + ". " + err.toString());
        }
    })
};

let _saveDataset = (file, data) => {
    return fs.writeFileSync(file, data);
};

module.exports = {
    readDataset: _readDataset,
    saveDataset: _saveDataset
};