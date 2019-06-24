# NERRecognition

Three different frameworks were used for compare results of NER recognition (only `PERSON` type). The instruction for execution is placed bellow.

## Requirement
- docker v18.09.2 or newest
- node.js v10.15 or newest
- npm v6.9.0 or newest
- python v2.7.10 or newest, PyTorch v1.0


## Dataset
The dataset is a XLSX file in the format presented bellow. Your data should be set in the first list in the XLSX file.
|   comment                         | has person |      names
|---------------------------------- | :--------: | :-----------------:
|Freizeitaktivität                  |      -     |   
|Aktivität                          |      -     |
|Schulbegleitung Lukas              |      +     |      Lukas
|Fall Graudenz, Angelina 2h in April|      +     | Graudenz, Angelina


**For working with code it is required to transform file to JSON format.**

Use next command for transformation dataset to json:
```
node transform/xlsx2json.js --input ./source/dataset_with_spelling.xlsx --output ./data/with_spelling/dataset.json
node transform/xlsx2json.js --input ./source/dataset_without_spelling.xlsx --output ./data/without_spelling/dataset.json
```


### Stanford 

The `standford` folder has scripts for running Stanford NER recognition using pre trained German model. The code has two parts:
1. Create and run existed Stanford CoreNLP server with german model [Dockerfile](https://github.com/Nepomuceno/CoreNLPContainer/tree/master/3.9.2/german)
2. The script that goes throw the dataset, makes request to the server, retrieves NER entities and matches them with expert entities

To create the server use next commands:
```
./stanford/create.sh

```

For running the server, you can use one the command (it runs server for 1 hour):
```
./stanford/run.sh
``` 

For the dataset analysis use command bellow:
```
node ./stanford/analyze.js --input ./data/with_spelling/dataset.json --output ./data/with_spelling/dataset_stanford.json
node ./stanford/analyze.js --input ./data/without_spelling/dataset.json --output ./data/without_spelling/dataset_stanford.json
```

The script steps:
- retrieves each comment from `data/dataset.json`
- makes request to the Stanford server with a comment in the body
- retrieves labeled NER, filter them by type `PERSON`
- matches filtered NER entities with expert entities, detect TP,FP,TN,FN 
- writes result to `data/with_spelling/dataset_stanford.json` or `data/without_spelling/dataset_stanford.json`  


### NCRF++

The `NCRFpp` folder has scripts for train model and evaluate it. 
1. Download NER files for train model, vectors of words file
2. Convert train/dev/test datasets to `.bmes` format
3. Run train model script, handle results in console

**Data preparation**

Firstly, download [NER files](https://sites.google.com/site/germeval2014ner/data) for train a model. We used [NER-de-dev.tsv](https://sites.google.com/site/germeval2014ner/data/NER-de-dev.tsv?attredirects=0&d=1) and [NER-de-test.tsv](https://sites.google.com/site/germeval2014ner/data/NER-de-test.tsv?attredirects=0&d=1).
Secondly, download [Word vectors](https://fasttext.cc/docs/en/crawl-vectors.html). We used [German text](https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.de.300.vec.gz) vector.
Finally, convert `.tsv` files to `.bmes` for download NER files and for source dataset (that will used as `test` file), unzip German word vector. All files should be in the folder `~/NCRFpp/data/source`.
```
node transform/tsv2bmes.js --input ./NCRFpp/data/source/NER-de-train.tsv --output ./NCRFpp/data/bmes/NER-de-train.bmes
node transform/tsv2bmes.js --input ./NCRFpp/data/source/NER-de-dev.tsv --output ./NCRFpp/data/bmes/NER-de-dev.bmes
node transform/json2bmes.js --input ./data/with_spelling/dataset.json --output ./data/with_spelling/dataset.bmes
node transform/json2bmes.js --input ./data/without_spelling/dataset.json --output ./data/without_spelling/dataset.bmes
```

**Training model**

For training model you should use the file `NCRFpp/train.config` (check that all paths set correct) and run the commands:
```
cd NCRFpp
```
For training validate the dataset with spell checking: (LSTM + LSTM, LSTM + CNN)
```
python3 main.py --config train.config --custom true --test ../data/with_spelling/dataset.bmes --model_dir data/models/with_lstmlstm --word_feature LSTM --char_feature LSTM
python3 main.py --config train.config --custom true --test ../data/with_spelling/dataset.bmes --model_dir data/models/with_lstmcnn --word_feature LSTM --char_feature CNN
```
For training validate the dataset without spell checking: (LSTM + LSTM, LSTM + CNN)
```
python3 main.py --config train.config --custom true --test ../data/without_spelling/dataset.bmes --model_dir data/models/without_lstmlstm --word_feature LSTM --char_feature LSTM
python3 main.py --config train.config --custom true --test ../data/without_spelling/dataset.bmes --model_dir data/models/without_lstmcnn --word_feature LSTM --char_feature CNN
```
In console the information of training is placed. The last line has values of precision, recall, acc, F-measure.  


### Dictionary based

The `dictionary` folder has the script for analysis: 
- load dictionaries entities to array
- go throw each comment in the dataset
    - split comment by space to array of words 
    - check each word in dictionary, define NER entities
- matches filtered NER entities with expert entities, detect TP,FP,TN,FN
- store results to `data/with_spelling/dataset_dictionat.json` or `data/without_spelling/dataset_dictionat.json`

Use command for execute the script:
```
node ./dictionary/analyze.js --input ./data/with_spelling/dataset.json --output ./data/with_spelling/dataset_dictionary.json
node ./dictionary/analyze.js --input ./data/without_spelling/dataset.json --output ./data/without_spelling/dataset_dictionary.json
```

### Calculate F-measure
For calculating F-measure use command:
```
node utils/results.js --file ./data/<file_name>.json
```

Description of confusion matrix:
```
TP - number of actual named entities that were marked as named entities by the model
FP - number of ordinary words that were marked as named entities by the model
FN - number of actual named entities that were marked as ordinary words by the model
TN - number of ordinary words that were marked as ordinary words by the model
```

### The results
|  ID |     Method       |      Dataset     | F-measure  | Accuracy   
| --- | ---------------- | ---------------- | :--------: | :---------:
|  1  | Stanford         | with spelling    | 0.8345     | 0.9678
|  2  | Stanford         | without spelling | 0.8359	 | 0.9682  
|  3  | NCRF++ LSTM+LSTM | with spelling    | 0.0234	 | 0.8930 
|  4  | NCRF++ LSTM+CNN  | with spelling    | 0.0202	 | 0.8961
|  5  | NCRF++ LSTM+LSTM | without spelling | 0.0935	 | 0.8863
|  6  | NCRF++ LSTM+CNN  | without spelling | 0.0716	 | 0.8229
|  7  | Dictionary       | with spelling    | 0.8475	 | 0.9744
|  8  | Dictionary       | with spelling    | **0.8495** | **0.9748**



## References
1. [Container of Stanford CoreNLP server](https://github.com/Nepomuceno/CoreNLPContainer)
2. [Oxford Dictionary of Names](https://www.oxfordreference.com/view/10.1093/acref/9780198610601.001.0001/acref-9780198610601?btog=chap&hide=true&pageSize=100&skipEditions=true&sort=titlesort&source=%2F10.1093%2Facref%2F9780198610601.001.0001%2Facref-9780198610601)
3. [Dictionary of Surnames](http://www.namenforschung.net/en/dfd/dictionary/list/)
4. [NCRF++ Neural Sequence Labeling Toolkit](https://github.com/jiesutd/NCRFpp)
5. [GermEval 2014 NER](https://sites.google.com/site/germeval2014ner/data)
6. [Word vectors for 157 languages](https://fasttext.cc/docs/en/crawl-vectors.html)
