import * as bootstrap from 'bootstrap';

type CursorToolTipType = { originX: number, originY: number } & HTMLElement;

export function moveTooltip(X: number, Y: number, checkHidden = false) {
    const cursorTooltip = document.getElementById('cursorTooltip') as CursorToolTipType;
    if (!cursorTooltip) return;
    if (checkHidden && cursorTooltip.hidden)
        return;

    cursorTooltip.originX = X;
    cursorTooltip.originY = Y;

    adjustTooltipSize();
}

export function adjustTooltipSize() {
    const cursorTooltip = document.getElementById('cursorTooltip') as CursorToolTipType;
    const X = cursorTooltip.originX ?? 0;
    const Y = cursorTooltip.originY ?? 0;

    let scale = 1;
    if (cursorTooltip.offsetWidth + 24 > window.innerWidth)
        scale = (window.innerWidth - 24) / cursorTooltip.offsetWidth;
    cursorTooltip.style.transform = `scale(${scale})`;

    let leftOffset = (X + cursorTooltip.offsetWidth + 12) > window.innerWidth
        ? window.innerWidth - cursorTooltip.offsetWidth - 12 : X + 5;
    leftOffset = Math.max(leftOffset, 12);

    let upOffset = Y + 2;
    if (Y > (window.innerHeight / 2)) {
        upOffset = Y - cursorTooltip.offsetHeight - 2;
        cursorTooltip.style.transformOrigin = `bottom left`;
    } else
        cursorTooltip.style.transformOrigin = `top left`;

    cursorTooltip.style.top = `${upOffset}px`;
    cursorTooltip.style.left = `${leftOffset}px`;
}

export function hideHoverAbilityTooltip(containerId = "cursorTooltip") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.hidden = true;
    container.innerHTML = "";
}

export function clamp(number: number, min: number, max: number) {
    return Math.max(min, Math.min(number, max));
}

export function shortenText(text: string, maxChars: number, replaceEndWith = "...") {
    if (text.length <= maxChars || maxChars < 1 || text.length < 2)
        return text;

    if (replaceEndWith.length >= text.length)
        replaceEndWith = replaceEndWith.substring(0, text.length);

    return text.substring(0, maxChars - replaceEndWith.length) + replaceEndWith;
}

export function enforceMinMax(inputElementID: string, min: number, max: number) {
    const inputElement = document.getElementById(inputElementID) as HTMLInputElement;
    if (!inputElement) return;

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", doTheThing);
    else doTheThing();

    function doTheThing() {
        inputElement.min = String(min);
        inputElement.max = String(max);

        inputElement.addEventListener('change', () => {

            if (inputElement.hasAttribute('min'))
                inputElement.value = stringMax(inputElement.value, inputElement.min);

            if (inputElement.hasAttribute('max'))
                inputElement.value = stringMin(inputElement.value, inputElement.max);

        }, true);
    }
}

function stringMax(...args: string[]) {
    return String(Math.max(...(args.map(a => Number(a)))));
}

function stringMin(...args: string[]) {
    return String(Math.min(...(args.map(a => Number(a)))));
}

export function showSmallToast(innerHTML = "I'm a toast!", autohide = true, hideDelay = 5000, id = 'smallToast') {
    const container = document.getElementById(id);
    if (!container) return;

    const toastBody = container.querySelector('.toast-body');
    if (toastBody) toastBody.innerHTML = innerHTML;

    bootstrap.Toast.getOrCreateInstance(container, {
        'autohide': autohide,
        'delay': autohide ? hideDelay : undefined,
    }).show();
}

const TAP_LENGTH = 250;
const MIN_SWIPE_DISTANCE = 30;


export class TouchProcessor {

    lastTap = 0;

    tapLength = 250;

    minSwipeDistance = 30;

    startX: number = 0;
    startY: number = 0;

    singeTapTimeoutId: number = 0;
    holdTimeout: number = 0;

    constructor({tapLength = TAP_LENGTH, minSwipeDistance: minSwipeDistance = MIN_SWIPE_DISTANCE} = {}) {
        this.tapLength = isNaN(Number(tapLength)) ? TAP_LENGTH : Math.max(Number(tapLength), 0);
        this.minSwipeDistance = isNaN(Number(minSwipeDistance)) ? MIN_SWIPE_DISTANCE : Math.max(Number(minSwipeDistance), 0);
    }

    processTouch(
        event: TouchEvent,
        singleTapCallback: EventListener,
        doubleTapCallback: EventListener,
        holdStartCallback: EventListener,
        holdMoveCallback: EventListener,
        holdEndCallback: EventListener,
        swipeStartCallback: EventListener,
        swipeMoveCallback: EventListener,
        swipeEndCallback: EventListener) {

        if (this.singeTapTimeoutId) {
            clearTimeout(this.singeTapTimeoutId);
            this.singeTapTimeoutId = 0;
        }

        const currentTime = new Date().getTime();
        const timeSinceLastTap = currentTime - this.lastTap;

        if (timeSinceLastTap < TAP_LENGTH && timeSinceLastTap > 0) {
            event.preventDefault();
            doubleTapCallback(event);
        } else {
            const target = event.target as EventTarget;
            this.startX = event.touches[0].clientX;
            this.startY = event.touches[0].clientY;

            let touchmove: ((e: TouchEvent) => void) | null;
            let touchmoveElectricBoogaloo: (e: TouchEvent) => void | null;
            let touchend: (e: TouchEvent) => void | null;

            let processor = this;

            touchmove = (e) => {
                const deltaX = e.changedTouches[0].clientX - processor.startX;
                const deltaY = e.changedTouches[0].clientY - processor.startY;

                if (deltaX ** 2 + deltaY ** 2 >= processor.minSwipeDistance ** 2) {
                    if (processor.holdTimeout) {
                        clearTimeout(processor.holdTimeout);
                        processor.holdTimeout = 0;
                    }
                    target.removeEventListener("touchend", touchend as EventListener);
                    target.removeEventListener("touchmove", touchmove as EventListener);

                    swipeStartCallback(event);

                    touchmoveElectricBoogaloo = swipeMoveCallback;

                    target.addEventListener("touchmove", touchmoveElectricBoogaloo as EventListener, {passive: true});
                    target.addEventListener("touchend", (e) => {
                        target.removeEventListener("touchmove", touchmoveElectricBoogaloo as EventListener);
                        swipeEndCallback(e);
                    }, {once: true});
                }
            };

            target?.addEventListener("touchmove", touchmove as EventListener, {passive: true});

            this.holdTimeout = setTimeout(
                () => {
                    target.removeEventListener("touchend", touchend as EventListener);
                    target.removeEventListener("touchmove", touchmove as EventListener);
                    holdStartCallback(event);
                    target.addEventListener("touchmove", (e) => holdMoveCallback(e), {passive: true});
                    target.addEventListener("touchend", (e) => {
                        holdEndCallback(e);
                        target.removeEventListener("touchmove", (e) => holdMoveCallback(e));
                    }, {once: true});
                },
                TAP_LENGTH,
            );

            target.addEventListener("touchend", touchend = function () {
                if (processor.holdTimeout) {
                    clearTimeout(processor.holdTimeout);
                    processor.holdTimeout = 0;
                }
                target.removeEventListener("touchmove", touchmove as EventListener);

                const currentTime = new Date().getTime();

                processor.singeTapTimeoutId = setTimeout(
                    () => {
                        singleTapCallback(event);
                        processor.singeTapTimeoutId = 0;
                    },
                    TAP_LENGTH + processor.lastTap - currentTime,
                );
            }, {once: true});
        }
        this.lastTap = currentTime;
    }
}

export type StringTo<T> = { [key: string]: T };
export type NumberTo<T> = { [key: number | string]: T };

export const codeDictionaryGenericSymbols: StringTo<string> = {
    'mana': '§b✺',

    'damage': '§c⚔',
    'neutral': '§6✣',
    'earth': '§2✤',
    'thunder': '§e✦',
    'water': '§b❉',
    'fire': '§c✹',
    'air': '§f❋',

    'effect': '§e✧',
    'duration': '§d⌛',
    'AoE': '§3☀',
    'range': '§a➼',
    'cooldown': '§3⌚',
    'heal': '§d❤',
    'blindness': '§c⬣',
    'slowness': '§c⬤',
};
export const codeDictionaryClassSymbols: StringTo<string> = {
    'focus': '§e➽',

    'winded': '§b≈',
    'dilation': '§3➲',

    'resistance': '§a❁',
    'corrupted': '§4☠',
    'armorbreak': '§c✃',
    'sacred': '§6✧',
    'provoke': '§4💢',
    'invincibility': '§b☗',

    'puppet': '§6⚘',
    'whipped': '§6⇶',
    'awakened': '§f♚',
    'bloodpool': '§4⚕',
    'bleeding': '§c',

    'old clones': '§5',
    'marked': '§c✜',
    'mirror clone': '§#c267f7',
    'mirage clone': '§#f5cfff',
    'shadow clone': '§#d84c4c',
    'tricks': '§#6afa65',
    'confused': '§#e1dca4',
    'contaminated': '§#94a771',
    'enkindled': '§#ff8e8e',
    'noxious': '§#eb3dfe',
    'drained': '§#a1fad9',
};
export const codeDictionaryCommonAbilityAttributes: StringTo<string[]> = {
    'manacost': ['§b✺', '\n§b✺ §7Mana Cost: §f_'],

    'damage': ['§c⚔', '\n§c⚔ §7Total Damage: §f_% §8(of your DPS)'],
    'neutral': ['§6✣', '\n   §8(§6✣ §8Damage: _%)'],
    'earth': ['§2✤', '\n   §8(§2✤ §8Earth: _%)'],
    'thunder': ['§e✦', '\n   §8(§e✦ §8Thunder: _%)'],
    'water': ['§b❉', '\n   §8(§b❉ §8Water: _%)'],
    'fire': ['§c✹', '\n   §8(§c✹ §8Fire: _%)'],
    'air': ['§f❋', '\n   §8(§f❋ §8Air: _%)'],

    'effect': ['§e✧', '\n§e✧ §7Effect: §f_'],
    'duration': ['§d⌛', '\n§d⌛ §7Duration: §f_s'],
    'range': ['§2➼', '\n§2➼ §7Range: §f_ Blocks'],
    'AoE': ['§3☀', '\n§3☀ §7Area of Effect: §f_ Blocks §7(Circle-Shaped)'],
    'cooldown': ['§3⌚', '\n§3⌚ §7Cooldown: §f_s'],
};

export const codeDictionaryColor: StringTo<string> = {
    '0': '#000000',
    '1': '#0000aa',
    '2': '#00aa00',
    '3': '#00aaaa',
    '4': '#aa0000',
    '5': '#aa00aa',
    '6': '#ffaa00',
    '7': '#aaaaaa',
    '8': '#555555',
    '9': '#5555ff',
    'a': '#55ff55',
    'b': '#55ffff',
    'c': '#ff5555',
    'd': '#ff55ff',
    'e': '#ffff55',
    'f': '#ffffff',
    // 'r': null,
    'g': '#87dd47',
    'h': '#ffe14d',
    'i': '#f747c2',
    'j': '#99e9ff',
    'k': '#ff4545',
};
export const codeDictionaryDecoration: StringTo<string> = {
    'm': 'line-through',
    'n': 'underline',
};
export const codeDictionaryStyle: StringTo<string> = {
    'l': 'fw-bold',
    'o': 'fst-italic',
};
export const minecraftDelimiters = ['§', '&'];
export const preferredDelimiter = '§';

export function splitByColorFormats(string: string) {
    let result: { color: null | string, content: string }[] = [
        {
            color: null,
            content: '',
        },
    ];

    if (string.length === 0)
        return result;

    let i = 0;
    for (i; i < string.length; i++) {

        let char = string[i];

        if (!minecraftDelimiters.includes(char)) {
            result[result.length - 1]['content'] += char;
            continue;
        }

        i++;
        if (i >= string.length)
            continue;

        let code = string[i];

        if (code in codeDictionaryColor)
            result.push({color: code, content: ''});

        else if (code == '#' && string.length - i >= 7) {
            const endOfColorCode = i + 6;
            for (i; i < endOfColorCode; i++) {
                code += string[i + 1];
            }
            result.push({color: code, content: ''});

        } else
            result[result.length - 1]['content'] += char + code;
    }

    return result;
}

export function splitByOtherFormats(str = '') {

    let result: { decoration?: string, style?: string, content: string }[] = [
        {
            content: '',
        },
    ];

    if (str.length == 0) return result;

    let i = 0;
    for (i; i < str.length - 1; i++) {

        const char = str[i];

        if (!minecraftDelimiters.includes(char)) {

            result[result.length - 1]['content'] += char;
            continue;

        }

        i++;
        const code = str[i];

        if (code in codeDictionaryStyle)
            result.push({style: code, content: ''});

        else if (code in codeDictionaryDecoration)
            result.push({decoration: code, content: ''});
    }
    if (i < str.length && !minecraftDelimiters.includes(str[str.length - 1]))
        result[result.length - 1]['content'] += str[str.length - 1];

    return result;

}

export function stripMinecraftFormatting(text = "") {

    let result = '';

    const colorSplitArr = splitByColorFormats(text);

    colorSplitArr.forEach(colorSplit => {

        const formatSplitArr = splitByOtherFormats(colorSplit['content']);

        formatSplitArr.forEach(formatSplit => {

            result += formatSplit['content'];
        });
    });

    return result;
}

export function convertToMinecraftTooltip(text: string, id: string) {
    const outputField = document.getElementById(id);
    if (outputField)
        outputField.innerHTML = minecraftToHTML(text);
}

export function insertStringBeforeSelected(insertString: string) {

    const activeElement = document.activeElement as HTMLInputElement;
    if (!activeElement) return;
    if (!activeElement || !(activeElement.type == 'textarea' || activeElement.type == 'text'))
        return;


    if (activeElement.maxLength != -1 && activeElement.value.length + insertString.length > activeElement.maxLength)
        return;

    const currentValue = activeElement.value;
    const cursorPosition = activeElement.selectionStart as number;

    activeElement.value = currentValue.substring(0, cursorPosition) + insertString + currentValue.substring(cursorPosition, currentValue.length);

    activeElement.selectionStart = cursorPosition + insertString.length;
    activeElement.selectionEnd = activeElement.selectionStart;

    activeElement.dispatchEvent(new Event('input'));
}

export function minecraftToHTML(text = "") {
    let result = '';

    const colorSplitArr = splitByColorFormats(text);

    colorSplitArr.forEach(colorSplit => {

        let pendingContent = '';

        let spansToClose = 0;
        let pendingTextDecorations: StringTo<boolean> = {};
        let pendingTextStyles: StringTo<boolean> = {};

        const formatSplitArr = splitByOtherFormats(colorSplit['content']);

        formatSplitArr.forEach(formatSplit => {

            const decoration = formatSplit['decoration'];
            const style = formatSplit['style'];
            const content = formatSplit['content'];

            if (decoration != null && codeDictionaryDecoration[decoration] != null)
                pendingTextDecorations[decoration] = true;

            if (style != null && codeDictionaryStyle[style] != null)
                pendingTextStyles[style] = true;

            if (!content) return;

            spansToClose++;

            const decorations = Object.keys(pendingTextDecorations);
            const styles = Object.keys(pendingTextStyles);
            pendingTextDecorations = {};
            pendingTextStyles = {};
            const bUseDecorations = decorations.length > 0;
            const bUseStyles = styles.length > 0;

            pendingContent += '<span';

            if (bUseDecorations) {
                pendingContent += ' style="text-decoration:';

                for (let decoration of decorations)
                    pendingContent += ' ' + codeDictionaryDecoration[decoration];

                pendingContent += '; text-decoration-thickness: 2px;"';
            }

            if (bUseStyles) {
                pendingContent += ' class="';
                for (let style of styles)
                    pendingContent += ' ' + codeDictionaryStyle[style];
                pendingContent += '"';
            }

            pendingContent += `>${anyToHTML(content)}`;
        });

        if (!pendingContent.length) return;

        const color = colorSplit['color'];

        if (color)
            if (codeDictionaryColor[color])
                result += `<span style="color:${codeDictionaryColor[color]}">`;

            else
                result += `<span style="color:${sanitizeHTML(color)}">`;
        else
            result += '<span>';

        result += pendingContent;

        for (spansToClose; spansToClose >= 0; spansToClose--)
            result += '</span>';
    });

    return result;
}

export function sanitizeHTML(text: string) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function anyToHTML(text = "") {
    return sanitizeHTML(text).replace(/\r\n|\r|\n/g, '<br>').replace(/ /g, '&nbsp;').replace(/-/g, '-&#8288;');
}