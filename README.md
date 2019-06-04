# NERRecognition

Three different frameworks were used for compare results of NER recognition (only `PERSON` type). The instruction for execution is placed bellow.

## Required
- docker v18.09.2 or newest
- node.js v10.15 or newest
- npm v6.9.0 or newest


## Dataset
The dataset is XLXS file with next format. Your dataset should be set in the first list in xlsx file.
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
node transform/xlsx2json.js --input data/dataset.xlxs --output data/dataset.json
```


### Stanford 
The `standford` folder has scripts run experiments of NER recognition based on pre trained German model. The code has two parts:
1. Run existed Stanford CoreNLP server with german model. It used Dockerfile [1] for downloading requires data and execute them.
2. The script that goes throw the dataset, make request to the server, retrieve NER entities and calculate F-measure  

To create the server use next commands:
```
cd ~/stanford
docker build -t corenlp .

```
For running the server, you can run `server.sh` or `docker run -e TIMEOUT=360000 -p 9000:9000 -ti corenlp`  where `TIMEOUT=360000` means run server for 1 hour.




## References
1. CoreNLPContainer https://github.com/Nepomuceno/CoreNLPContainer