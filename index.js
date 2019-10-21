let fs = require("fs");
let _ = require("lodash");
const input = "input.csv";
const output = "output.json";


class FileManipulator {
  constructor() {
    this.content = this.readInput();
  }
  readInput() {
    const fileString = fs.readFileSync(input, "utf-8");
    return fileString;
  }
  writeOutput(result) {
    const resultString = JSON.stringify(result);
    fs.writeFileSync(output, resultString);
  }
  parseToArray(){
    this.arrayContent = this.content.split("\r\n");
    this.header = this.arrayContent[0].split(",");
    this.arrayContent.shift();
    this.arrayContent = this.cleanArray(this.arrayContent);
  }
  cleanArray(array) {
    let arrayContent = [];
    array.forEach((value, index) => {
      value = value.replace('"', "");
      value = value.replace('"', "");
      value = value.replace(" :)", "");
      let list = value.split(/[\/|,]+/);
      arrayContent.push(list);
    });
    console.log(arrayContent);
    return arrayContent;
  }
}

class aluno {
  constructor(fullname, eid, classes, addresses) {
    this.fullname = fullname;
    this.eid = eid;
    this.classes = classes;
    this.addresses = addresses;
  }
  updateAluno(classes, addresses){
    this.classes.push(classes);
    this.addresses.push(addresses);
}
}

class address {
  constructor(adress, type, tags) {
    this.adress = adress;
    this.type = type;
    this.tags = tags;
  }
}

let file = new FileManipulator();
file.parseToArray();

address = new address("tomas.dalessandro@ibm.com", "mail", ['pai', 'responsavel']);
classes = ['Class 2', 'Class 3', 'Class 4'];
aluno = new aluno("John", 3222, classes, address);

alunos = [aluno, aluno];

console.log(alunos);


// file.writeOutput(alunos);

