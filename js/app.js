// Sets up variables to keep track of employee value and what's being shown
const numberOfEmployees = 12;
const employeesContainer = document.getElementById('employees');
const employeeModalBackground = document.getElementById('container--modal');
const employeeModalContainer = document.getElementById('employee--modal');
let employeesList = document.getElementsByClassName("employee");
let employeeArray = [];
// Modal variables
let modalIsActive = false;
let currentEmployeeShown;
let nextEmployee;
let lastEmployee;
// Filtering variables
let searchResultNumber;
let searchResultsArray = [];
let maxlength;

// Helper function to capitalize strings of employee information
function capitalize(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
     splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
}

// Function to make the AJAX request
function makeRequest (method, url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.onload = function () {
     if (this.status >= 200 && this.status < 300) {
       resolve(xhr.response)
     } else {
       reject({status: this.status, statusText: xhr.statusText })
     }
    }
    xhr.onerror = function () {
     reject({ status: this.status, statusText: xhr.statusText });
    }
    xhr.send()
  })
}

// Actually making the AJAX request with variable # of employees
makeRequest('GET', 'https://randomuser.me/api/?nat=us&results=' + numberOfEmployees)
 .then(parse)
 .catch(function (response) {
   alert('Something went wrong')
});

// Parses the results and builds each employee container
function parse(results) {
  var results = JSON.parse(results)
  employeeArray = results.results;
  buildFullHtml();
}

// Builds HTML of the employees
function buildFullHtml() {
  let pageHTML = '';
  employeeArray.forEach((user, index) => {
    capitalizeUserElements(user);
    let employeeHTML = `<div class="employee" onclick="showEmployee(${index})">` +
     `<img src="${user.picture.large}" class="employee__photo">` +
     `<div class="employee__info">` +
       `<h2 class="employee__name">${user.name.first} ${user.name.last}</h2>` +
       `<p class="employee__email">${user.email}<br/>${user.location.city}</p>` +
     `</div></div>`;
    pageHTML += employeeHTML;
  });
  employeesContainer.innerHTML = pageHTML;
}

// Capitalizes relevant employee information
function capitalizeUserElements(user) {
  user.name.first = capitalize(user.name.first);
  user.name.last = capitalize(user.name.last);
  user.location.street = capitalize(user.location.street);
  user.location.city = capitalize(user.location.city);
  user.location.state = capitalize(user.location.state);
}

// Displays the Employee modal
function showEmployee(index){
  // Sets global tracking variables
  modalIsActive = true;
  currentEmployeeShown = index;
  lastEmployee = index - 1;
  nextEmployee = index + 1;
  employeeModalBackground.style.display = "block";
  employeeModalContainer.style.display = "block";
  // Sets up the appropriate array (search or default) and variables
  let user;
  if (searchResultNumber > 0) {
    user = searchResultsArray[index];
    maxlength = searchResultNumber - 1;
  } else {
    user = employeeArray[index];
    maxlength = employeeArray.length - 1;
  }
  // Sets up user
  let birthday = cleanUpDOB(user.dob);
  let employeeModalHTML = `<a class="close-modal" onclick="closeModal()"><img src="assets/close.png"></a>`;
  // Add left arrow if employee is not the first
  if (index > 0) {
    employeeModalHTML += `<a class="left-arrow" onclick="showEmployee(${lastEmployee})">☺<br/>←</a>`
  };
  // Build HTML text
  employeeModalHTML += `<img src="${user.picture.large}" class="employee__photo--modal">` +
    `<h2 class="employee__name">${user.name.first} ${user.name.last}</h2>` +
    `<p class="employee__email">@${user.login.username}<br/>${user.email}<br/>${user.location.city}</p>` +
    `<hr>` +
    `<p class="employee__cellnumber">${user.phone}</p>` +
    `<p class="employee__address">${user.location.street}<br/>${user.location.city}, ${user.location.state} ${user.location.postcode}</p>` +
    `<p class="employee__birthday">${birthday}</p>`;
  // Add right arrow if employee is not the last
  if (index < maxlength) {
   employeeModalHTML += `<a class="right-arrow" onclick="showEmployee(${nextEmployee})">☺<br/>→</a>`
  };
  employeeModalContainer.innerHTML = employeeModalHTML;
};

// Cleans and organizes birthday value
function cleanUpDOB(dob) {
  let newDOB = "Birthday: ";
  let month = dob.slice(5,7);
  let day = dob.slice(8,10);
  let year = dob.substr(0, 4);
  newDOB += `${month}/${day}/${year}`;
  return newDOB;
}

// Allows user to use the left and right arrows to key between employees
document.onkeydown = function(e) {
  if (modalIsActive) {
    e = e || window.event;
    if (e.keyCode == '37' && currentEmployeeShown != 0) {
       showEmployee(lastEmployee)
    }
    else if (e.keyCode == '39' && currentEmployeeShown != (maxlength)) {
      showEmployee(nextEmployee)
    }
  }
}

// Closes modal
function closeModal(){
  employeeModalBackground.style.display = "none";
  employeeModalContainer.style.display = "none";
  modalIsActive = false;
};

function filterResults() {
  // Resets results
  buildFullHtml()

  // Stores search input and clears box
  let searchInput = document.getElementById("filter").value;

  // Translate filter to lowercase for comparison
  let filter = searchInput.toLowerCase();
  // set up "no results" scenario
  let noResults = '<div class="loading">No results</div>';

  // resets number of results to 0
  searchResultsArray = [];
  searchResultNumber = 0;

  // Loop through all list items, and hide those who don't match the search query
  employeeArray.forEach((user, index) => {
    firstName = user.name.first.toLowerCase();
    lastName = user.name.last.toLowerCase();
    username = user.login.username.toLowerCase();
    if (firstName.indexOf(filter) > -1 || lastName.indexOf(filter) > -1 || username.indexOf(filter) > -1) {
        employeesList[index].classList.remove("hidden");
        searchResultsArray.push(user);
        employeesList[index].setAttribute("onclick", `showEmployee(${searchResultNumber})`);
        searchResultNumber += 1;
    } else {
        employeesList[index].classList.add("hidden");
    };
  });

  // if there's no results
  if (searchResultNumber === 0) {
    employeesContainer.innerHTML = noResults;
  };

};
