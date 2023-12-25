import { list_plans, plan_info } from './plan.js'

export function set_page_info_project_list() {
  // Get all projects
  var list_project_uuids = [];
  for (var index = 0; index < SITE_HOSTERS.length; index++) {
    try {
      var obj_list_projects = list_plans(SITE_HOSTERS[index], null);
      list_project_uuids = list_project_uuids.concat(obj_list_projects.projects);
    } catch(e) { console.log(e) }
  }

  for (var index = 0; index < list_project_uuids.length; index++) {
    var obj_project = plan_info(list_project_uuids[index]);

    /* Replace variable in str_project_block_in_project_page_page */

    // Project data
    obj_project.name = obj_project.name || '';
    obj_project.project_a = obj_project.project_a || '';
    obj_project.project_b = obj_project.project_b || '';
    obj_project.uuid = obj_project.uuid || '';

    var str_project_block_in_project_page_innetHTML = str_project_block_in_project_page.replaceAll("PROJECT_NAME", obj_project.name);
    str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("PROJECT_A", obj_project.project_a);
    str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("PROJECT_B", obj_project.project_b);
    str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("PROJECT_UUID", obj_project.uuid);

    var list_period = [];
    try {
      list_period = obj_project.period.split("-");
    } catch (e) {}

    if (list_period.length == 2) {
      str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("PROJECT_START", list_period[0]);
      str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("PROJECT_DUE", list_period[1]);
    } else {
      str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("PROJECT_START", "");
      str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("PROJECT_DUE", "");
    }
    str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("BUDGET", obj_project.budget);

    // Add image
    if (obj_project.img != null && obj_project.img != "") {
      str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("PROJECT_COVER", HOST_URL_TPLANET_DAEMON + obj_project.img);
    } else {
      str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("PROJECT_COVER", "#");
    }

    // Add SDGs
    var list_weght = [];
    try {
      list_weght = obj_project.weight.split(",");
    } catch (e) {}

    if (list_weght.length > 0){
      var sdg = ""
      for (var index_segs = 0; index_segs < list_weght.length; index_segs ++){
        if (1 == parseInt(list_weght[index_segs])) {
          var index_sdg = ("0" + (index_segs + 1)).slice(-2);
          sdg = sdg + str_SDG_in_list_project.replaceAll("INDEX_SDG", index_sdg);
        }
      }
      str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("SDGS_LIST", sdg);
    } else {
      str_project_block_in_project_page_innetHTML = str_project_block_in_project_page_innetHTML.replaceAll("SDGS_LIST", "");
    }

    // Replace variable and generate block
    var project_block = document.createElement("div");
    project_block.className = "col-md-4";
    project_block.innerHTML = str_project_block_in_project_page_innetHTML;

    // Append
    var obj_project_container = document.getElementById("project_container");
    obj_project_container.append(project_block);
  }
}
