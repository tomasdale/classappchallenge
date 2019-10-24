let fs = require("fs");
let _ = require("lodash");
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
const PNF = require("google-libphonenumber").PhoneNumberFormat;
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
    const resultString = JSON.stringify(result, null, 2);
    fs.writeFileSync(output, resultString);
  }
  getContentAsArray() {
    let arrayContent = this.content.split("\r\n");
    this.createHeader(arrayContent);
    arrayContent.shift();
    arrayContent = this.cleanTextInArray(arrayContent);
    return arrayContent;
  }
  createHeader(arrayContent) {
    let firstline = arrayContent[0];
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
  }

  cleanTextInArray(arrayContent) {
    let cleanArray = [];
    arrayContent.forEach(value => {
      value = value.replace(/\"/g, "");
      let list = value.split(/[\s][\/][\s]|,/);
      list.forEach((value, index) => {
        list[index] = value.trim();
      });
      cleanArray.push(list);
    });
    return cleanArray;
  }
}
class aluno {
  constructor(fullname, eid, classes, addresses, invisible, see_all) {
    this.fullname = fullname;
    this.eid = eid;
    this.classes = classes;
    this.addresses = addresses;
    this.invisible = invisible;
    this.see_all = see_all;
  }

  setInvisibe(invisible) {
    this.invisible = invisible;
  }
  setSeeAll(see_all) {
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
    this.type = type;
    this.tags = tags;
    this.address = address;
  }
  addTags(tags) {
    tags.forEach(tag => {
      this.tags.push(tag);
    });
  }
}

function createAddress(lastaddress, possibletags) {
  let type = null;
  if (lastaddress.match(emailRegex)) {
    type = "email";
  } else {
    try {
      let number = phoneUtil.parseAndKeepRawInput(lastaddress, "BR");
      if (phoneUtil.isValidNumberForRegion(number, "BR")) {
        lastaddress = phoneUtil.format(number, PNF.E164);
        lastaddress = lastaddress.replace("+", "");
        type = "phone";
      }
    } catch {}
  }
  if (type) {
    let newaddress = new address(lastaddress, type, possibletags);
    return newaddress;
  }
  return null;
}

function main() {
  let file = new FileManipulator();
  let arrayContent = file.getContentAsArray();
  let alunos = [];

  arrayContent.forEach(matricula => {
    let name = matricula.shift();
    let eid = matricula.shift();
    let invisible = false;
    let see_all = false;

    if (
      matricula[matricula.length - 2] == "1" ||
      matricula[matricula.length - 2] == "yes"
    ) {
      invisible = true;
    }
    if (
      matricula[matricula.length - 1] == "1" ||
      matricula[matricula.length - 1] == "yes"
    ) {
      see_all = true;
    }

    if (matricula[1] === "") {
      matricula.splice(1, 1);
    }
    if (matricula[0] === "") {
      matricula.splice(0, 1);
    }

    let classes = _.remove(matricula, function(v) {
      if (v.match("Sala")) {
        return v;
      }
    });

    let addresses = [];
    file.header.forEach(column => {
      let lastaddress = matricula.shift().split("/");
      let possibletags = column.split(" ");
      possibletags.shift();
      lastaddress.forEach(addr => {
        let address = createAddress(addr, possibletags);
        if (address) {
          let isaddress = false;
          addresses.forEach(existingaddress => {
            if (address.address == existingaddress.address) {
              isaddress = true;
              existingaddress.addTags(possibletags);
            }
          });
          if (!isaddress) {
            addresses.push(address);
          }
        }
      });
    });

    let isaluno = false;
    alunos.forEach(aluno => {
      if (eid == aluno.eid) {
        isaluno = true;
        aluno.updateAluno(classes, addresses);
        if (aluno.invisible == false) {
          aluno.setInvisibe(invisible);
        }
        if (aluno.see_all == false) {
          aluno.setSeeAll(see_all);
        }
      }
    });
    if (!isaluno) {
      let novoaluno = new aluno(
        name,
        eid,
        classes,
        addresses,
        invisible,
        see_all
      );
      alunos.push(novoaluno);
    }
  });

  file.writeOutput(alunos);
}

main();
