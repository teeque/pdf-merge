const filesSelected = document.getElementById('filesSelected');
const fileInput = document.getElementById('files');
const submitButton = document.getElementById('submit-btn');
const info = document.getElementById('info');
let filesArray = [];

info.addEventListener('dragover', (e) => {
    e.preventDefault();
    info.classList.add('highlight');
});

info.addEventListener('dragleave', () => {
    info.classList.remove('highlight');
});

info.addEventListener('drop', (e) => {
    e.preventDefault();
    info.classList.remove('highlight');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files);
});

function handleFiles(files) {
    filesArray = Array.from(files);
    filesSelected.replaceChildren();
    info.classList.add('hide');
    submitButton.classList.remove('hide');
    filesArray.forEach((file, index) => {
        let div = document.createElement('div');
        div.classList.add('file-item');
        div.dataset.index = index;

        let p = document.createElement('p');
        p.textContent = file.name;

        if (index === 0) {
            let downButton = document.createElement('button');
            downButton.textContent = '↓';
            downButton.classList.add('move-down');
            downButton.onclick = (e) => {
                e.preventDefault();
                moveDown(index);
            };
            div.appendChild(downButton);
        } else {
            let upButton = document.createElement('button');
            upButton.textContent = '↑';
            upButton.classList.add('move-up');
            upButton.onclick = (e) => {
                e.preventDefault();
                moveUp(index);
            };
            div.appendChild(upButton);
        }

        div.appendChild(p);
        filesSelected.appendChild(div);
    });
    updateButtons();
}

function moveUp(index) {
    if (index === 0) return;
    [filesArray[index - 1], filesArray[index]] = [filesArray[index], filesArray[index - 1]];
    handleFiles(filesArray);
}

function moveDown(index) {
    if (index === filesArray.length - 1) return;
    [filesArray[index + 1], filesArray[index]] = [filesArray[index], filesArray[index + 1]];
    handleFiles(filesArray);
}

function updateButtons() {
    const items = filesSelected.querySelectorAll('.file-item');
    items.forEach((item, index) => {
        const upButton = item.querySelector('.move-up');
        const downButton = item.querySelector('.move-down');
        upButton.style.display = index === 0 ? 'none' : 'inline-block';
        downButton.style.display = index === items.length - 1 ? 'none' : 'inline-block';
    });
}

function getFile() {
    document.getElementById('files').click();
}

document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    filesArray.forEach((file, index) => {
        formData.append('files', file);
    });
    fetch('/merge', {
        method: 'POST',
        body: formData
    }).then(response => response.blob())
      .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `merged_${Date.now()}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Error:', error));
});