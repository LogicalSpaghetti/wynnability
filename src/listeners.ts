import {loadModal, tree} from "./global_objects";
import * as utils from "./utils";
import {invertTheme} from "./index.ts";

export function addListeners() {
    const dropzone = document.getElementById('dropzone');
    ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((str): void =>
        dropzone?.addEventListener(str, (e) => e.preventDefault()));
    dropzone?.addEventListener('drop', (e) => {
        tree.loadTreeFromDrop(e);
        loadModal.hide();
    });

    const blindnessToggle = document.getElementById('blindnessToggle');
    blindnessToggle?.addEventListener('pointerover', () => {
        const container = document.getElementById('cursorTooltip');
        if (!container) return;
        container.hidden = false;
        container.innerHTML = `<span style='color:#ff55ff' class='fw-bold'>Eye&nbsp;Piercer</span><br><br>
            <span style='color:#ffff55'>✧&nbsp;</span><span style='color:#aaaaaa'>Effect:&nbsp;</span><span style='color:#ffffff'>Blindness&nbsp;(</span><span style='color:#ff5555'>⬣</span><span style='color:#ffffff'>)&nbsp;to&nbsp;Self</span>`;
    });
    blindnessToggle?.addEventListener('pointerout', () => utils.hideHoverAbilityTooltip());

    const themeSwitchImage = document.getElementById('themeSwitchImage');
    themeSwitchImage?.addEventListener('click', () => invertTheme());
}
