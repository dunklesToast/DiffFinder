const path = require('path');

const pathUncover = path.join(process.argv[2]);
const pathTwelve = path.join(process.argv[3]);

const similiar = require('string-similarity');
const fs = require('fs');

const twelveList = [];

const listUncover = fs.readdirSync(pathUncover);

const AsciiTable = require('ascii-table');

const table = new AsciiTable("dunklesToast's file comparison");

table.setHeading('Tested File', 'Highest Match in other folder', 'Similarity [%]');

let differences = 0;
let testedFiles = 0;

function compare(file) {
    const isDirectory = (fs.statSync(file)).isDirectory();
    if(isDirectory){
        const dirList = fs.readdirSync(file);
        for(let i in dirList) compare(file + '/' + dirList[i]);
    }else {
        const fileDataUndecimus = fs.readFileSync(file).toString();
        let highestMatch = {
            percent: 0,
            file: 'no match'
        };
        for(let i in twelveList){
            const fileDataTwelve = fs.readFileSync(twelveList[i]).toString();
            const simi = similiar.compareTwoStrings(fileDataTwelve, fileDataUndecimus);
            if(simi > highestMatch.percent) {
                highestMatch = {
                    percent: simi,
                    file: twelveList[i]
                }
            }
        }
        table.addRow(file.replace(pathUncover, ''), highestMatch.file.replace(pathTwelve, ''), (highestMatch.percent*100).toPrecision(5));
        differences += highestMatch.percent;
        testedFiles++;
    }
}

function run() {
    buildListWithTwelveFiles(pathTwelve);
    for(let i in listUncover){
        compare(pathUncover + '/' + listUncover[i]);
        console.log('Finished: ' + listUncover[i]);
    }
    const result = 'Compared: ' +  new Date() + '\r\n' + table.toString() + '\r\n' + 'Average Similarity: ' + (differences / testedFiles).toPrecision(4)*100 + '%';
    fs.writeFileSync('result.txt', result);
    console.log('done. result written to result.txt')
}

run();

function buildListWithTwelveFiles(file) {
    const isDirectory = (fs.statSync(file)).isDirectory();
    if(isDirectory){
        const dirList = fs.readdirSync(file);
        for(let i in dirList) buildListWithTwelveFiles(file + '/' + dirList[i]);
    }else {
        twelveList.push(file);
    }
}
