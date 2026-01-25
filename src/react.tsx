import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import React from "react";
import {loadModal, tree, changeHidden} from "./index.ts";
import {renderSearchResults} from "./custom_presets";
import {convertToMinecraftTooltip, insertStringBeforeSelected, preferredDelimiter} from "./utils.ts";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
);

function App() {
    return <>
        <section className="mt-2 pb-2 pt-2">
            <div className="d-flex justify-content-start align-items-center ps-1 pe-1">
                <button type="button" className="btn btn-primary me-auto" data-bs-toggle="collapse" data-bs-target="#extraSettings"
                        aria-expanded="false" aria-controls="extraSettings">Class Settings
                </button>
                <div id="blindnessToggle" className="ms-1 me-auto d-flex align-items-center" style={{height: "40px"}}>
                    <img id="themeSwitchImage" src="assets/img/abilities/generic/purple_a.png"/>
                </div>
                <button type="button" className="btn btn-primary ms-1 me-2" data-bs-toggle="modal" data-bs-target="#loadModal"
                        onClick={() => {
                            changeHidden(false, [], ['loadinterface']);
                            changeHidden(true, [], ['libraryinterface']);
                        }}
                >Load
                </button>
                <div className="dropdown">
                    <button type="button" className="btn btn-primary dropdown-toggle" title="Display sharing options"
                            data-bs-toggle="dropdown">Share
                    </button>
                    <ul className="p-0 dropdown-menu share-dropdown">
                        <li>
                            <button type="button" onClick={() => navigator.clipboard.writeText(JSON.stringify(tree, null, 0))}
                                    className="dropdown-item mb-1" title="Copies a shareable JSON">Copy
                            </button>
                        </li>
                        <li>
                            <button type="button" onClick={() => tree.downloadJSON()} className="dropdown-item"
                                    title="Saves current configuration in a shareable file">Download
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="collapse" id="extraSettings">
                <form>
                    {/* Prevent implicit submission of the form */}
                    <button type="submit" disabled style={{display: "none"}} aria-hidden="true"></button>
                    <div className="row">
                        <div className="col-xs-12 col-sm-6 col-lg-3 d-flex flex-column align-items-center justify-content-center">
                            <div className="pt-2" style={{width:"85%"}}>
                                <select defaultValue={"archer"} className="form-select form-select-sm mt-1" aria-label="Class selection" id="classSelect"
                                        onInput={() => tree.readProperties()} title="Affects ability icons and default tree">
                                    <option value="archer">Archer</option>
                                    <option value="warrior">Warrior</option>
                                    <option value="assassin">Assassin</option>
                                    <option value="mage">Mage</option>
                                    <option value="shaman">Shaman</option>
                                </select>
                                <div className="d-flex flex-row">
                                    <button type="button" className="btn btn-primary mt-2 me-1" style={{minWidth: "150px", width: "67%"}}
                                            onClick={(e) => tree.loadTreeFromPreset(e.currentTarget)}
                                            title="Loads the in-game tree for the selected class">Load default tree
                                    </button>
                                    <button type="button" className="btn btn-primary mt-2 flex-grow-1" style={{overflow: "hidden"}}
                                            onClick={() => tree.loadEmptyTree()} title="Completely clears tree and settings">Reset
                                    </button>
                                </div>
                                <div className="d-flex flex-row">
                                    <button type="button" className="btn btn-primary mt-2 me-1 col" style={{overflow: "hidden"}}
                                            onClick={()=>tree.removeAllAbilityNodes()}
                                            title="Removes all abilities from the tree (but not from the menu)">Clear abilities
                                    </button>
                                    <button type="button" className="btn btn-primary mt-2 col" style={{overflow: "hidden"}}
                                            onClick={()=>tree.removeAllTravelNodes()} title="Removes all connections from the tree">
                                        Clear paths
                                    </button>
                                </div>
                                <div className="d-flex flex-row">
                                    <button type="button" className="btn btn-primary mt-2 col" style={{overflow: "hidden"}}
                                            onClick={()=>tree.autoformatAbilityNames()}
                                            title="Reformats ability names to match in-game color">Autoformat ability names
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3 pt-3 d-flex flex-column align-items-center">
                            <div className="d-flex flex-row ps-3 align-items-center justify-content-between" style={{width:"85%"}}>
                                    <div className="me-5 text-light"><label htmlFor="maxAbilityPoints" className="form-label">Ability
                                    Points</label></div>
                                <div><input type="number" className="form-control integer settingNumberInput" id="maxAbilityPoints"
                                            onChange={()=>tree.readProperties()}/></div>
                            </div>
                            <div className="d-flex flex-row pt-3 ps-3 align-items-center justify-content-between" style={{width:"85%"}}>
                                <div className="me-5 text-light"><label htmlFor="treePages" className="form-label">Vertical Pages</label>
                                </div>
                                <div><input type="number" className="form-control integer settingNumberInput" id="treePages"
                                            onChange={()=>tree.readProperties()}/></div>
                            </div>
                            <div className="d-flex flex-row pt-3 ps-3 align-items-center justify-content-between" style={{width:"85%"}}>
                                <div className="me-5 text-light"><label htmlFor="horizontalPages" className="form-label">Horizontal
                                    Pages</label></div>
                                <div><input type="number" className="form-control integer settingNumberInput" id="horizontalPages"
                                            disabled onChange={()=>tree.readProperties()}/></div>
                            </div>
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3 pt-3 d-flex flex-column align-items-center">
                            <div className="d-flex flex-row ps-3 align-items-center justify-content-between" style={{width:"85%"}}>
                                <div className="me-5 text-light"><label htmlFor="rowsPerPage" className="form-label">Rows Per Page</label>
                                </div>
                                <div><input type="number" className="form-control integer settingNumberInput" id="rowsPerPage"
                                            onChange={()=>tree.readProperties()}/></div>
                            </div>
                            <div className="d-flex flex-row pt-3 ps-3 align-items-center justify-content-between" style={{width:"85%"}}>
                                <div className="me-5 text-light"><label htmlFor="pagesDisplayed" className="form-label">Pages
                                    displayed</label></div>
                                <div><input type="number" className="form-control integer settingNumberInput" id="pagesDisplayed"
                                            onChange={()=>tree.readProperties()}/></div>
                            </div>
                            <div className="d-flex flex-row pt-3 ps-3 align-items-center justify-content-between" style={{width:"85%"}}>
                                <div className="me-5 text-light"><label htmlFor="startingPage" className="form-label">Starting Page</label>
                                </div>
                                <div><input type="number" className="form-control integer settingNumberInput" id="startingPage"
                                            onChange={()=>tree.readProperties()} disabled/></div>
                            </div>
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3 pt-4 d-flex flex-column align-items-center">
                            <div className="d-flex flex-row ps-3 align-items-center justify-content-between form-check form-switch"
                                 style={{width:"85%"}} title="Whether left and right borders can connect">
                                <label className="form-check-label text-light" htmlFor="loopTreeSwitch">Loop tree</label>
                                <input className="form-check-input me-4" type="checkbox" role="switch" id="loopTreeSwitch"
                                       onInput={()=>tree.readProperties()}/>
                            </div>
                            <div className="d-flex flex-row mt-3 ps-3 align-items-center justify-content-between form-check form-switch"
                                 style={{width:"85%"}} title="Allows allocating nodes directly above">
                                <label className="form-check-label text-light" htmlFor="travelUpSwitch">Travel Up</label>
                                <input className="form-check-input me-4" type="checkbox" role="switch" id="travelUpSwitch"
                                       onInput={()=>tree.readProperties()}/>
                            </div>
                            <div className="d-flex flex-row mt-3 ps-3 align-items-center justify-content-between form-check form-switch"
                                 style={{width:"85%"}} title="Makes L-Shaped connections illegal (like in-game)">
                                <label className="form-check-label text-light" htmlFor="strictAllocationSwitch">Strict
                                    Allocation</label>
                                <input className="form-check-input me-4" type="checkbox" role="switch" id="strictAllocationSwitch"
                                       onInput={()=>tree.readProperties()}/>
                            </div>
                            <div className="d-flex flex-row mt-3 ps-3 align-items-center justify-content-between form-check form-switch"
                                 style={{width:"85%"}} title="Feels warm to the touch">
                                <label className="form-check-label text-light" htmlFor="altIconSwitch">Extra Ability Icons</label>
                                <input className="form-check-input me-4" type="checkbox" role="switch" id="altIconSwitch"
                                       onInput={()=>tree.readProperties()}/>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    <section className="mt-2 pb-2" onContextMenu={(e)=>e.preventDefault()}>
        <div className="row justify-content-center ms-2 me-2">
            <div className="col-xs-12 col-sm-12 col-md-6 p-0" style={{maxWidth: "500px"}}>
                <div className="text-center col shown-on-single-horizontal-page">
                    <img src="assets/img/background/page_up.png" className="page-up-arrow" width="auto" height="40"
                         onClick={()=>tree.incrementVerticalPage(-1)}/>
                        <img src="assets/img/background/orb_edit.png" className="orb-edit shown-on-tree-edit" width="auto"
                             height="40" onClick={()=>tree.setMode(false)}/>
                            <img src="assets/img/background/orb_allocate.png" className="orb-allocate shown-on-allocation" width="auto"
                                 height="40" onClick={()=>tree.setMode(true)}/>
                                <img src="assets/img/background/page_down.png" className="page-down-arrow" width="auto" height="40"
                                     onClick={()=>tree.incrementVerticalPage(1)}/>
                </div>
                <div className="text-center col shown-on-multi-horizontal-page">
                    <img src="assets/img/background/page_up.png" className="page-up-arrow" width="auto" height="40"
                         onClick={()=>tree.incrementVerticalPage(-1)}/>
                        <img src="assets/img/background/page_down.png" className="page-down-arrow" width="auto" height="40"
                             onClick={()=>tree.incrementVerticalPage(1)}/>
                            <img src="assets/img/background/orb_edit.png" className="orb-edit shown-on-tree-edit" width="auto"
                                 height="40" onClick={()=>tree.setMode(false)}/>
                                <img src="assets/img/background/orb_allocate.png" className="orb-allocate shown-on-allocation" width="auto"
                                     height="40" onClick={()=>tree.setMode(true)}/>
                                    <img src="assets/img/background/page_left.png" className="page-left-arrow" width="auto" height="40"
                                         onClick={()=>tree.incrementHorizontalPage(-1)}/>
                                        <img src="assets/img/background/page_right.png" className="page-right-arrow" width="auto" height="40"
                                             onClick={()=>tree.incrementHorizontalPage(1)}/>
                </div>
                <div className="w-100 h-auto"
                     style={{aspectRatio: "406 / 44", backgroundImage: "url(assets/img/background/tree_top.png)", backgroundRepeat: "no-repeat", backgroundSize: "100% auto"}}>
                </div>
                <div className="w-100 h-auto d-flex flex-row"
                     style={{backgroundImage: "url(assets/img/background/tree_scroll.png)", backgroundRepeat: "repeat-y", backgroundSize: "100% auto"}}>
                    <div style={{width: "calc(100% / 406 * 32)"}} onPointerEnter={()=>tree.continueEditWithloopedNode(-1)}></div>
                    <table className="w-100 m-0" style={{tableLayout: "fixed"}}
                           onWheel={(e) => {
                               e.preventDefault();
                               tree.incrementVerticalPage(e.deltaY > 0 ? 1 : -1);
                           }}>
                        <tbody id="treeTableBody"></tbody>
                    </table>
                    <div id="rightTreeBoundary" style={{width: "calc(100% / 406 * 34)"}}
                         onPointerEnter={()=>tree.continueEditWithloopedNode(1)}></div>
                </div>
                <div className="w-100 h-auto"
                     style={{aspectRatio: "406 / 44", backgroundImage: "url(assets/img/background/tree_bot.png)", backgroundRepeat: "no-repeat", backgroundSize: "100% auto"}}>
                </div>
                <div className="text-center col shown-on-single-horizontal-page">
                    <img src="assets/img/background/page_up.png" className="page-up-arrow" width="auto" height="40"
                         onClick={()=>tree.incrementVerticalPage(-1)}/>
                        <img src="assets/img/background/orb_edit.png" className="orb-edit shown-on-tree-edit" width="auto"
                             height="40" onClick={()=>tree.setMode(false)}/>
                            <img src="assets/img/background/orb_allocate.png" className="orb-allocate shown-on-allocation" width="auto"
                                 height="40" onClick={()=>tree.setMode(true)}/>
                                <img src="assets/img/background/page_down.png" className="page-down-arrow" width="auto" height="40"
                                     onClick={()=>tree.incrementVerticalPage(1)}/>
                </div>
                <div className="text-center col shown-on-multi-horizontal-page">
                    <img src="assets/img/background/page_up.png" className="page-up-arrow" width="auto" height="40"
                         onClick={()=>tree.incrementVerticalPage(-1)}/>
                        <img src="assets/img/background/page_down.png" className="page-down-arrow" width="auto" height="40"
                             onClick={()=>tree.incrementVerticalPage(1)}/>
                            <img src="assets/img/background/orb_edit.png" className="orb-edit shown-on-tree-edit" width="auto"
                                 height="40" onClick={()=>tree.setMode(false)}/>
                                <img src="assets/img/background/orb_allocate.png" className="orb-allocate shown-on-allocation" width="auto"
                                     height="40" onClick={()=>tree.setMode(true)}/>
                                    <img src="assets/img/background/page_left.png" className="page-left-arrow" width="auto" height="40"
                                         onClick={()=>tree.incrementHorizontalPage(-1)}/>
                                        <img src="assets/img/background/page_right.png" className="page-right-arrow" width="auto" height="40"
                                             onClick={()=>tree.incrementHorizontalPage(1)}/>
                </div>
            </div>
            <div className="d-flex flex-column col-xs-12 col-sm-12 col-md-5 col-lg-5 ms-md-4 p-0" style={{maxWidth: "500px"}}>
                <div className="normal-container shown-on-tree-edit">
                    <div className="d-flex justify-content-end align-items-center ps-2 pe-2 mt-1">
                        <div id="neutralContainer" className="mt-1 overflow-hidden rtl"></div>
                        <div className="flex-fill"></div>
                        <div className="text-light ms-2">
                            ARCHETYPES
                        </div>
                        <button className="btn btn-secondary btn-sm ms-2" data-bs-toggle="modal"
                                data-bs-target="#archetypeModal" onClick={()=>tree.editArchetype()}>+</button>
                    </div>
                    <div className="ms-2 me-2 mt-1 mb-1 overflow-auto" style={{maxHeight: "108px"}} id="archetypeContainer"></div>
                </div>
                <div className="flex-grow-1 position-relative mt-2 mb-2 shown-on-tree-edit" style={{minHeight: "400px"}}>
                    <div className="position-absolute normal-container" style={{left: 0, top: 0, width: "100%", height: "100%"}}>
                        <div className="d-flex justify-content-end align-items-center ps-2 pe-2 mt-2">
                            <input type="text" className="generic-background text-light" style={{minWidth: "60px"}}
                                   id="abilitySearch" placeholder="Search..."
                                   onInput={()=>{
                                       tree.selectedAbilityID = -1;
                                       tree.renderAbilities()
                                   }}/>
                                <div className="me-auto ms-2">
                                    <input className="btn-check" type="checkbox" id="notOnTreeFilter" hidden
                                           style={{position: "absolute"}}
                                           onInput={()=>{
                                               tree.selectedAbilityID = -1;
                                               tree.renderAbilities();
                                           }} checked={true}/>
                                        <label className="btn btn-outline-success" style={{height: "25px", width: "25px"}}
                                               htmlFor="notOnTreeFilter" title="Filter abilities that are not on the tree"><span
                                            style={{position: "relative", top: "-18px", left: "-13.5px", fontSize: "30px"}}>❁</span></label>
                                </div>
                                <div className="text-light ms-2">
                                    ABILITIES
                                </div>
                                <button className="btn btn-secondary btn-sm ms-2" data-bs-toggle="modal"
                                        data-bs-target="#abilityModal" onClick={()=>tree.editAbility()}>
                                    +
                                </button>
                        </div>
                        <div className="m-2 overflow-auto position-relative" style={{height: "calc(100% - 51px)"}}
                             id="abilityContainer"></div>
                    </div>
                </div>
                <div className="shown-on-allocation normal-container">
                    <div className="d-flex justify-content-end align-items-center ps-2 pe-2 mt-1 mb-2">
                        <div className="text-light me-2 text-center w-50">
                            Starting Ability:
                        </div>
                        <select className="form-select mt-2 focusable" id="startingAbilityInput" aria-label="Starting ability"
                                onInput={(e)=>tree.selectStartingAbility(e.currentTarget.value)}></select>
                    </div>
                </div>
                <div className="shown-on-allocation mt-2 normal-container">
                    <div className="m-2 mb-1 overflow-auto" style={{maxHeight: "204px"}} id="archetypeCountContainer"></div>
                </div>
                <div className="flex-grow-1 position-relative mt-2 mb-2 shown-on-allocation" style={{minHeight: "400px"}}>
                    <div className="position-absolute normal-container" style={{left: 0, top: 0, width: "100%", height: "100%"}}>
                        <div className="d-flex justify-content-between align-items-center ps-2 pe-2 mt-2">
                            <div className="minecraftTooltip pt-2 overflow-hidden col" style={{background: "none", border: "none"}}>
                                <span className="shown-on-allocation" id="abilityPointsUsed"></span>
                            </div>
                            <div className="text-light ms-2 me-2">
                                TREES
                            </div>
                            <button className="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#treeModal"
                                    onClick={()=>tree.editTree()}>
                                +
                            </button>
                        </div>
                        <div className="m-2 overflow-auto position-relative" style={{height: "calc(100% - 51px)"}}
                             id="treeNameContainer"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section className="mt-2 d-flex p-3 justify-content-center">
        <div className="text-light d-flex flex-column justify-content-between align-items-center" style={{width: "100px"}}>
            <div className="d-flex flex-column align-items-center">
                <div className="fw-bold mb-1">HISTORY</div>
                <div>
                    <button title="Undo" onClick={()=>tree.loadStateIncrementally(-1)}>&lt;</button>
                    <button title="Redo" onClick={()=>tree.loadStateIncrementally(1)}>&gt;</button>
                </div>
            </div>
            <div className="mt-5 mb-2 d-flex flex-column align-items-center">
                <div className="text-light"><label htmlFor="maxSaveStates" className="form-label">Record last</label></div>
                <div><input type="number" value="10" className="form-control integer" style={{width: "80px"}} id="maxSaveStates"/>
                </div>
                <div className="mt-1">changes</div>
            </div>
        </div>
    </section>
    <div className="ms-3 p-1 text-light overflow-auto generic-background" id="historyContainer"
         style={{width: "100%", maxHeight: "352px", maxWidth: "900px"}}>
    </div>
    <div className="modal" id="loadModal" tabIndex={-1} aria-labelledby="Load Modal" aria-hidden="true">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header text-light" data-bs-theme="dark">
                    <h1 className="modal-title fs-5 overflow-hidden text-nowrap" id="exampleModalLabel">Load a custom tree</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <div id="loadinterface">
                        <input type="text" id="json-container" className="overflow-hidden generic-background text-light"
                               style={{minWidth: "40px", width: "100%"}} onFocus={(e)=>e.currentTarget.value = ''}
                               placeholder="Paste the JSON here"
                               onPaste={e=> {
                                   setTimeout( () => {
                                       try {
                                           tree.loadTreeFromField();
                                           loadModal.hide();
                                       } catch (error) {
                                           e.currentTarget.select();
                                       }
                                       e.currentTarget.value = '';
                                   }, 0); // TODO: why 0 delay delay? "its an async function and as i understood this is a way to run it" - punscake TEST
                               }}/>
                            <div className="d-flex mt-2 mb-2">
                                <button type="button" className="btn btn-primary me-2 flex-fill"
                                        onClick={()=>document.getElementById('autoFileInput')?.click()}
                                        onMouseOver={()=>{
                                            changeHidden(false, [], ['selectFileTip']);
                                            changeHidden(true, [], ['browseLibraryTip']);
                                        }}
                                >Select a file
                                </button>
                                <input hidden type="file" id="autoFileInput" accept=".json,.txt"
                                       onChange={(e) => {
                                           tree.loadTreeFromFile(e.currentTarget?.files?.[0]);
                                           loadModal.hide();
                                       }}/>
                                <button type="button" className="btn btn-primary flex-fill"
                                        onMouseOver={() => {
                                            changeHidden(false, [], ['browseLibraryTip']);
                                            changeHidden(true, [], ['selectFileTip']);
                                        }}
                                        onClick={()=>{
                                            changeHidden(false, [], ['libraryinterface']);
                                            changeHidden(true, [], ['loadinterface']);
                                            renderSearchResults();
                                        }}>
                                    Browse library
                                </button>
                            </div>
                            <div className="minecraftTooltip p-2 hide-cursor-coarse hide-cursor-none">
                                <div id="selectFileTip">
                                    <p>Select a file from your device</p>
                                    <p>TIP: Dragging and dropping the file onto the page also works</p>
                                </div>
                                <div id="browseLibraryTip" hidden>
                                    <p>Custom classes and reworks made by the community</p>
                                    <p>TIP: If you want your work to be featured, contact me (punscake) on discord</p>
                                </div>
                            </div>
                    </div>
                    <div id="libraryinterface" hidden>
                        <input type="text" id="customSearch" className="overflow-hidden generic-background text-light"
                               style={{minWidth: "40px", width: "100%"}} placeholder="Search..."
                               onInput={()=>renderSearchResults()}/>
                            <div className="d-flex mt-2 mb-2">
                                <select className="form-select form-select-sm me-3" aria-label="Class filter" id="customClassSelect"
                                        onInput={()=>renderSearchResults()} title="Select reworked class">
                                    <option value="all">All</option>
                                    <option value="archer">Archer</option>
                                    <option value="warrior">Warrior</option>
                                    <option value="assassin">Assassin</option>
                                    <option value="mage">Mage</option>
                                    <option value="shaman">Shaman</option>
                                    <option value="custom">Custom</option>
                                </select>
                                <button type="button" className="btn btn-primary col-5 ms-2"
                                        onMouseOver={()=>{
                                            changeHidden(false, [], ['browseLibraryTip']);
                                            changeHidden(true, [], ['selectFileTip']);
                                        }}
                                        onClick={()=>{
                                            changeHidden(false, [], ['loadinterface']);
                                            changeHidden(true, [], ['libraryinterface']);
                                        }}
                                >Back
                                </button>
                            </div>
                            <div id="customPresetContainer" className="p-2 generic-background"
                                 style={{borderRadius: "2px", maxHeight: "50vh", overflow: "auto"}}>
                            </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <div className="modal fade" id="archetypeModal" tabIndex={-1} aria-labelledby="Archetype Edit" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered"
             onPointerDown={(e)=> {
                 if (!e.currentTarget.classList.contains('focusable')) e.preventDefault();
             }}>

            <div className="modal-content">

                <form>
                    {/* Prevent implicit submission of the form */}
                    <button type="submit" disabled style={{display: "none"}} aria-hidden="true"></button>
                    <div className="modal-header justify-content-end">
                        <h1 className="modal-title fs-5 text-light ms-1 me-auto" id="archetypeModalLabel">Archetype</h1>
                        <div id="archetypeStyleIcons">
                            <div className="colorContainer" style={{textAlign: "end"}}></div>
                            <div className="row justify-content-end mt-2" style={{textAlign: "end"}}>
                                {/*<button type="button" className="btn btn-secondary me-2 medium-btn" style="width: 100px;" onClick="utils.insertStringBeforeSelected(utils.preferredDelimiter + 'r')">Reset style</button>*/}
                                <button type="button" className="btn btn-secondary me-2 fw-bold medium-btn" title="Bold"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}l`)}>B
                                </button>
                                <button type="button" className="btn btn-secondary me-2 fst-italic medium-btn" title="Italic"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}o`)}>I
                                </button>
                                <button type="button" className="btn btn-secondary me-2 text-decoration-underline medium-btn"
                                        title="Underline"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}n`)}>U
                                </button>
                                <button type="button" className="btn btn-secondary me-2 text-decoration-line-through medium-btn"
                                        title="Strikethrough"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}m`)}>S
                                </button>
                                <input type="color" style={{height: "25px", width: "25px"}}
                                       className="form-control form-control-color me-3" value="#18f7d1" title="Custom color"
                                       onChange={(e) => insertStringBeforeSelected(preferredDelimiter + e.currentTarget.value)}/>
                            </div>
                        </div>
                    </div>
                    <div className="modal-body">
                        <div className="form-floating">
                            <input type="text" className="form-control focusable" id="archetypeNameInput" autoComplete="off"
                                   placeholder="ex. Boltslinger"
                                   onInput={(e)=>convertToMinecraftTooltip(e.currentTarget.value, 'archetypeTooltip')} maxLength={150}/>
                                <label className="maxlength-label" htmlFor="archetypeNameInput">ex. Boltslinger</label>
                        </div>
                        <div className="mt-3 mb-3" style={{backgroundColor: "#110111", height: "1px"}}></div>
                        <div className="minecraftTooltip overflow-hidden" id="archetypeTooltip"></div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-danger focusable" data-bs-dismiss="modal">Close
                        </button>
                        <button type="button" className="btn btn-outline-success ms-4 focusable" data-bs-dismiss="modal"
                                onClick={()=>tree.saveArchetype()}>Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div className="modal fade modal-lg" id="abilityModal" tabIndex={-1} aria-labelledby="Ability Edit" aria-hidden="true"
         data-bs-backdrop="static">
        <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "600px"}}
             onPointerDown={(e)=>{
                 if (!e.currentTarget.classList.contains('focusable')) e.preventDefault()
             }}>
            <div className="modal-content">
                <form>
                    {/*Prevent implicit submission of the form*/}
                    <button type="submit" disabled style={{display: "none"}} aria-hidden="true"></button>
                    <div className="modal-header justify-content-end">
                        <div>
                            <div className="genericUnicodeContainer" style={{textAlign: "end"}}></div>
                            <div className="classUnicodeContainer mt-1" style={{textAlign: "end"}}></div>
                            <div className="commonAbilityUnicodeContainer mt-1" style={{textAlign: "end"}}></div>
                            <div className="colorContainer mt-1" style={{textAlign: "end"}}></div>
                            <div className="row justify-content-end mt-2" style={{textAlign: "end"}}>
                                {/*<button type="button" className="btn btn-secondary me-2 medium-btn" style="width: 100px;" onClick="utils.insertStringBeforeSelected(utils.preferredDelimiter + 'r')">Reset style</button>*/}
                                <button type="button" className="btn btn-secondary me-2 fw-bold medium-btn" title="Bold"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}l`)}>B
                                </button>
                                <button type="button" className="btn btn-secondary me-2 fst-italic medium-btn" title="Italic"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}o`)}>I
                                </button>
                                <button type="button" className="btn btn-secondary me-2 text-decoration-underline medium-btn"
                                        title="Underline"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}n`)}>U
                                </button>
                                <button type="button" className="btn btn-secondary me-2 text-decoration-line-through medium-btn"
                                        title="Strikethrough"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}m`)}>S
                                </button>
                                <input type="color" style={{height: "25px", width: "25px"}}
                                       className="form-control form-control-color me-3" value="#18f7d1" title="Custom color"
                                       onChange={(e)=>insertStringBeforeSelected(preferredDelimiter + e.currentTarget.value)}/>
                            </div>
                        </div>
                    </div>
                    <div className="modal-body">
                        <div className="form-floating">
                            <input type="text" className="form-control focusable" id="abilityNameInput" autoComplete="off"
                                   placeholder="Name" onInput={()=>tree.renderEditorAbilityTooltip()} maxLength={200}/>
                                <label className="maxlength-label" htmlFor="abilityNameInput">Name</label>
                        </div>
                        <div className="form-floating mt-2">
                        <textarea style={{minHeight: "200px"}} className="form-control focusable"
                                  id="abilityDescriptionInput" autoComplete="off" placeholder="Description"
                                  onInput={()=>tree.renderEditorAbilityTooltip()} maxLength={1500}></textarea>
                            <label className="maxlength-label" htmlFor="abilityDescriptionInput">Description</label>
                        </div>
                        <div className="btn-group dropup w-100 mt-2">
                            <button className="form-select" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside"
                                    aria-expanded="false" style={{textAlign: "start"}}>
                                Unlocking will block (<span id="abilityBlockCountDisplay"></span>)
                            </button>
                            <ul className="dropdown-menu w-100" id="abilityBlockInput"
                                style={{maxHeight: "363px", overflowY: "auto", overflowX: "hidden"}}></ul>
                        </div>
                        <select className="form-select mt-2 focusable" id="abilityArchetypeInput" aria-label="Archetype"
                                onInput={()=>tree.renderEditorAbilityTooltip()}></select>
                        <div className="d-flex align-items-center justify-content-between w-100 mt-2 ps-1">
                            <div className="me-5 text-light"><label htmlFor="pointsRequiredInput" className="form-label">Points
                                Required</label></div>
                            <div><input type="number" min="0" max="8" value="1" className="form-control focusable integer"
                                        style={{width: "80px"}} id="pointsRequiredInput"
                                        onChange={()=>tree.renderEditorAbilityTooltip()}/></div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between w-100 mt-2 ps-1">
                            <div className="me-5 text-light"><label htmlFor="archetypePointsRequiredInput" className="form-label">Archetype
                                Points Required</label></div>
                            <div><input type="number" min="0" max="8" value="0" className="form-control focusable integer"
                                        style={{width: "80px"}} id="archetypePointsRequiredInput"
                                        onChange={()=>tree.renderEditorAbilityTooltip()}/></div>
                        </div>
                        <select className="form-select mt-2 focusable" id="abilityPrerequiseteInput"
                                aria-label="Prerequisite ability" onInput={()=>tree.renderEditorAbilityTooltip()}></select>
                        <div className="mt-3 mb-3" style={{backgroundColor: "#110111", height: "1px"}}></div>
                        <div className="minecraftTooltip" id="editAbilityTooltip"></div>
                    </div>
                    <div className="modal-footer justify-content-between">
                        <div className="d-flex justify-content-between align-items-center flex-fill"
                             id="abilityTypeInput"></div>
                        <div>
                            <button type="button" className="btn btn-outline-danger focusable" data-bs-dismiss="modal">Close
                            </button>
                            <button type="button" className="btn btn-outline-success ms-4 focusable"
                                    onClick={()=>tree.saveAbility()} data-bs-dismiss="modal">Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div className="modal fade" id="treeModal" tabIndex={-1} aria-labelledby="Tree name edit" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered"
             onPointerDown={(e)=>{
                 if (!e.currentTarget.classList.contains('focusable')) e.preventDefault();
             }}>
            <div className="modal-content">
                <form>
                    {/* Prevent implicit submission of the form */}
                    <button type="submit" disabled style={{display: "none"}} aria-hidden="true"></button>
                    <div className="modal-header justify-content-end">
                        <h1 className="modal-title fs-5 text-light ms-1 me-auto" id="treeModalLabel">Tree Name</h1>
                        <div>
                            <div className="colorContainer" style={{textAlign: "end"}}></div>
                            <div className="row justify-content-end mt-2" style={{textAlign: "end"}}>
                                {/*<button type="button" className="btn btn-secondary me-2 medium-btn" style="width: 100px;" onClick="utils.insertStringBeforeSelected(utils.preferredDelimiter + 'r')">Reset style</button>*/}
                                <button type="button" className="btn btn-secondary me-2 fw-bold medium-btn" title="Bold"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}l`)}>B
                                </button>
                                <button type="button" className="btn btn-secondary me-2 fst-italic medium-btn" title="Italic"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}o`)}>I
                                </button>
                                <button type="button" className="btn btn-secondary me-2 text-decoration-underline medium-btn"
                                        title="Underline"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}n`)}>U
                                </button>
                                <button type="button" className="btn btn-secondary me-3 text-decoration-line-through medium-btn"
                                        title="Strikethrough"
                                        onClick={()=>insertStringBeforeSelected(`${preferredDelimiter}m`)}>S
                                </button>
                            {/* <input type="color" style="height: 25px; width: 25px;" className="form-control form-control-color me-3" value="#18f7d1" title="Custom color" onchange="utils.insertStringBeforeSelected(utils.preferredDelimiter + value)"> */}
                            </div>
                        </div>
                    </div>
                    <div className="modal-body">
                        <div className="form-floating">
                            <input type="text" className="form-control focusable" id="treeNameInput" autoComplete="off"
                                   placeholder="ex. Mango Tree"
                                   onInput={(e)=>convertToMinecraftTooltip(e.currentTarget.value, 'treeTooltip')} maxLength={100}/>
                                <label className="maxlength-label" htmlFor="treeNameInput">ex. Mango Tree</label>
                        </div>
                        <div className="mt-3 mb-3" style={{backgroundColor: "#110111", height: "1px"}}></div>
                        <div className="minecraftTooltip overflow-hidden" id="treeTooltip"></div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-danger focusable" data-bs-dismiss="modal">Close
                        </button>
                        <button type="button" className="btn btn-outline-success ms-4 focusable" data-bs-dismiss="modal"
                                onClick={()=>tree.saveTree()}>Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div className="toast align-items-center" id="smallToast" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
                <div className="toast-body"></div>
                <button type="button" className="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>
    <div className="minecraftTooltip overflow-hidden pe-none" id="cursorTooltip" hidden></div>
    <script type="module" src="src/index.ts"></script>
</>;
}