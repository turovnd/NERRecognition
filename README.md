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
```
TP - each marked as NER word is in the array of names
FP - if some of NER word is recognized AND it is not in the array of names
FN - if some of NER word is not recognized AND it is in the array of names
TN - if some of NER word is not recognized AND it is not in the array of names
```
For calculating F-measure use command:
```
node ./stanford/results.js
```  


## References
1. CoreNLPContainer https://github.com/Nepomuceno/CoreNLPContainer