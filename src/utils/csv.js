import { REQUIRED_DATE_COLUMNS, REQUIRED_PLAN_COLUMNS } from '../config/dashboard';
import { formatBranchName } from './branch';
import { parseReportDate, toDateKey } from './date';

const parseLine = (line) => {
  const values = [];
  let currentValue = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(currentValue);
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  values.push(currentValue);
  return values;
};

export const parseCSV = (csvText) => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.replace(/^\uFEFF/, ''))
    .filter((line) => line.trim() !== '');

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseLine(lines[0]).map((value) => value.trim().replace(/^"|"$/g, ''));
  const rows = lines
    .slice(1)
    .map((line) => {
      const values = parseLine(line);
      const row = {};

      headers.forEach((header, index) => {
        let value = values[index] ? values[index].trim() : '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        row[header] = value;
      });

      return row;
    })
    .filter((row) => Object.values(row).some((value) => String(value ?? '').trim() !== ''));

  return { headers, rows };
};

const getMissingColumns = (headers, requiredColumns) => requiredColumns
  .filter((column) => !headers.includes(column));

const buildSummaryMessage = (label, importedRows, ignoredRows, invalidRows) => {
  const parts = [`成功导入 ${importedRows} 条${label}`];

  if (ignoredRows > 0) {
    parts.push(`忽略 ${ignoredRows} 条空白行`);
  }

  if (invalidRows > 0) {
    parts.push(`跳过 ${invalidRows} 条格式异常行`);
  }

  return `${parts.join('，')}。`;
};

export const parsePlanCsvText = (csvText) => {
  const { headers, rows } = parseCSV(csvText);

  if (headers.length === 0) {
    return {
      ok: false,
      message: '文件为空，请选择包含表头和数据的 Plan CSV。',
    };
  }

  const missingColumns = getMissingColumns(headers, REQUIRED_PLAN_COLUMNS);
  if (missingColumns.length > 0) {
    return {
      ok: false,
      message: `Plan CSV 缺少必要列：${missingColumns.join('、')}。`,
    };
  }

  if (rows.length === 0) {
    return {
      ok: false,
      message: 'Plan CSV 只有表头，没有可导入的数据行。',
    };
  }

  const cleanedRows = [];
  let ignoredRows = 0;
  let invalidRows = 0;

  rows.forEach((row) => {
    const branch = formatBranchName(row['机构名称']);
    const plannedRaw = String(row['应上报授信户数'] ?? '').trim();

    if (!branch && !plannedRaw) {
      ignoredRows += 1;
      return;
    }

    const planned = Number.parseInt(plannedRaw, 10);
    if (!branch || Number.isNaN(planned) || planned < 0) {
      invalidRows += 1;
      return;
    }

    cleanedRows.push({
      ...row,
      '机构名称': branch,
      '应上报授信户数': String(planned),
    });
  });

  if (cleanedRows.length === 0) {
    return {
      ok: false,
      message: '没有找到有效的计划数据，请检查“机构名称”和“应上报授信户数”列。',
    };
  }

  return {
    ok: true,
    data: cleanedRows,
    summary: { importedRows: cleanedRows.length, ignoredRows, invalidRows },
    message: buildSummaryMessage('计划记录', cleanedRows.length, ignoredRows, invalidRows),
  };
};

export const parseDateCsvText = (csvText) => {
  const { headers, rows } = parseCSV(csvText);

  if (headers.length === 0) {
    return {
      ok: false,
      message: '文件为空，请选择包含表头和数据的 Date CSV。',
    };
  }

  const missingColumns = getMissingColumns(headers, REQUIRED_DATE_COLUMNS);
  if (missingColumns.length > 0) {
    return {
      ok: false,
      message: `Date CSV 缺少必要列：${missingColumns.join('、')}。`,
    };
  }

  if (rows.length === 0) {
    return {
      ok: false,
      message: 'Date CSV 只有表头，没有可导入的数据行。',
    };
  }

  const cleanedRows = [];
  let ignoredRows = 0;
  let invalidRows = 0;

  rows.forEach((row) => {
    const branch = formatBranchName(row['机构名称']);
    const rawDate = String(row['上报日期'] ?? '').trim();

    if (!branch && !rawDate) {
      ignoredRows += 1;
      return;
    }

    const reportDate = parseReportDate(rawDate);
    if (!branch || !reportDate) {
      invalidRows += 1;
      return;
    }

    cleanedRows.push({
      ...row,
      '机构名称': branch,
      '客户名称': String(row['客户名称'] ?? '').trim(),
      '上报日期': toDateKey(reportDate),
    });
  });

  if (cleanedRows.length === 0) {
    return {
      ok: false,
      message: '没有找到有效的上报数据，请检查“机构名称”和“上报日期”列。',
    };
  }

  return {
    ok: true,
    data: cleanedRows,
    summary: { importedRows: cleanedRows.length, ignoredRows, invalidRows },
    message: buildSummaryMessage('上报记录', cleanedRows.length, ignoredRows, invalidRows),
  };
};
