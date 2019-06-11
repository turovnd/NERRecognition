# NERRecognition

Three different frameworks were used for compare results of NER recognition (only `PERSON` type). The instruction for execution is placed bellow.

## Requirement
- docker v18.09.2 or newest
- node.js v10.15 or newest
- npm v6.9.0 or newest


## Dataset
The dataset is a XLSX file in the format presented bellow. Your data should be set in the first list in the XLSX file.
```
    comment                         |       has person      |       names
---------------------------------------------------------------------------------------
Freizeitaktivität                   |           -           |
Aktivität                           |           -           |	        
Schulbegleitung Lukas               |           +           |       Lukas 
Fall Graudenz, Angelina 2h in April |           +           |   Graudenz, Angelina
```

**For working with code it is required to transform file to JSON format.**

Use next command for transformation dataset to json:
```
node transform/xlsx2json.js --input ./data/dataset.xlxs --output ./data/dataset.json
```


### Stanford 

The `standford` folder has scripts for running NER recognition based on pre trained German model. The code has two parts:
1. Run existed Stanford CoreNLP server with german model. It used Dockerfile [1] for downloading requires data and execute them.
2. The script that goes throw the dataset, make request to the server, retrieve NER entities and calculate F-measure  

To create the server use next commands:
```
cd ~/stanford
docker build -t corenlp .

```
For running the server, you can use one the command (it runs server for 1 hour):
```
./stanford/server.sh
``` 
For the dataset analysis use command bellow.
```
node ./stanford/analyze.js
``` 
It retrieves each comment from `data/dataset.json`, makes request to stanford server for NER recognition, matches recognized NER entities with hand marked by setting flags described bellow. In the result `data/dataset_stanford.json` file will be created.  


### Dictionary based 

The `dictionary` folder has the script for analysis: 
- load dictionaries entities to array of unique values
- go throw each comment in the dataset
    - split comment to words by space 
    - check each word in dictionary
- store results to `data/dataset_dictionat.json`

Use command for execute it
```
node ./dictionary/analyze.js
```

### Calculate F-measure
For calculating F-measure use command:
```
node utils/results.js --file ./data/<file_name>.json
```
Description of confusion matrix places bellow.  
```
TP - each marked as NER word is in the array of names
FP - if some of NER word is recognized AND it is not in the array of names
FN - if some of NER word is not recognized AND it is in the array of names
TN - if some of NER word is not recognized AND it is not in the array of names
```


## References
1. [CoreNLPContainer](https://github.com/Nepomuceno/CoreNLPContainer)
2. [Oxford Dictionary of Names](https://www.oxfordreference.com/view/10.1093/acref/9780198610601.001.0001/acref-9780198610601?btog=chap&hide=true&pageSize=100&skipEditions=true&sort=titlesort&source=%2F10.1093%2Facref%2F9780198610601.001.0001%2Facref-9780198610601)
3. [Dictionary of Surnames](http://www.namenforschung.net/en/dfd/dictionary/list/)
