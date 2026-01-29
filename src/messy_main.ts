import type {NumberTo, StringTo} from "./utils";
import * as utils from './utils';

type NameInput = (HTMLInputElement & { oldName: string }) | null

const classNames = ['archer', 'assassin', 'mage', 'shaman', 'warrior'];

const abilityIconDirectoryPath = `/wynnability/assets/img/abilities/`;

const abilityIconDictionary: StringTo<string> = {
    'skill': 'class/',
    'red': 'generic/red',
    'blue': 'generic/blue',
    'purple': 'generic/purple',
    'yellow': 'generic/yellow',
    'white': 'generic/white',
};

const nodeDictionary: StringTo<{ path: string, color_tag: string }> = {
    'skill': {
        'path': 'class/',
        'color_tag': 'g',
    },
    'magenta': {
        'path': 'generic/magenta',
        'color_tag': 'd',
    },
    'red': {
        'path': 'generic/red',
        'color_tag': 'k',
    },
    'blue': {
        'path': 'generic/blue',
        'color_tag': 'j',
    },
    'purple': {
        'path': 'generic/purple',
        'color_tag': 'i',
    },
    'yellow': {
        'path': 'generic/yellow',
        'color_tag': 'h',
    },
    'white': {
        'path': 'generic/white',
        'color_tag': 'f',
    },
};

const altAbilityIconDictionary: StringTo<string> = {
    'skill': 'class/',
    'magenta': 'generic/magenta',
    'red': 'generic/red',
    'blue': 'generic/blue',
    'purple': 'generic/purple',
    'yellow': 'generic/yellow',
    'white': 'generic/white',
};

const reverseDirectionDictionary: StringTo<string> = {
    'up': 'down',
    'down': 'up',
    'right': 'left',
    'left': 'right',
};

const priorityMap: StringTo<number> = {};
Object.keys(altAbilityIconDictionary).forEach((elem, i) => {
    priorityMap[elem] = i;
});

function generateIconDiv(type: string, travelNode: TravelNode | null = new TravelNode(), classs = "", allocationStatus = 0, bScaleAbilityIcon = false, useAlternativeAbilityIcons = false) {

    let result = document.createElement('div');
    result.classList.add('centered-element-container');

    if (travelNode instanceof TravelNode)
        result.innerHTML = travelNode.generateIconHTML();

    let url = generateIconUrl(type, classs, allocationStatus, useAlternativeAbilityIcons);

    if (url) {
        let img = document.createElement('img');

        img.src = url;
        img.style.zIndex = '11';

        if (bScaleAbilityIcon) {
            img.style.width = `${img.naturalWidth * 100 / 36}%`;
            img.onload = () =>
                img.style.width = `${img.naturalWidth * 100 / 36}%`;
        }

        result.appendChild(img);
    }

    return result;
}

const statusSuffixes = ['_blocked', '_dark', '', '_a'];

export function generateIconUrl(type: string, classs = "custom", allocationStatus = 0, useAlternativeAbilityIcons = false) {

    let iconDictionary = useAlternativeAbilityIcons
        ? altAbilityIconDictionary : abilityIconDictionary;

    const suffix = statusSuffixes[allocationStatus + 1];

    return suffix == null ? null
        : (type === 'skill' ? abilityIconDirectoryPath + iconDictionary[type] + classs + `/skill${suffix}.png`
            : (type in iconDictionary ? abilityIconDirectoryPath + iconDictionary[type] + `${suffix}.png`
                : null));
}

const POINTS_REQUIRED_LOWER = -69;
const POINTS_REQUIRED_UPPER = 69;
const POINTS_REQUIRED_INPUT_ID = 'pointsRequiredInput';
utils.enforceMinMax(POINTS_REQUIRED_INPUT_ID, POINTS_REQUIRED_LOWER, POINTS_REQUIRED_UPPER);

const ARCHETYPE_POINTS_REQUIRED_LOWER = 0;
const ARCHETYPE_POINTS_REQUIRED_UPPER = 420;
const ARCHETYPE_POINTS_REQUIRED_INPUT_ID = 'archetypePointsRequiredInput';
utils.enforceMinMax(ARCHETYPE_POINTS_REQUIRED_INPUT_ID, ARCHETYPE_POINTS_REQUIRED_LOWER, ARCHETYPE_POINTS_REQUIRED_UPPER);

type AbilityData = {

    name: string,
    description: string,
    unlockingWillBlock: number[],
    archetype: string,
    pointsRequired: number,
    archetypePointsRequired: number,
    type: string,
    requires: number,
}

class Ability {
    /**
     * Top-most text
     */
    name = '';

    /**
     * Name without minecraft formatting codes
     */
    _plainname = '';

    /**
     * Description
     */
    description = '';

    /**
     * Blocks these abilities from being allocated
     */
    unlockingWillBlock: number[] = [];

    /**
     * Archetype
     */
    archetype = '';

    /**
     * Ability point requirement
     */
    pointsRequired = POINTS_REQUIRED_LOWER;

    /**
     * Min archetype points required
     */
    archetypePointsRequired = ARCHETYPE_POINTS_REQUIRED_LOWER;

    /**
     * Ability type
     */
    type = '';

    /**
     * ID of the required ability
     */
    requires = -1;

    constructor({
                    name = '',
                    description = '',
                    unlockingWillBlock = [],
                    archetype = '',
                    pointsRequired = POINTS_REQUIRED_LOWER,
                    archetypePointsRequired = ARCHETYPE_POINTS_REQUIRED_LOWER,
                    type = 'skill',
                    requires = -1,
                }: AbilityData = {} as AbilityData) {

        this.name = String(name) ? String(name) : '';
        this._plainname = utils.stripMinecraftFormatting(this.name);
        this.description = String(description) ? String(description) : '';
        this.archetype = String(archetype) ? String(archetype) : '';

        this.unlockingWillBlock = [];
        if (Array.isArray(unlockingWillBlock))
            unlockingWillBlock.forEach(element => {
                if (!isNaN(Number(element)))
                    this.unlockingWillBlock.push(Number(element));
            });

        this.pointsRequired = isNaN(Number(pointsRequired)) ? POINTS_REQUIRED_LOWER : utils.clamp(Number(pointsRequired), POINTS_REQUIRED_LOWER, POINTS_REQUIRED_UPPER);

        this.archetypePointsRequired = isNaN(Number(archetypePointsRequired)) ? ARCHETYPE_POINTS_REQUIRED_LOWER : utils.clamp(Number(archetypePointsRequired), ARCHETYPE_POINTS_REQUIRED_LOWER, ARCHETYPE_POINTS_REQUIRED_UPPER);

        this.type = Object.keys(abilityIconDictionary).includes(type) || Object.keys(altAbilityIconDictionary).includes(type)
            ? String(type) : Object.keys(abilityIconDictionary)[0];

        this.requires = isNaN(Number(requires)) ? -1 : Number(requires);
    }

    getPlainName() {
        return this._plainname;
    }

    autoformatName() {
        const delimiter = utils.preferredDelimiter;
        this.name = `${delimiter}${nodeDictionary[this.type].color_tag}${delimiter}l${this._plainname}`;
    }
}

const VARIANT_COUNT = 4;
type VariantIndex = 1 | 2 | 3 | 4; // 1 to VARIANT_COUNT

type Direction = "up" | "down" | "left" | "right";
type ConnectionStrength = 0 | 1 | 2;

class TravelNode {
    /**
     * up : 0 means unconnected, 1 means connected, 2 means allocated
     */
    up: ConnectionStrength = 0;

    /**
     * down : 0 means unconnected, 1 means connected, 2 means allocated
     * @var int
     */
    down: ConnectionStrength = 0;

    /**
     * left : 0 means unconnected, 1 means connected, 2 means allocated
     * @var int
     */
    left: ConnectionStrength = 0;

    /**
     * right : 0 means unconnected, 1 means connected, 2 means allocated
     * @var int
     */
    right: ConnectionStrength = 0;

    /**
     * Which variant to pick when rendering
     * @var int
     */
    variant: VariantIndex = 1;

    constructor({
                    up = 0, down = 0, left = 0, right = 0,
                    variant = Math.ceil(Math.random() * VARIANT_COUNT) as VariantIndex,
                }: TravelNode = {} as TravelNode) {
        this.up = up;
        this.down = down;
        this.left = left;
        this.right = right;
        this.variant = variant;
    }

    mergeTravelNodes(travelNode: TravelNode) {
        this.up = Math.max(this.up, travelNode.up) as ConnectionStrength;
        this.down = Math.max(this.down, travelNode.down) as ConnectionStrength;
        this.left = Math.max(this.left, travelNode.left) as ConnectionStrength;
        this.right = Math.max(this.right, travelNode.right) as ConnectionStrength;
    }

    generateIconHTML() {
        let result = '';

        let connectionCountMap = {'connected': 0, 'active': 0};
        const properties: Direction[] = ['up', 'down', 'left', 'right'];
        for (let property of properties)
            if (this[property] == 1)
                connectionCountMap['connected']++;
            else if (this[property] == 2)
                connectionCountMap['active']++;

        if (connectionCountMap['connected'] == 0 && connectionCountMap['active'] == 0)
            return `<img src="${abilityIconDirectoryPath}branch/0000.png" class="ability-icon" style="z-index: 1;">\n`;

        if (connectionCountMap['connected'] > 0)
            result += `<img src="${abilityIconDirectoryPath}branch/${this.up != 0 ? 1 : 0}${this.down != 0 ? 1 : 0}${this.left != 0 ? 1 : 0}${this.right != 0 ? 1 : 0}.png" class="ability-icon" style="z-index: 1;">\n`;

        if (connectionCountMap['active'] == 1 || connectionCountMap['active'] == 4)
            result += `<img src="${abilityIconDirectoryPath}branch/${this.up == 2 ? 2 : 0}${this.down == 2 ? 2 : 0}${this.left == 2 ? 2 : 0}${this.right == 2 ? 2 : 0}.png" class="ability-icon" style="z-index: 2;">\n`;
        else if (connectionCountMap['active'] == 2)
            result += `<img src="${abilityIconDirectoryPath}branch/${this.up == 2 ? 2 : 0}${this.down == 2 ? 2 : 0}${this.left == 2 ? 2 : 0}${this.right == 2 ? 2 : 0}/${this.variant}.png" class="ability-icon" style="z-index: 2;">\n`;
        else if (connectionCountMap['active'] == 3)
            result += `<img src="${abilityIconDirectoryPath}branch/${this.up == 2 ? 2 : 0}${this.down == 2 ? 2 : 0}${this.left == 2 ? 2 : 0}${this.right == 2 ? 2 : 0}/${Math.ceil(this.variant / VARIANT_COUNT * 2)}.png" class="ability-icon" style="z-index: 2;">\n`;


        return result;
    }

    hasConnections() {
        return this.up != 0 || this.down != 0 || this.left != 0 || this.right != 0;
    }
}

const MAX_ABILITY_POINTS_LOWER = 1;
const MAX_ABILITY_POINTS_DEFAULT = 45;
const MAX_ABILITY_POINTS_UPPER = 1984;
const MAX_ABILITY_POINTS_INPUT_ID = 'maxAbilityPoints';
utils.enforceMinMax(MAX_ABILITY_POINTS_INPUT_ID, MAX_ABILITY_POINTS_LOWER, MAX_ABILITY_POINTS_UPPER);

const PAGES_LOWER = 1;
const PAGES_DEFAULT = 7;
const PAGES_UPPER = 30;
const PAGES_INPUT_ID = 'treePages';
utils.enforceMinMax(PAGES_INPUT_ID, PAGES_LOWER, PAGES_UPPER);

const HORIZONTAL_PAGES_LOWER = 1;
const HORIZONTAL_PAGES_DEFAULT = 1;
const HORIZONTAL_PAGES_UPPER = 30;
const HORIZONTAL_PAGES_INPUT_ID = 'horizontalPages';
utils.enforceMinMax(HORIZONTAL_PAGES_INPUT_ID, HORIZONTAL_PAGES_LOWER, HORIZONTAL_PAGES_UPPER);

const ROWS_PER_PAGE_LOWER = 3;
const ROWS_PER_PAGE_DEFAULT = 6;
const ROWS_PER_PAGE_UPPER = 11;
const ROWS_PER_PAGE_INPUT_ID = 'rowsPerPage';
utils.enforceMinMax(ROWS_PER_PAGE_INPUT_ID, ROWS_PER_PAGE_LOWER, ROWS_PER_PAGE_UPPER);

const PAGES_DISPLAYED_LOWER = 1;
const PAGES_DISPLAYED_DEFAULT = 2;
const PAGES_DISPLAYED_UPPER = 8;
const PAGES_DISPLAYED_INPUT_ID = 'pagesDisplayed';
utils.enforceMinMax(PAGES_DISPLAYED_INPUT_ID, PAGES_DISPLAYED_LOWER, PAGES_DISPLAYED_UPPER);

class Properties {
    /**
     * Class
     */
    classs = '';

    /**
     * Maximum ability points unsigned
     */
    maxAbilityPoints = 45;

    /**
     * Number of vertical ability tree pages unsigned
     */
    pages = 7;

    /**
     * Number of horizontal ability tree pages unsigned
     */
    horizontalPages = 1;

    /**
     * How many cells per page
     */
    rowsPerPage = 6;

    /**
     * How many pages are drawn
     * @var int
     */
    pagesDisplayed = 2;

    /**
     * Whether the tree can loop along the left and right edge
     */
    loopTree = false;

    /**
     * Whether you can go up the tree
     */
    bTravesableUp = false;

    /**
     * Whether to use extra ability icons
     */
    useAlternativeAbilityIcons = false;

    /**
     * Whether to enforce L shaped allocation (how it works in-game)
     */
    strictAllocation = true;

    constructor({
                    classs = classNames[0],
                    maxAbilityPoints = MAX_ABILITY_POINTS_DEFAULT,
                    loopTree = false,
                    pages = PAGES_DEFAULT,
                    horizontalPages = HORIZONTAL_PAGES_DEFAULT,
                    rowsPerPage = ROWS_PER_PAGE_DEFAULT,
                    pagesDisplayed = PAGES_DISPLAYED_DEFAULT,
                    bTravesableUp = false,
                    useAlternativeAbilityIcons = false,
                    strictAllocation = true,
                } = {}) {

        this.classs = classNames.find(name => name === String(classs)) ?? classNames[0];

        this.maxAbilityPoints = isNaN(Number(maxAbilityPoints)) ? MAX_ABILITY_POINTS_DEFAULT : utils.clamp(Number(maxAbilityPoints), MAX_ABILITY_POINTS_LOWER, MAX_ABILITY_POINTS_UPPER);

        this.pages = isNaN(Number(pages)) ? PAGES_DEFAULT : utils.clamp(Number(pages), PAGES_LOWER, PAGES_UPPER);

        this.horizontalPages = isNaN(Number(horizontalPages)) ? HORIZONTAL_PAGES_DEFAULT : utils.clamp(Number(horizontalPages), HORIZONTAL_PAGES_LOWER, HORIZONTAL_PAGES_UPPER);

        this.rowsPerPage = isNaN(Number(rowsPerPage)) ? ROWS_PER_PAGE_DEFAULT : utils.clamp(Number(rowsPerPage), ROWS_PER_PAGE_LOWER, ROWS_PER_PAGE_UPPER);

        this.pagesDisplayed = isNaN(Number(pagesDisplayed)) ? PAGES_DISPLAYED_DEFAULT : utils.clamp(Number(pagesDisplayed), PAGES_DISPLAYED_LOWER, Math.min(PAGES_DISPLAYED_UPPER, this.pages));

        this.loopTree = Boolean(loopTree);
        this.bTravesableUp = Boolean(bTravesableUp);
        this.useAlternativeAbilityIcons = Boolean(useAlternativeAbilityIcons);
        this.strictAllocation = Boolean(strictAllocation);
    }
}

class StateLog {

    /**
     * Latest change description
     */
    change: string;

    /**
     * JSON string representing the state
     */
    state: string;

    /**
     * Optional tag to help distinguish changes
     */
    type: string; // TODO: verify if optional

    constructor({change = '', state = '', type = ''}: StateLog = {} as StateLog) {
        this.change = change;
        this.state = state;
        this.type = type;
    }
}

const RESPONSE_TIMEOUT = 5000;
const EDIT_PATH_TEMP_CLASS = 'cell-edit-temp-element';
const MAX_SELECTED_CELLS = 40;
const CELL_ID_PREFIX = 'cell-';
const COLUMNS = 9;

type UncertainBaseTree = {
    properties: undefined | any,
    archetypes: undefined | any,
    abilities: undefined | any,
    selectedAbilityID: undefined | any,
    selectedArchetype: undefined | any,
    history: undefined | any,
    currentHistoryState: undefined | any,
    cellMap: undefined | any,
    currentVerticalPage: undefined | any,
    currentHorizontalPage: undefined | any,
    selectedCells: undefined | any,
    bEditMode: undefined | any,
    startingAbilityID: undefined | any,
    potentialAllocationMap: undefined | any,
    abilityTrees: undefined | any,
    selectedTree: undefined | any,
    currentTree: undefined | any,
}

export class BaseTree {
    /**
     * Generic properties of the editor
     */
    properties: Properties;

    /**
     * Archetypes
     */
    archetypes: string[] = [];

    /**
     * Abilities
     */
    abilities: StringTo<Ability> = {};

    /**
     * Selected ability id, waiting to be placed on the tree
     */
    selectedAbilityID = -1;

    /**
     * Selected archetype for ability sorting
     */
    selectedArchetype: string = '';

    /**
     * Recorded changes queue
     */
    history: StateLog[] = [];

    /**
     * Current history state
     */
    currentHistoryState = 0;

    /**
     * A map of cells, keys are cell number if counted left to right, up to down, starting at 1
     */
    cellMap: NumberTo<{ travelNode: TravelNode, abilityID: number | undefined }> = {};

    /**
     * Current horizontal page
     */
    currentVerticalPage = 1;

    /**
     * Current vertical page
     */
    currentHorizontalPage = 1;

    /**
     * Used by initializeEditNode method to keep track of affected cells
     */
    selectedCells: number[] = [];


    /**
     * Determines if the rendered tree is for editing or allocation
     */
    bEditMode = true;

    /**
     * Ability ID from which tree allocation starts
     */
    startingAbilityID: number | undefined;

    /**
     * abilityID : map of allocatable abilities from it as well as connecting nodes (abilityID : [path])
     */
    potentialAllocationMap: NumberTo<NumberTo<{ cellID: TravelNode }>> = {};

    /**
     * A map of names for trees, each tree is represented by an array of allocated cellIDs
     */
    abilityTrees: NumberTo<number[]> = {};

    /**
     * Determines which tree to render
     */
    selectedTree: string | undefined;

    /**
     * A copy of the current tree that\
     * Uses allocatedNodes to keep track of allocated nodes (abilityID : true)\
     * Uses connectedNodes to keep track of nodes connected to the tree : their connection points (abilityID : abilityID[])\
     * Uses blockedNodes to keep track of blocked nodes (abilityID : true)\
     * Uses archetypes to keep track of archetype points (archetype : unsignedInt)\
     * Uses abilityPoints to keep track of used ability points (unsignedInt)\
     * Uses travelNodes to keep track of paths between allocated nodes (cellID : travelNode)\
     */
    currentTree: undefined | {
        allocatedNodes: NumberTo<boolean>,
        connectedNodes: NumberTo<number[]>,
        blockedNodes: NumberTo<boolean>,
        archetypes: NumberTo<number>,
        abilityPoints: number,
        travelNodes: NumberTo<TravelNode>
    };

    #treeTouchProcessor = new utils.TouchProcessor();

    constructor(affectPage = true) {
        this.properties = new Properties();
        if (affectPage) {
            this.writeProperties();
            this.renderEverything();
            this.saveState('Reset tree and settings');
            window.addEventListener("pointerup", () => this.finallizeEditNode());
        }
    }

    // TODO: not unused(?), find best way to communicate that.
    // #region Serialization and history
    toJSON() {
        let result: { [key: string]: any } = {};
        for (let x in this) {
            if (x !== "history" && x !== "currentHistoryState" && x !== "selectedAbilityID" && x !== "currentVerticalPage" &&
                x !== "selectedCells" && x !== "currentTree" && x !== "potentialAllocationMap" && x !== "selectedArchetype" && x !== "treeTouchProcessor") {
                result[x] = this[x];
            }
        }
        return result;
    }

    readProperties(classSelectId = "classSelect", maxAbilityPointsId = MAX_ABILITY_POINTS_INPUT_ID, loopTreeId = "loopTreeSwitch", pagesId = PAGES_INPUT_ID, horizontalPagesId = HORIZONTAL_PAGES_INPUT_ID,
                   rowsPerPageId = ROWS_PER_PAGE_INPUT_ID, pagesDisplayedId = PAGES_DISPLAYED_INPUT_ID, bTravesableUpId = "travelUpSwitch", useAlternativeAbilityIconsId = "altIconSwitch", strictAllocationId = "strictAllocationSwitch") {

        if (this.properties != null && this.properties.loopTree != (document.getElementById(loopTreeId) as HTMLInputElement)?.checked) {
            const totalCells = this.properties.pages * this.properties.rowsPerPage * COLUMNS;

            for (let key = 1; key <= totalCells; key += COLUMNS)
                if (this.cellMap[key] != null && this.cellMap[key]['travelNode'] != null)
                    this.cellMap[key]['travelNode']['left'] = 0;

            for (let key = COLUMNS; key <= totalCells; key += COLUMNS)
                if (this.cellMap[key] != null && this.cellMap[key]['travelNode'] != null)
                    this.cellMap[key]['travelNode']['right'] = 0;
        }

        this.properties = new Properties({
            classs: (document.getElementById(classSelectId) as HTMLInputElement)?.value ?? '',
            maxAbilityPoints: Number((document.getElementById(maxAbilityPointsId) as HTMLInputElement)?.value) ?? 0,
            pages: Number((document.getElementById(pagesId) as HTMLInputElement)?.value) ?? 0,
            horizontalPages: Number((document.getElementById(horizontalPagesId) as HTMLInputElement)?.value) ?? 0,
            rowsPerPage: Number((document.getElementById(rowsPerPageId) as HTMLInputElement)?.value) ?? 0,
            pagesDisplayed: Number((document.getElementById(pagesDisplayedId) as HTMLInputElement)?.value) ?? 0,
            loopTree: (document.getElementById(loopTreeId) as HTMLInputElement)?.checked ?? false,
            bTravesableUp: (document.getElementById(bTravesableUpId) as HTMLInputElement)?.checked ?? false,
            useAlternativeAbilityIcons: (document.getElementById(useAlternativeAbilityIconsId) as HTMLInputElement)?.checked ?? false,
            strictAllocation: (document.getElementById(strictAllocationId) as HTMLInputElement)?.checked ?? true,
        });

        this.setMode(this.bEditMode);
        this.writeProperties();
        this.saveState('Updated properties');
    }

    writeProperties(classSelectId = "classSelect", maxAbilityPointsId = MAX_ABILITY_POINTS_INPUT_ID, loopTreeId = "loopTreeSwitch", pagesId = PAGES_INPUT_ID, horizontalPagesId = HORIZONTAL_PAGES_INPUT_ID,
                    rowsPerPageId = ROWS_PER_PAGE_INPUT_ID, pagesDisplayedId = PAGES_DISPLAYED_INPUT_ID, bTravesableUpId = "travelUpSwitch", useAlternativeAbilityIconsId = "altIconSwitch", strictAllocationId = "strictAllocationSwitch") {
        if (!document.getElementById(classSelectId)) {
            console.log("shit's fucked, needs to be react-ified");
            return;
        }
        (document.getElementById(classSelectId) as HTMLInputElement).value = this.properties.classs;
        (document.getElementById(maxAbilityPointsId) as HTMLInputElement).value = String(this.properties.maxAbilityPoints);
        (document.getElementById(pagesId) as HTMLInputElement).value = String(this.properties.pages);
        (document.getElementById(horizontalPagesId) as HTMLInputElement).value = String(this.properties.horizontalPages);
        (document.getElementById(rowsPerPageId) as HTMLInputElement).value = String(this.properties.rowsPerPage);
        (document.getElementById(pagesDisplayedId) as HTMLInputElement).value = String(this.properties.pagesDisplayed);
        (document.getElementById(loopTreeId) as HTMLInputElement).checked = this.properties.loopTree;
        (document.getElementById(bTravesableUpId) as HTMLInputElement).checked = this.properties.bTravesableUp;
        (document.getElementById(useAlternativeAbilityIconsId) as HTMLInputElement).checked = this.properties.useAlternativeAbilityIcons;
        (document.getElementById(strictAllocationId) as HTMLInputElement).checked = this.properties.strictAllocation;
    }

    renderScrollArrows(showSidewayArrows: boolean) {
        let hideElementsOfClass = showSidewayArrows ? "shown-on-single-horizontal-page" : "shown-on-multi-horizontal-page";
        let showElementsOfClass = !showSidewayArrows ? "shown-on-single-horizontal-page" : "shown-on-multi-horizontal-page";

        const containersToHide = document.getElementsByClassName(hideElementsOfClass) as HTMLCollectionOf<HTMLElement>;
        const containersToShow = document.getElementsByClassName(showElementsOfClass) as HTMLCollectionOf<HTMLElement>;

        for (let container of containersToHide) if (container)
            container.hidden = true;

        for (let container of containersToShow) if (container)
            container.hidden = false;
    }

    saveState(change = "", type = "", replaceSameType = false) {
        const state = JSON.stringify(this, null, 0);

        const replaceLast = replaceSameType && this.history[this.currentHistoryState].type == type;

        const numOfPreservedStates = this.currentHistoryState + (replaceLast ? 0 : 1);

        if (this.history.length > numOfPreservedStates)
            this.history.splice(numOfPreservedStates, this.history.length - numOfPreservedStates);

        const maxSaveStates = Number((document.getElementById('maxSaveStates') as HTMLInputElement)?.value) ?? 10;

        const removeElementsBeforeID = this.history.length - maxSaveStates + 1;

        if (removeElementsBeforeID > 0) {
            let newHistory: StateLog[] = [];

            this.history.forEach((element, index) => {

                if (index < removeElementsBeforeID)
                    return;

                newHistory.push(element);
            });

            this.history = newHistory;
        }

        const newStateLog = new StateLog({change, type, state});

        this.currentHistoryState = this.history.push(newStateLog) - 1;

        this.renderStates();
    }

    loadStateIncrementally(increment: number) {
        this.loadState(this.currentHistoryState + increment);
    }

    loadState(stateIndex = -1) {
        if (stateIndex < 0 || stateIndex + 1 > this.history.length)
            return;

        this.currentHistoryState = stateIndex;

        this.selectedAbilityID = -1;
        this.loadFromJSON(this.history[stateIndex].state, true);
        this.renderStates();
    }

    renderStates(historyContainerID = 'historyContainer') {
        const container = document.getElementById(historyContainerID);
        if (container == null) return;

        container.innerHTML = "";

        for (let i = this.history.length - 1; i >= 0; i--) {
            const div = document.createElement("div");
            div.classList.add('minecraftTooltip', i == this.currentHistoryState
                ? 'history-record-selected'
                : (i > this.currentHistoryState
                    ? 'history-record-overridden'
                    : 'history-record-not-selected'));
            div.addEventListener('click', () => this.loadState(i));
            div.innerHTML = this.history[i].change;
            container.appendChild(div);
        }
    }

    renderEverything() {
        if (this.bEditMode) {
            this.renderArchetypes();
            this.renderAbilities();
        } else {
            this.renderTreeNames();
            this.renderStartingAbilityList();
            this.renderArchetypeCounts();
            this.renderAbilityPointsUsed();
        }

        this.renderScrollArrows(this.properties.horizontalPages > 1);

        let hideElementsOfClass = this.bEditMode ? "shown-on-allocation" : "shown-on-tree-edit";
        let showElementsOfClass = this.bEditMode ? "shown-on-tree-edit" : "shown-on-allocation";

        const containersToHide = document.getElementsByClassName(hideElementsOfClass) as HTMLCollectionOf<HTMLElement>;
        const containersToShow = document.getElementsByClassName(showElementsOfClass) as HTMLCollectionOf<HTMLElement>;

        for (let container of containersToHide)
            container.hidden = true;

        for (let container of containersToShow)
            container.hidden = false;

        this.renderTree();
    }

    loadTreeFromPreset(self: HTMLButtonElement, classSelectID = 'classSelect') {
        const classSelect = document.getElementById(classSelectID) as HTMLInputElement;
        if (!classSelect) return;

        self.classList.add('btn-secondary');
        self.disabled = true;

        const controller = new AbortController();
        const signal = controller.signal;

        const timeoutId = setTimeout(() => {
            controller.abort();
            console.log('Fetch request timed out');
        }, RESPONSE_TIMEOUT);

        // TODO: switch to import()
        fetch(`presets/base/${classSelect.value}.json`, {

            signal,
            cache: 'no-store',
            mode: 'same-origin',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },

        }).then((response) => {

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            return response.text();

        }).then((text) => {

            this.loadFromJSON(text);
            this.saveState(`Loaded default ${classSelect.value} tree`);

        }).catch((e) => {

            if (e != "Couldn't parse")
                utils.showSmallToast("Load Failed: couldn't reach the server");

            console.log(e.stack);

        }).finally(() => {

            self.classList.remove('btn-secondary');
            self.disabled = false;
            clearTimeout(timeoutId);

        });

    }

    loadTreeFromField(jsonContainerID = "json-container") {

        const jsonContainer = document.getElementById(jsonContainerID);
        if (jsonContainer == null) {
            return;
        }

        this.loadFromJSON((jsonContainer as HTMLInputElement).value);
        this.saveState('Loaded tree from JSON');
    }

    loadTreeFromDrop(dropEvent: DragEvent) {
        dropEvent.preventDefault();

        let file;

        file = dropEvent.dataTransfer?.items
            ? dropEvent.dataTransfer?.items[0].getAsFile()
            : dropEvent.dataTransfer?.files[0];

        if (file) this.loadTreeFromFile(file);
    }

    loadTreeFromFile(file: File | undefined) {
        if (!file) return;
        file.text()
            .then(text => {
                this.loadFromJSON(text);
                this.saveState(`Loaded tree from ${file.name}`);
            })
            .catch(() => {
                utils.showSmallToast("Wrong file type");
            });
    }

    loadEmptyTree() {
        this.loadFromJSON('{}');
        this.saveState('Reset tree and settings');
    }

    loadFromJSON(json: string, respectEditMode = false, updatePage = true) {
        let obj: UncertainBaseTree;

        try {
            obj = JSON.parse(json) as UncertainBaseTree;
        } catch (error) {
            utils.showSmallToast("Load Failed: couldn't parse JSON");
            throw ("Couldn't parse");
        }

        this.properties = new Properties(obj.properties);

        this.archetypes = [];
        const archetypes = obj.archetypes;
        if (Array.isArray(archetypes)) {
            archetypes.forEach(element => {
                this.archetypes.push(element);
            });
        }

        this.abilities = {};
        const abilities = obj.abilities;
        if (typeof abilities === 'object' && !Array.isArray(abilities) && abilities !== null)
            Object.keys(abilities).forEach(id => {
                this.abilities[id] = new Ability(abilities[id] as AbilityData);
            });

        this.cellMap = {};
        const cellMap = obj.cellMap;
        if (typeof cellMap === 'object' && !Array.isArray(cellMap) && cellMap !== null)
            Object.keys(cellMap).map(Number).forEach(id =>
                this.cellMap[id] = {
                    travelNode: new TravelNode(cellMap[id]['travelNode']),
                    abilityID: cellMap[id]['abilityID'] ?? undefined,
                });

        this.startingAbilityID = Number(obj.startingAbilityID);

        if (typeof obj.selectedTree === 'string')
            this.selectedTree = obj.selectedTree;

        this.abilityTrees = {};
        const abilityTrees = obj.abilityTrees;
        if (typeof abilityTrees === 'object' && !Array.isArray(abilityTrees) && abilityTrees !== null) {

            Object.keys(abilityTrees).map(Number).forEach(treeName => {

                if (Array.isArray(abilityTrees[treeName]))
                    this.abilityTrees[treeName] = abilityTrees[treeName];

            });
        }

        if (!updatePage) return;

        if (respectEditMode && obj.bEditMode != null && obj.bEditMode === false) {
            this.bEditMode = false;
            this.compileAllocationMap();
            this.compileCurrentTree();
        } else
            this.bEditMode = true;

        this.writeProperties();
        this.renderEverything();
    }

    downloadJSON() {
        const json = JSON.stringify(this, null, 0);

        const link = document.createElement("a");
        const file = new Blob([json], {type: 'text/plain'});
        link.href = URL.createObjectURL(file);
        link.download = `Wynnability_${this.properties.classs}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // #endregion

    // #region Archetypes
    editArchetype(name = "", nameFormID = "archetypeNameInput") {
        const nameInputElement = document.getElementById(nameFormID) as NameInput;
        if (nameInputElement == null) return;

        if (name == "") {
            nameInputElement.value = "";
            nameInputElement.oldName = "";
        } else {
            nameInputElement.value = name;
            nameInputElement.oldName = name;
        }

        nameInputElement.dispatchEvent(new Event('input'));
    }

    saveArchetype(nameFormID = "archetypeNameInput") {
        const nameInputElement = document.getElementById(nameFormID) as NameInput;
        if (nameInputElement == null) return;

        if (nameInputElement.value == "" || this.archetypes.includes(nameInputElement.value))
            return;

        const oldName = nameInputElement.oldName ?? "";
        const newName = nameInputElement.value;

        if (oldName == "") {

            this.archetypes.push(newName);
            this.saveState(`Added archetype: ${utils.minecraftToHTML(newName)}`);

        } else {

            const existingIndex = this.archetypes.indexOf(oldName);
            this.archetypes[existingIndex] = newName;
            this.updateArchetype(oldName, newName);
            this.saveState(`Renamed archetype: ${utils.minecraftToHTML(oldName)} -> ${utils.minecraftToHTML(newName)}`);

        }

        this.renderArchetypes();

    }

    deleteArchetype(name: string) {
        if (!name) return;

        const index = this.archetypes.indexOf(name);
        if (index > -1)
            this.archetypes.splice(index, 1);

        this.updateArchetype(name);
        this.renderArchetypes();
        this.saveState(`Deleted archetype: ${utils.minecraftToHTML(name)}`);
    }

    renderArchetypes(containerID = "archetypeContainer", neutralContainerID = "neutralContainer") {
        const container = document.getElementById(containerID);
        if (!container) return;

        let archetypeCounts: StringTo<number> = {};
        let placedArchetypeCounts: StringTo<number> = {"": 0};
        let neutralCount = 0;
        for (let archetype of this.archetypes) {
            archetypeCounts[archetype] = 0;
            placedArchetypeCounts[archetype] = 0;
        }

        for (let ability of Object.values(this.abilities)) {
            if (ability.archetype.length > 0)
                archetypeCounts[ability.archetype]++;
            else
                neutralCount++;
        }
        for (let cellKey of Object.keys(this.cellMap)) {
            if (this.cellMap[cellKey]['abilityID'] != null)
                placedArchetypeCounts[this.abilities[this.cellMap[cellKey]['abilityID']]['archetype']]++;
        }

        container.innerHTML = "";

        for (let archetype of this.archetypes) {
            const div = document.createElement("div");
            div.classList.add('d-inline-flex', 'minecraftTooltip', 'w-100', 'mb-1', 'pt-1');

            if (archetype == this.selectedArchetype) {
                div.classList.add('selected-ability');
                div.addEventListener('click', (e) => {
                    if ((e.currentTarget as HTMLElement)?.nodeName != 'BUTTON')
                        this.selectArchetype("");
                });
            } else {
                div.addEventListener('click', (e) => {
                    if ((e.currentTarget as HTMLElement)?.nodeName != 'BUTTON')
                        this.selectArchetype(archetype);
                });
            }

            const text = document.createElement("div");
            text.classList.add('flex-fill', 'overflow-hidden');
            text.innerHTML = utils.minecraftToHTML(archetype);
            div.appendChild(text);

            const abilityCount = document.createElement("div");
            abilityCount.innerHTML = placedArchetypeCounts[archetype] + '/' + archetypeCounts[archetype];
            div.appendChild(abilityCount);

            const editbtn = document.createElement("button");
            editbtn.classList.add('small-btn', 'me-1', 'ms-2', 'font-default');
            editbtn.type = "button";
            editbtn.style = "background-color: transparent;";
            editbtn.title = "Edit";
            editbtn.innerHTML = "✒️";
            editbtn.setAttribute('data-bs-toggle', 'modal');
            editbtn.setAttribute('data-bs-target', '#archetypeModal');
            editbtn.addEventListener('click', () => this.editArchetype(archetype));
            div.appendChild(editbtn);

            const delbtn = document.createElement("button");
            delbtn.classList.add('small-btn', 'font-default');
            delbtn.type = "button";
            delbtn.style = "background-color: transparent;";
            delbtn.title = "Delete";
            delbtn.innerHTML = "💀";
            delbtn.addEventListener('click', (e) => this.deleteArchetype(archetype));
            div.appendChild(delbtn);

            container.appendChild(div);
        }

        const div = document.createElement("div");
        div.classList.add('d-inline-flex', 'minecraftTooltip', 'w-100', 'mb-1', 'pt-1');

        if (this.selectedArchetype == "") {
            div.classList.add('selected-ability');
            div.addEventListener('click', () => this.selectArchetype(""));
        } else {
            div.addEventListener('click', () => this.selectArchetype(""));
        }

        const abilityCount = document.createElement("div");
        abilityCount.innerHTML = utils.minecraftToHTML("§f§lNeutral ") + placedArchetypeCounts[""] + '/' + neutralCount;
        div.appendChild(abilityCount);

        const neutralContainer = document.getElementById(neutralContainerID);
        if (neutralContainer) {
            neutralContainer.innerHTML = "";
            neutralContainer.appendChild(div);
        }
    }

    updateArchetype(oldArchetype: string, newArchetype = "") {
        for (let abilityID of Object.keys(this.abilities))
            if (this.abilities[abilityID]['archetype'] == oldArchetype)
                this.abilities[abilityID]['archetype'] = newArchetype;
    }

    selectArchetype(archetype = "") {
        this.selectedArchetype = archetype;
        this.renderArchetypes();
        this.renderAbilities();
    }

    // #endregion

    // #region Abilities
    renderAbilityTypeSelector(selected = "skill", containerId = "abilityTypeInput") {
        const container = document.getElementById(containerId) as HTMLInputElement | null;
        if (!container) return;

        container.innerHTML = "";
        container.value = selected;

        let iconDictionary = this.properties.useAlternativeAbilityIcons
            ? altAbilityIconDictionary : abilityIconDictionary;

        Object.keys(iconDictionary).forEach((type) => {
            const div = generateIconDiv(type, null, this.properties.classs, type == selected ? 2 : 1, false, this.properties.useAlternativeAbilityIcons);
            div.classList.add('ability-type-selector');
            container.appendChild(div);
            div.addEventListener("click", (e) => {
                this.renderAbilityTypeSelector(type);
                this.renderEditorAbilityTooltip();
            });
        });
    }

    renderEditorAbilityTooltip(scaleDown = true, nameFormID = "abilityNameInput", descriptionFormID = "abilityDescriptionInput", archetypeFormID = "abilityArchetypeInput",
                               pointsRequiredFormID = POINTS_REQUIRED_INPUT_ID, archetypePointsRequiredFormID = ARCHETYPE_POINTS_REQUIRED_INPUT_ID, containerId = "editAbilityTooltip",
                               prerequisiteFormID = "abilityPrerequiseteInput", abilityBlockCountDisplayID = "abilityBlockCountDisplay", typeFormID = "abilityTypeInput") {

        const nameInputElement = document.getElementById(nameFormID) as NameInput;
        const descriptionInputElement = document.getElementById(descriptionFormID) as HTMLInputElement;
        const archetypeInputElement = document.getElementById(archetypeFormID) as HTMLInputElement;
        const pointsRequiredInputElement = document.getElementById(pointsRequiredFormID) as HTMLInputElement;
        const archetypePointsRequiredInputElement = document.getElementById(archetypePointsRequiredFormID) as HTMLInputElement;
        const typeInputElement = document.getElementById(typeFormID) as HTMLInputElement;
        const prerequisiteInputElement = document.getElementById(prerequisiteFormID) as HTMLInputElement;
        const container = document.getElementById(containerId);

        const abilityBlockCountDisplay = document.getElementById(abilityBlockCountDisplayID);

        let blockedAbilities = this.getBlockedAbilities();
        if (abilityBlockCountDisplay != null)
            abilityBlockCountDisplay.innerHTML = String(blockedAbilities.length);

        const content = this._getAbilityTooltipHTML(new Ability({
            name: nameInputElement?.value ?? '',
            description: descriptionInputElement?.value,
            unlockingWillBlock: blockedAbilities,
            archetype: archetypeInputElement?.value,
            pointsRequired: Number(pointsRequiredInputElement?.value),
            archetypePointsRequired: Number(archetypePointsRequiredInputElement?.value),
            type: typeInputElement?.value,
            requires: Number(prerequisiteInputElement?.value),
        }));

        if (scaleDown) {
            container.innerHTML = '';
            const div = document.createElement('div');
            container.appendChild(div);
            div.innerHTML = content;

            const scale = (container.offsetWidth - 5) / (container.scrollWidth + 5);
            div.style.transform = `scale(${scale})`;
            div.style.transformOrigin = `top left`;
            container.style.height = `${div.offsetHeight * scale + 5}px`;
            container.style.paddingBottom = null;
        } else {
            container.innerHTML = content;
            container.style.height = null;
            container.style.paddingBottom = "8px";
        }
    }

    renderHoverAbilityTooltip(abilityId: string | number = -1, containerId = "cursorTooltip") {
        const container = document.getElementById(containerId);
        const ability = this.abilities[abilityId];

        if (this.selectedCells.length > 0 || ability == null)
            return;

        container.hidden = false;

        container.innerHTML = this._getAbilityTooltipHTML(ability);
    }

    _getAbilityTooltipHTML(ability = new Ability()) {

        let result = '';

        if (ability.type == 'skill')
            result = `
                <div class="abilityName">${utils.minecraftToHTML(ability.name)}</div>
                ${utils.minecraftToHTML(ability.description)}<br><br>`;
        else
            result = `
                ${utils.minecraftToHTML(ability.name)}<br><br>
                ${utils.minecraftToHTML(ability.description)}<br><br>`;

        if (ability.unlockingWillBlock.length > 0) {
            result += `<span style="color:${utils.codeDictionaryColor['c']}">Unlocking&nbsp;will&nbsp;block:<br></span>`;
            for (let id of ability.unlockingWillBlock)
                result += `<span style="color:${utils.codeDictionaryColor['c']}">-&#8288;&nbsp;</span><span style="color:${utils.codeDictionaryColor['7']}">${utils.anyToHTML(this.abilities[id].getPlainName())}</span><br>`;
            result += '<br>';
        }

        if (ability.archetype != "")
            result += `${utils.minecraftToHTML(ability.archetype + ' Archetype')}<br><br>`;

        result += `<span style="color:${utils.codeDictionaryColor['7']}">Ability&nbsp;Points:&nbsp;</span>${ability.pointsRequired}<br>`;

        if (this.abilities[ability.requires] != null)
            result += `<span style="color:${utils.codeDictionaryColor['7']}">Required&nbsp;Ability:&nbsp;</span>${utils.anyToHTML(this.abilities[ability.requires].getPlainName())}<br>`;

        if (ability.archetype != "" && ability.archetypePointsRequired > 0)
            result += `<span style="color:${utils.codeDictionaryColor['7']}">Min&nbsp;${utils.anyToHTML(utils.stripMinecraftFormatting(ability.archetype))}&nbsp;Archetype:&nbsp;</span>${ability.archetypePointsRequired}`;

        return result;
    }

    editAbility(abilityID = -1,
                nameFormID = "abilityNameInput", descriptionFormID = "abilityDescriptionInput", abilityBlockFormID = "abilityBlockInput", archetypeFormID = "abilityArchetypeInput",
                pointsRequiredFormID = POINTS_REQUIRED_INPUT_ID, archetypePointsRequiredFormID = ARCHETYPE_POINTS_REQUIRED_INPUT_ID, prerequisiteFormID = "abilityPrerequiseteInput") {

        const nameInputElement = document.getElementById(nameFormID);
        const descriptionInputElement = document.getElementById(descriptionFormID);
        const abilityBlockInputElement = document.getElementById(abilityBlockFormID);
        const archetypeInputElement = document.getElementById(archetypeFormID);
        const pointsRequiredInputElement = document.getElementById(pointsRequiredFormID);
        const archetypePointsRequiredInputElement = document.getElementById(archetypePointsRequiredFormID);
        const prerequisiteInputElement = document.getElementById(prerequisiteFormID);

        let sortedAbilityIDs = this.sortAbilities();

        if (abilityID < 0) {

            archetypeInputElement.innerHTML = `<option class="ability-type-none" selected value="">Archetype (none)</option>`;
            for (let archetype of this.archetypes) {

                const option = document.createElement('option');
                option.value = archetype;
                option.innerHTML = utils.anyToHTML(utils.shortenText(utils.stripMinecraftFormatting(archetype), 50));
                archetypeInputElement.appendChild(option);

            }

            prerequisiteInputElement.innerHTML = `<option class="ability-type-none" selected value="-1">Prerequisite (none)</option>`;
            abilityBlockInputElement.innerHTML = '';
            for (let id of sortedAbilityIDs) {

                const abilityName = utils.anyToHTML(utils.shortenText(utils.stripMinecraftFormatting(this.abilities[id].name), 50));

                const option = document.createElement('option');
                option.value = id;
                option.innerHTML = abilityName;
                option.classList.add("ability-type-" + this.abilities[id].type);
                prerequisiteInputElement.appendChild(option);

                const li = document.createElement('li');
                li.innerHTML = abilityName;
                li.value = id;
                li.classList.add("ability-type-" + this.abilities[id].type, "dropdown-item");
                li.addEventListener('click', (event) => {
                    event.target.classList.toggle('active');
                    this.renderEditorAbilityTooltip();
                });
                abilityBlockInputElement.appendChild(li);

            }

            nameInputElement.abilityId = "";
            nameInputElement.value = "";
            descriptionInputElement.value = "";
            pointsRequiredInputElement.value = 1;
            archetypePointsRequiredInputElement.value = 0;
            prerequisiteInputElement.value = -1;
            this.renderAbilityTypeSelector();

        } else {

            if (this.abilities[abilityID] == null)
                return;

            archetypeInputElement.innerHTML = `<option class="ability-type-none" value="">Archetype (none)</option>`;
            for (let archetype of this.archetypes) {

                const option = document.createElement('option');
                option.value = archetype;
                option.innerHTML = utils.anyToHTML(utils.shortenText(utils.stripMinecraftFormatting(archetype), 50));
                if (archetype == this.abilities[abilityID].archetype)
                    option.selected = true;
                archetypeInputElement.appendChild(option);

            }

            let blockedAbilitiesMap = {};
            for (let blockedID of this.abilities[abilityID].unlockingWillBlock)
                blockedAbilitiesMap[blockedID] = true;

            prerequisiteInputElement.innerHTML = `<option class="ability-type-none" value="-1">Prerequisite (none)</option>`;
            abilityBlockInputElement.innerHTML = '';
            for (let id of sortedAbilityIDs) {

                if (id == abilityID)
                    continue;

                const abilityName = utils.anyToHTML(utils.shortenText(utils.stripMinecraftFormatting(this.abilities[id].name), 50));

                const option = document.createElement('option');
                option.value = id;
                option.innerHTML = abilityName;
                option.classList.add("ability-type-" + this.abilities[id].type);
                if (id == this.abilities[abilityID].requires)
                    option.selected = true;
                prerequisiteInputElement.appendChild(option);

                const li = document.createElement('li');
                li.innerHTML = abilityName;
                li.value = id;
                li.classList.add("ability-type-" + this.abilities[id].type, "dropdown-item");
                if (blockedAbilitiesMap[id])
                    li.classList.add("active");
                li.addEventListener('click', (event) => {
                    event.target.classList.toggle('active');
                    this.renderEditorAbilityTooltip();
                });
                abilityBlockInputElement.appendChild(li);

            }

            nameInputElement.abilityId = abilityID;
            nameInputElement.value = this.abilities[abilityID].name;
            descriptionInputElement.value = this.abilities[abilityID].description;
            pointsRequiredInputElement.value = this.abilities[abilityID].pointsRequired;
            archetypePointsRequiredInputElement.value = this.abilities[abilityID].archetypePointsRequired;
            this.renderAbilityTypeSelector(this.abilities[abilityID].type);

        }
    }

    cloneAbility(abilityID = -1) {
        if (this.abilities[abilityID] == null)
            return;

        let copy = new Ability(this.abilities[abilityID]);

        let maxId = Object.keys(this.abilities).length + 1;
        for (abilityID = 1; abilityID <= maxId; abilityID++) {
            if (this.abilities[abilityID] == null)
                break;
        }

        this.abilities[abilityID] = copy;

        this.saveState(`Copied ability: ${utils.minecraftToHTML(copy.name)}`);

        this.renderAbilities();
        this.renderArchetypes();
    }

    getBlockedAbilities(abilityBlockFormID = "abilityBlockInput") {

        const abilityBlockInputElement = document.getElementById(abilityBlockFormID);

        let blockedAbilities = [];

        for (let li of abilityBlockInputElement.children) {
            if (li.classList.contains('active'))
                blockedAbilities.push(li.value);
        }
        return blockedAbilities;
    }

    saveAbility(nameFormID = "abilityNameInput", descriptionFormID = "abilityDescriptionInput", archetypeFormID = "abilityArchetypeInput", pointsRequiredFormID = POINTS_REQUIRED_INPUT_ID,
                archetypePointsRequiredFormID = ARCHETYPE_POINTS_REQUIRED_INPUT_ID, typeFormID = "abilityTypeInput", prerequisiteFormID = "abilityPrerequiseteInput") {

        const nameInputElement = document.getElementById(nameFormID);
        const descriptionInputElement = document.getElementById(descriptionFormID);
        const archetypeInputElement = document.getElementById(archetypeFormID);
        const pointsRequiredInputElement = document.getElementById(pointsRequiredFormID);
        const archetypePointsRequiredInputElement = document.getElementById(archetypePointsRequiredFormID);
        const typeInputElement = document.getElementById(typeFormID);
        const prerequisiteInputElement = document.getElementById(prerequisiteFormID);

        if (nameInputElement.value == '') {
            nameInputElement.value = 'UNNAMED';
        }

        const newAbility = new Ability({
            name: nameInputElement.value,
            description: descriptionInputElement.value,
            unlockingWillBlock: this.getBlockedAbilities(),
            archetype: archetypeInputElement.value,
            pointsRequired: pointsRequiredInputElement.value,
            archetypePointsRequired: archetypePointsRequiredInputElement.value,
            type: typeInputElement.value,
            requires: prerequisiteInputElement.value,
        });

        let abilityID = nameInputElement.abilityId;


        if (this.abilities[abilityID] == null) {

            let maxId = Object.keys(this.abilities).length + 1;
            for (abilityID = 1; abilityID <= maxId; abilityID++) {
                if (this.abilities[abilityID] == null)
                    break;
            }

            this.abilities[abilityID] = newAbility;
            //nameInputElement.abilityId = abilityID;

            this.saveState(`Added ability: ${utils.minecraftToHTML(nameInputElement.value)}`);

        } else {

            const oldName = this.abilities[abilityID].name;

            this.abilities[abilityID] = newAbility;

            this.saveState(`Edited ability: ${utils.minecraftToHTML(oldName)} -> ${utils.minecraftToHTML(nameInputElement.value)}`);
        }

        this.renderAbilities();
        this.renderArchetypes();
        this.renderTree();
    }

    deleteAbility(abilityID = -1) {

        if (abilityID == null || abilityID < 0)
            return;

        if (this.abilities[abilityID] != null) {

            for (let id of Object.keys(this.abilities)) {
                if (this.abilities[id].requires == abilityID)
                    this.abilities[id].requires = -1;

                const index = this.abilities[id].unlockingWillBlock.indexOf(Number(abilityID));
                if (index > -1)
                    this.abilities[id].unlockingWillBlock.splice(index, 1);
            }

            if (this.selectedAbilityID == abilityID)
                this.selectedAbilityID = -1;

            this.removeAbilityFromTree(abilityID);
            const name = this.abilities[abilityID].name;
            delete this.abilities[abilityID];
            this.saveState(`Deleted ability: ${utils.minecraftToHTML(name)}`);
            this.renderArchetypes();
            this.renderAbilities();
            this.renderTree();
        }
    }

    sortAbilities() {
        return Object.keys(this.abilities).sort((a, b) => {
            if (this.abilities[a].type == null) return 1;
            if (this.abilities[b].type == null) return -1;

            const priorityDif = priorityMap[this.abilities[a].type] - priorityMap[this.abilities[b].type];

            if (priorityDif != 0) return priorityDif;

            return this.abilities[a].getPlainName().localeCompare(this.abilities[b].getPlainName()) || 1;
        });
    }

    renderAbilities(containerID = "abilityContainer", searchFieldID = "abilitySearch", notOnTreeFilterID = "notOnTreeFilter") {

        const container = document.getElementById(containerID);
        if (container == null)
            return;

        container.innerHTML = "";

        let sortedAbilityIDs = this.sortAbilities();

        if (this.selectedArchetype != null) {
            sortedAbilityIDs = sortedAbilityIDs.filter((id) => {
                return this.abilities[id].archetype == this.selectedArchetype;
            });
        }

        const searchContainer = document.getElementById(searchFieldID);
        if (searchFieldID != null && searchContainer.value != null && String(searchContainer.value) != null && String(searchContainer.value) != '') {

            const filterSubstring = String(searchContainer.value).toLowerCase();

            sortedAbilityIDs = sortedAbilityIDs.filter((id) => {
                return this.abilities[id].getPlainName().toLowerCase().includes(filterSubstring);
            });
        }

        const notOnTreeFilter = document.getElementById(notOnTreeFilterID);
        let bFilterNotOnTree = notOnTreeFilter != null && !notOnTreeFilter.checked;

        let abilitiesOnTree = {};
        for (let cellKey of Object.keys(this.cellMap)) {
            if (this.cellMap[cellKey]['abilityID'] != null)
                abilitiesOnTree[this.cellMap[cellKey]['abilityID']] = true;
        }

        for (let id of sortedAbilityIDs) {

            if (bFilterNotOnTree && abilitiesOnTree[id])
                continue;

            const div = document.createElement("div");

            if (id == this.selectedAbilityID)
                div.classList.add('selected-ability');


            div.addEventListener('click', (e) => {
                if (e.target.nodeName == 'BUTTON')
                    return;

                this.removeAbilitySelection();
                if (id == this.selectedAbilityID) {
                    this.selectedAbilityID = -1;
                } else {
                    this.selectedAbilityID = id;
                    div.classList.add('selected-ability');
                }
            });

            div.classList.add('d-inline-flex', 'align-items-center', 'minecraftTooltip', 'w-100', 'mb-1');

            const imgholder = document.createElement("div");
            imgholder.style = "width: 56px; text-align: center;";
            div.appendChild(imgholder);
            imgholder.appendChild(generateIconDiv(this.abilities[id].type, null, this.properties.classs, abilitiesOnTree[id] ? 2 : 1, false, true));

            imgholder.addEventListener('pointerover', (e) => {
                if (e.pointerType !== "touch") this.renderHoverAbilityTooltip(id);
            });
            imgholder.addEventListener('pointerout', (e) => {
                if (e.pointerType !== "touch") utils.hideHoverAbilityTooltip();
            });
            imgholder.addEventListener('touchstart', (e) => {
                this.#treeTouchProcessor.processTouch(
                    e,
                    () => {
                    },
                    () => {
                    },
                    () => {
                        document.body.style.overflow = 'hidden';
                        this.renderHoverAbilityTooltip(id);
                        utils.moveTooltip(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                    },
                    () => {
                        utils.moveTooltip(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                    },
                    () => {
                        utils.hideHoverAbilityTooltip();
                        document.body.style.overflow = 'auto';
                    },
                );
            }, {passive: false});

            const text = document.createElement("div");
            text.classList.add('flex-fill', 'align-items-center', 'overflow-hidden', 'ms-2');
            text.innerHTML = utils.minecraftToHTML(this.abilities[id].name);
            div.appendChild(text);

            const clonebtn = document.createElement("button");
            clonebtn.classList.add('small-btn', 'me-1', 'ms-2', 'font-default');
            clonebtn.type = "button";
            clonebtn.style = "background-color: transparent;";
            clonebtn.title = "Clone";
            clonebtn.innerHTML = "📋";
            clonebtn.addEventListener('click', (e) => this.cloneAbility(id));
            div.appendChild(clonebtn);

            const editbtn = document.createElement("button");
            editbtn.classList.add('small-btn', 'me-1', 'font-default');
            editbtn.type = "button";
            editbtn.style = "background-color: transparent;";
            editbtn.title = "Edit";
            editbtn.innerHTML = "✒️";
            editbtn.setAttribute('data-bs-toggle', 'modal');
            editbtn.setAttribute('data-bs-target', '#abilityModal');
            editbtn.addEventListener('click', (e) => this.editAbility(id));
            div.appendChild(editbtn);

            const delbtn = document.createElement("button");
            delbtn.classList.add('small-btn', 'font-default');
            delbtn.type = "button";
            delbtn.style = "background-color: transparent;";
            delbtn.title = "Delete";
            delbtn.innerHTML = "💀";
            delbtn.addEventListener('click', (e) => this.deleteAbility(id));
            div.appendChild(delbtn);

            div.addEventListener('dblclick', (e) => {
                editbtn.click();
            });

            container.appendChild(div);

        }
    }

    selectAbility(abilityID = -1) {

        this.selectedAbilityID = abilityID;
        this.renderAbilities();

    }

    removeAbilitySelection(containerID = "abilityContainer") {
        const container = document.getElementById(containerID);
        for (const child of container.children) {
            if (child.classList.contains('selected-ability')) {
                child.classList.remove('selected-ability');
                break;
            }
        }
    }

    focusSelectedAbility(containerID = "abilityContainer") {

        const container = document.getElementById(containerID);
        if (container == null)
            return;

        const selected = container.querySelector('.selected-ability');
        if (selected == null)
            return;

        container.scrollTo({top: selected.offsetTop - 10, behavior: "instant"});
        //selected.scrollIntoView({block: "center", inline: "center", behavior: "instant"});

    }

    autoformatAbilityNames() {
        for (let ability of Object.values(this.abilities))
            ability.autoformatName();

        this.saveState(`Autoformatted ability names`);
        this.renderEverything();
    }

    // #endregion

    // #region Tree editing
    removeAllTravelNodes() {
        for (let cell of Object.keys(this.cellMap))
            if (this.cellMap[cell]['abilityID'] != null)
                delete this.cellMap[cell]['travelNode'];
            else
                delete this.cellMap[cell];

        this.saveState(`Removed all paths from the tree`);
        this.renderTree();
    }

    removeAllAbilityNodes() {
        for (let cell of Object.keys(this.cellMap))
            if (this.cellMap[cell]['travelNode'] != null)
                delete this.cellMap[cell]['abilityID'];
            else
                delete this.cellMap[cell];

        this.saveState(`Removed all abilities from the tree`);
        this.renderAbilities();
        this.renderArchetypes();
        this.renderTree();
    }

    incrementVerticalPage(increment = 0) {

        this.setcurrentVerticalPage(this.currentVerticalPage + increment);
        this.renderTree();

    }

    incrementHorizontalPage(increment = 0) {

        this.setcurrentHorizontalPage(this.currentHorizontalPage + increment);
        this.renderTree();

    }

    setcurrentVerticalPage(page = this.currentVerticalPage) {

        if (page == null || typeof page != "number" || page < 1)
            return;

        this.currentVerticalPage = utils.clamp(page, 1, this.properties.pages - this.properties.pagesDisplayed + 1);

    }

    setcurrentHorizontalPage(page = this.currentHorizontalPage) {

        if (page == null || typeof page != "number" || page < 1)
            return;

        this.currentHorizontalPage = utils.clamp(page, 1, this.properties.horizontalPages);

    }

    cellPositionInRow(cellKey) {

        //position in row = (cellKey % cells per page) % cells per row
        let cellPositionInRow = cellKey % (this.properties.rowsPerPage * COLUMNS) % COLUMNS;
        return cellPositionInRow == 0 ? COLUMNS : cellPositionInRow;

    }

    getAdjecentCell(cellKey, direction) {
        switch (direction) {
            case "up":
                const upKey = cellKey - COLUMNS;
                if (upKey >= 1)
                    return upKey;
                break;

            case "down":
                const downKey = cellKey + COLUMNS;
                if (downKey <= this.properties.pages * this.properties.rowsPerPage * COLUMNS)
                    return downKey;
                break;

            case "left":
                if (this.cellPositionInRow(cellKey) > 1)
                    return cellKey - 1;
                else if (this.properties.loopTree)
                    return cellKey - 1 + COLUMNS;
                break;

            case "right":
                if (this.cellPositionInRow(cellKey) < COLUMNS)
                    return cellKey + 1;
                else if (this.properties.loopTree)
                    return cellKey + 1 - COLUMNS;
                break;

            default:
                break;
        }
        return null;
    }

    getAdjacentCells(cellKey, bUseCellsAsKeys = true) {

        cellKey = Number(cellKey);
        let result = {};

        for (let direction of Object.keys(reverseDirectionDictionary)) {
            const adjacentCell = this.getAdjecentCell(cellKey, direction);
            if (adjacentCell != null) {
                if (bUseCellsAsKeys)
                    result[adjacentCell] = direction;
                else
                    result[direction] = adjacentCell;
            }
        }

        return result;
    }

    getConnectedCells(cellKey) {

        const cell = this.cellMap[cellKey];

        if (cell == null || cell['travelNode'] == null)
            return {};

        const adjacent = this.getAdjacentCells(cellKey, false);

        for (let direction of Object.keys(adjacent)) {
            const cellID = adjacent[direction];

            const otherCell = this.cellMap[cellID];
            const reverseDirection = reverseDirectionDictionary[direction];

            if (otherCell == null
                || otherCell['travelNode'] == null
                || cell['travelNode'][direction] == 0
                || otherCell['travelNode'][reverseDirection] == 0)

                delete adjacent[direction];

        }

        return adjacent;

    }

    /**
     * Returns which direction cellKey2 is from cellKey1
     * @returns {string}
     */
    determineCellRelation(cellKey1, cellKey2) {

        const dif = cellKey2 - cellKey1;

        if (this.properties.loopTree) {

            const position1 = this.cellPositionInRow(cellKey1);
            const position2 = this.cellPositionInRow(cellKey2);

            if (dif == (COLUMNS - 1) && position1 == 1 && position2 == COLUMNS)
                return 'left';
            if (dif == (1 - COLUMNS) && position2 == 1 && position1 == COLUMNS)
                return 'right';
        }

        if (dif == COLUMNS)
            return 'down';
        if (dif == -COLUMNS)
            return 'up';
        if (dif == 1)
            return 'right';
        if (dif == -1)
            return 'left';

        return null;

    }

    connectCells(cellKey1, cellKey2, bDisconnectIfConnected = true) {

        const direction = this.determineCellRelation(cellKey1, cellKey2);

        if (direction == null)
            return;

        const reverseDirection = reverseDirectionDictionary[direction];

        this.cellMap[cellKey1] = this.cellMap[cellKey1] ?? {};
        this.cellMap[cellKey2] = this.cellMap[cellKey2] ?? {};

        if (this.cellMap[cellKey1]['travelNode'] == null)
            this.cellMap[cellKey1]['travelNode'] = new TravelNode();

        if (this.cellMap[cellKey2]['travelNode'] == null)
            this.cellMap[cellKey2]['travelNode'] = new TravelNode();

        if (bDisconnectIfConnected && this.cellMap[cellKey1]['travelNode'][direction] != 0 && this.cellMap[cellKey2]['travelNode'][reverseDirection] != 0) {

            this.cellMap[cellKey1]['travelNode'][direction] = 0;
            this.cellMap[cellKey2]['travelNode'][reverseDirection] = 0;

            if (!this.cellMap[cellKey1]['travelNode'].hasConnections() && this.cellMap[cellKey1]['abilityID'] == null)
                delete this.cellMap[cellKey1];

            if (!this.cellMap[cellKey2]['travelNode'].hasConnections() && this.cellMap[cellKey2]['abilityID'] == null)
                delete this.cellMap[cellKey2];

        } else {

            this.cellMap[cellKey1]['travelNode'][direction] = 1;
            this.cellMap[cellKey2]['travelNode'][reverseDirection] = 1;

        }
    }

    initializeEditNode(cellKey) {

        if (this.selectedCells.length > 0 || cellKey == null || Number(cellKey) < 1 || Number(cellKey) > this.properties.pages * this.properties.rowsPerPage * COLUMNS)
            return;

        this.selectedCells.push(cellKey);

        const cellElem = document.getElementById(CELL_ID_PREFIX + cellKey).firstChild;
        cellElem.innerHTML += `<img class="ability-icon ${EDIT_PATH_TEMP_CLASS} ${EDIT_PATH_TEMP_CLASS + this.selectedCells.length - 1}" src="${abilityIconDirectoryPath}generic/travel_center_6_a.png" style="z-index: 26;" draggable="false">\n`;

    }

    continueEditWithloopedNode(direction = 1) {

        const selectedCellsLength = this.selectedCells.length;

        if (selectedCellsLength == 0 || !(this.properties.loopTree))
            return;

        if (selectedCellsLength > MAX_SELECTED_CELLS) {

            this.finallizeEditNodes();
            return;

        }

        const lastCellKey = this.selectedCells[selectedCellsLength - 1];
        const cellPositionInRow = this.cellPositionInRow(lastCellKey);

        switch (direction) {
            case -1:
                if (cellPositionInRow == 1)
                    this.continueEditNode(lastCellKey + COLUMNS - 1);
                break;

            case 1:
                if (cellPositionInRow == COLUMNS)
                    this.continueEditNode(lastCellKey - COLUMNS + 1);
                break;

            default:
                break;
        }
    }

    continueEditNode(cellKey) {

        const selectedCellsLength = this.selectedCells.length;

        if (selectedCellsLength == 0 || cellKey == null || Number(cellKey) < 1 || Number(cellKey) > this.properties.pages * this.properties.rowsPerPage * COLUMNS)
            return;

        if (selectedCellsLength > MAX_SELECTED_CELLS) {

            this.finallizeEditNode();
            return;

        }

        const adjacentCellsMap = this.getAdjacentCells(cellKey, true);
        const prevCellKey = this.selectedCells[selectedCellsLength - 1];

        // if cell is not adjacent to the last one - ignore it
        if (adjacentCellsMap[prevCellKey] == null)
            return;

        // if backtracked - remove last element and visuals
        if (cellKey == this.selectedCells[selectedCellsLength - 2]) {

            const collection = document.getElementsByClassName(EDIT_PATH_TEMP_CLASS + (selectedCellsLength - 1));

            while (collection[0])
                collection[0].parentNode.removeChild(collection[0]);

            this.selectedCells.splice(selectedCellsLength - 1, 1);

        } else {

            const newCellElem = document.getElementById(CELL_ID_PREFIX + cellKey).firstChild;
            const prevCellElem = document.getElementById(CELL_ID_PREFIX + prevCellKey).firstChild;

            // add center image to the cell
            if (!this.selectedCells.includes(cellKey))
                newCellElem.innerHTML += `<img class="ability-icon ${EDIT_PATH_TEMP_CLASS} ${EDIT_PATH_TEMP_CLASS + selectedCellsLength}" src="${abilityIconDirectoryPath}generic/travel_center_6_a.png" style="z-index: 26;">\n`;

            // add connection images to this and previous cell
            switch (adjacentCellsMap[prevCellKey]) {
                case 'up':
                    newCellElem.innerHTML += `<img class="ability-icon ${EDIT_PATH_TEMP_CLASS} ${EDIT_PATH_TEMP_CLASS + selectedCellsLength}" src="${abilityIconDirectoryPath}generic/travel_up_10_a.png" style="z-index: 30;">\n`;
                    prevCellElem.innerHTML += `<img class="ability-icon ${EDIT_PATH_TEMP_CLASS} ${EDIT_PATH_TEMP_CLASS + selectedCellsLength}" src="${abilityIconDirectoryPath}generic/travel_down_8_a.png" style="z-index: 28;">\n`;
                    break;

                case 'down':
                    newCellElem.innerHTML += `<img class="ability-icon ${EDIT_PATH_TEMP_CLASS} ${EDIT_PATH_TEMP_CLASS + selectedCellsLength}" src="${abilityIconDirectoryPath}generic/travel_down_8_a.png" style="z-index: 28;">\n`;
                    prevCellElem.innerHTML += `<img class="ability-icon ${EDIT_PATH_TEMP_CLASS} ${EDIT_PATH_TEMP_CLASS + selectedCellsLength}" src="${abilityIconDirectoryPath}generic/travel_up_10_a.png" style="z-index: 30;">\n`;
                    break;

                case 'left':
                    newCellElem.innerHTML += `<img class="ability-icon ${EDIT_PATH_TEMP_CLASS} ${EDIT_PATH_TEMP_CLASS + selectedCellsLength}" src="${abilityIconDirectoryPath}generic/travel_left_7_a.png" style="z-index: 27;">\n`;
                    prevCellElem.innerHTML += `<img class="ability-icon ${EDIT_PATH_TEMP_CLASS} ${EDIT_PATH_TEMP_CLASS + selectedCellsLength}" src="${abilityIconDirectoryPath}generic/travel_right_9_a.png" style="z-index: 29;">\n`;
                    break;

                case 'right':
                    newCellElem.innerHTML += `<img class="ability-icon ${EDIT_PATH_TEMP_CLASS} ${EDIT_PATH_TEMP_CLASS + selectedCellsLength}" src="${abilityIconDirectoryPath}generic/travel_right_9_a.png" style="z-index: 29;">\n`;
                    prevCellElem.innerHTML += `<img class="ability-icon ${EDIT_PATH_TEMP_CLASS} ${EDIT_PATH_TEMP_CLASS + selectedCellsLength}" src="${abilityIconDirectoryPath}generic/travel_left_7_a.png" style="z-index: 27;">\n`;
                    break;

                default:
                    break;
            }

            // add cellKey to array
            this.selectedCells.push(cellKey);

        }

    }

    finallizeEditNode() {

        const selectedCellsLength = this.selectedCells.length;

        let editSummary = '';

        switch (selectedCellsLength) {
            case 0:
                return;

            case 1:
                const cellKey = this.selectedCells[0];

                this.cellMap[cellKey] = this.cellMap[cellKey] ?? {};

                if (this.abilities[this.selectedAbilityID] != null) {

                    this.removeAbilityFromTree(this.selectedAbilityID);
                    this.cellMap[cellKey]['abilityID'] = this.selectedAbilityID;
                    editSummary = `Positioned ${utils.minecraftToHTML(this.abilities[this.selectedAbilityID].name)} on tree`;
                    this.selectedAbilityID = -1;

                } else {

                    if (this.cellMap[cellKey]['abilityID'] != null) {

                        const abilityID = this.cellMap[cellKey]['abilityID'];
                        this.removeAbilityFromTree(abilityID);
                        utils.hideHoverAbilityTooltip();
                        editSummary = `Removed ${utils.minecraftToHTML(this.abilities[abilityID].name)} from tree`;

                    } else if (this.cellMap[cellKey]['travelNode'] == null) {

                        this.cellMap[cellKey]['travelNode'] = new TravelNode({up: 0, down: 0, left: 0, right: 0});

                        editSummary = `Added empty tree node on page ${Math.ceil(cellKey / (this.properties.rowsPerPage * COLUMNS))}`;

                    } else {

                        editSummary = `Removed 1 tree node on page ${Math.ceil(cellKey / (this.properties.rowsPerPage * COLUMNS))}`;

                        this.removeCellFromTree(cellKey);

                    }
                }
                break;

            case 2:
                const cellKey1 = this.selectedCells[0];
                const cellKey2 = this.selectedCells[1];

                this.connectCells(cellKey1, cellKey2, true);
                editSummary = 'Changed 1 tree node connection';
                break;

            default:
                for (let cellKey = 0; cellKey < selectedCellsLength - 1; cellKey++) {

                    const cellKey1 = this.selectedCells[cellKey];
                    const cellKey2 = this.selectedCells[cellKey + 1];

                    this.connectCells(cellKey1, cellKey2, false);

                }

                editSummary = `Changed ${selectedCellsLength - 1} tree node connections`;
                break;
        }

        const collection = document.getElementsByClassName(EDIT_PATH_TEMP_CLASS);

        while (collection[0])
            collection[0].parentNode.removeChild(collection[0]);

        this.selectedCells = [];
        this.saveState(editSummary);
        this.renderTree();
        this.renderAbilities();
        this.renderArchetypes();

    }

    removeCellFromTree(cellKey) {

        const connected = this.getConnectedCells(cellKey);

        for (let key of Object.keys(connected)) {
            const cellID = connected[key];

            if (this.cellMap[cellID]['travelNode'] == null)
                continue;

            this.cellMap[cellID]['travelNode'][reverseDirectionDictionary[key]] = 0;

            if (!this.cellMap[cellID]['travelNode'].hasConnections())
                delete this.cellMap[cellID];

        }

        delete this.cellMap[cellKey];

    }

    removeAbilityFromTree(abilityID) {

        for (let cellKey of Object.keys(this.cellMap)) {

            if (this.cellMap[cellKey] != null && this.cellMap[cellKey]['abilityID'] == abilityID) {

                if (this.cellMap[cellKey]['travelNode'] == null) {

                    this.removeCellFromTree(cellKey);
                    continue;

                }

                const connected = Object.keys(this.getConnectedCells(cellKey));

                if (connected.length == 0)
                    delete this.cellMap[cellKey];
                else
                    delete this.cellMap[cellKey]['abilityID'];
            }
        }
    }

    renderTreeForEditing(tableBodyID = "treeTableBody") {

        const table = document.getElementById(tableBodyID);
        if (table == null)
            return;

        table.innerHTML = '';

        this.setcurrentVerticalPage();

        const CELLSPERPAGE = this.properties.rowsPerPage * COLUMNS;

        for (let page = this.currentVerticalPage; page < this.currentVerticalPage + this.properties.pagesDisplayed; page++) {

            const pageRow = document.createElement('tr');
            table.appendChild(pageRow);

            const pageCol = document.createElement('td');
            pageCol.colSpan = COLUMNS;
            pageRow.appendChild(pageCol);

            const pageDiv = document.createElement('div');
            pageDiv.classList.add("page-display");
            pageDiv.innerHTML = `PAGE ${page}`;
            pageCol.appendChild(pageDiv);

            for (let row = 1; row <= this.properties.rowsPerPage; row++) {

                const newRow = document.createElement('tr');
                table.appendChild(newRow);

                for (let col = 1; col <= COLUMNS; col++) {

                    const cellKey = (page - 1) * (CELLSPERPAGE) + (row - 1) * COLUMNS + col;

                    const newCol = document.createElement('td');
                    newCol.id = CELL_ID_PREFIX + cellKey;
                    newCol.cellKey = cellKey;
                    newRow.appendChild(newCol);

                    const cell = this.cellMap[cellKey];

                    let div = null;

                    if (cell != null) {

                        div = generateIconDiv(
                            this.abilities[cell['abilityID']] ? this.abilities[cell['abilityID']].type : null,
                            cell['travelNode'],
                            this.properties.classs,
                            1,
                            true,
                            true,
                        );

                        if (this.abilities[cell['abilityID']] != null) {

                            div.addEventListener('pointerover', (e) => {
                                if (e.pointerType !== "touch") this.renderHoverAbilityTooltip(cell['abilityID']);
                            });

                            div.addEventListener('pointerout', (e) => {
                                if (e.pointerType !== "touch") utils.hideHoverAbilityTooltip();
                            });

                        }

                    } else {
                        div = document.createElement('div');
                        div.classList.add("centered-element-container");
                    }

                    div.style.userSelect = 'none';
                    div.addEventListener('pointerdown', (e) => {
                        if (e.pointerType !== "touch") this.initializeEditNode(cellKey);
                    });
                    div.addEventListener('pointerenter', (e) => {
                        if (e.pointerType !== "touch") this.continueEditNode(cellKey);
                    });
                    div.addEventListener('touchstart', (e) => {
                        this.#treeTouchProcessor.processTouch(
                            e,
                            () => {
                                if (this.abilities[this.selectedAbilityID] != null) {

                                    this.removeAbilityFromTree(this.selectedAbilityID);
                                    this.cellMap[cellKey] = this.cellMap[cellKey] ?? {};
                                    this.cellMap[cellKey]['abilityID'] = this.selectedAbilityID;
                                    let editSummary = `Positioned ${utils.minecraftToHTML(this.abilities[this.selectedAbilityID].name)} on tree`;
                                    this.selectedAbilityID = -1;
                                    this.saveState(editSummary);
                                    this.renderAbilities();
                                    this.renderArchetypes();
                                    this.renderTree();

                                } else {
                                    const td = e.target.closest("td");
                                    try {
                                        this.renderHoverAbilityTooltip(this.cellMap[td.cellKey]['abilityID']);
                                        utils.moveTooltip(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                                    } catch (e) {
                                    }
                                    ;
                                }
                            },
                            () => {
                            },
                            () => {
                                utils.hideHoverAbilityTooltip();
                                //document.body.style.overflow = 'hidden';
                                this.initializeEditNode(cellKey);
                            },
                            (event) => {
                                const location = event.changedTouches[0];
                                const target = document.elementFromPoint(location.clientX, location.clientY);
                                if (target == null)
                                    return;

                                if (target.id == "rightTreeBoundary")
                                    this.continueEditWithloopedNode(1);
                                else if (target.id == "leftTreeBoundary")
                                    this.continueEditWithloopedNode(-1);
                                else {
                                    const td = target.closest("td");
                                    if (td && td.cellKey != null)
                                        this.continueEditNode(td.cellKey);
                                }
                            },
                            () => {
                                //document.body.style.overflow = 'auto';
                                this.finallizeEditNode();
                            },
                        );
                    }, {passive: false});
                    newCol.appendChild(div);

                }
            }
        }
    }


    // #endregion

    renderTree(tableBodyID = "treeTableBody") {

        if (this.bEditMode)
            this.renderTreeForEditing(tableBodyID);
        else
            this.renderTreeForAllocation(tableBodyID);

    }

    // #region Tree allocation
    setMode(bEditMode) {
        this.bEditMode = bEditMode;
        if (!bEditMode) {
            this.compileAllocationMap();
            this.selectTree(this.selectedTree);
        }
        this.renderEverything();
    }

    ensureStartingAbility() {
        if (this.startingAbilityID != null && this.abilities[this.startingAbilityID] != null)
            return;

        const abilityList = Object.keys(this.abilities);
        if (abilityList.length < 1)
            return;
        this.startingAbilityID = abilityList[0];
    }

    ensureDefaultTree() {

        if (Object.keys(this.abilityTrees).length == 0) {
            this.abilityTrees['Default'] = [];
            this.selectTree('Default');
        }
    }

    ensureSelectedTree() {
        this.ensureDefaultTree();
        if (this.abilityTrees[this.selectedTree] == null)
            this.selectedTree = Object.keys(this.abilityTrees)[0];
    }

    compileAllocationMap() {
        this.potentialAllocationMap = {};

        //cellID : {direction : cellID}
        let undirectedConnectionsMap = {};
        for (let key of Object.keys(this.cellMap)) {
            undirectedConnectionsMap[key] = this.getConnectedCells(key);
        }
        let directedConnectionsMap = {};
        if (this.properties.bTravesableUp)
            directedConnectionsMap = undirectedConnectionsMap;
        else {
            for (let key of Object.keys(undirectedConnectionsMap)) {

                directedConnectionsMap[key] = Object.assign({}, undirectedConnectionsMap[key]);

                if (!this.properties.bTravesableUp)
                    delete directedConnectionsMap[key]['up'];
            }
        }

        // cellID : {abilityID : {distance from ability : int, restrict going sideways : false}}
        let pathwayMap = {};

        for (let cellID of Object.keys(this.cellMap)) {
            if (this.cellMap[cellID]["abilityID"] != null) {
                pathwayMap[cellID] = pathwayMap[cellID] ?? {};
                pathwayMap[cellID][this.cellMap[cellID]["abilityID"]] = {'distance': 0, 'restrictSides': false};
            }
        }

        let currentProcessingTarget = 0;
        let keepGoing;
        do {
            keepGoing = false;
            for (let cellID of Object.keys(pathwayMap)) {

                let pendingAbilityIDs = [];
                for (let abilityID of Object.keys(pathwayMap[cellID])) {
                    if (pathwayMap[cellID][abilityID]['distance'] == currentProcessingTarget)
                        pendingAbilityIDs.push(abilityID);
                }

                if (pendingAbilityIDs.length != 0) {
                    keepGoing = true;

                    for (let connectedCellDirection of Object.keys(directedConnectionsMap[cellID])) {

                        const connectedCellNumber = directedConnectionsMap[cellID][connectedCellDirection];

                        if (this.cellMap[connectedCellNumber]["abilityID"] == null) {

                            pathwayMap[connectedCellNumber] = pathwayMap[connectedCellNumber] ?? {};
                            const restrictSides = (connectedCellDirection == 'down' && this.properties.strictAllocation);

                            for (let parentAbilityID of pendingAbilityIDs) {

                                if (pathwayMap[cellID][parentAbilityID]['restrictSides'] && (connectedCellDirection == 'left' || connectedCellDirection == 'right'))
                                    continue;

                                pathwayMap[connectedCellNumber][parentAbilityID] = pathwayMap[connectedCellNumber][parentAbilityID] ?? {
                                    'distance': currentProcessingTarget + 1,
                                    restrictSides,
                                };
                            }

                        } else {
                            for (let parentAbilityID of pendingAbilityIDs) {

                                if (pathwayMap[cellID][parentAbilityID]['restrictSides'] && (connectedCellDirection == 'left' || connectedCellDirection == 'right'))
                                    continue;

                                const childAbilityID = this.cellMap[connectedCellNumber]["abilityID"];

                                if (parentAbilityID == childAbilityID)
                                    continue;

                                this.potentialAllocationMap[parentAbilityID] = this.potentialAllocationMap[parentAbilityID] ?? {};

                                if (this.potentialAllocationMap[parentAbilityID][childAbilityID] == null) {

                                    this.potentialAllocationMap[parentAbilityID][childAbilityID] = {};

                                    let backtrackProcessingTarget = currentProcessingTarget;
                                    let currentCell = connectedCellNumber;
                                    let lastTravelNode = new TravelNode(this.cellMap[currentCell]['travelNode']);

                                    for (backtrackProcessingTarget; backtrackProcessingTarget >= 0; backtrackProcessingTarget--) {

                                        for (let direction of Object.keys(undirectedConnectionsMap[currentCell])) {

                                            const cellID = undirectedConnectionsMap[currentCell][direction];

                                            if (pathwayMap[cellID] &&
                                                pathwayMap[cellID][parentAbilityID] &&
                                                pathwayMap[cellID][parentAbilityID]['distance'] == backtrackProcessingTarget) {

                                                lastTravelNode[direction] = 2;
                                                this.potentialAllocationMap[parentAbilityID][childAbilityID][currentCell] = lastTravelNode;

                                                currentCell = cellID;
                                                lastTravelNode = new TravelNode(this.cellMap[currentCell]['travelNode']);
                                                lastTravelNode[reverseDirectionDictionary[direction]] = 2;
                                                break;
                                            }
                                        }
                                    }
                                    this.potentialAllocationMap[parentAbilityID][childAbilityID][currentCell] = lastTravelNode;
                                }
                            }
                        }
                    }
                }
            }

            currentProcessingTarget++;

        } while (keepGoing);
    }

    compileCurrentTree() {
        this.ensureStartingAbility();
        this.ensureSelectedTree();
        this.currentTree = {
            'allocatedNodes': {},
            'connectedNodes': {},
            'blockedNodes': {},
            'archetypes': {},
            'abilityPoints': 0,
            'travelNodes': {},
        };
        if (this.startingAbilityID == null || this.abilities[this.startingAbilityID] == null)
            return;

        this.currentTree['connectedNodes'][this.startingAbilityID] = [];
        for (let archetype of this.archetypes) {
            this.currentTree['archetypes'][archetype] = 0;
        }
        for (let abilityID of this.abilityTrees[this.selectedTree]) {
            this.currentTree['allocatedNodes'][abilityID] = false;
        }
        this.abilityTrees[this.selectedTree] = [];

        let allocatableNodes = [];
        do {
            for (let abilityID of allocatableNodes) {
                this.allocateNode(abilityID, false);
            }

            allocatableNodes = [];
            for (let abilityID of Object.keys(this.currentTree['connectedNodes'])) {
                if (this.currentTree['allocatedNodes'][abilityID] == false &&
                    this.isAllocatable(abilityID))
                    allocatableNodes.push(abilityID);
            }
        } while (allocatableNodes.length > 0);

        for (let abilityID of Object.keys(this.currentTree['allocatedNodes']))
            if (!this.currentTree['allocatedNodes'][abilityID])
                delete this.currentTree['allocatedNodes'][abilityID];
    }

    isAllocatable(abilityID) {

        if (this.currentTree['blockedNodes'][abilityID])
            return false;

        if (this.abilities[abilityID].archetype != '' &&
            this.currentTree['archetypes'][this.abilities[abilityID].archetype] < this.abilities[abilityID].archetypePointsRequired)
            return false;

        if (this.abilities[abilityID].requires != -1 &&
            !this.currentTree['allocatedNodes'][this.abilities[abilityID].requires])
            return false;

        return this.currentTree['connectedNodes'][abilityID] != null
            && this.properties.maxAbilityPoints - this.currentTree['abilityPoints'] >= this.abilities[abilityID].pointsRequired;
    }

    allocateNode(abilityID, saveAfter = true) {

        for (let blockedID of this.abilities[abilityID].unlockingWillBlock)
            this.currentTree['blockedNodes'][blockedID] = true;
        if (this.abilities[abilityID].archetype != '')
            this.currentTree['archetypes'][this.abilities[abilityID].archetype] += 1;
        this.currentTree['abilityPoints'] += this.abilities[abilityID].pointsRequired;
        this.currentTree['allocatedNodes'][abilityID] = true;
        this.abilityTrees[this.selectedTree].push(abilityID);

        for (let connectedAbilityID of this.currentTree['connectedNodes'][abilityID])
            this.allocateTravelNodes(connectedAbilityID, abilityID);

        delete this.currentTree['connectedNodes'][abilityID];
        this.addConnectedNodes(abilityID);

        if (saveAfter)
            this.saveState(`Reallocated nodes on '${utils.minecraftToHTML(this.selectedTree)}'`, 'treeAllocation', true);
    }

    deallocateNode(abilityID) {
        this.abilityTrees[this.selectedTree].splice(this.abilityTrees[this.selectedTree].indexOf(abilityID), 1);
        this.compileCurrentTree();
        this.saveState(`Reallocated nodes on '${utils.minecraftToHTML(this.selectedTree)}'`, 'treeAllocation', true);
    }

    addConnectedNodes(abilityID) {
        if (this.potentialAllocationMap[abilityID] == null)
            return;

        for (let connectedAbilityID of Object.keys(this.potentialAllocationMap[abilityID])) {

            if (this.currentTree['allocatedNodes'][connectedAbilityID])
                this.allocateTravelNodes(abilityID, connectedAbilityID);

            else {
                if (this.currentTree['connectedNodes'][connectedAbilityID] == null)
                    this.currentTree['connectedNodes'][connectedAbilityID] = [];
                this.currentTree['connectedNodes'][connectedAbilityID].push(abilityID);
            }
        }
    }

    allocateTravelNodes(originAbilityID, destinationAbilityID) {
        if (this.potentialAllocationMap[originAbilityID][destinationAbilityID] == null)
            return;
        const travelNodeMap = this.potentialAllocationMap[originAbilityID][destinationAbilityID];
        for (let cellID of Object.keys(travelNodeMap)) {
            if (this.currentTree['travelNodes'][cellID] == null)
                this.currentTree['travelNodes'][cellID] = new TravelNode(travelNodeMap[cellID]);
            else
                this.currentTree['travelNodes'][cellID].mergeTravelNodes(travelNodeMap[cellID]);
        }
    }

    getAllocatableNodes() {
        let nodeMap = {};
        for (let abilityID of Object.keys(this.currentTree['connectedNodes']))
            if (this.isAllocatable(abilityID))
                nodeMap[abilityID] = true;
        return nodeMap;
    }

    editTree(name = "", nameFormID = "treeNameInput") {

        const nameInputElement = document.getElementById(nameFormID);

        if (name == "") {
            nameInputElement.value = "";
            nameInputElement.oldName = "";
        } else {
            nameInputElement.value = name;
            nameInputElement.oldName = name;
        }

        nameInputElement.dispatchEvent(new Event('input'));
    }

    saveTree(nameFormID = "treeNameInput") {

        const nameInputElement = document.getElementById(nameFormID);
        if (nameInputElement.value == "")
            return;

        const oldName = nameInputElement.oldName ?? "";
        let newname = nameInputElement.value;

        if (this.abilityTrees[newname] != null && newname != oldName) {
            for (let i = 1; i < 100; i++)
                if (this.abilityTrees[newname + `(${i})`] == null) {
                    newname = newname + `(${i})`;
                    break;
                }
        }

        if (oldName == "") {

            this.abilityTrees[newname] = [];
            this.saveState(`Added tree: ${utils.minecraftToHTML(newname)}`);
            this.selectTree(newname);

        } else {

            this.abilityTrees[newname] = this.abilityTrees[oldName];
            if (this.selectedTree == oldName)
                this.selectedTree = newname;
            delete this.abilityTrees[oldName];
            this.saveState(`Renamed tree: ${utils.minecraftToHTML(oldName)} -> ${utils.minecraftToHTML(newname)}`);
            this.renderTreeNames();

        }
    }

    deleteTree(name) {

        if (typeof name != "string" || name == "")
            return;


        delete this.abilityTrees[name];

        this.ensureSelectedTree();
        this.renderTreeNames();
        this.saveState(`Deleted tree: ${utils.minecraftToHTML(name)}`);

    }

    renderTreeNames(containerID = "treeNameContainer") {

        const container = document.getElementById(containerID);

        container.innerHTML = "";

        for (let treeName of Object.keys(this.abilityTrees)) {

            const div = document.createElement("div");
            div.classList.add('d-inline-flex', 'minecraftTooltip', 'w-100', 'mb-1', 'pt-1');

            if (treeName == this.selectedTree) {

                div.classList.add('selected-ability');

            } else {

                div.addEventListener('click', (e) => {
                    if (e.target.nodeName != 'BUTTON')
                        this.selectTree(treeName);
                });

            }

            const text = document.createElement("div");
            text.classList.add('flex-fill', 'overflow-hidden');
            text.innerHTML = utils.minecraftToHTML(treeName);
            div.appendChild(text);

            const editbtn = document.createElement("button");
            editbtn.classList.add('small-btn', 'me-1', 'ms-2', 'font-default');
            editbtn.type = "button";
            editbtn.style = "background-color: transparent;";
            editbtn.title = "Edit";
            editbtn.innerHTML = "✒️";
            editbtn.setAttribute('data-bs-toggle', 'modal');
            editbtn.setAttribute('data-bs-target', '#treeModal');
            editbtn.addEventListener('click', (e) => this.editTree(treeName));
            div.appendChild(editbtn);

            const delbtn = document.createElement("button");
            delbtn.classList.add('small-btn', 'font-default');
            delbtn.type = "button";
            delbtn.style = "background-color: transparent;";
            delbtn.title = "Delete";
            delbtn.innerHTML = "💀";
            delbtn.addEventListener('click', (e) => this.deleteTree(treeName));
            div.appendChild(delbtn);

            container.appendChild(div);

        }
    }

    selectTree(name) {
        this.selectedTree = name;
        this.compileCurrentTree();
        this.saveState(`Selected '${utils.minecraftToHTML(this.selectedTree)}' tree for allocation`, `${this.selectedTree}`, true);
        this.renderTreeNames();
        this.renderArchetypeCounts();
        this.renderAbilityPointsUsed();
        this.renderTree();
    }

    selectStartingAbility(abilityID) {
        this.startingAbilityID = abilityID;
        this.compileCurrentTree();
        this.saveState(`Made ${utils.minecraftToHTML(this.abilities[abilityID].name)} the starting ability`);
        this.renderArchetypeCounts();
        this.renderAbilityPointsUsed();
        this.renderTree();
    }

    renderStartingAbilityList(startingAbilityInputID = "startingAbilityInput") {

        const startingAbilityInputElement = document.getElementById(startingAbilityInputID);

        startingAbilityInputElement.innerHTML = '';

        let sortedAbilityIDs = this.sortAbilities();
        for (let id of sortedAbilityIDs) {

            const abilityName = utils.anyToHTML(utils.shortenText(utils.stripMinecraftFormatting(this.abilities[id].name), 30));

            const option = document.createElement('option');
            option.value = id;
            option.innerHTML = abilityName;
            if (id == this.startingAbilityID)
                option.selected = true;

            option.classList.add("ability-type-" + this.abilities[id].type);
            startingAbilityInputElement.appendChild(option);

        }
    }

    renderAbilityPointsUsed(containerID = "abilityPointsUsed") {
        const container = document.getElementById(containerID);
        container.innerHTML = `AP: ${this.currentTree['abilityPoints']} / ${this.properties.maxAbilityPoints}`;
    }

    renderArchetypeCounts(containerID = "archetypeCountContainer") {

        let archetypeCounts = {};
        for (let archetype of this.archetypes) {
            archetypeCounts[archetype] = 0;
        }
        for (let ability of Object.values(this.abilities)) {
            if (ability.archetype.length > 0)
                archetypeCounts[ability.archetype]++;
        }

        const container = document.getElementById(containerID);

        container.innerHTML = "";

        for (let archetype of this.archetypes) {

            const div = document.createElement("div");
            div.classList.add('d-inline-flex', 'minecraftTooltip', 'w-100', 'mb-1', 'pt-1');

            const text = document.createElement("div");
            text.classList.add('flex-fill', 'overflow-hidden');
            text.innerHTML = utils.minecraftToHTML(archetype);
            div.appendChild(text);

            const abilityCount = document.createElement("div");
            abilityCount.innerHTML = `${this.currentTree['archetypes'][archetype] ?? 0} / ${archetypeCounts[archetype]}`;
            div.appendChild(abilityCount);

            container.appendChild(div);

        }
    }

    renderTreeForAllocation(tableBodyID = "treeTableBody") {
        const table = document.getElementById(tableBodyID);
        if (table == null)
            return;

        table.innerHTML = '';

        this.setcurrentVerticalPage();

        const CELLSPERPAGE = this.properties.rowsPerPage * COLUMNS;

        const allocatableNodes = this.getAllocatableNodes();

        for (let page = this.currentVerticalPage; page < this.currentVerticalPage + this.properties.pagesDisplayed; page++) {

            const pageRow = document.createElement('tr');
            table.appendChild(pageRow);

            const pageCol = document.createElement('td');
            pageCol.colSpan = COLUMNS;
            pageRow.appendChild(pageCol);

            const pageDiv = document.createElement('div');
            pageDiv.classList.add("page-display");
            pageDiv.innerHTML = `PAGE ${page}`;
            pageCol.appendChild(pageDiv);

            for (let row = 1; row <= this.properties.rowsPerPage; row++) {

                const newRow = document.createElement('tr');
                table.appendChild(newRow);

                for (let col = 1; col <= COLUMNS; col++) {

                    const cellKey = (page - 1) * (CELLSPERPAGE) + (row - 1) * COLUMNS + col;

                    const newCol = document.createElement('td');
                    newCol.id = CELL_ID_PREFIX + cellKey;
                    newRow.appendChild(newCol);

                    const cell = this.cellMap[cellKey];

                    let div = null;

                    if (cell != null) {

                        const travelNode = this.currentTree['travelNodes'][cellKey] ?? cell['travelNode'];
                        let allocationStatus = 0;
                        if (this.currentTree['allocatedNodes'][cell['abilityID']] != null)
                            allocationStatus = 2;
                        else if (allocatableNodes[cell['abilityID']] != null)
                            allocationStatus = 1;
                        else if (this.currentTree['blockedNodes'][cell['abilityID']])
                            allocationStatus = -1;

                        div = generateIconDiv(
                            this.abilities[cell['abilityID']] ? this.abilities[cell['abilityID']].type : null,
                            travelNode,
                            this.properties.classs,
                            allocationStatus,
                            true,
                            true,
                        );

                        if (this.abilities[cell['abilityID']] != null) {

                            switch (allocationStatus) {
                                case 1:
                                    div.addEventListener('click', (e) => {
                                            this.allocateNode(cell['abilityID']);
                                            this.renderTree();
                                            this.renderArchetypeCounts();
                                            this.renderAbilityPointsUsed();
                                        },
                                    );
                                    break;
                                case 2:
                                    div.addEventListener('click', (e) => {
                                            this.deallocateNode(cell['abilityID']);
                                            this.renderTree();
                                            this.renderArchetypeCounts();
                                            this.renderAbilityPointsUsed();
                                        },
                                    );
                                    break;
                                default:
                                    break;
                            }

                            div.addEventListener('pointerover', (e) => {
                                if (e.pointerType !== "touch") this.renderHoverAbilityTooltip(cell['abilityID']);
                            });
                            div.addEventListener('pointerout', (e) => {
                                if (e.pointerType !== "touch") utils.hideHoverAbilityTooltip();
                            });
                            div.addEventListener('touchstart', (e) => {
                                this.#treeTouchProcessor.processTouch(
                                    e,
                                    () => {
                                        switch (allocationStatus) {
                                            case 1:
                                                this.allocateNode(cell['abilityID']);
                                                this.renderTree();
                                                this.renderArchetypeCounts();
                                                this.renderAbilityPointsUsed();
                                                break;
                                            case 2:
                                                this.deallocateNode(cell['abilityID']);
                                                this.renderTree();
                                                this.renderArchetypeCounts();
                                                this.renderAbilityPointsUsed();
                                                break;
                                            default:
                                                break;
                                        }
                                    },
                                    () => {
                                    },
                                    () => {
                                        document.body.style.overflow = 'hidden';
                                        this.renderHoverAbilityTooltip(cell['abilityID']);
                                        utils.moveTooltip(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                                    },
                                    () => {
                                        utils.moveTooltip(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                                    },
                                    () => {
                                        utils.hideHoverAbilityTooltip();
                                        document.body.style.overflow = 'auto';
                                    },
                                );
                            }, {passive: false});
                        }
                    } else {
                        div = document.createElement('div');
                        div.classList.add("centered-element-container");
                    }

                    div.style.userSelect = 'none';
                    newCol.appendChild(div);

                }
            }
        }
    }

    // #endregion
}
