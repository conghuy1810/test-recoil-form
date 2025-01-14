import { fieldAtomFamily } from './atoms';

export function gan(atomName) {
  return `WitForm_${atomName}`;
}

export function getNewRowId(rowIds) {
  let val = Math.floor(Math.random() * 10000);
  while (rowIds.indexOf(val) !== -1) {
    val++;
  }
  return val;
}

export function generateFormId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function snapshotToGet(snapshot) {
  return (atom) => snapshot.getLoadable(atom).contents;
}

export function getFullObjectPath(params, get) {
  let path = '';
  let prevAncestors = [];
  for (const ancestor of params.ancestors) {
    const ancestorValue = get(
      fieldAtomFamily({
        formId: params.formId,
        ancestors: prevAncestors,
        name: ancestor.name,
        type: 'field-array',
      })
    );
    const rowIndex = ancestorValue.rowIds.indexOf(ancestor.rowId);
    path = path + `${ancestor.name}[${rowIndex}].`;
    prevAncestors.push(ancestor);
  }
  path = path + params.name;
  return path;
}
