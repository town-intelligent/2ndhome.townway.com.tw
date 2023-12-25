export const parse_sdgs_items = (plan_info) => {
  if (!plan_info || !plan_info.weight_description) {
    // 如果 plan_info 是 null、undefined 或者 weight_description 不存在，
    // 則返回一個空陣列或進行其他處理。
    return [];
  }

  const weights = JSON.parse(plan_info.weight_description);
  const sdgs_items = Object.entries(weights).map(([key, value]) => {
    const title = "SDG " + (parseInt(key) + 1);
    let index = parseInt(key) + 1;
    index = ("0" + index).slice(-2);

    return { title, index, value };
  });

  return sdgs_items;
};

const psrse_date_string = (str) => {
  const regex = new RegExp("^(\\d+)/(\\d+)/(\\d+)$");
  const matches = regex.exec(str);
  if (matches == null) {
    console.log(str);
    return null;
  }
  const [_, month, day, year] = matches;
  const date = new Date();
  date.setMonth(month - 1);
  date.setDate(day);
  date.setFullYear(year);

  return date;
};

export const get_period_dates = (period) => {
  let start_date = null,
    end_date = null;
  if (typeof period !== "string") {
    return { start_date, end_date };
  }

  const items = period.split("-");
  if (items.length === 2) {
    [start_date, end_date] = items.map(psrse_date_string);
  }

  return { start_date: start_date, end_date };
};

export const get_sorted_tasks = (tasks) => {
  tasks = tasks.map((task) => {
    const { start_date, end_date } = get_period_dates(task.period);

    return { ...task, start_date, end_date };
  });

  const sorted_tasks = tasks.sort((a, b) => {
    if (a.start_date == null) {
      return -1;
    }
    if (b.start_date == null) {
      return 1;
    }

    return b.start_date.getTime() - a.start_date.getTime();
  });

  return sorted_tasks;
};
