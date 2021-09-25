"use strict";

window.addEventListener("DOMContentLoaded", start);

let hack = false;

//Global array to contain student objects
let allStudents = [];
let thisStudent = null;

//The prototype for the student object
const Student = {
  id: 0,
  firstName: "-unknown-",
  middleName: "-unknown-",
  lastName: "",
  nickName: "-unknown-",
  gender: "-unknown-",
  bloodPurity: "-unknown-",
  house: "",
  image: "-unknown-",
  responsibility: "",
  status: "",
};

//Global values
const settings = {
  filterHouse: "all",
  filterPure: "all",
  filterRespons: "all",
  filterStatus: "active",
  sortBy: "firstName",
  sirtDir: "asc",
  seachFor: "",
};

function start() {
  console.log("start");

  //Call functions
  registerButtons();
  getJson();
}

//Adding event listeners to all the buttons on the page
function registerButtons() {
  //Filter buttons
  const selectors = document.querySelectorAll("select");
  selectors.forEach((selector) => {
    selector.addEventListener("change", selectFilter);
  });

  //Sort buttons
  document
    .querySelectorAll("[data-action='sort']")
    .forEach((button) => button.addEventListener("click", selectSort));

  //Seach Buttons
  document.querySelector("#seach-button").addEventListener("click", setSeach);

  //Prefect and inquisitor buttons
  document
    .querySelector("#prefect-button")
    .addEventListener("click", createPrefect);
  document
    .querySelector("#inquisitor-button")
    .addEventListener("click", createInquisitor);

  //Expell button
  document.querySelector("#expell").addEventListener("click", displayWarning);
  document.querySelector("#warning-continue").addEventListener("click", () => {
    document.querySelector("#warning-messege").classList.add("hidden");
    let messege;
    //Making sure I cannot be exspelled when system is hacked
    if (thisStudent.firstName === "Sandie") {
      messege = "Error student CANNOT be expelled";
      displayMessege(messege, true);
    } else {
      expellStudent();
      messege = "Student Has been expelled";
      displayMessege(messege);
    }
  });

  //Warning cancel and continue buttons
  document.querySelector("#warning-cancel").addEventListener("click", () => {
    document.querySelector("#warning-messege").classList.add("hidden");
    document.querySelector("#messege-background").classList.add("hidden");
  });

  //Close messege button
  document.querySelector("#close-messege").addEventListener("click", () => {
    document.querySelector("#user-messege").classList.add("hidden");
    document.querySelector("#messege-background").classList.add("hidden");
  });

  //Close popup button
  document.querySelector("#close-popup").addEventListener("click", () => {
    document.querySelector("#popup").classList = "hidden";
    document.querySelector("#popup-bacground").classList.add("hidden");

    createList();
  });

  //Hack button
  document.querySelector("#star-4").addEventListener("click", hackHogwarts);
}

function getJson() {
  //Load the student json data
  console.log("getJson");
  fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    .then((response) => response.json())
    .then((jsonData) => {
      //Call functions
      createStudentObject(jsonData);
      setBloodPurity();
      setImagePaths();
    });
}

//C
function createStudentObject(json) {
  console.log("createStudentObject");
  console.log(json);

  let counter = 0;

  json.forEach((jsonObject) => {
    const student = Object.create(Student);

    const nameString = jsonObject.fullname.trim();
    const houseString = jsonObject.house.trim();

    student.id = counter;
    student.firstName = calculateCapitalize(calculateFirstName(nameString));
    student.middleName = calculateCapitalize(calculateMiddleName(nameString));
    student.lastName = calculateCapitalize(calculateLastName(nameString));
    student.nickName = calculateCapitalize(calculateNickName(nameString));
    student.gender = calculateCapitalize(jsonObject.gender);
    student.bloodPurity = "";
    student.house = calculateCapitalize(houseString);
    student.responsibility = "None";
    student.status = "Active";

    allStudents.push(student);

    counter++;
  });

  console.log(allStudents);
}

function setImagePaths() {
  allStudents.forEach((student) => {
    if (student.lastName) {
      student.image = imageFirstname(student.lastName, student.firstName);
    } else {
      student.image = imageFirstLetter(student.lastName, student.firstName);
    }
  });
}

function setBloodPurity() {
  fetch("https://petlatkea.dk/2021/hogwarts/families.json")
    .then((response) => response.json())
    .then((jsonData) => {
      console.log(jsonData);
      allStudents.forEach((student) => {
        if (jsonData.half.includes(student.lastName)) {
          student.bloodPurity = "Half pure";
        } else if (jsonData.pure.includes(student.lastName)) {
          student.bloodPurity = "Pure";
        } else {
          student.bloodPurity = "Muggle";
        }
      });
      displayList(allStudents);
    });
}

function selectFilter(event) {
  const filterId = event.target.id;
  console.log(filterId);
  const filter = event.target.value;

  setFilter(filterId, filter);
}

function setFilter(filterId, filter) {
  if (filterId === "filter-house") {
    settings.filterHouse = filter;
  } else if (filterId === "filter-blod-purity") {
    settings.filterPure = filter;
  } else if (filterId === "filter-responsibility") {
    settings.filterRespons = filter;
  } else if (filterId === "filter-student-status") {
    settings.filterStatus = filter;
  }

  createList();
}

function createFilter(filteredStudents) {
  console.log("createFilter");
  //let filteredStudents = allStudents;

  let filteredByHouse;

  if (settings.filterHouse === "all") {
    filteredByHouse = filteredStudents.filter(filterAll);
  } else if (settings.filterHouse === "gryffindor") {
    filteredByHouse = filteredStudents.filter(filterGryffindor);
  } else if (settings.filterHouse === "hufflepuff") {
    filteredByHouse = filteredStudents.filter(filterHufflepuff);
  } else if (settings.filterHouse === "ravenclaw") {
    filteredByHouse = filteredStudents.filter(filterRavenclaw);
  } else if (settings.filterHouse === "slytherin") {
    filteredByHouse = filteredStudents.filter(filterSlytherin);
  }

  let filteredByBlood;

  if (settings.filterPure === "all") {
    filteredByBlood = filteredByHouse.filter(filterAll);
  } else if (settings.filterPure === "pure") {
    filteredByBlood = filteredByHouse.filter(filterPureBlood);
  } else if (settings.filterPure === "half") {
    filteredByBlood = filteredByHouse.filter(filterHalfBlood);
  } else if (settings.filterPure === "muggler") {
    filteredByBlood = filteredByHouse.filter(filterMuggleBlood);
  }

  let filteredByResponsibility;

  if (settings.filterRespons === "all") {
    filteredByResponsibility = filteredByBlood.filter(filterAll);
  } else if (settings.filterRespons === "prefect") {
    filteredByResponsibility = filteredByBlood.filter(filterPrefect);
  } else if (settings.filterRespons === "inquisitor") {
    filteredByResponsibility = filteredByBlood.filter(filterInquisitor);
  }

  let filteredByAll;

  if (settings.filterStatus === "active") {
    filteredByAll = filteredByResponsibility.filter(filterActive);
  } else if (settings.filterStatus === "expelled") {
    filteredByAll = filteredByResponsibility.filter(filterExpelled);
  }

  return filteredByAll;
}

function setSeach() {
  settings.seachFor = document.querySelector("#seach-input").value;

  createList();
}

function createSeach(currentList) {
  console.log("createSeach");

  let seachedList;

  currentList.forEach((student) => {
    seachedList = currentList.filter(nameIncludes);
  });

  return seachedList;
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  const oldElement = document.querySelector(`[data-sort="${settings.sortBy}"]`);
  oldElement.classList.remove("sorted-by");
  event.target.classList.add("sorted-by");

  //toggle
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;

  createList();
}

function createSort(sortedList) {
  //let sortedList = allStudents;

  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(sortByParam);

  function sortByParam(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

function createList() {
  const currentList = createFilter(allStudents);
  const seachedList = createSeach(currentList);
  const sortedList = createSort(seachedList);

  displayList(sortedList);
}

function displayList(array) {
  console.log("displayList");

  //Clear the list
  document.querySelector("#student-table tbody").innerHTML = "";
  document
    .querySelectorAll("[data-action='pop-up']")
    .forEach((button) => button.removeEventListener("click", createPopUp));

  //Build new list
  array.forEach(displayStudent);

  document
    .querySelectorAll("[data-action='pop-up']")
    .forEach((button) => button.addEventListener("click", createPopUp));

  displayNumbers(array);
}

function displayNumbers(dispStudents) {
  document.querySelector("#all-students").textContent = allStudents.length;
  document.querySelector("#disp-students").textContent = dispStudents.length;
  document.querySelector("#griff-students").textContent =
    allStudents.filter(filterGryffindor).length;
  document.querySelector("#slyth-students").textContent =
    allStudents.filter(filterSlytherin).length;
  document.querySelector("#huff-students").textContent =
    allStudents.filter(filterHufflepuff).length;
  document.querySelector("#raven-students").textContent =
    allStudents.filter(filterRavenclaw).length;
  document.querySelector("#act-students").textContent =
    allStudents.filter(filterActive).length;
  document.querySelector("#exp-students").textContent =
    allStudents.filter(filterExpelled).length;
}

function displayStudent(student) {
  //Create clone
  const clone = document
    .querySelector("template#student")
    .content.cloneNode(true);

  //Clone data
  clone.querySelector("[data-field=id]").textContent = `${student.id}`;
  student.firstName;
  clone.querySelector("[data-field=first-name]").textContent =
    student.firstName;
  clone.querySelector("[data-field=middle-name]").textContent =
    student.middleName;
  clone.querySelector("[data-field=last-name]").textContent = student.lastName;
  clone.querySelector("[data-field=gender]").textContent = student.gender;

  clone.querySelector("[data-field=blood-purity]").textContent =
    student.bloodPurity;

  clone.querySelector("[data-field=house]").textContent = student.house;

  if (student.responsibility === "Both") {
    clone.querySelector("[data-field=responsibility]").textContent =
      "Prefect, Inquisitor";
  } else {
    clone.querySelector("[data-field=responsibility]").textContent =
      student.responsibility;
  }

  clone.querySelector("[data-field=student-status]").textContent =
    student.status;

  //Append clone to the list
  document.querySelector("#student-table tbody").appendChild(clone);
}

function createPopUp(event) {
  console.log("createPopUp");
  const target = event.path[1].childNodes[1].textContent;
  thisStudent = allStudents[target];

  displayPopUp(thisStudent);
}

function displayPopUp() {
  console.log("displeyPopUp");
  document.querySelector("#house-logo").classList = "";
  document.querySelector("#popup").classList = "";
  document.querySelector("#changing-info-wrapper").classList.remove("hidden");
  document.querySelector("#is-expelled").classList.add("hidden");
  document.querySelector("#popup-bacground").classList.remove("hidden");

  if (thisStudent.status === "Expelled") {
    console.log("student is expelled");
    document.querySelector("#house-logo").classList.add("no-house");
    document.querySelector("#popup").classList.add("no-house-border");
    document.querySelector("#is-expelled").classList.remove("hidden");
    document.querySelector("#changing-info-wrapper").classList.add("hidden");
  } else {
    document
      .querySelector("#house-logo")
      .classList.add(`${thisStudent.house.toLowerCase()}`);
    document
      .querySelector("#popup")
      .classList.add(`${thisStudent.house.toLowerCase()}-border`);
  }

  //Display the full name
  if (thisStudent.nickName === "") {
    document.querySelector(
      "#name"
    ).textContent = `Name: ${thisStudent.firstName} ${thisStudent.middleName} ${thisStudent.lastName}`;
  } else {
    document.querySelector(
      "#name"
    ).textContent = `Name: ${thisStudent.firstName} ${thisStudent.middleName} ${thisStudent.lastName} "${thisStudent.nickName}"`;
  }

  //Display blood purity
  document.querySelector(
    "#blood-purity"
  ).textContent = `Blood purity: ${thisStudent.bloodPurity}`;

  //Display house and image
  document.querySelector(
    "#gender"
  ).textContent = `Gender: ${thisStudent.gender}`;
  document.querySelector("#house").textContent = `House: ${thisStudent.house}`;

  let imageElement = document.querySelector("#image");
  const imageFile = "./images/" + thisStudent.image;
  let img = new Image();
  img.onload = () => {
    imageElement.src = imageFile;
  };
  img.onerror = () => {
    imageElement.src = "./images/no_image.png";
  };
  img.src = imageFile;

  //Display responsibilities
  console.log(thisStudent.responsibility);
  if (thisStudent.responsibility === "None") {
    document.querySelector("#prefect").textContent = "Not set";
    document.querySelector("#inquisitor").textContent = "Not set";
    document.querySelector("#prefect-button").textContent =
      "Add responsibility";
    document.querySelector("#inquisitor-button").textContent =
      "Add responsibility";
  } else if (thisStudent.responsibility === "Both") {
    document.querySelector("#prefect").textContent = "Active";
    document.querySelector("#inquisitor").textContent = "Active";
    document.querySelector("#prefect-button").textContent =
      "Revoke responsibility";
    document.querySelector("#inquisitor-button").textContent =
      "Revoke responsibility";
  } else if (thisStudent.responsibility === "Prefect") {
    document.querySelector("#prefect").textContent = "Active";
    document.querySelector("#inquisitor").textContent = "Not set";
    document.querySelector("#prefect-button").textContent =
      "Revoke responsibility";
    document.querySelector("#inquisitor-button").textContent =
      "Add responsibility";
  } else if (thisStudent.responsibility === "Inquisitor") {
    document.querySelector("#prefect").textContent = "Not set";
    document.querySelector("#inquisitor").textContent = "Active";
    document.querySelector("#prefect-button").textContent =
      "Add responsibility";
    document.querySelector("#inquisitor-button").textContent =
      "Revoke responsibility";
  }
}

function createPrefect() {
  console.log("createPrefect");

  const house = thisStudent.house;
  const isPrefect = thisStudent.responsibility === "Prefect";

  let messege;

  if (thisStudent.responsibility === "Prefect") {
    thisStudent.responsibility = "None";
    messege = "Prefect privilige has been removed";
  } else if (thisStudent.responsibility === "Both") {
    thisStudent.responsibility = "Inquisitor";
    messege = "Prefect privilige has been removed";
  } else if (
    thisStudent.responsibility === "None" ||
    thisStudent.responsibility === "Inquisitor"
  ) {
    const allHouseStudents = allStudents.filter(filterHouse);
    const allResponsStudents = allHouseStudents.filter(filterRespons);

    if (allResponsStudents.length <= 2) {
      if (thisStudent.responsibility === "None") {
        thisStudent.responsibility = "Prefect";
      } else {
        thisStudent.responsibility = "Both";
      }
      messege = "Prefect privilige has been set";
    } else {
      messege =
        "Prefect cannot be set, remove existing prefects before adding new";
    }

    function filterRespons(student) {
      if (student.responsibility === "Prefect") {
        return true;
      }
      return false;
    }
  }

  function filterHouse(student) {
    if (student.house === house) {
      return true;
    }
    return false;
  }

  displayMessege(messege);
  displayPopUp();
}

function createInquisitor() {
  console.log("createInquisitor");

  let currentStudent = thisStudent;

  const isInquisitor = thisStudent.responsibility === "Inquisitor";
  const isBoth = thisStudent.responsibility === "Both";
  const blood = thisStudent.bloodPurity;
  const house = thisStudent.house;

  let messege;

  if (isInquisitor || isBoth) {
    if (isInquisitor) {
      thisStudent.responsibility = "None";
    } else {
      thisStudent.responsibility = "Prefect";
    }
    messege = "Inquisitor privilige has been removed";
  } else if (!isInquisitor) {
    if (blood === "Pure" || house === "Slytherin") {
      if (thisStudent.responsibility === "Prefect") {
        thisStudent.responsibility = "Both";
      } else {
        thisStudent.responsibility = "Inquisitor";
      }
      messege = "Inquisitor privilige has been set";

      if (hack) {
        const studentId = thisStudent.id;
        setTimeout(() => {
          const student = allStudents[studentId];
          if (student.responsibility !== "Both") {
            allStudents[studentId].responsibility = "None";
          } else {
            allStudents[studentId].responsibility = "Prefect";
          }
          messege = "Inquisitor has been removed";
          displayMessege(messege);
          if (document.querySelector("#popup").classList.contains("hidden")) {
            createList();
          } else {
            displayPopUp();
          }
        }, 5000);
      }
    } else {
      messege =
        "This student does not qualify to become inquisitor, only pureblood student or students of house Slytherin can be inquisitors";
    }
  }

  displayMessege(messege);
  displayPopUp();
}

function expellStudent() {
  console.log("expellStudent");

  if (thisStudent.firstName === "Sandie") {
  } else {
    thisStudent.status = "Expelled";
    thisStudent.house = "None";
    thisStudent.responsibility = "None";
  }

  console.log(thisStudent);
  displayPopUp(thisStudent);
}

function displayWarning() {
  document.querySelector("#messege-background").classList.remove("hidden");
  console.log("displayWarning");
  document.querySelector("#warning-messege").classList.remove("hidden");
  document.querySelector("#warning").textContent =
    "Are you sure you want to expell this student, once done this action CANNOT be undon!";
}

function displayMessege(messege, shake = false) {
  const messageBackground = document.querySelector("#user-messege");
  if (shake) {
    messageBackground.classList.add("shake");
    setTimeout(() => {
      messageBackground.classList.remove("shake");
    }, 1000);
  }
  document.querySelector("#messege-background").classList.remove("hidden");
  messageBackground.classList.remove("hidden");
  document.querySelector("#messege").textContent = messege;
}

function hackHogwarts() {
  console.log("hack Hogwarts");
  hack = true;

  createMe();
  mixBlood();
  removeInquisitor();
  createList();
}

function createMe() {
  console.log("Create me");
  const student = Object.create(Student);

  student.id = allStudents.length;
  student.firstName = "Sandie";
  student.middleName = "Neander";
  student.lastName = "Petersen";
  student.nickName = "";
  student.gender = "Girl";
  student.bloodPurity = "Muggle";
  student.house = "Gryffindor";
  student.responsibility = "None";
  student.status = "Active";

  allStudents.push(student);
}

function mixBlood() {
  console.log("mixBlood");
  const bloodArray = ["Half pure", "Muggle"];

  allStudents.forEach((student) => {
    if (student.bloodPurity === "Pure") {
      student.bloodPurity =
        bloodArray[Math.floor(Math.random() * bloodArray.length)];
    } else {
      student.bloodPurity = "Pure";
    }
  });
}

function removeInquisitor() {
  allStudents.forEach((student) => {
    if (student.responsibility === "Inquisitor") {
      student.responsibility = "None";
    } else if (student.responsibility === "Both") {
      student.responsibility = "Prefect";
    }
  });
}

//Function calculating the firstname
function calculateFirstName(fullName) {
  const firstname = fullName.substring(0, fullName.indexOf(" "));
  return firstname;
}

//Function calculating the middlename
function calculateMiddleName(fullName) {
  const middlename = fullName.substring(
    fullName.indexOf(" ") + 1,
    fullName.lastIndexOf(" ")
  );

  if (middlename.includes('"')) {
    return "";
  } else {
    return middlename;
  }
}

//function calculating the lastname
function calculateLastName(fullName) {
  const lastname = fullName.substring(fullName.lastIndexOf(" ") + 1);
  return lastname;
}

//function calculating the nickname
function calculateNickName(fullName) {
  const nickname = fullName.substring(
    fullName.indexOf('"') + 1,
    fullName.lastIndexOf('"')
  );
  return nickname;
}

function calculateCapitalize(name) {
  const sub1 = name.substring(0, 1);
  const sub2 = name.substring(1);

  return sub1.toUpperCase() + sub2.toLowerCase();
}

//Name includes
function nameIncludes(student) {
  if (
    student.firstName.toLowerCase().includes(settings.seachFor.toLowerCase()) ||
    student.middleName
      .toLowerCase()
      .includes(settings.seachFor.toLowerCase()) ||
    student.lastName.toLowerCase().includes(settings.seachFor.toLowerCase())
  ) {
    return true;
  }
  return false;
}

//Filter all
function filterAll(student) {
  return true;
}

//Filter Gryffindor
function filterGryffindor(student) {
  if (student.house === "Gryffindor") {
    return true;
  }
  return false;
}

//Filter Ravenclaw
function filterRavenclaw(student) {
  if (student.house === "Ravenclaw") {
    return true;
  }
  return false;
}

//Filter Hufflepuff
function filterHufflepuff(student) {
  if (student.house === "Hufflepuff") {
    return true;
  }
  return false;
}

//Filter Slytherin
function filterSlytherin(student) {
  if (student.house === "Slytherin") {
    return true;
  }
  return false;
}

//FilterBlood
function filterPureBlood(student) {
  if (student.bloodPurity === "Pure") {
    return true;
  }
  return false;
}

function filterHalfBlood(student) {
  if (student.bloodPurity === "Half pure") {
    return true;
  }
  return false;
}

function filterMuggleBlood(student) {
  if (student.bloodPurity === "Muggle") {
    return true;
  }
  return false;
}

function filterPrefect(student) {
  if (student.responsibility === "Prefect") {
    return true;
  }
  return false;
}

function filterInquisitor(student) {
  if (student.responsibility === "Inquisitor") {
    return true;
  }
  return false;
}

function filterActive(student) {
  if (student.status === "Active") {
    return true;
  }
  return false;
}

function filterExpelled(student) {
  if (student.status === "Expelled") {
    return true;
  }
  return false;
}

//check status for responsibility
function calculateResponsibilityStatus(respons, param) {
  if (respons === param) {
    return true;
  }
  return false;
}

//
function checkLastnameDuplicate(lastname) {
  return (
    allStudents.filter((student) => student.lastName === lastname).length > 1
  );
}

//
function imageFirstname(lastname, firstname) {
  return `${lastname.toLowerCase()}_${firstname.toLowerCase()}.png`;
}

function imageFirstLetter(lastname, firstname) {
  const sub = firstname.substring(0, 1);

  return `${lastname.toLowerCase()}_${sub.toLowerCase()}.png`;
}
