import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import * as utils from './utils.ts';
import * as custom from './custom_presets.ts';
import * as listeners from "./listeners.ts";
import {loadModal, tree} from './global_objects.ts';

// TODO: is "load" better than "DOMContentLoaded"? Should inputs be delayed?
window.addEventListener("DOMContentLoaded", loadPage);

function loadPage() {
    // TODO: preLoadAssets();
    listeners.addListeners();
}

window.utils = utils;
window.custom = custom;

window.changeHidden = changeHidden;
window.tree = tree;
window.loadModal = loadModal;

// #region Cookies
const LAST_SESSION_STORAGE_NAME = 'lastClosedSession';
const LAST_SESSION_THEME = 'theme';

window.addEventListener('beforeunload', () => {
    localStorage.setItem(LAST_SESSION_STORAGE_NAME, JSON.stringify(tree, null, 0));
});

if (typeof document.hidden !== "undefined") {
    document.addEventListener("visibilitychange", () => {
        if (document.hidden)
            localStorage.setItem(LAST_SESSION_STORAGE_NAME, JSON.stringify(tree, null, 0));
    });
}

window.switchTheme = function switchTheme(theme: string) {
    document.body.dataset['bsTheme'] = theme;
    localStorage.setItem(LAST_SESSION_THEME, theme);
};

document.addEventListener("DOMContentLoaded", () => {

    const json = localStorage.getItem(LAST_SESSION_STORAGE_NAME);
    if (json != null) {
        localStorage.removeItem(LAST_SESSION_STORAGE_NAME);
        tree.loadFromJSON(json);
        tree.saveState('Loaded last closed session');
    }

    const theme = localStorage.getItem(LAST_SESSION_THEME);
    if (theme != null) {
        document.body.dataset['bsTheme'] = theme;
        if (theme == 'dark') {
            changeHidden(false, [], ['themeSwitchDark']);
            changeHidden(true, [], ['themeSwitchLight']);
        }
    }
});
// #endregion

const treeModal = document.getElementById('treeModal');
const treeNameInput = document.getElementById('treeNameInput');
treeModal.addEventListener('shown.bs.modal', () => {
    treeNameInput.focus();
});

const archetypeModal = document.getElementById('archetypeModal');
const archetypeNameInput = document.getElementById('archetypeNameInput');
archetypeModal.addEventListener('shown.bs.modal', () => {
    archetypeNameInput.focus();
});

const abilityModal = document.getElementById('abilityModal');
abilityModal.addEventListener('shown.bs.modal', () => {
    tree.renderEditorAbilityTooltip();
});
document.getElementById('editAbilityTooltip').addEventListener('click', () => tree.renderEditorAbilityTooltip(false));
window.addEventListener('resize', () => {
    if (!abilityModal.ariaHidden) tree.renderEditorAbilityTooltip();
});

history.pushState(null, null, location.href);
window.addEventListener('popstate', (e) => {
    if (!abilityModal.ariaHidden)
        history.pushState(null, null, location.href);
    else
        history.back();
});


utils.enforceMinMax('maxSaveStates', 1, 100);

// TODO: mostly used for theme switching which is weird
function changeHidden(hidden: boolean, classes: string[] = [], ids: string[] = []): void {
    for (let className of classes)
        for (let element of document.getElementsByClassName(className))
            (element as HTMLElement).hidden = hidden;

    if (ids.length) for (let element of ids.map(id => document.getElementById(id)))
        if (element) element.hidden = hidden;
}

document.addEventListener("DOMContentLoaded", () => {

    //Attaches a div to a cursor, used to display content
    document.addEventListener('pointermove', (e) => {
        utils.moveTooltip(e.clientX, e.clientY, true);
    });
    //Makes tooltip disappear on tap
    document.addEventListener('touchstart', () => {
        utils.hideHoverAbilityTooltip();
    });
    document.addEventListener('wheel', (e) => utils.hideHoverAbilityTooltip());

    let treescrollprocessor = new utils.TouchProcessor();
    document.getElementById('treeTableBody')?.addEventListener('touchstart', (e) => {
        e.preventDefault();
        let swipeY = e.changedTouches[0].clientY;
        treescrollprocessor.processTouch(e,
            () => {
            },
            () => {
            },
            () => {
            },
            () => {
            },
            () => {
            },
            () => {
            },
            (event) => {
                const deltaY = event.changedTouches[0].clientY - swipeY;
                if (Math.abs(deltaY) > 30) {
                    swipeY = event.changedTouches[0].clientY;
                    if (deltaY < 0)
                        tree.incrementVerticalPage(1);
                    else
                        tree.incrementVerticalPage(-1);
                }
            },
        );
    }, {passive: false});

    const containersToHide = document.getElementsByClassName("shown-on-allocation");
    for (let container of containersToHide)
        container.hidden = true;

    //Populates color options from utils.codeDictionaryColor map
    const colorContainers = document.getElementsByClassName("colorContainer");

    for (let key in utils.codeDictionaryColor) {
        if (utils.codeDictionaryColor[key] == null)
            continue;

        const button = document.createElement("button");
        button.style = "height: 16px; width: 16px; margin-right: 4px; background-color:" + utils.codeDictionaryColor[key];
        button.tabIndex = "-1";
        button.type = "button";

        for (let container of colorContainers) {
            const clone = button.cloneNode(false);
            container.appendChild(clone);
            clone.addEventListener("click", () => {
                utils.insertStringBeforeSelected(utils.preferredDelimiter + key);
            });
        }

        button.remove();
    }

    //Populates generic unicode options from utils.codeDictionaryGenericSymbols map
    const genericUnicodeContainers = document.getElementsByClassName("genericUnicodeContainer");

    for (let key in utils.codeDictionaryGenericSymbols) {
        const button = document.createElement("button");
        button.title = key;
        button.classList.add('small-btn', 'font-minecraft');

        const div = document.createElement("div");
        button.appendChild(div);
        div.innerHTML = utils.minecraftToHTML(utils.codeDictionaryGenericSymbols[key]);
        button.tabIndex = "-1";
        button.type = "button";

        for (let container of genericUnicodeContainers) {
            const clone = button.cloneNode(true);
            container.appendChild(clone);
            clone.addEventListener("click", () => {
                utils.insertStringBeforeSelected(utils.codeDictionaryGenericSymbols[key]);
            });
        }

        button.remove();
    }

    //Populates class unicode options from utils.codeDictionaryClassSymbols map
    const classUnicodeContainers = document.getElementsByClassName("classUnicodeContainer");

    for (let key in utils.codeDictionaryClassSymbols) {
        const button = document.createElement("button");
        button.title = key;
        button.classList.add('small-btn', 'font-minecraft');

        const div = document.createElement("div");
        button.appendChild(div);
        div.innerHTML = utils.minecraftToHTML(utils.codeDictionaryClassSymbols[key]);

        button.tabIndex = "-1";
        button.type = "button";

        for (let container of classUnicodeContainers) {
            const clone = button.cloneNode(true);
            container.appendChild(clone);
            clone.addEventListener("click", () => {
                utils.insertStringBeforeSelected(utils.codeDictionaryClassSymbols[key]);
            });
        }

        button.remove();
    }

    //Populates common ability options from utils.codeDictionaryCommonAbilityAttributes map
    const commonAbilityUnicodeContainers = document.getElementsByClassName("commonAbilityUnicodeContainer");

    for (let key in utils.codeDictionaryCommonAbilityAttributes) {
        const button = document.createElement("button");
        button.title = key;
        button.classList.add('large-btn', 'font-minecraft');

        const div = document.createElement("div");
        button.appendChild(div);
        div.innerHTML = utils.minecraftToHTML(utils.codeDictionaryCommonAbilityAttributes[key][0]);

        button.tabIndex = "-1";
        button.type = "button";

        for (let container of commonAbilityUnicodeContainers) {
            const clone = button.cloneNode(true);
            container.appendChild(clone);
            clone.addEventListener("click", () => {
                utils.insertStringBeforeSelected(utils.codeDictionaryCommonAbilityAttributes[key][1]);
            });
        }

        button.remove();
    }

    //Makes labels display remaining character count when something is typed
    const automatedCharCountLabels = document.getElementsByClassName("maxlength-label");

    for (let label of automatedCharCountLabels) {

        let input = document.getElementById(label.getAttribute('for'));

        if (input == null || input.getAttribute('maxlength') == null)
            continue;

        input.addEventListener("input", () =>
            label.innerHTML = input.value.length > 0 ? `${input.value.length}/${input.getAttribute('maxlength')}` : input.placeholder);

        abilityModal.addEventListener('shown.bs.modal', () =>
            label.innerHTML = input.value.length > 0 ? `${input.value.length}/${input.getAttribute('maxlength')}` : input.placeholder);
    }

    //Makes .integer inputs round floats
    const automatedRoundInputs = document.getElementsByClassName("integer");
    for (let input of automatedRoundInputs) {
        input.addEventListener("change", (e) => {
            input.value = Math.round(input.value);
        }, true);
    }
});

