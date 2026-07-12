export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }

  const separator = ',';
  // Exclude nested objects or format them
  const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
  
  const csvContent = [
    keys.join(separator),
    ...data.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = String(cell).replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
