let fs = require("fs");
let _ = require("lodash");
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
const PNF = require('google-libphonenumber').PhoneNumberFormat;
let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
  parseToArray() {
    this.arrayContent = this.content.split("\r\n");
    this.createHeader();
    this.arrayContent = this.cleanArray(this.arrayContent);
  }
  createHeader() {
    let firstline = this.arrayContent[0];
    this.header = firstline.split(/(".*?"|,)/g);
    this.header.forEach((value, index) => {
      value = value.replace(",", "");
      this.header[index] = value.replace(/\"/g, "");
    });
    this.header = this.header.filter(function(el) {
      return el;
    });

    for (let inicio = 0; inicio <= 3; inicio++) {
      this.header.shift();
    }
    console.log(this.header);
    this.arrayContent.shift();
  }
  cleanArray(array) {
    let arrayContent = [];
    array.forEach(value => {
      value = value.replace(/\"/, "");
      value = value.replace(" :)", "");
      let list = value.split(/[\/|,]+/);
      arrayContent.push(list);
    });
    return arrayContent;
  }
}

class aluno {
  constructor(
    fullname,
    eid,
    classes,
    addresses,
    invisible = false,
    see_all = false
  ) {
    this.fullname = fullname;
    this.eid = eid;
    this.classes = classes;
    this.addresses = addresses;
    this.invisible = invisible;
    this.see_all = see_all;
  }

  updateAluno(classes, addresses) {
    classes.forEach(classe => {
      this.addClasse(classe);
    });
    addresses.forEach(address => {
      this.addAddress(address);
    });
  }

  addAddress(address) {
    this.addresses.push(address);
  }
  addClasse(classe) {
    this.classes.push(classe);
  }
}

class address {
  constructor(address, type, tags) {
    this.address = address;
    this.type = type;
    this.tags = tags;
  }
}

let file = new FileManipulator();
file.parseToArray();
let alunos = [];

file.arrayContent.forEach(matricula => {
  console.log(matricula);
  let name = matricula.shift();
  let eid = matricula.shift();

  let classes = _.remove(matricula, function(v) {
    if (v.match("Sala ")) {
      return v;
    }
  });

  let addresses = [];
  file.header.forEach(column => {
    let lastaddress = matricula.shift();
    let possibletags = column.split(" ");
    possibletags.shift();
    let type;
    if (lastaddress) {
      if (lastaddress.match(emailRegex)) {
        type = "email";
      } else {
        try {
          let number = phoneUtil.parseAndKeepRawInput(lastaddress, "BR");
          if (phoneUtil.isValidNumberForRegion(number, "BR")) {
            lastaddress = phoneUtil.format(
              number,
              PNF.E164
            );
            lastaddress = lastaddress.replace("+", "");
            type = "phone";
          }
        } catch {}
      }
      if (type) {
        let newaddress = new address(lastaddress, type, possibletags);
        addresses.push(newaddress);
      }
    }
  });

  let isaluno = false;
  alunos.forEach(aluno => {
    if (eid == aluno.eid) {
      isaluno = true;
      aluno.updateAluno(classes, addresses);
    }
  });
  if (!isaluno) {
    let novoaluno = new aluno(name, eid, classes, addresses);
    alunos.push(novoaluno);
  }
});

file.writeOutput(alunos);
