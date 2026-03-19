export const formatBranchName = (value) => String(value ?? '')
  .replace(/\u3000/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const normalizeBranchName = (value) => formatBranchName(value)
  .replace(/\s+/g, '')
  .toLowerCase();
