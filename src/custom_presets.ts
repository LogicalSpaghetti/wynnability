import * as utils from './utils';
import * as main from './messy_main';
import {BaseTree, generateIconUrl} from "./messy_main";
import {loadModal, tree} from "./index.ts";
import type {StringTo} from "./utils";

export type Preset = {
    "credit": string,
    "title": string,
    "description": string,
    "class": string,
    "baseclass": string,
    "completeness": number,
    "filename": string,
};

console.log("custom presets loaded");
let sortedPresets: Preset[] = [];
let treeCache: StringTo<BaseTree> = {};
const MAX_CACHED_TREES = 15;
const TOUCH_PROCESSOR = new utils.TouchProcessor();

async function initializePresets() {
    if (sortedPresets.length > 0) return false;

    let unsortedPresets = await getPresets();
    if (unsortedPresets == null) return false;

    sortedPresets = sortPresets(unsortedPresets);
    return true;
}

async function getPresets(): Promise<null | Preset[]> {
    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('Fetch request timed out');
    }, 5000);

    return await fetch(`presets/presets.json`, {
        signal,
        cache: 'no-store',
        mode: 'same-origin',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    }).then((response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.text();
    }).then((text) => {
        return JSON.parse(text);
    }).catch((e) => {
        console.log(e.stack);
        utils.showSmallToast("Load Failed: couldn't reach the server");
        return null;
    }).finally(() => {
        clearTimeout(timeoutId);
    });
}

function sortPresets(presetArray: Preset[]): Preset[] {
    return presetArray.sort((a, b) =>
        (b.completeness - a.completeness) || a.title.localeCompare(b.title));
}

function filterResults(searchID = "customSearch", classSelectID = "customClassSelect") {
    let filterSubstring = String((document.getElementById(searchID) as HTMLInputElement)?.value).toLowerCase();
    let classs = (document.getElementById(classSelectID) as HTMLInputElement)?.value;
    let filteredArray;

    if (classs === 'all')
        filteredArray = sortedPresets;
    else
        filteredArray = sortedPresets.filter((preset) => {
            return preset['class'] == classs;
        });

    if (filterSubstring !== '')
        filteredArray = filteredArray.filter((preset) => {
            return preset['credit'].toLowerCase().includes(filterSubstring) || preset['title'].toLowerCase().includes(filterSubstring);
        });

    return filteredArray;
}

function cacheTree(filename: string, tree: BaseTree) {
    if (!treeCache[filename]) {
        const keys = Object.keys(treeCache);
        if (keys.length >= MAX_CACHED_TREES)
            delete treeCache[keys[0]];
    }

    return treeCache[filename] = tree;
}

async function getPreset(filename: string) {
    if (treeCache[filename])
        return treeCache[filename];

    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('Fetch request timed out');
    }, 5000);

    const presetTree = await fetch(`presets/custom/${filename}.json`, {
        signal,
        cache: 'no-store',
        mode: 'same-origin',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    }).then((response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.text();
    }).then((text) => {
        let tree = new main.BaseTree(false);
        tree.loadFromJSON(text, false, false);
        return tree;
    }).catch((e) => {
        console.log(e);
        return null;
    }).finally(() => {
        clearTimeout(timeoutId);
    });

    return presetTree ? cacheTree(filename, presetTree) : null;
}

async function getRandomNodeOfType(filename: string, type = "red") {

    let tree = await getPreset(filename);
    if (!tree) return -1;

    let filteredAbilities = [];
    for (let id of Object.keys(tree.abilities)) {
        if (tree.abilities[id].type == type)
            filteredAbilities.push(id);
    }

    return filteredAbilities[Math.floor(Math.random() * filteredAbilities.length)] ?? -1;
}

async function renderRandomAbilityTooltip(filename: string, type = "red", signal = {cancel: false}, containerId = "cursorTooltip") {

    const container = document.getElementById(containerId);
    if (!container) return;

    container.hidden = false;
    container.innerHTML = "Loading random ability...";

    await (async () => {
        const randomAbilityID = await getRandomNodeOfType(filename, type);
        if (randomAbilityID == -1)
            return;
        const tree = await getPreset(filename);
        if (tree && !signal.cancel) {
            tree.renderHoverAbilityTooltip(randomAbilityID);
            utils.adjustTooltipSize();
        }
    })();
}

export async function renderSearchResults(containerID = "customPresetContainer") {
    await initializePresets();

    const container = document.getElementById(containerID);
    if (!container) return;
    container.innerHTML = "";

    const filteredArray = filterResults();

    if (filteredArray.length == 0) {
        container.innerHTML = "<span style='font-style: italic;'>*crickets*</span>";
        return;
    }

    for (let preset of filteredArray) {
        const div = document.createElement("div");
        div.classList.add('minecraftTooltip', 'w-100', 'mb-3', 'overflow-hidden');

        div.addEventListener('dblclick', async () => {
            const loadedTree = await getPreset(preset['filename']);
            tree.loadFromJSON(JSON.stringify(loadedTree, null, 0));
            tree.saveState("Loaded a custom tree");
            loadModal.hide();
        });
        div.addEventListener('touchstart', (e) => {
            if ((e.currentTarget as HTMLElement)?.tagName === "IMG" || !document.getElementById("cursorTooltip")?.hidden)
                return;
            TOUCH_PROCESSOR.processTouch(
                e,
                async () => {
                    const loadedTree = await getPreset(preset['filename']);
                    tree.loadFromJSON(JSON.stringify(loadedTree, null, 0));
                    tree.saveState("Loaded a custom tree");
                    loadModal.hide();
                },
            );
        }, {passive: false});

        const upper = document.createElement("div");
        upper.classList.add('d-inline-flex', 'w-100', "mb-2");
        div.appendChild(upper);

        const left = document.createElement("div");
        left.classList.add("flex-fill");
        upper.appendChild(left);

        const title = document.createElement("div");
        title.innerHTML = utils.minecraftToHTML(preset['title']);
        left.appendChild(title);

        const credit = document.createElement("div");
        credit.classList.add("customCredit");
        credit.innerHTML = utils.minecraftToHTML('§7by ' + preset['credit']);
        left.appendChild(credit);

        const imgholder = document.createElement("div");
        imgholder.classList.add("d-flex", "align-items-center");
        upper.appendChild(imgholder);

        const description = document.createElement("div");
        description.classList.add("customDescription");
        description.innerHTML = utils.sanitizeHTML(preset['description']);
        div.appendChild(description);

        let icons;
        if (preset['class'] === 'custom')
            icons = ['yellow', 'purple', 'blue', 'red', 'skill'];
        else
            icons = ['yellow', 'purple', 'blue', 'red'];

        imgholder.id = "customAbilityPreview";
        icons.forEach((type) => {
            const div = document.createElement("div");
            div.classList.add('ability-type-selector', 'ms-1', 'centered-element-container');

            const img = document.createElement('img');
            img.src = generateIconUrl(type, preset['baseclass'], 1) ?? "";
            img.style.zIndex = "11";
            div.appendChild(img);

            const cancelRender = {cancel: false};
            div.addEventListener('pointerover', (e) => {
                if (e.pointerType !== "touch") {
                    cancelRender.cancel = false;
                    renderRandomAbilityTooltip(preset['filename'], type, cancelRender);
                    img.src = generateIconUrl(type, preset['baseclass'], 2) ?? "";
                }
            });
            div.addEventListener('pointerout', (e) => {
                if (e.pointerType !== "touch") {
                    cancelRender.cancel = true;
                    utils.hideHoverAbilityTooltip();
                    img.src = generateIconUrl(type, preset['baseclass'], 1) ?? "";
                }
            });
            div.addEventListener('touchstart', (e) => {

                cancelRender.cancel = false;

                TOUCH_PROCESSOR.processTouch(
                    e,
                    () => {
                        img.src = generateIconUrl(type, preset['baseclass'], 2) ?? "";
                        document.body.style.overflow = 'hidden';
                        renderRandomAbilityTooltip(preset['filename'], type, cancelRender);
                        utils.moveTooltip(e.changedTouches[0].clientX, e.changedTouches[0].clientY);

                        document.addEventListener('touchstart', (event) => {
                            if (e.target !== event.target)
                                cancelRender.cancel = true;
                            img.src = generateIconUrl(type, preset['baseclass'], 1) ?? "";
                        }, {once: true});
                    },
                );
            }, {passive: false});
            imgholder.appendChild(div);
        });

        container.appendChild(div);
    }
}