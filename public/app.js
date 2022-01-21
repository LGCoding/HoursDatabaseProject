//elements O = html element
let fnameO,
  lnameO,
  submitO,
  formO,
  basicFormDropInput,
  adminFormDropInput,
  reportFormDropInput,
  basicDropDown,
  adminDropDown,
  reportDropDown,
  adminBO,
  reportBO,
  reportDivO,
  reportTypes,
  minDateInput,
  maxDateInput,
  title,
  projectsO,
  extendBO,
  projectsAO,
  extendBAO,
  projectsPO,
  extendBPO,
  hoursB3O,
  dayB3O,
  submitBO,
  dateB2OMin,
  dateB2OMax,
  pnameAO,
  dateBAOMax,
  dateBAOMin,
  nameABO,
  pnamePO,
  namePBO,
  activateO,
  deleteAO,
  submitABO,
  adminBlock3,
  formUserO,
  block1O,
  block2O,
  adminFormO,
  adminBlock1O,
  adminBlock2O,
  personFormO,
  personBlock1O,
  personBlock2O,
  reportsO,
  deleteHourO,
  deleteProjectO,
  toggleProjectActiveO,
  deletePersonO,
  togglePersonActiveO;

//varables
let isoffDrop = true;
let prC = [];
let nameT = [];
let lastPrC = 0;
let prCA = [];
let lastPrCA = 0;
let prCP = [];
let lastPrCP = 0;
const maxDisp = 2;
let preP = false;
let preI, preMin, preMax;
let cEditPid;
let ctx;
let myChart;
let dataG = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "# of hours",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      hoverBackgroundColor: [],
      borderWidth: 1,
    },
  ],
};
let type = "bar";
let showTips = false;
let hoursDone;
let currentEdit;
let projects;

let userName, role, id, token;

window.onload = () => {
  //get elements
  fnameO = document.getElementById("fname");
  lnameO = document.getElementById("lname");
  basicFormDropInput = document.getElementById("basicFormDropInput");
  adminFormDropInput = document.getElementById("adminFormDropInput");
  reportFormDropInput = document.getElementById("reportFormDropInput");

  formUserO = document.getElementById("formUser");
  block1O = document.getElementById("block1");
  block2O = document.getElementById("block2");

  adminFormO = document.getElementById("adminForm");
  adminBlock1O = document.getElementById("adminBlock1");
  adminBlock2O = document.getElementById("adminBlock2");

  personFormO = document.getElementById("personForm");
  personBlock1O = document.getElementById("personBlock1");
  personBlock2O = document.getElementById("personBlock2");

  reportsO = document.getElementById("Reports");

  deleteHourO = document.getElementById("deleteHour");
  deleteHourO.addEventListener("click", deleteHour);
  deleteProjectO = document.getElementById("deleteProject");
  toggleProjectActiveO = document.getElementById("toggleProjectActive");
  toggleProjectActiveO.addEventListener("click", toggleProject);
  deleteProjectO.addEventListener("click", deleteProject);
  deletePersonO = document.getElementById("deletePerson");
  deletePersonO.addEventListener("click", deletePerson);
  togglePersonActiveO = document.getElementById("togglePersonActive");
  togglePersonActiveO.addEventListener("click", togglePerson);

  basicDropDown = document.getElementById("basicDropDown");
  adminDropDown = document.getElementById("adminDropDown");
  reportDropDown = document.getElementById("reportDropDown");
  minDateInput = document.getElementById("minDateInput");
  maxDateInput = document.getElementById("maxDateInput");
  adminBO = document.getElementById("adminB");
  reportBO = document.getElementById("reportB");
  reportTypes = document.getElementById("reportTypes");
  title = document.getElementById("title");
  projectsO = document.getElementById("projects");
  extendBO = document.getElementById("extend");
  projectsAO = document.getElementById("projectsA");
  extendBAO = document.getElementById("extendA");
  projectsPO = document.getElementById("projectsP");
  extendBPO = document.getElementById("extendP");
  hoursB3O = document.getElementById("hoursB3");
  dayB3O = document.getElementById("dayB3");
  submitBO = document.getElementById("submitB");
  dateB2OMax = document.getElementById("dateB2Max");
  dateB2OMin = document.getElementById("dateB2Min");
  pnameAO = document.getElementById("pnameAB");
  dateBAOMax = document.getElementById("dateABMax");
  dateBAOMin = document.getElementById("dateABMin");
  nameABO = document.getElementById("nameAB");
  pnamePO = document.getElementById("pnamePB");
  namePBO = document.getElementById("namePB");
  activateO = document.getElementById("activate");
  deleteAO = document.getElementById("deleteA");
  submitABO = document.getElementById("submitAB");
  adminBlock3 = document.getElementById("adminBlock3");

  document.getElementById("projectNewSubmit").onclick = addProject;
  document.getElementById("personNewSubmit").onclick = addPerson;
  document.getElementById("hourNewSubmit").onclick = addHour;

  let tempToken = sessionStorage.getItem("token");
  token = tempToken ? tempToken : "";
  if (token) {
    userName = sessionStorage.getItem("userName");
    role = sessionStorage.getItem("role");
    id = sessionStorage.getItem("userId");
    adminFormDropInput.value = userName;
    if (role < 0) {
      adminFormDropInput.disabled = true;
    }

    document.getElementById("loginOuterDiv").style.display = "none";
    runInitStuff();
  }
};

function addProject() {
  if (deleteProjectO.style.display !== "block") {
    cFetch(
      "projects/" + id,
      {
        name: document.getElementById("projectNameInput").value,
        comment: document.getElementById("commentAdmin").innerHTML
          ? document.getElementById("commentAdmin").innerHTML
          : undefined,
        startDate: document.getElementById("sday").value
          ? new Date(document.getElementById("sday").value)
          : undefined,
        endDate: document.getElementById("eday").value
          ? new Date(document.getElementById("eday").value)
          : undefined,
      },
      "POST"
    )
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 201) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        console.log(response.json);
      })
      .catch((err) => {
        makePopup(err.message);
      });
  } else {
    let pId = "";
    for (let i in projects) {
      if (
        projects[i].name === document.getElementById("projectNameInput").value
      ) {
        pId = projects[i]._id;
      }
    }
    cFetch(
      "projects/" + id + "/" + pId,
      {
        name: document.getElementById("projectNameInput").value,
        comment: document.getElementById("commentAdmin").innerHTML
          ? document.getElementById("commentAdmin").innerHTML
          : undefined,
        startDate: document.getElementById("sday").value
          ? new Date(document.getElementById("sday").value)
          : undefined,
        endDate: document.getElementById("eday").value
          ? new Date(document.getElementById("eday").value)
          : undefined,
      },
      "PUT"
    )
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 201) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        console.log(response.json);
      })
      .catch((err) => {
        makePopup(err.message);
      });
  }
  setTimeout(function () {
    getProjects();
    console.log(projects);
  }, 1000);
  homeSwitch();
}

function deleteProject() {
  let pId = "";
  for (let i in projects) {
    if (
      projects[i].name === document.getElementById("projectNameInput").value
    ) {
      pId = projects[i]._id;
    }
  }
  console.log(pId);
  cFetch("projects/" + id + "/" + pId, {}, "DELETE")
    .then((r) =>
      r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
    )
    .then((response) => {
      if (!response.ok || response.status !== 201) {
        console.log(response.ok, response.status);
        throw new Error(response.json.message);
      }
      console.log(response.json);
    })
    .catch((err) => {
      makePopupmakePopup(err.message);
    });

  setTimeout(function () {
    getProjects();
    console.log(projects);
  }, 1000);

  homeSwitch(document.getElementById("homeB"));
}

function toggleProject() {
  let pId = "";
  let pActive = "";
  for (let i in projects) {
    if (
      projects[i].name === document.getElementById("projectNameInput").value
    ) {
      pId = projects[i]._id;
      pActive = projects[i].isActive;
    }
  }
  cFetch(
    "projects/" + id + "/" + pId,
    {
      isActive: !pActive,
    },
    "PUT"
  )
    .then((r) =>
      r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
    )
    .then((response) => {
      if (!response.ok || response.status !== 201) {
        console.log(response.ok, response.status);
        throw new Error(response.json.message);
      }
      console.log(response.json);
    })
    .catch((err) => {
      makePopup(err.message);
    });

  setTimeout(function () {
    getProjects();
    console.log(projects);
  }, 1000);
  homeSwitch();
}

function addHour() {
  let cId = "";
  for (let i in names) {
    if (names[i].name === document.getElementById("adminFormDropInput").value) {
      cId = names[i].id;
    }
  }
  let pId = "";
  for (let i in projects) {
    if (
      projects[i].name === document.getElementById("basicFormDropInput").value
    ) {
      pId = projects[i]._id;
    }
  }
  if (deleteHourO.style.display !== "block") {
    cFetch(
      "projects/" + id + "/" + cId + "/" + pId,
      {
        date: new Date(document.getElementById("day").value),
        hours: parseFloat(document.getElementById("hours").value),
        comment: document.getElementById("comment").innerHTML,
      },
      "POST"
    )
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 201) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        console.log(response.json);
      })
      .catch((err) => {
        makePopup(err.message);
      });
  } else {
    cFetch(
      "projects/" + id + "/" + pId + "/" + currentEdit,
      {
        date: new Date(document.getElementById("day").value),
        hours: parseFloat(document.getElementById("hours").value),
        comment: document.getElementById("comment").innerHTML,
      },
      "PUT"
    )
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 201) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
      })
      .catch((err) => {
        makePopup(err.message);
      });
  }
  setTimeout(function () {
    getNames();
    console.log(names);
  }, 1000);
  homeSwitch();
}

function deleteHour() {
  let cId = "";
  for (let i in names) {
    if (names[i].name === document.getElementById("adminFormDropInput").value) {
      cId = names[i].id;
    }
  }
  let pId = "";
  for (let i in projects) {
    if (
      projects[i].name === document.getElementById("basicFormDropInput").value
    ) {
      pId = projects[i]._id;
    }
  }
  cFetch(
    "projects/" + id + "/" + cId + "/" + pId + "/" + currentEdit,
    {
      date: document.getElementById("day").value,
      hours: document.getElementById("hours").value,
      comment: document.getElementById("comment").innerHTML,
    },
    "DELETE"
  )
    .then((r) =>
      r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
    )
    .then((response) => {
      if (!response.ok || response.status !== 201) {
        console.log(response.ok, response.status);
        throw new Error(response.json.message);
      }
      console.log(response.json);
    })
    .catch((err) => {
      makePopup(err.message);
    });
  homeSwitch(document.getElementById("homeB"));
  setTimeout(function () {
    getNames();
    console.log(names);
  }, 1000);
}

function addPerson() {
  if (deletePersonO.style.display !== "block") {
    cFetch(
      "users/" + id,
      {
        name: document.getElementById("personNameInput").value,
        email: document.getElementById("personEmailInput").value,
        role: parseInt(document.getElementById("permissionValue").value),
        memberType: parseInt(
          document.getElementById("memberType2").getAttribute("v")
        ),
        password: document.getElementById("personPassInput").value
          ? document.getElementById("personPassInput").value
          : "PleaseChange.1",
      },
      "POST"
    )
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 201) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        console.log(response.json);
      })
      .catch((err) => {
        makePopup(err.message);
      });
  } else {
    let cId = "";
    for (let i in names) {
      if (names[i].name === document.getElementById("personNameInput").value) {
        cId = names[i].id;
      }
    }
    if (document.getElementById("personPassInput").value) {
      cFetch(
        "users/" + id + "/" + cId,
        {
          name: document.getElementById("personNameInput").value,
          email: document.getElementById("personEmailInput").value,
          role: parseInt(document.getElementById("permissionValue").value),
          memberType: parseInt(
            document.getElementById("memberType2").getAttribute("v")
          ),
          password: document.getElementById("personPassInput").value,
        },
        "PUT"
      )
        .then((r) =>
          r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
        )
        .then((response) => {
          if (!response.ok || response.status !== 201) {
            console.log(response.ok, response.status);
            throw new Error(response.json.message);
          }
          console.log(response.json);
        })
        .catch((err) => {
          makePopup(err.message);
        });
    } else {
      cFetch(
        "users/" + id + "/" + cEditPid,
        {
          name: document.getElementById("personNameInput").value,
          email: document.getElementById("personEmailInput").value,
          role: parseInt(document.getElementById("permissionValue").value),
          memberType: parseInt(
            document.getElementById("memberType2").getAttribute("v")
          ),
        },
        "PUT"
      )
        .then((r) =>
          r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
        )
        .then((response) => {
          if (!response.ok || response.status !== 201) {
            console.log(response.ok, response.status);
            throw new Error(response.json.message);
          }
          console.log(response.json);
        })
        .catch((err) => {
          makePopup(err.message);
        });
    }
  }
  setTimeout(function () {
    getNames();
    console.log(names);
  }, 1000);
  homeSwitch();
}

function togglePerson() {
  let cId = "";
  let cActive = "";
  for (let i in names) {
    if (names[i].name === document.getElementById("personNameInput").value) {
      cId = names[i].id;
      cActive = names[i].isActive;
    }
  }
  cFetch(
    "users/" + id + "/" + cId,
    {
      isActive: !cActive,
    },
    "PUT"
  )
    .then((r) =>
      r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
    )
    .then((response) => {
      if (!response.ok || response.status !== 201) {
        console.log(response.ok, response.status);
        throw new Error(response.json.message);
      }
      console.log(response.json);
    })
    .catch((err) => {
      makePopup(err.message);
    });

  setTimeout(function () {
    getNames();
    console.log(names);
  }, 1000);
  homeSwitch();
}

function deletePerson() {
  let cId = "";
  let cActive = "";
  for (let i in names) {
    if (names[i].name === document.getElementById("personNameInput").value) {
      cId = names[i].id;
    }
  }
  cFetch("users/" + id + "/" + cId, {}, "DELETE")
    .then((r) =>
      r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
    )
    .then((response) => {
      if (!response.ok || response.status !== 201) {
        console.log(response.ok, response.status);
        throw new Error(response.json.message);
      }
      console.log(response.json);
    })
    .catch((err) => {
      makePopup(err.message);
    });

  setTimeout(function () {
    getNames();
    console.log(names);
  }, 1000);
  homeSwitch(document.getElementById("homeB"));
}

function runInitStuff() {
  if (role === 0) {
    document.getElementById("adminB").style.visibility = "hidden";
    document.getElementById("adminCB").style.visibility = "hidden";
    document.getElementById("addPB").style.visibility = "hidden";
    document.getElementById("editPB").style.visibility = "hidden";
  }
  Chart.pluginService.register({
    beforeRender: function (chart) {
      if (chart.config.options.showAllTooltips) {
        // create an array of tooltips
        // we can't use the chart tooltip because there is only one tooltip per chart
        chart.pluginTooltips = [];
        chart.config.data.datasets.forEach(function (dataset, i) {
          chart.getDatasetMeta(i).data.forEach(function (sector, j) {
            chart.pluginTooltips.push(
              new Chart.Tooltip(
                {
                  _chart: chart.chart,
                  _chartInstance: chart,
                  _data: chart.data,
                  _options: chart.options.tooltips,
                  _active: [sector],
                },
                chart
              )
            );
          });
        });

        // turn off normal tooltips
        chart.options.tooltips.enabled = false;
      }
    },
    afterDraw: function (chart, easing) {
      if (chart.config.options.showAllTooltips) {
        // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
        if (!chart.allTooltipsOnce) {
          if (easing !== 1) return;
          chart.allTooltipsOnce = true;
        }

        // turn on tooltips
        chart.options.tooltips.enabled = true;
        Chart.helpers.each(chart.pluginTooltips, function (tooltip) {
          tooltip.initialize();
          tooltip.update();
          // we don't actually need this since we are not animating tooltips
          tooltip.pivot();
          tooltip.transition(easing).draw();
        });
        chart.options.tooltips.enabled = false;
      }
    },
  });

  let qParts = location.search.substring(1).split("&");
  if (qParts[0].substring(0, 5) === "chart") {
    document.body.innerHTML =
      "<canvas style='width:100%,height:100%' id='reportArea'></canvas>";
    ctx = document.getElementById("reportArea").getContext("2d");
    myChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "First dataset",
            data: [
              {
                x: new Date(2020, 1, 1),
                y: 1,
              },
              {
                t: new Date(2020, 4, 1),
                y: 3,
              },
              {
                t: new Date(2020, 7, 1),
                y: 5,
              },
              {
                t: new Date(2020, 10, 1),
                y: 7,
              },
            ],
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: "time",
            time: {
              unit: "month",
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
    preP = qParts[2].substring(4);
    preI = qParts[3].substring(6);
    preMin = qParts[4].substring(4);
    preMax = qParts[5].substring(4);

    changeReport(qParts[0].substring(6), qParts[1].substring(4));
    return;
  }

  ctx = document.getElementById("reportArea").getContext("2d");
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "First dataset",
          data: [
            {
              x: new Date(2020, 1, 1),
              y: 1,
            },
            {
              t: new Date(2020, 4, 1),
              y: 3,
            },
            {
              t: new Date(2020, 7, 1),
              y: 5,
            },
            {
              t: new Date(2020, 10, 1),
              y: 7,
            },
          ],
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "time",
          time: {
            unit: "month",
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  //get data
  getNames();
}

function doOtherInitStuff() {
  document.getElementById("day").value = new Date().toDateInputValue();
  //event listeners
  formUserO.onsubmit = submit;
  reportTypes.onchange = changeReport;
  window.onresize = resize;
  adminFormDropInput.onchange = updatePerson;
  extendBO.onclick = extend;
  extendBAO.onclick = extendA;
  extendBPO.onclick = extendP;

  changeReport();
  resize();
  reportsO.style.display = "none";
  updatePerson();
  updatePersonA();
  updatePersonP();
  if (role === "0") {
    adminFormDropInput.value = userName;
    adminFormDropInput.disabled = true;
  }
}

function extend() {
  let templastPrC = lastPrC;
  for (let i = lastPrC; i < prC.length && i < maxDisp + lastPrC; i++) {
    if (check2(prC[i].date)) continue;
    let div = document.createElement("div");
    div.className = "projectO";
    let b = prC[i].date.split(/\D/);
    let id = getRandomArbitrary(-100000, 100000);
    div.innerHTML = `<input onclick="edit(this)" id="${id}" name="ex" value="${
      nameT[i]
    }" type='radio'><label for=${id} class='namedB2'>${
      prC[i].name
    }</label><label for=${id}>:</label>
                    
                    <label for=${id}>Hours:</label> <label for=${id} class='hoursdB2'>${
      prC[i].hours
    }</label>;
                    <label for=${id}>Date:</label> <label for=${id} class='datedB2'>${
      b[1] + "/" + b[2] + "/" + b[0]
    }</label>`;
    projectsO.appendChild(div);
    templastPrC++;
  }
  lastPrC = templastPrC;
  if (document.getElementById("...Projec"))
    document.getElementById("...Projec").remove();
  if (lastPrC < prC.length) {
    let div = document.createElement("div");
    div.className = "projectO";
    div.id = "...Projec";
    div.innerHTML = `...`;
    projectsO.appendChild(div);
  }
}

function updatePerson() {
  lastPrC = 0;
  projectsO.innerHTML = "";
  cFetch("projects/user/" + id, undefined, "GET")
    .then((r) =>
      r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
    )
    .then((response) => {
      if (!response.ok || response.status !== 200) {
        throw new Error(response.json.message);
      }
      hoursDone = response.json;
      if (!hoursDone) return;
      prC = [];
      nameT = [];
      for (let i in hoursDone) {
        if (check2(hoursDone[i].date)) continue;
        nameT.push(i);
        prC.push(hoursDone[i]);
      }
      prC.sort((a, b) => new Date(b.date) - new Date(a.date));
      nameT.sort(
        (a, b) => new Date(hoursDone[b].date) - new Date(hoursDone[a].date)
      );
      for (let i = 0; i < prC.length && i < maxDisp; i++) {
        let div = document.createElement("div");
        div.className = "projectO";
        let id = getRandomArbitrary(-100000, 100000);
        let b = prC[i].date.split(/\D/);
        div.innerHTML = `<input onclick="edit(this)" id="${id}" name="ex" value="${
          nameT[i]
        }" type='radio'><label for=${id} class='namedB2'>${
          prC[i].name
        }</label><label for=${id}>:</label>
                    
                    <label for=${id}>Hours:</label> <label for=${id} class='hoursdB2'>${
          prC[i].hours
        }</label>;
                    <label for=${id}>Date:</label> <label for=${id} class='datedB2'>${
          b[1] + "/" + b[2] + "/" + b[0]
        }</label>`;
        projectsO.appendChild(div);
        lastPrC++;
      }

      if (lastPrC < prC.length) {
        let div = document.createElement("div");
        div.className = "projectO";
        div.id = "...Projec";
        div.innerHTML = `...`;
        projectsO.appendChild(div);
      }
    })
    .catch((err) => {
      makePopup(err.message);
    });
}

function edit(e) {
  let ele = document.getElementsByName("ex");
  for (let i = 0; i < ele.length; i++) ele[i].checked = false;
  formUserO.style.display = "block";
  block1O.style.display = "block";
  block2O.style.display = "none";
  deleteHourO.style.display = "block";
  document.getElementById("day").value = hoursDone[e.value].date;
  document.getElementById("hours").value = hoursDone[e.value].hours;
  document.getElementById("comment").innerHTML = hoursDone[e.value].comment;
  document.getElementById("basicFormDropInput").value = hoursDone[e.value].name;
  console.log(e.value, hoursDone[e.value].name);
  currentEdit = e.value;
  adminFormDropInput.disabled = true;
  basicFormDropInput.disabled = true;
}

function extendA() {
  let templastPrC = lastPrCA;
  for (let i = lastPrCA; i < prCA.length && i < maxDisp + lastPrCA; i++) {
    let div = document.createElement("div");
    div.className = "projectO";
    let b = new Date(prCA[i].startDate);
    console.log(b);
    let id = getRandomArbitrary(-100000, 100000);
    div.innerHTML = `<input onclick="editA(this)" id="${id}" name="projectsSelect" value="${
      prCA[i].name
    }" type='radio'><label for="${id}" class='namedB2, ${
      prCA[i].isActive ? "black" : "red"
    }'>${prCA[i].name}</label>:
                    <label for="${id}">Date:</label> <label for="${id}" class='datedB2'>${b.toLocaleDateString(
      "en-US"
    )}</label>`;
    console.log(div);
    projectsAO.appendChild(div);
    templastPrC++;
  }
  lastPrCA = templastPrC;
  if (document.getElementById("...Projects"))
    document.getElementById("...Projects").remove();
  if (lastPrCA < prCA.length) {
    let div = document.createElement("div");
    div.className = "projectO";
    div.id = "...Projects";
    div.innerHTML = `...`;
    projectsAO.appendChild(div);
  }
}

function updatePersonA() {
  lastPrCA = 0;
  projectsAO.innerHTML = "";
  prCA = [];
  for (let i in projects) {
    if (projects[i].name.includes(pnameAO.value)) {
      prCA.push(projects[i]);
    }
  }
  prCA.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

  for (let i = 0; i < prCA.length && i < maxDisp; i++) {
    let div = document.createElement("div");
    div.className = "projectO";
    let b = new Date(prCA[i].startDate);

    let id = getRandomArbitrary(-100000, 100000);
    div.innerHTML = `<input onclick="editA(this)" id="${id}" name="projectsSelect" value="${
      prCA[i].name
    }" type='radio'><label for="${id}" class='namedB2, ${
      prCA[i].isActive ? "black" : "red"
    }'>${prCA[i].name}</label>:
                    <label for="${id}">Date:</label> <label for="${id}" class='datedB2'>${b.toLocaleDateString(
      "en-US"
    )}</label>`;
    projectsAO.appendChild(div);
    lastPrCA++;
  }
  if (lastPrCA < prCA.length) {
    let div = document.createElement("div");
    div.className = "projectO";
    div.id = "...Projects";
    div.innerHTML = `...`;
    projectsAO.appendChild(div);
  }
}

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

function editA(e) {
  let ele = document.getElementsByName("projectsSelect");
  for (let i = 0; i < ele.length; i++) ele[i].checked = false;
  adminFormO.style.display = "block";
  adminBlock1O.style.display = "block";
  adminBlock2O.style.display = "none";
  deleteProjectO.style.display = "block";
  toggleProjectActiveO.style.display = "block";
  console.log(projects);

  let somthing;
  for (let i in projects) {
    if (projects[i].name === e.value) somthing = i;
  }
  document.getElementById("projectNameInput").value = projects[somthing].name;
  document.getElementById("sday").value = formatDate(
    new Date(projects[somthing].startDate)
  );
  document.getElementById("eday").value = formatDate(
    new Date(projects[somthing].enduhhDate)
  );
  document.getElementById("commentAdmin").innerHTML =
    projects[somthing].comment;
}

function extendP() {
  let templastPrC = lastPrCP;
  for (let i = lastPrCP; i < prCP.length && i < maxDisp + lastPrCP; i++) {
    let div = document.createElement("div");
    div.className = "projectO";
    let id = getRandomArbitrary(-100000, 100000);
    div.innerHTML = `<input onclick="editP(this)" id="${id}" name="projectSelect" value="${
      prCP[i].name
    }" type='radio'><span for="${id}" class='namedB2, ${
      prCP[i].isActive ? "black" : "red"
    }'>${prCP[i].name}</span>`;
    projectsPO.appendChild(div);
    templastPrC++;
  }
  lastPrCP = templastPrC;
  if (document.getElementById("...Project"))
    document.getElementById("...Project").remove();
  if (lastPrCP < prCP.length) {
    let div = document.createElement("div");
    div.className = "projectO";
    div.id = "...Project";
    div.innerHTML = `...`;
    projectsPO.appendChild(div);
  }
}

function updatePersonP() {
  lastPrCP = 0;
  projectsPO.innerHTML = "";
  prCP = [];
  for (let i in names) {
    if (names[i].name.includes(pnamePO.value)) {
      prCP.push(names[i]);
    }
  }
  prCP.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
  for (let i = 0; i < prCP.length && i < maxDisp; i++) {
    let div = document.createElement("div");
    div.className = "projectO";
    let id = getRandomArbitrary(-100000, 100000);
    div.innerHTML = `<input onclick="editP(this)" id="${id}" name="projectSelect" value="${
      prCP[i].name
    }" type='radio'><label for="${id}" class='namedB2, ${
      prCP[i].isActive ? "black" : "red"
    }'>${prCP[i].name}</label>`;
    projectsPO.appendChild(div);
    lastPrCP++;
  }
  if (lastPrCP < prCP.length) {
    let div = document.createElement("div");
    div.className = "projectO";
    div.id = "...Project";
    div.innerHTML = `...`;
    projectsPO.appendChild(div);
  }
}

function editP(e) {
  let ele = document.getElementsByName("projectSelect");
  for (let i = 0; i < ele.length; i++) ele[i].checked = false;
  personFormO.style.display = "block";
  personBlock1O.style.display = "block";
  personBlock2O.style.display = "none";
  deletePersonO.style.display = "block";
  togglePersonActiveO.style.display = "block";

  let somthing;
  for (let i in names) {
    if (names[i].name === e.value) somthing = i;
  }
  console.log(names[somthing]);
  cEditPid = names[somthing].id;
  document.getElementById("personNameInput").value = names[somthing].name;
  document.getElementById("personEmailInput").value = names[somthing].email;
  document.getElementById("permissionValue").value = names[somthing].role;
  console.log(names[somthing].memberType);
  switch (names[somthing].memberType) {
    case 0:
      document.getElementById("memberType2").setAttribute("v", "0");
      document.getElementById("logButton2").innerHTML = "Club Member";
      break;
    case 1:
      document.getElementById("memberType2").setAttribute("v", "1");
      document.getElementById("logButton2").innerHTML = "Non Weston Memeber";
      break;
    case 2:
      document.getElementById("memberType2").setAttribute("v", "2");
      document.getElementById("logButton2").innerHTML = "Non Member Adult";
      break;
    case 3:
      document.getElementById("memberType2").setAttribute("v", "3");
      document.getElementById("logButton2").innerHTML =
        "Non Member Kid Interact";
      break;
    case 4:
      document.getElementById("memberType2").setAttribute("v", "4");
      document.getElementById("logButton2").innerHTML = "Non Member Kid";
      break;
    default:
    // code block
  }
}

function resize() {}

//changes report
function changeReport(preT, preD) {
  let day = document.getElementById("days");
  let isbyDay = preD
    ? "true" == preD
    : document.getElementById("isByDay").checked;
  reportFormDropInput.disabled = false;
  switch (typeof preT === "string" ? preT : getChecked()) {
    case "leaderBoard":
      {
        createDropDowns(undefined, 2);
        reportFormDropInput.value = "";
        if (typeof preT !== "string")
          document.getElementById("days").innerHTML = "Month";
        reportFormDropInput.disabled = true;
        getLeaderBoardDisplayData(isbyDay);
      }
      break;
    case "club":
      {
        if (typeof preT !== "string")
          document.getElementById("days").innerHTML = "Day";
        createDropDowns(undefined, 2);
        reportFormDropInput.value = "";
        filterFunction(2);
        reportFormDropInput.disabled = true;
        getClubDisplayData(isbyDay);
      }
      break;
    case "person":
      {
        createDropDowns(names, 2);
        let temp = false;
        for (let i in projects) {
          if (names[i].name === (preI ? preI : reportFormDropInput.value)) {
            temp = true;
          }
        }
        if (!temp) {
          reportFormDropInput.value = names[0].name;
          filterFunction(2);
        }
        if (typeof preT !== "string")
          document.getElementById("days").innerHTML = "Day";
        getPersonDisplayData(isbyDay);
      }
      break;
    default:
      {
        createDropDowns(projects, 2);
        let temp = false;
        for (let i in projects) {
          if (projects[i].name === (preI ? preI : reportFormDropInput.value)) {
            temp = true;
          }
        }
        if (!temp) {
          reportFormDropInput.value = projects[0].name;
          filterFunction(2);
        }
        if (typeof preT !== "string")
          document.getElementById("days").innerHTML = "Day";
        getProjectDisplayData(isbyDay);
      }
      break;
  }
}

function check(thing) {
  let vdate = new Date(
    parseInt(thing.slice(0, 4)),
    parseInt(thing.slice(5, 7)),
    parseInt(thing.slice(8))
  );
  let min = preMin ? preMin : minDateInput.value;
  if (
    !(
      !min ||
      vdate >=
        new Date(
          parseInt(min.slice(0, 4)),
          parseInt(min.slice(5, 7)),
          parseInt(min.slice(8))
        )
    )
  ) {
    return true;
  }
  let max = preMax ? preMax : maxDateInput.value;
  if (
    !(
      !max ||
      vdate <=
        new Date(
          parseInt(max.slice(0, 4)),
          parseInt(max.slice(5, 7)),
          parseInt(max.slice(8))
        )
    )
  ) {
    return true;
  }
  return false;
}

function check2(thing) {
  let b1 = thing.split(/\D/);
  let vdate = new Date(parseInt(b1[0]), parseInt(b1[1]), parseInt(b1[2]));

  let b2 = dateB2OMin.value.split(/\D/);
  let b3 = dateB2OMax.value.split(/\D/);
  if (
    !(
      (!dateB2OMin.value ||
        vdate >= new Date(parseInt(b2[0]), parseInt(b2[1]), parseInt(b2[2]))) &&
      (!dateB2OMax.value ||
        vdate <= new Date(parseInt(b3[0]), parseInt(b3[1]), parseInt(b3[2])))
    )
  ) {
    return true;
  }
  return false;
}

function check3(thing) {
  let b1 = thing.split(/\D/);
  let vdate = new Date(parseInt(b1[0]), parseInt(b1[1]), parseInt(b1[2]));

  let b2 = dateBAOMin.value.split(/\D/);
  let b3 = dateBAOMax.value.split(/\D/);
  if (
    !(
      (!dateBAOMin.value ||
        vdate >= new Date(parseInt(b2[0]), parseInt(b2[1]), parseInt(b2[2]))) &&
      (!dateBAOMax.value ||
        vdate <= new Date(parseInt(b3[0]), parseInt(b3[1]), parseInt(b3[2])))
    )
  ) {
    return true;
  }
  return false;
}

function getProjectDisplayData(isDay) {
  let data = [];
  if (!isDay) {
    let cDate;
    let eDate;
    if (document.getElementById("minDateInput").value) {
      cDate = new Date(document.getElementById("minDateInput").value);
    }
    if (document.getElementById("maxDateInput").value) {
      eDate = new Date(document.getElementById("maxDateInput").value);
    }
    let j = "";
    for (let i in projects) {
      if (
        projects[i].name ===
        document.getElementById("reportFormDropInput").value
      )
        j = projects[i]._id;
    }

    cFetch("projects/" + id + "/" + j, undefined, "GET")
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 200) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        let temp = response.json.participants;
        console.log(temp);
        for (let i in temp) {
          let hours = 0;
          for (let k in temp[i]) {
            let dateO = new Date(temp[i][k].date);
            if (!cDate || cDate <= dateO) {
              if (!eDate || eDate >= dateO) {
                hours += temp[i][k].hours;
              }
            }
          }
          let t = "";
          for (let p in names) {
            if (names[p].id === i) t = names[p].name;
          }
          data.push({
            label: t,
            y: hours,
          });
        }
        displayData(data, "bar");
      })
      .catch((err) => {
        console.log(err.message, err);
      });
  } else {
    let cDate;
    let eDate;
    if (document.getElementById("minDateInput").value) {
      cDate = new Date(document.getElementById("minDateInput").value);
    }
    if (document.getElementById("maxDateInput").value) {
      eDate = new Date(document.getElementById("maxDateInput").value);
    }
    let j = "";
    for (let i in projects) {
      if (
        projects[i].name ===
        document.getElementById("reportFormDropInput").value
      )
        j = projects[i]._id;
    }

    cFetch("projects/" + id + "/" + j, undefined, "GET")
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 200) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        let temp = response.json.participants;
        console.log(temp);
        let days = {};
        for (let i in temp) {
          for (let j in temp[i]) {
            if (days[temp[i][j].date]) {
              days[temp[i][j].date] += temp[i][j].hours;
            } else {
              days[temp[i][j].date] = temp[i][j].hours;
            }
          }
        }
        console.log(days);
        for (let i in days) {
          if (days[i]) {
            data.push({
              x: new Date(i),
              y: days[i],
            });
          }
        }
        data.sort((a, b) => b.x - a.x);
        displayData(data, "line");
      })
      .catch((err) => {
        console.log(err.message, err);
      });
  }
}

function getPersonDisplayData(isDay) {
  let data = [];
  if (!isDay) {
    let cDate;
    let eDate;
    if (document.getElementById("minDateInput").value) {
      cDate = new Date(document.getElementById("minDateInput").value);
    }
    if (document.getElementById("maxDateInput").value) {
      eDate = new Date(document.getElementById("maxDateInput").value);
    }
    let j = "";
    for (let i in names) {
      if (
        names[i].name === document.getElementById("reportFormDropInput").value
      )
        j = i;
    }
    cFetch("projects/user/" + id + "/" + names[j].id, undefined, "GET")
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 200) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        let temp = response.json;
        console.log(temp);
        let hours = {};
        for (let j in temp) {
          if (j === "name") continue;
          console.log(new Date(temp[j].date));
          let dateO = new Date(temp[j].date);
          if (!cDate || cDate <= dateO) {
            if (!eDate || eDate >= dateO) {
              if (hours[temp[j].name]) {
                hours[temp[j].name] += temp[j].hours;
              } else {
                hours[temp[j].name] = temp[j].hours;
              }
            }
          }
        }
        console.log(projects);
        for (let i in hours) {
          data.push({
            label: i,
            y: hours[i],
          });
        }

        displayData(data, "bar");
      })
      .catch((err) => {
        console.log(err.message, err);
      });
  } else {
    let cMonth = new Date().getMonth();
    let cYear = new Date().getFullYear();
    if (document.getElementById("minDateInput").value) {
      cDate = new Date(document.getElementById("minDateInput").value);
    }
    if (document.getElementById("maxDateInput").value) {
      eDate = new Date(document.getElementById("maxDateInput").value);
    }
    let j = "";
    for (let i in names) {
      if (
        names[i].name === document.getElementById("reportFormDropInput").value
      )
        j = i;
    }
    cFetch("projects/user/" + id + "/" + names[j].id, undefined, "GET")
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 200) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        let temp = response.json;
        let hours = {};
        for (let j in temp) {
          if (j === "name") continue;
          let dateO = new Date(temp[j].date);
          let month = dateO.getMonth();
          let year = dateO.getFullYear();
          if (cMonth === month && year === cYear) {
            if (hours[temp[j].name]) {
              hours[temp[j].name] += temp[j].hours;
            } else {
              hours[temp[j].name] = temp[j].hours;
            }
          }
        }
        for (let i in hours) {
          data.push({
            label: i,
            y: hours[i],
          });
        }

        displayData(data, "bar");
      })
      .catch((err) => {
        console.log(err.message, err);
      });
  }
}

function getLeaderBoardDisplayData(isMonth) {
  let data = [];
  if (!isMonth) {
    let cDate;
    let eDate;
    if (document.getElementById("minDateInput").value) {
      cDate = new Date(document.getElementById("minDateInput").value);
    }
    if (document.getElementById("maxDateInput").value) {
      eDate = new Date(document.getElementById("maxDateInput").value);
    }
    let usersHours = [];
    cFetch("projects/user/all/why/" + id, undefined, "GET")
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 200) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        ////////////////////////////////////////
        for (let l in response.json) {
          let temp = response.json[l];
          let hour = 0;
          for (let j in temp) {
            if (j === "name") continue;
            let dateO = new Date(temp[j].date);
            if (!cDate || cDate <= dateO) {
              if (!eDate || eDate >= dateO) {
                hour += parseInt(temp[j].hours);
              }
            }
          }
          if (hour) {
            data.push({
              label: temp.name,
              y: hour,
            });
          } else {
            data.push({
              label: temp.name,
              y: 0,
            });
          }
        }
        data.sort((a, b) => b.y - a.y);
        displayData(data, "cBar");
      })
      .catch((err) => {
        console.log(err.message, err);
      });
  } else {
    let usersHours = [];
    let cMonth = new Date().getMonth();
    let cYear = new Date().getFullYear();
    cFetch("projects/user/all/why/" + id, undefined, "GET")
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 200) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        ////////////////////////////////////////
        for (let l in response.json) {
          let temp = response.json[l];
          let hour = 0;
          for (let j in temp) {
            if (j === "name") continue;
            let dateO = new Date(temp[j].date);
            let month = dateO.getMonth();
            let year = dateO.getFullYear();
            if (cMonth === month && year === cYear)
              hour += parseInt(temp[j].hours);
          }
          if (hour) {
            data.push({
              label: temp.name,
              y: hour,
            });
          } else {
            data.push({
              label: temp.name,
              y: 0,
            });
          }

          data.sort((a, b) => b.y - a.y);
          displayData(data, "cBar");
        }
      })
      .catch((err) => {
        console.log(err.message, err);
      });
  }
  // data.sort((a, b) => b.y - a.y);
  // displayData(data, "cBar");
}

function getClubDisplayData(isDay, isprint) {
  let data = [];
  if (!isDay) {
    cFetch("projects/all/", undefined, "GET")
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 201) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        ////////////////////////////////////////
        for (let i in response.json) {
          let temp = response.json[i];
          let hours = 0;
          for (let j in temp.participants) {
            for (let k in temp.participants[j]) {
              hours += temp.participants[j][k].hours;
            }
          }
          data.push({ label: response.json[i].name, y: hours });
        }
        displayData(data, "bar");
      })
      .catch((err) => {
        console.log(err.message, err);
      });
  } else {
    cFetch("projects/all/", undefined, "GET")
      .then((r) =>
        r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
      )
      .then((response) => {
        if (!response.ok || response.status !== 201) {
          console.log(response.ok, response.status);
          throw new Error(response.json.message);
        }
        ////////////////////////////////////////
        let days = {};
        for (let i in response.json) {
          let temp = response.json[i];
          let hours = 0;
          for (let j in temp.participants) {
            for (let k in temp.participants[j]) {
              if (days[temp.participants[j][k].date]) {
                days[temp.participants[j][k].date] +=
                  temp.participants[j][k].hours;
              } else {
                days[temp.participants[j][k].date] =
                  temp.participants[j][k].hours;
              }
            }
          }
        }

        for (let i in days) {
          if (days[i]) {
            data.push({
              x: new Date(i),
              y: days[i],
            });
          }
        }
        data.sort((a, b) => b.x - a.x);
        if (isprint) return data;
        displayData(data, "line");
      })
      .catch((err) => {
        console.log(err.message, err);
      });
  }
}

function displayData(array, typ) {
  dataG.datasets[0].backgroundColor = [];
  dataG.datasets[0].borderColor = [];
  dataG.datasets[0].hoverBackgroundColor = [];
  dataG.datasets[0].hoverBorderColor = [];
  dataG.datasets[0].data = [];
  dataG.labels = [];
  if (typ === "bar" || typ === "cBar") {
    for (let i = 0; i < array.length; i++) {
      dataG.labels.push(array[i].label);
      dataG.datasets[0].data.push(array[i].y);
      let d = Math.random() * 360;
      let c = "hsla(" + d + ", 100%, 75%";
      let c2 = "hsla(" + d + ", 100%, 40%";

      dataG.datasets[0].backgroundColor.push(c + ", 0.6)");

      dataG.datasets[0].hoverBackgroundColor.push(c2 + ", 0.6)");
      dataG.datasets[0].hoverBorderColor.push(c2 + ", 1)");

      if (!isPie()) dataG.datasets[0].borderColor.push(c + ", 1)");

      myChart.destroy();

      myChart = new Chart(ctx, {
        type: isPie() ? "pie" : typ === "cBar" ? "horizontalBar" : "bar",
        data: dataG,
        options: {
          showAllTooltips: showTips,
          scales: {
            y: {
              beginAtZero: true,
            },
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
            xAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });
    }
  } else {
    for (let i = 0; i < array.length; i++) {
      dataG.labels.push(array[i].x);
      dataG.datasets[0].data.push(array[i].y);
    }

    let d = Math.random() * 360;
    let c = "hsl(" + d + ", 100%, 75%";
    let c2 = "hsl(" + d + ", 100%, 40%";

    dataG.datasets[0].backgroundColor = c + ", 0.6)";

    dataG.datasets[0].pointHoverBackgroundColor = c2 + ", .6)";

    dataG.datasets[0].borderColor = c2 + ", 1)";
    myChart.destroy();
    myChart = new Chart(ctx, {
      data: dataG,
      type: "line",
      options: {
        elements: {
          line: {
            tension: 0,
          },
        },
        scales: {
          showAllTooltips: showTips,
          xAxes: [
            {
              type: "time",
              time: {
                displayFormats: {
                  quarter: "MMM Do YY",
                },
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
              type: "linear",
            },
          ],
        },
      },
    });
  }
  myChart.update();
}

function isPie() {
  return preP ? "true" == preP : document.getElementById("isPie").checked;
}

//finds which report is checked
function getChecked() {
  let els = document.getElementsByName("reportsR");
  let checked;
  for (let i in els) {
    if (els[i].checked && els[i].type === "radio") checked = els[i].value;
  }
  return checked;
}

//gets data from base
function getNames() {
  //call database add to name array
  //names =
  cFetch("users/", undefined, "GET")
    .then((r) =>
      r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
    )
    .then((response) => {
      if (!response.ok || response.status !== 201) {
        console.log(response.ok, response.status);
        throw new Error(response.json.message);
      }
      names = [];
      names = response.json;
      names.sort(sortByName);
      getProjects();
    })
    .catch((err) => {
      console.log(err.message, err);
    });
}

//gets data from base
function getProjects() {
  //call database add to project array
  cFetch("projects/", undefined, "GET")
    .then((r) =>
      r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
    )
    .then((response) => {
      if (!response.ok || response.status !== 201) {
        console.log(response.ok, response.status);
        throw new Error(response.json.message);
      }
      projects = response.json;
      projects.sort(sortByName);
      createDropDowns(projects, 0);
      createDropDowns(projects, 3);
      createDropDowns(names, 1);
      createDropDowns(names, 2);
      createDropDowns(names, 4);
      doOtherInitStuff();
    })
    .catch((err) => {
      makePopup("Failed to get Projects");
    });
}

//creates objects for dropdown
function createDropDowns(things, dropdownNum) {
  if (dropdownNum === 0) {
    basicDropDown.innerHTML = "";
  } else if (dropdownNum === 1) {
    adminDropDown.innerHTML = "";
  } else if (dropdownNum === 2) {
    reportDropDown.innerHTML = "";
  } else if (dropdownNum === 3) {
    document.getElementById("SpreadProjectDropDown").innerHTML = "";
  } else if (dropdownNum === 4) {
    document.getElementById("SpreadPersonDropDown").innerHTML = "";
  }
  if (!things) return;
  for (let i in things) {
    let el = document.createElement("button");
    el.class = "formButton";
    el.onclick = insertData;
    if (!things[i].isActive) el.style.color = "darkblue";
    if (!things[i].isActive) el.style.fontWeight = "bold";

    if (dropdownNum === 0) {
      el.setAttribute("num", 0);
      if (!things[i].isActive) {
        continue;
      }
    } else if (dropdownNum === 1) {
      el.setAttribute("num", 1);
      if (!things[i].isActive) {
        continue;
      }
    } else if (dropdownNum === 2) {
      el.setAttribute("num", 2);
    } else if (dropdownNum === 3) {
      el.setAttribute("num", 3);
    } else if (dropdownNum === 4) {
      el.setAttribute("num", 4);
    }
    el.type = "button";
    el.innerHTML = things[i].name;
    if (dropdownNum === 0) {
      basicDropDown.appendChild(el);
    } else if (dropdownNum === 1) {
      adminDropDown.appendChild(el);
    } else if (dropdownNum === 2) {
      reportDropDown.appendChild(el);
    } else if (dropdownNum === 3) {
      document.getElementById("SpreadProjectDropDown").appendChild(el);
    } else if (dropdownNum === 4) {
      document.getElementById("SpreadPersonDropDown").appendChild(el);
    }
  }
}
//switches to reports
function closeAll(th) {
  toggleNav();
  formUserO.style.display = "none";
  block1O.style.display = "none";
  block2O.style.display = "none";

  adminFormO.style.display = "none";
  adminBlock1O.style.display = "none";
  adminBlock2O.style.display = "none";

  personFormO.style.display = "none";
  personBlock1O.style.display = "none";
  personBlock2O.style.display = "none";

  deleteHourO.style.display = "none";
  deleteProjectO.style.display = "none";
  toggleProjectActiveO.style.display = "none";
  deletePersonO.style.display = "none";
  togglePersonActiveO.style.display = "none";

  adminFormDropInput.value = userName;
  if (role < 0) {
    adminFormDropInput.disabled = true;
  } else {
    adminFormDropInput.disabled = false;
  }
  basicFormDropInput.disabled = false;

  reportsO.style.display = "none";
  document.getElementById("myTopnav").className = "topnav";
  if (th) {
    th.className = "active";
  } else {
    document.getElementById("homeB").className = "active";
  }
  document.getElementById("adminFormDropInput").value = userName;
  document.getElementById("hours").value = 3;
  document.getElementById("basicFormDropInput").value = "";
  document.getElementById("comment").innerHTML = "";

  document.getElementById("projectNameInput").value = "";
  document.getElementById("sday").value = "";
  document.getElementById("eday").value = "";
  document.getElementById("commentAdmin").innerHTML = "";

  document.getElementById("personNameInput").value = "";
  document.getElementById("personEmailInput").value = "";
  document.getElementById("permissionValue").value = 0;
  document.getElementById("personPassInput").value = "";
}
//switch
function homeSwitch(th) {
  closeAll(th);
  formUserO.style.display = "block";
  block1O.style.display = "block";
}

function hourEditSwitch(th) {
  closeAll(th);
  formUserO.style.display = "block";
  block2O.style.display = "block";
}

function reportSwitch(th) {
  closeAll(th);
  reportsO.style.display = "block";
}

function addProjectSwitch(th) {
  closeAll(th);
  adminFormO.style.display = "block";
  adminBlock1O.style.display = "block";
}

function editProjectsSwitch(th) {
  closeAll(th);
  adminFormO.style.display = "block";
  adminBlock2O.style.display = "block";
}

function addPersonSwitch(th) {
  closeAll(th);
  personFormO.style.display = "block";
  personBlock1O.style.display = "block";
}

function editPersonSwitch(th) {
  closeAll(th);
  personFormO.style.display = "block";
  personBlock2O.style.display = "block";
}

//add cookies
function submit() {
  setCookie("firstName", fname.value, 100000);
  setCookie("lastName", lname.value, 100000);
}

//cookie setter function from w3schools
function setCookie(cname, cvalue, exdays) {
  let d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

//cookie getter function from w3schools
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

//shows The drop down menue
function openDropDown(num) {
  basicDropDown.classList.remove("show");
  adminDropDown.classList.remove("show");
  reportDropDown.classList.remove("show");
  document.getElementById("SpreadProjectDropDown").classList.remove("show");
  document.getElementById("SpreadPersonDropDown").classList.remove("show");
  if (num === 0 && !basicFormDropInput.disabled) {
    basicDropDown.classList.add("show");
  } else if (num === 1 && !adminFormDropInput.disabled) {
    adminDropDown.classList.add("show");
  } else if (num === 2 && !reportFormDropInput.disabled) {
    reportDropDown.classList.add("show");
  } else if (
    num === 3 &&
    !document.getElementById("SpreadProjectFormDropInput").disabled
  ) {
    document.getElementById("SpreadProjectDropDown").classList.add("show");
  } else if (
    num === 4 &&
    !document.getElementById("SpreadPersonFormDropInput").disabled
  ) {
    document.getElementById("SpreadPersonDropDown").classList.add("show");
  }
}

//detects if there is a click on the body and if the drop down menue is open then closes it
function bodyClick() {
  if (isoffDrop) {
    basicDropDown.classList.remove("show");
    adminDropDown.classList.remove("show");
    reportDropDown.classList.remove("show");
    document.getElementById("SpreadProjectDropDown").classList.remove("show");
    document.getElementById("SpreadPersonDropDown").classList.remove("show");
  }
}

//filters the dropdown menue from w3schools
function filterFunction(num) {
  let input, filter, b, i, div;
  if (num === 0) {
    input = basicFormDropInput;
    filter = input.value.toUpperCase();
    div = basicDropDown;
    b = div.getElementsByTagName("button");
  } else if (num === 1) {
    input = adminFormDropInput;
    filter = input.value.toUpperCase();
    div = adminDropDown;
    b = div.getElementsByTagName("button");
  } else if (num === 2) {
    input = reportFormDropInput;
    filter = input.value.toUpperCase();
    div = reportDropDown;
    b = div.getElementsByTagName("button");
  } else if (num === 3) {
    input = document.getElementById("SpreadProjectFormDropInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("SpreadProjectDropDown");
    b = div.getElementsByTagName("button");
  } else if (num === 4) {
    input = document.getElementById("SpreadPersonFormDropInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("SpreadPersonDropDown");
    b = div.getElementsByTagName("button");
  }
  for (i = 0; i < b.length; i++) {
    let txtValue = b[i].textContent || b[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      b[i].style.display = "";
    } else {
      b[i].style.display = "none";
    }
  }
}

//takes data from button and puts it in the input
function insertData() {
  if (this.getAttribute("num") === "0") {
    basicFormDropInput.value = this.innerText;
    filterFunction(0);
  } else if (this.getAttribute("num") === "1") {
    adminFormDropInput.value = this.innerText;
    updatePerson();
    filterFunction(1);
  } else if (this.getAttribute("num") === "2") {
    reportFormDropInput.value = this.innerText;
    filterFunction(2);
  } else if (this.getAttribute("num") === "3") {
    document.getElementById("SpreadProjectFormDropInput").value =
      this.innerText;
    filterFunction(3);
  } else if (this.getAttribute("num") === "4") {
    document.getElementById("SpreadPersonFormDropInput").value = this.innerText;
    filterFunction(4);
  }
  isoffDrop = true;
  bodyClick();
}
//from w3schools
Date.prototype.toDateInputValue = function () {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};

//sort function
function sortByName(a, b) {
  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  // names must be equal
  return 0;
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function randomProperty(obj) {
  return obj[(obj.length * Math.random()) << 0].name;
}

function printG() {
  showTips = true;
  changeReport();
  setTimeout(() => {
    printJS({
      printable: "reportArea",
      type: "html",
      header: "Hours Graph",
    });
    showTips = false;
    changeReport();
  }, 1000);
}

function picG(el) {
  showTips = true;
  changeReport();
  setTimeout(() => {
    let link = document.createElement("a");
    link.download = "graph.png";
    link.href = document.getElementById("reportArea").toDataURL();
    link.click();
    showTips = false;
    changeReport();
  }, 1000);
}

function downloadXlsx() {
  document.getElementById("suff").style.display = "block";
}
function getData() {
  document.getElementById("suff").style.display = "none";
  let projectId;
  let personId;
  for (let i in projects) {
    if (
      projects[i].name ===
      document.getElementById("SpreadProjectFormDropInput").value
    )
      projectId = projects[i]._id;
  }
  for (let i in names) {
    if (
      names[i].name ===
      document.getElementById("SpreadPersonFormDropInput").value
    )
      personId = names[i].id;
  }
  let stuff = {};
  if (document.getElementById("minDateInputSpread").value)
    stuff.startDate = new Date(
      document.getElementById("minDateInputSpread").value
    );
  if (document.getElementById("maxDateInputSpread").value)
    stuff.endDate = new Date(
      document.getElementById("maxDateInputSpread").value
    );
  if (personId) stuff.person = personId;
  if (projectId) stuff.project = projectId;
  cFetch("projects/sheet/" + id, stuff, "PATCH")
    .then((r) =>
      r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
    )
    .then((response) => {
      if (!response.ok || response.status !== 200) {
        console.log(response.ok, response.status);
        throw new Error(response.json.message);
      }
      console.log(response.json);
      zipcelx(response.json);
    })
    .catch((err) => {
      console.log(err.message, err);
    });
}

function embed() {
  let copyText =
    "" +
    location.origin +
    location.pathname +
    `?chart=${getChecked()}&day=${
      document.getElementById("isByDay").checked
    }&pie=${isPie()}&input=${reportFormDropInput.value}&min=${
      minDateInput.value
    }&max=${maxDateInput.value}`;

  navigator.clipboard.writeText(copyText).then(
    function () {
      alert("Link was copied to your clipboard");
    },
    function (err) {
      console.error("Async: Could not copy text: ", err);
    }
  );
}

function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

function toggleNav() {
  var x = document.getElementById("myTopnav").getElementsByClassName("active");
  x[0].className = "";
}

function cFetch(url = "", data = undefined, operation = "POST") {
  if (data) {
    return fetch("/api/" + url, {
      method: operation,
      cache: "default",
      headers: {
        "Content-Type": "application/json",
        "x-auth": token ? token : "",
      },
      body: JSON.stringify(data),
    });
  } else {
    return fetch("./api/" + url, {
      method: operation,
      cache: "default",
      headers: {
        "Content-Type": "application/json",
        "x-auth": token ? token : "",
      },
    });
  }
}

function logSign() {
  //document.getElementById("signLog").getAttribute("v")
  if ("0" === "1") {
    //signup
    if (
      document.getElementById("password1Input").value ===
      document.getElementById("password2Input").value
    ) {
      cFetch("users/", {
        displayName: document.getElementById("nameInput").value,
        email: document.getElementById("emailInput").value,
        password: document.getElementById("password1Input").value,
        memberType: parseInt(
          document.getElementById("memberType").getAttribute("v")
        ),
      })
        .then((r) =>
          r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
        )
        .then((response) => {
          if (!response.ok || response.status !== 201) {
            throw new Error(response.json.message);
          }
          alert("good");
        })
        .catch((err) => {
          if (err.message.lastIndexOf("displayName") !== -1) {
            makePopup("Name can only contain letters");
          } else if (err.message.lastIndexOf("!@#$%^&.*") !== -1) {
            makePopup(
              'Password must contain at least on number and one of these caracters special "!@#$%^&.*"'
            );
          } else if (err.message.lastIndexOf("[") !== -1) {
            alert(
              err.message.substring(
                err.message.lastIndexOf("[") + 1,
                err.message.lastIndexOf("]")
              )
            );
          } else {
            makePopup(err.message);
          }
          makePopup(err.message);
        });
    } else {
      makePopup("Passwords do not match");
    }
  }

  cFetch("sessions/", {
    email: document.getElementById("emailInput").value,
    password: document.getElementById("password2Input").value,
  })
    .then((r) =>
      r.json().then((json) => ({ ok: r.ok, status: r.status, json }))
    )
    .then((response) => {
      if (!response.ok || response.status !== 201) {
        throw new Error(response.json.message);
      }

      adminFormDropInput.value = response.json.name;

      document.getElementById("loginOuterDiv").style.display = "none";
      sessionStorage.setItem("userId", response.json.userId);
      sessionStorage.setItem("userName", response.json.name);
      sessionStorage.setItem("token", response.json.token);
      sessionStorage.setItem("role", response.json.role);
      console.log(response.json);
      token = response.json.token;
      userName = response.json.name;
      role = response.json.role;
      id = response.json.userId;
      runInitStuff();
    })
    .catch((err) => {
      makePopup("Username or Password is Wrong");
    });
}

function makePopup(text) {
  let popupDiv = document.getElementById("popupDiv");
  let el = document.createElement("div");
  el.className += "popup";
  el.onclick = function (e) {
    this.remove();
  };
  el.innerHTML = text;
  popupDiv.appendChild(el);
  popupDiv.style["background"] = "rgb(2,0,36)";
  popupDiv.style["background"] =
    "radial-gradient(circle, rgba(2,0,36,0) 0%,rgb(52, 157, 248) 100%)";
  setTimeout(function () {
    popupDiv.style["background"] = "none";
  }, 50);
}
