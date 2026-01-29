import {minecraftToHTML} from "./utils.ts";
import React, {type RefObject, useEffect, useRef, useState} from "react";
import {Modal} from "react-bootstrap";
import {ColorPalette, FormatterPalette, MaxLengthInput, preventDefocus, type StateSetter} from "./react.tsx";
import * as utils from "./utils.ts";
import type Tree from "./tree.tsx";

export function ArchetypeMenu({archetypes, tree}: {
    archetypes: string[],
    tree: RefObject<Tree>,
}) {
    const [editedArchetype, editArchetype] = useState(null as (string | null));

    return <div className="normal-container shown-on-tree-edit">
        <div className="d-flex justify-content-end align-items-center ps-2 pe-2 mt-1">
            <div id="neutralContainer" className="mt-1 overflow-hidden rtl"></div>
            <div className="flex-fill"></div>
            <div className="text-light ms-2">
                ARCHETYPES
            </div>
            <button className="btn btn-secondary btn-sm ms-2" data-bs-toggle="modal"
                    data-bs-target="#archetypeModal" onClick={() => editArchetype("")}>+
            </button>
        </div>
        <ArchetypeSelector archetypes={archetypes} tree={tree} editArchetype={editArchetype}/>
        <ArchetypeModal editedArchetype={editedArchetype} editArchetype={editArchetype}
                        tree={tree}></ArchetypeModal>
    </div>;
}

function ArchetypeSelector({archetypes, tree, editArchetype}: {
    archetypes: string[],
    tree: RefObject<Tree>,
    editArchetype: StateSetter<string | null>
}) {

    const [selectedArchetype, setSelectedArchetype] = useState("");

    return <div className="ms-2 me-2 mt-1 mb-1 overflow-auto" style={{maxHeight: "108px"}}>
        {archetypes.map((archetype, i) => {
            return <ArchetypeOption key={i} archetype={archetype} selectedArchetype={selectedArchetype}
                                    setSelectedArchetype={setSelectedArchetype}
                                    editArchetype={editArchetype} tree={tree}/>;
        })}
    </div>;
}

function ArchetypeOption({key, archetype, selectedArchetype, setSelectedArchetype, editArchetype, tree}: {
    key: number,
    archetype: string,
    selectedArchetype: string,
    setSelectedArchetype: StateSetter<string>,
    editArchetype: StateSetter<string | null>,
    tree: RefObject<Tree>,
}) {
    return <div key={key}
                className={`d-inline-flex minecraftTooltip w-100 mb-1 pt-1${archetype == selectedArchetype ? ' selected-ability' : ''}`}
                onClick={(e) => {
                    if ((e.target as HTMLElement)?.nodeName != 'BUTTON')
                        setSelectedArchetype(archetype == selectedArchetype ? "" : archetype);
                }}
    >
        <div className="flex-fill overflow-hidden"
             dangerouslySetInnerHTML={{__html: utils.minecraftToHTML(archetype)}}/>
        {/*TODO:*/}{/*<div>{placedArchetypeCounts[archetype]}/{archetypeCounts[archetype]}</div>*/}
        <button type="button" title="Edit" style={{backgroundColor: 'transparent'}}
                className="small-btn me-1 ms-2 font-default" onClick={() => {
            editArchetype(archetype);
        }}>✒️
        </button>
        <button type="button" style={{backgroundColor: "transparent"}} title="Delete" className="small-btn font-default"
                onClick={() => {
                    tree.current.deleteArchetype(archetype);
                }}>💀
        </button>
    </div>;
}

function ArchetypeModal({editedArchetype, editArchetype, tree}: {
    editedArchetype: string | null,
    editArchetype: StateSetter<string | null>,
    tree: RefObject<Tree>
}) {
    function handleClose() {
        editArchetype(null);
    }

    const inputRef = useRef<HTMLInputElement>(undefined) as RefObject<HTMLInputElement>;

    const [name, setName] = useState(editedArchetype ?? "");
    useEffect(() => {
        setName(editedArchetype ?? "");
    }, [editedArchetype]);

    return <>
        <Modal show={editedArchetype != null} onHide={handleClose} centered onPointerDown={preventDefocus}
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
                                    value={name}
                                    onInput={(e) => {
                                        setName(e.currentTarget.value);
                                    }}
                                    maxLength={150}
                                    inputRef={inputRef}/>
                </div>
                <div className="mt-3 mb-3" style={{backgroundColor: "#110111", height: "1px"}}></div>
                <div className="minecraftTooltip overflow-hidden"
                     dangerouslySetInnerHTML={{__html: minecraftToHTML(name)}}></div>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-outline-danger focusable"
                        onClick={handleClose}>Close
                </button>
                <button type="button" className="btn btn-outline-success ms-4 focusable"
                        onClick={() => {
                            tree.current.renameArchetype(editedArchetype ?? "", name);
                            handleClose();
                        }}>Save
                </button>
            </Modal.Footer>
        </Modal>
    </>;
}
