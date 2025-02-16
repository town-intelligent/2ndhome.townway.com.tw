import { list_plans, plan_info, list_plan_tasks, getProjectWeight, addWeight } from './plan.js'
import { set_page_info_project_list } from './project_list.js'
import { draw_bar } from './chart/bar.js'

export function set_page_info_project_counts(uuid_project) {
  var weight = {};

  try {
    var obj_project = plan_info(uuid_project);
    var obj_parent_tasks = list_plan_tasks(obj_project.uuid, 1);
    weight = getProjectWeight(obj_parent_tasks.tasks);
  } catch (e) { return; }

  for (var index = 1; index < 28; index++) {
    if (weight["sdgs-" + index.toString()] != "0") {
      try {
        document.getElementById("pc_" + index.toString()).innerText = 
        parseInt(document.getElementById("pc_" + index.toString()).innerText) + 1;
      } catch (e) { console.log(e) }
    }
  }
}

export function set_relate_people_and_project_counts(totalProjectWeight, list_project_uuids) {
  // 關係人口
  var total_sdgs_weight = 0;
  for (var index = 1; index < 28; index++) {
    try {
      total_sdgs_weight = total_sdgs_weight + parseInt(totalProjectWeight["sdgs-" + index]);
      document.getElementById("rp_" + index.toString()).innerText = totalProjectWeight["sdgs-" + index.toString()];
    } catch (e) { console.log(e) }
  }

  try {
    document.getElementById("rp_total_sdgs").innerText = total_sdgs_weight.toString();
  } catch (e) { console.log(e) }

  // 專案件數
  list_project_uuids.forEach(set_page_info_project_counts);
}

export function get_total_project_weight(list_project_uuids) {
    // Get Project weigh
    if (list_project_uuids.length != 0) {
      var totalProjectWeight = {};
    }
    for (var index = 0; index < list_project_uuids.length; index++) {
      var obj_project = plan_info(list_project_uuids[index]);
      var obj_parent_tasks = list_plan_tasks(obj_project.uuid, 1);
  
      var weight = {}
      try {
        if (obj_parent_tasks.tasks.length != 0) {
          weight = getProjectWeight(obj_parent_tasks.tasks);
        }
      } catch (e) { console.log(e) }
  
      totalProjectWeight = addWeight(totalProjectWeight, weight)
    }

    return totalProjectWeight;
}

export function draw_five_chart(totalProjectWeight) {
  // Remove useless weight
  Object.keys(totalProjectWeight).forEach(function(key){
    if (18 > parseInt(key.substring(5,7)) || parseInt(key.substring(5,7)) > 22) {
      delete totalProjectWeight[key]; 
    }
  });

  // Draw
  var array_weight_colors = ["#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1"]
  draw_bar("weight_five", totalProjectWeight, 541, 450, array_weight_colors, true, false)
}

export function draw_sdgs_chart(totalProjectWeight) {
  // Remove useless weight
  Object.keys(totalProjectWeight).forEach(function(key){ 
    if (parseInt(key.substring(5,7)) > 17){
      delete totalProjectWeight[key]; 
    }
  });

  // Draw
  var array_weight_colors = ["#e5243b", "#DDA63A", "#4C9F38", "#C5192D", "#FF3A21", "#26BDE2", "#FCC30B", "#A21942", "#FD6925", "#DD1367", "#FD9D24", "#BF8B2E", "#3F7E44", "#0A97D9", "#56C02B", "#00689D", "#19486A", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1", "#0075A1"]
  draw_bar("weight_sdgs", totalProjectWeight, 1251, 450, array_weight_colors, true, false)
}

export function draw_comm_chart(totalProjectWeight) {
  // Remove useless weight
  Object.keys(totalProjectWeight).forEach(function(key){
    if (23 > parseInt(key.substring(5,7)) || parseInt(key.substring(5,7)) > 28) {
      delete totalProjectWeight[key]; 
    }
  });

  // Draw
  var array_weight_colors = ["#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745", "#28a745","#28a745", "#28a745"]
  draw_bar("weight_comm", totalProjectWeight, 541, 450, array_weight_colors, true, false)
}

export function set_page_info_kpi() {
  // Get all projects
  var list_project_uuids = [];
  for (var index = 0; index < SITE_HOSTERS.length; index++) {
    try {
      var obj_list_projects = list_plans(SITE_HOSTERS[index], null);
      list_project_uuids = list_project_uuids.concat(obj_list_projects.projects);
    } catch(e) { console.log(e) }
  }

  // Page info
  set_page_info_project_list();

  // Get total project weight
  var totalProjectWeight = get_total_project_weight(list_project_uuids);

  // Set relate people and project counts
  set_relate_people_and_project_counts(totalProjectWeight, list_project_uuids);

  // SDGS
  var totalProjectWeight_for_sdgs = Object.assign({}, totalProjectWeight);
  draw_sdgs_chart(totalProjectWeight_for_sdgs);

  // 德智體群美
  var totalProjectWeight_for_five = Object.assign({}, totalProjectWeight)
  draw_five_chart(totalProjectWeight_for_five);

  // 人文地產景
  var totalProjectWeight_for_comm = Object.assign({}, totalProjectWeight)
  draw_comm_chart(totalProjectWeight_for_comm);
}
