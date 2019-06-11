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

let _readDictionaries = (files) => {
    return new Promise(async resolve => {
        let array = [];
        for (let i = 0; i < files.length; i++) {
            let data = await fs.readFileSync(files[i]).toString( "utf-8" );
            data = data.split("\n");
            data = data.map(item => item.replace(/\r/i, ''));
            array = array.concat(data);
        }
        return resolve(array);
    });
};

module.exports = {
    readDataset: _readDataset,
    saveDataset: _saveDataset,
    readDictionaries: _readDictionaries
};