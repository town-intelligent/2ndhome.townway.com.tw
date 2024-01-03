// import { draws } from './app.js'
import { list_plans, plan_info, append_plan_submit_data, plan_submit, delete_plan, list_plan_tasks, getProjectWeight } from './plan.js'
import { task_submit, child_task_submit } from './tasks.js'
// import { draw_bar } from './chart/bar.js'
import { mintNFT, make_attrubute } from './nft.js'

const cms_project_submit_pages = ["cms_plan_info.html", "cms_sdgs_setting.html", "cms_impact.html", "cms_contact_person.html"];
const cms_support_format = ["cms_missions_display.html", "cms_support_form.html", "cms_deep_participation.html"]

$(function () {
  $("#add_c_project").on("click", function(event) {
    event.preventDefault();

    var obj_project = null;
    var form = new FormData();
    if (obj_project = plan_submit(form)) {
      window.location.replace("/backend/cms_plan_info.html?uuid=" + obj_project.uuid);
    }
  });
});

function get_page_index(page) {
  for (var index = 0; index < cms_support_format.length; index++) {
    if (page == cms_support_format[index]) {
	    return 3
    }
  }

  for (var index = 0; index < cms_project_submit_pages.length; index++) {
    if (page == cms_project_submit_pages[index]) {
      return index
    }
  }
  return null
}

function get_index_page(index) {
  return cms_project_submit_pages[index];
}

// Previous page
$(function () {
  $("#btn_ab_project_prev").on("click", function(e) {
    e.preventDefault(); // To prevent following the link (optional)

    // Get path
    var path = window.location.pathname;
    var page = path.split("/").pop();

    // Get parent uuid
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var uuid = urlParams.get("uuid")
    var task = urlParams.get("task")

    // Get index
    var index = get_page_index(page);

    // Set params
    var param = "";
    if (uuid != null) {
      param = param + "?uuid=" + uuid;
    }
    if (task != null) {
      param = param + "&task=" + task;
    }

    // Replace page
    if (index > 0) {
      if (page == "cms_missions_display.html") {
        window.location.replace("cms_impact.html" + param);
      } else {
        window.location.replace(get_index_page(index - 1) + param);
      }
    } else {
      window.location.replace(get_index_page(0) + param);
    }
  });
});

// Submit to next page
$(function () {
  $("form").on("submit", function(e){
    e.preventDefault();
    if (typeof update_ckeditor_data === "function") {
      update_ckeditor_data();
    }

    // Get path
    var path = window.location.pathname;
    var page = path.split("/").pop();

    // Get parent uuid
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var uuid = urlParams.get("uuid")
    var task = urlParams.get("task")

    // Get index
    var index = get_page_index(page);

    // Set params
    var param = "";
    if (uuid != null) {
      param = param + "?uuid=" + uuid;
    }

    if (task != null) {
      param = param + "&task=" + task;
    }

    // Append data to form
    var form = new FormData();
    form = append_plan_submit_data(page, form);

    // Submit
    plan_submit(form, uuid);

    // Parent task submit
    if (page == "cms_impact.html") {
      // Variables
      var list_parent_tasks = [];

      // Get history parent tasks
      var result_parent_tasks = list_plan_tasks(uuid, 1);
      if (result_parent_tasks.result) {
        try {
          list_parent_tasks = result_parent_tasks.tasks;
        } catch (e) {
          console.log(e);
        }
      }

      // Update all tasks from web and submit
      for (var index_task = 0; index_task < list_parent_tasks.length; index_task++) {
        // Form
        var form = new FormData();

        try {
          // Keep old data
          form.append("uuid", uuid);
          form.append("task", list_parent_tasks[index_task]);
          form.append("email", getLocalStorage("email"));

          // name
          form.append("name", document.getElementById("parent_task_name_" + list_parent_tasks[index_task]).value);

          // start date
          form.append("task_start_date", document.getElementById("parent_task_start_date_" + list_parent_tasks[index_task]).value);

          // due date
          form.append("task_due_date", document.getElementById("parent_task_due_date_" + list_parent_tasks[index_task]).value);

          // overview
          form.append("overview", document.getElementById("parent_task_overview_" + list_parent_tasks[index_task]).value);

          // GPS
          try {
            form.append("gps_flag", document.getElementById("gps_flag_" + list_parent_tasks[index_task]).checked);
          } catch(e) {
            console.log(e);
          }

          var obj_task = task_submit(form);
        } catch(e) {
          console.log(e)
        }

        // Create NFT
        var parent_task_name = "";
        var raw_description = "";
        var doc = "";
        var description = "";
        var attribute = "";

        try {
          parent_task_name = document.getElementById("parent_task_name_" + list_parent_tasks[index_task]).value;
          raw_description = document.getElementById("parent_task_overview_" + list_parent_tasks[index_task]).value;
          var parser = new DOMParser();
          doc = parser.parseFromString(raw_description, "text/html");
          description = doc.body.firstChild.innerText;
          attribute = make_attrubute();

          const obj_input = {"uuid_project":uuid,
            "uuid_task":list_parent_tasks[index_task],
            "name":parent_task_name,
            "description": description, // "社會影響力足跡: " + parent_task_name,
            "attribute":attribute};

          mintNFT(obj_input);
        } catch (e) {
            console.log(e);
        }
      }
    }

    if (page == "cms_support_form.html" || page == "cms_deep_participation.html") {
      if (false == child_task_submit(page)){
        return;
      }
    }

    // Replace page
    var btn_submit = $(this).find("button[type=submit]:focus");
    var id_btn_submit = btn_submit.attr('id');

    if (id_btn_submit == "btn_ab_project_next") {
      if (index < cms_project_submit_pages.length - 1) {
        var next_page = get_index_page(index + 1);
        window.location.replace("/backend/" + next_page + param);
      } else {
        window.location.replace("/backend/" + get_index_page(cms_project_submit_pages.length - 1) + param);
      }

      if (page == "cms_contact_person.html") {
        window.location.replace("/backend/cms_project_detail.html?uuid=" + uuid);
      }

      if (page == "cms_deep_participation.html") {
        window.location.replace("/backend/cms_impact.html" + param);
      }

    } else if (id_btn_submit == "btn_cms_plan_save") {
      alert("儲存成功");
    } else if (id_btn_submit == "btn_cms_plan_preview") {
      window.open(
        "/backend/cms_project_detail.html?uuid=" + uuid,
        "_blank" // <- This is what makes it open in a new window.
      );
    }
  });
});

export function cms_plan_add_parent_tasks(uuid_task) {
  if (typeof update_ckeditor_data === "function") {
    update_ckeditor_data();
  }

  // Path
  var path = window.location.pathname;
  var page = path.split("/").pop();
  var url = new URL(window.location.href);
  // Params
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var uuid = urlParams.get("uuid")

  // Submit
  var uuid_plan = null;

  if (uuid != null) {
    uuid_plan = uuid;
  } else if (getLocalStorage("uuid_project") != "") {
    uuid_plan = getLocalStorage("uuid_project");
  }

  if ( uuid_plan != null && getLocalStorage("uuid_project") == "")
    setLocalStorage("uuid_project", uuid_plan);

  // Update project
  var form_plan = new FormData();
  form_plan = append_plan_submit_data(page, form_plan);

  // Submit
  plan_submit(form_plan, uuid);

  // GPS check
  var gps_flag = false;
  try {
    if (document.getElementById("gps_flag_" + uuid_task).checked == true) {
      gps_flag = true;
    }
  } catch (e) {
    console.log(e)
  }

  // Parent task submit
  // Variables
  var list_parent_tasks = [];

  // Get history parent tasks
  var result_parent_tasks = list_plan_tasks(uuid, 1);
  if (result_parent_tasks.result) {
    try {
      list_parent_tasks = result_parent_tasks.tasks;
    } catch (e) {
      console.log(e);
    }
  }

  // Update all tasks from web and submit
  for (var index_task = 0; index_task < list_parent_tasks.length; index_task++) {
    // Form
    var form = new FormData();

    try {
      // Keep old data
      form.append("uuid", uuid);
      form.append("task", list_parent_tasks[index_task]);
      form.append("email", getLocalStorage("email"));

      // name
      form.append("name", document.getElementById("parent_task_name_" + list_parent_tasks[index_task]).value);

      // start date
      form.append("task_start_date", document.getElementById("parent_task_start_date_" + list_parent_tasks[index_task]).value);

      // due date
      form.append("task_due_date", document.getElementById("parent_task_due_date_" + list_parent_tasks[index_task]).value);

      // overview
      form.append("overview", document.getElementById("parent_task_overview_" + list_parent_tasks[index_task]).value);

      // GPS
      try {
        form.append("gps_flag", document.getElementById("gps_flag_" + list_parent_tasks[index_task]).checked);
      } catch(e) {
        console.log(e);
      }

      var obj_task = task_submit(form);
    } catch(e) {
      console.log(e)
    }
  }
  // Redirect to add parent window
  window.location.replace("/backend/cms_missions_display.html?uuid=" + uuid_plan + "&task=" + uuid_task + "&gps=" + gps_flag);
}

// btn_cms_plan_add_form_task
$(function () {
  $("#btn_cms_plan_add_form_task").on("click", function(e) {
    e.preventDefault(); // To prevent following the link (optional)

    // Path
    var path = window.location.pathname;
    var page = path.split("/").pop();
    var url = new URL(window.location.href);
    // Params
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var uuid = urlParams.get("uuid")
    var task = urlParams.get("task")

    // Submit
    var uuid_project = null;
    if (getLocalStorage("uuid_project") != "") {
      uuid_project = getLocalStorage("uuid_project");
    }

    var form = new FormData();
    var obj_project = plan_submit(form, uuid_project);
    setLocalStorage("uuid_project", obj_project.uuid);

    // Redirect to add parent window
    window.location.replace("/backend/cms_support_form.html?uuid=" + obj_project.uuid + "&task=" + task);
  });
});

// btn_cms_plan_add_deep_task
$(function () {
  $("#btn_cms_plan_add_deep_task").on("click", function(e) {
    e.preventDefault(); // To prevent following the link (optional)

    // Get path
    var path = window.location.pathname;
    var page = path.split("/").pop();

    // Get Parent uuid
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var task = urlParams.get("task")
    var gps = urlParams.get("gps")

    // Submit
    var uuid_project = null;
    if (getLocalStorage("uuid_project") != "") {
      uuid_project = getLocalStorage("uuid_project");
    }

    var form = new FormData();
    var obj_project = plan_submit(form, uuid_project);
    setLocalStorage("uuid_project", obj_project.uuid);

    // Redirect to add parent window
    window.location.replace("/backend/cms_deep_participation.html?uuid=" + obj_project.uuid + "&task=" + task + "&gps=" + gps);
  });
});

// btn sdg trigger
$(function () {
  $("[id='btn_sdg']").on("click", function(e) {
    e.stopPropagation();
    var obj_name = $(this).attr("name");

    for(var index = 1; index <= 17; index++) {
      var index_sdg = "";
      if (index  < 10) {
        index_sdg = ("0" + index).slice(-2);
      } else {
        index_sdg = index;
      }

      document.getElementsByName(index_sdg.toString())[0].style.backgroundColor = "";
    }

    // Set task sdgs
    document.getElementsByName(obj_name)[0].style.backgroundColor = "gray";
    setLocalStorage("target_sdgs", obj_name);
  });
});

// btn_add_sdg_into_task
$(function () {
  $("#btn_add_sdg_into_task").on("click", function(e) {

    e.stopPropagation();
    var list_target_sdgs = [];
    if (getLocalStorage("list_target_sdgs") != "") {
      list_target_sdgs = getLocalStorage("list_target_sdgs").split(",");
    }

    list_target_sdgs.push(getLocalStorage("target_sdgs"));

    // Get path
    var path = window.location.pathname;
    var page = path.split("/").pop();

    // Show widget
    var obj_sdgs_container = document.getElementById("sdgs_container");

    if (page == "cms_support_form.html") {

      // Create SDGs element - row
      // <div class="row align-items-center justify-content-center mt-4">
      var obj_div_row = document.createElement("div");
      obj_div_row.className = "row align-items-center justify-content-center mt-4";

      // Create image
      // <img class="col-3 col-md-1" src="/static/imgs/SDGs_04.jpg" alt="">
      var obj_img = document.createElement("img");
      obj_img.className = "col-3 col-md-1";
      obj_img.src = "/static/imgs/SDGs_" + getLocalStorage("target_sdgs") + ".jpg";
      obj_img.setAttribute("width", "49px");
      obj_img.setAttribute("height", "49px");

      // Create label
      // <label class="col-3 col-md-1 col-form-label pr-0">支持，</label>
      var obj_label = document.createElement("label");
      obj_label.className = "col-3 col-md-1 col-form-label pr-0";
      obj_label.innerHTML = "支持，";

      // Create div_child
      // <div class="mt-3 mt-md-0 col-md-10 pl-md-0">
      var obj_div_child = document.createElement("div");
      obj_div_child.className = "mt-3 mt-md-0 col-md-10 pl-md-0";

      // Create input
      // <input type="text" class="form-control" placeholder="SDG 15 陸地生態保育，請留下您的支持評論。">
      var obj_input = document.createElement("input");
      obj_input.id = "target_sdgs_" + getLocalStorage("target_sdgs");
      obj_input.type = "text";
      obj_input.className = "form-control";
      obj_input.placeholder = "請留下您的支持評論。"
      obj_input.disabled = true;

      // Append
      obj_div_child.append(obj_input);

      obj_div_row.append(obj_img);
      obj_div_row.append(obj_label);
      obj_div_row.append(obj_div_child);
      obj_sdgs_container.append(obj_div_row);
    }

    // Finish
    $("#SDGsModal").modal("hide");
  });
});

export function set_page_info_cms_agent(uuid){
  /* Create DOM */
  const list_project_obj = list_plans(getLocalStorage("email"));

  if (list_project_obj == undefined) {
    return;
  }

  const list_project_uuids = list_project_obj.projects;

  const obj_project_list = document.getElementById("project_list");
  for (let index = 0; index < list_project_uuids.length; index++) {
    // Get project info
    const obj_project = plan_info(list_project_uuids[index]);

    const root_container = $('<div />', {
      class: 'col-sm-12 col-md-6 col-lg-4 mb-5',
    })
      .appendTo($(obj_project_list))
      .get(0);

    const card_container = $('<div />', {
      class: 'project card mb-4',
    })
      .append(
        $('<a />', {
          class: 'stretched-link',
          href: `${location.protocol}//${window.location.host}/backend/cms_project_detail.html?uuid=${obj_project.uuid}`,
        })
      )
      .appendTo($(root_container))
      .get(0);

    let image_url = null;
    if (obj_project.img != null) {
      image_url = `${HOST_URL_TPLANET_DAEMON}/static/project/${obj_project.uuid}/media/cover/cover.png`;
    }

    $('<div />', {
      class: 'card-img-top',
      style: `background-image: url(${image_url});`,
      src: image_url,
    })
      .appendTo($(card_container))

    const card_body = $('<div />', {
      class: 'card-body d-flex flex-column',
      style: 'min-height: 300px;',
    })
      .append(
        $('<div />', {
          class: 'flex-grow-1',
        })
          .append(
            $('<h5 />', {
              class: 'font-weight-bold mb-4',
              style: 'color: #3E6896; font-size: 25px;',
              html: obj_project.name,
            })
          )
          .append(
            $('<p />', {
              class: 'card-text',
              html: `永續企業: `,
            })
              .append(
                $('<span />', {
                  class: 'pl-2',
                  html: obj_project.project_a,
                })
              )
          )
          .append(
            $('<p />', {
              class: 'card-text',
              html: `地方團隊: `,
            })
              .append(
                $('<span />', {
                  class: 'pl-2',
                  html: obj_project.project_b,
                })
              )
          )
          .append(
            $('<p />', {
              class: 'card-text',
              html: `期間: `,
            })
              .append(
                $('<span />', {
                  class: 'pl-2',
                  html: obj_project.period,
                })
              )
          )
      )
      .appendTo($(card_container))
      .get(0);

    const sdg_container = $('<div />', {
      class: 'row mt-3',
      style: 'gap: 10px;',
    })
      .appendTo($(card_body));

    let list_sdgs = [];
    if (typeof obj_project.weight === "string") {
      list_sdgs = obj_project.weight.split(",");
    }

    list_sdgs = list_sdgs.reduce(
      (all, value, index) => [...all, ...(value > 0 ? [index] : [])],
      []
    );

    const displaySdgsItems = list_sdgs.slice(0, 5);
    const isReadMore = list_sdgs.length > 5;

    for (const index of displaySdgsItems) {
      const container = $('<div/>', {
        class: 'col-2 pr-0',
      })

      const index_sdg = ("0" + (index + 1)).slice(-2);
      $('<img/>', {
        class: 'w-100',
        src: `/static/imgs/SDGs_${index_sdg}.jpg`,
        alt: '',
      }).appendTo(container);

      container.appendTo(sdg_container);
    };

    if (isReadMore) {
      $('<p/>', { class: 'col-12 m-0 text-center', html: 'Read more...'}).appendTo(sdg_container);
    }


    $('<a />', {
      class: "dropdown-toggle btn btn-dark w-100",
      style: "border-radius: 18px;",
      href: "#",
      role: "button",
      "aria-haspopup": "true",
      "aria-expanded": "false",
      "data-bs-toggle": "modal",
      "data-bs-target": `#modalProjectManagement_${obj_project.uuid}`,
      html: "專案管理選單",
    })
      .appendTo($(root_container));

    // Project management modal
    $("<div/>", {
      id: "modalProjectManagement_" + obj_project.uuid,
      class: "modal fade",
      tabindex: -1,
      "data-bs-backdrop": "static",
      "data-bs-keyboard": false,
      "aria-labelledby": "staticBackdropLabel",
      "aria-hidden": true,
    })
      .html(
        str_project_management_modal.replaceAll("UUID_PROJECT", obj_project.uuid)
      )
      .appendTo("body");

    $('<div/>', {
      class: 'modal fade',
      id: "projectDeleteModel_" + obj_project.uuid,
      tabindex: -1,
      role: 'dialog',
      html: str_project_delete_modal.replaceAll("UUID_PROJECT", obj_project.uuid),
    })
      .appendTo("body");
  }
  /* Create DOM */
}

export function showProjectDeleteModel (uuid_project){
  delete_plan(uuid_project);
  $("#projectDeleteModel_" + uuid_project).modal("hide");

  // Reload page
  location.reload();
}
