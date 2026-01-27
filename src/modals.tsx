import {insertStringBeforeSelected, minecraftToHTML, preferredDelimiter} from "./utils.ts";
import {tree} from "./index.ts";
import React, {type RefObject, useRef, useState} from "react";
import Modal from "react-bootstrap/Modal";
import * as utils from "./utils.ts";
import {MaxLengthInput} from "./react.tsx";

type StateSetter<T> = (value: ((prevState: T) => T) | T) => void

// const archetypeModal = document.getElementById('archetypeModal');
// const archetypeNameInput = document.getElementById('archetypeNameInput');
// archetypeModal?.addEventListener('shown.bs.modal', () => {
//     archetypeNameInput?.focus();
// });

function preventDefocus(e: React.PointerEvent<HTMLDivElement>) {
    if (!(e.target as HTMLElement).classList.contains('focusable')) e.preventDefault();
}

export function ArchetypeModal({show, setShow}: { show: boolean, setShow: StateSetter<boolean> }) {
    const handleClose = () => setShow(false);

    const inputRef = useRef<HTMLInputElement>(undefined) as RefObject<HTMLInputElement>;

    const [minecraftTooltip, setMinecraftTooltip] = useState<string>("");

    return <>
        <Modal show={show} onHide={handleClose} centered onPointerDown={preventDefocus}
               onEntered={() => inputRef.current?.focus()}>
            <Modal.Header className="justify-content-end">
                <Modal.Title className="fs-5 text-light ms-1 me-auto">Archetype</Modal.Title>
                <div id="archetypeStyleIcons">
                    <ColorPalette/>
                    <FormatterPalette/>
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className="form-floating">
                    <MaxLengthInput labelDefault="ex. Boltslinger" type="text" className="form-control focusable"
                                    id="archetypeNameInput"
                                    autoComplete="off"
                                    placeholder="ex. Boltslinger"
                                    onChange={(e) =>
                                        setMinecraftTooltip(minecraftToHTML(e.currentTarget.value))}
                                    maxLength={150}
                                    inputRef={inputRef}/>
                </div>
                <div className="mt-3 mb-3" style={{backgroundColor: "#110111", height: "1px"}}></div>
                <div className="minecraftTooltip overflow-hidden" dangerouslySetInnerHTML={{ __html: minecraftTooltip}}></div>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-outline-danger focusable"
                        onClick={handleClose}>Close
                </button>
                <button type="button" className="btn btn-outline-success ms-4 focusable"
                        onClick={() => {
                            tree.saveArchetype();
                            handleClose();
                        }}>Save
                </button>
            </Modal.Footer>
        </Modal>
    </>;
}

export function ColorPalette() {
    return <div className="colorContainer" style={{textAlign: "end", maxWidth: "320px", marginLeft: "auto"}}>
        {Object.keys(utils.codeDictionaryColor).filter(x => utils.codeDictionaryColor[x] != null)
            .map(key => {
                return <button key={key}
                               onClick={() => utils.insertStringBeforeSelected(utils.preferredDelimiter + key)}
                               tabIndex={-1}
                               style={{
                                   height: "16px",
                                   width: "16px",
                                   marginRight: "4px",
                                   backgroundColor: utils.codeDictionaryColor[key],
                               }}></button>;
            })}
    </div>;
}

export function FormatterPalette() {
    return <div className="row justify-content-end mt-2" style={{textAlign: "end"}}>
        {/*<button type="button" className="btn btn-secondary me-2 medium-btn" style="width: 100px;" onClick="utils.insertStringBeforeSelected(utils.preferredDelimiter + 'r')">Reset style</button>*/}
        <button type="button" className="btn btn-secondary me-2 fw-bold medium-btn"
                title="Bold"
                onClick={() => insertStringBeforeSelected(`${preferredDelimiter}l`)}>B
        </button>
        <button type="button" className="btn btn-secondary me-2 fst-italic medium-btn"
                title="Italic"
                onClick={() => insertStringBeforeSelected(`${preferredDelimiter}o`)}>I
        </button>
        <button type="button"
                className="btn btn-secondary me-2 text-decoration-underline medium-btn"
                title="Underline"
                onClick={() => insertStringBeforeSelected(`${preferredDelimiter}n`)}>U
        </button>
        <button type="button"
                className="btn btn-secondary me-2 text-decoration-line-through medium-btn"
                title="Strikethrough"
                onClick={() => insertStringBeforeSelected(`${preferredDelimiter}m`)}>S
        </button>
        <input type="color" style={{height: "25px", width: "25px"}}
               className="form-control form-control-color me-3" value="#18f7d1"
               title="Custom color"
               onChange={(e) => insertStringBeforeSelected(preferredDelimiter + e.currentTarget.value)}/>
    </div>;
}
