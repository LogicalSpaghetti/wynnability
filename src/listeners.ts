import {loadModal, tree} from "./global_objects.ts";

export function addListeners() {
    const dropzone = document.getElementById('dropzone');
    ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((str) => {
        dropzone.addEventListener(str, (e) => {
            e.preventDefault();
        });
    });
    dropzone?.addEventListener('drop', (e) => {
        tree.loadTreeFromDrop(e);
        loadModal.hide();
    });


}
