export function SaveToFile(data,fileName) {
    const blob = new window.Blob([data], { type: 'text/plain' })
    const e = document.createEvent('MouseEvents'),
        a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
    e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
}
