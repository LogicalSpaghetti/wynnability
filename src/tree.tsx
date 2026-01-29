import type {StateSetter} from "./react.tsx";

type TreeStates = {
    setArchetypes: StateSetter<string[]>
}

export default class Tree {
    setArchetypes;

    constructor({setArchetypes}: TreeStates) {
        this.setArchetypes = setArchetypes;
    }

    renameArchetype(oldName: string, newName: string) {
        this.setArchetypes(archetypes => archetypes.includes(oldName)
            ? archetypes.map(name => name === oldName ? newName : name)
            : archetypes.concat(newName));
    }

    deleteArchetype(archetype: string) {
        this.setArchetypes(archetypes => {
            const index = archetypes.indexOf(archetype);
            if (index == -1) return archetypes;
            console.log(archetypes)
            return archetypes.filter(name => name !== archetype);
        });
        // TODO: update nodes
    }
}
