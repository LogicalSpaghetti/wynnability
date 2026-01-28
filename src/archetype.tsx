import {minecraftToHTML} from "./utils.ts";
import {tree} from "./index.ts";
import React, {type RefObject, useRef, useState} from "react";
import Modal from "react-bootstrap/Modal";
import {ColorPalette, FormatterPalette, MaxLengthInput, preventDefocus, type StateSetter} from "./react.tsx";
import * as utils from "./utils.ts";

// TODO: find a way to communicate to the modal what Archetype is being edited, and to add a new Archetype.

export function ArchetypeMenu({archetypes, setArchetypes}: {
    archetypes: string[],
    setArchetypes: StateSetter<string[]>
}) {
    const [show, setShow] = useState(false);

    function deleteArchetype(archetype: string) {
        setArchetypes(archetypes => archetypes.filter(name => name !== archetype));
    }

    return <div className="normal-container shown-on-tree-edit">
        <div className="d-flex justify-content-end align-items-center ps-2 pe-2 mt-1">
            <div id="neutralContainer" className="mt-1 overflow-hidden rtl"></div>
            <div className="flex-fill"></div>
            <div className="text-light ms-2">
                ARCHETYPES
            </div>
            <button className="btn btn-secondary btn-sm ms-2" data-bs-toggle="modal"
                    data-bs-target="#archetypeModal" onClick={() => tree.editArchetype()}>+
            </button>
        </div>
        <ArchetypeSelector archetypes={archetypes} deleteArchetype={deleteArchetype} setShow={setShow}/>
        <button onClick={() => setShow(true)}>Show</button>
        <ArchetypeModal show={show} setShow={setShow}></ArchetypeModal>
    </div>;
}

function ArchetypeSelector({archetypes, deleteArchetype, setShow}: {
    archetypes: string[],
    deleteArchetype: (archetype: string) => void,
    setShow: StateSetter<boolean>
}) {

    const [selectedArchetype, setSelectedArchetype] = useState("");

    return <div className="ms-2 me-2 mt-1 mb-1 overflow-auto" style={{maxHeight: "108px"}}>
        {archetypes.map((archetype, i) => {
            return <ArchetypeOption key={i} archetype={archetype} selectedArchetype={selectedArchetype}
                                    setSelectedArchetype={setSelectedArchetype}
                                    setShow={setShow} deleteArchetype={deleteArchetype}/>;
        })}
    </div>;
}

function ArchetypeOption({key, archetype, selectedArchetype, setSelectedArchetype, setShow, deleteArchetype}: {
    key: number,
    archetype: string,
    selectedArchetype: string,
    setSelectedArchetype: StateSetter<string>,
    setShow: StateSetter<boolean>,
    deleteArchetype: ((archetype: string) => void)
}) {
    return <div key={key}
                className={`d-inline-flex minecraftTooltip w-100 mb-1 pt-1${archetype == selectedArchetype ? ' selected-ability' : ''}`}
                onClick={(e) => {
                    if ((e.currentTarget as HTMLElement)?.nodeName != 'BUTTON')
                        setSelectedArchetype(archetype == selectedArchetype ? "" : archetype);
                }}
    >
        <div className="flex-fill overflow-hidden"
             dangerouslySetInnerHTML={{__html: utils.minecraftToHTML(archetype)}}/>
        <div>{placedArchetypeCounts[archetype]}/{archetypeCounts[archetype]}</div>
        <button type="button" title="Edit" style={{backgroundColor: 'transparent'}}
                className="small-btn me-1 ms-2 font-default" onClick={() => {
            setSelectedArchetype(archetype);
            setShow(true);
        }}>✒️
        </button>
        <button type="button" style={{backgroundColor: "transparent"}} title="Delete" className="small-btn font-default"
                onClick={() => {
                    deleteArchetype(archetype);
                }}>💀
        </button>
    </div>;
}

function ArchetypeModal({show, setShow}: { show: boolean, setShow: StateSetter<boolean> }) {
    const handleClose = () => setShow(false);

    const inputRef = useRef<HTMLInputElement>(undefined) as RefObject<HTMLInputElement>;

    const [minecraftTooltip, setMinecraftTooltip] = useState<string>("");

    return <>
        <Modal show={show} onHide={handleClose} centered onPointerDown={preventDefocus}
               onEntered={() => inputRef.current?.focus()}>
            <Modal.Header className="justify-content-end">
                <Modal.Title className="fs-5 text-light ms-1 me-auto">Archetype</Modal.Title>
                <div>
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
                <div className="minecraftTooltip overflow-hidden"
                     dangerouslySetInnerHTML={{__html: minecraftTooltip}}></div>
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
