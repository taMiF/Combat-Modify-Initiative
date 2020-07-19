class ExtendedCombatTracker extends CombatTracker {
    _getIndexAfterModifyContextOption(options) {
        return options.findIndex(option => option.name === 'Modify') + 1;
    }

    _modifiyInitiativeBy(li, modifyBy) {
        const combatant = this.combat.getCombatant(li.data('combatant-id'));
        // Use typecast style used in FoundryVTT.
        let modifiedIni = Math.round(combatant.initiative * 100) / 100 + modifyBy;
        modifiedIni = modifiedIni < 0 ? 0 : modifiedIni;
        // Don't use Combat.updateCombatant to avoid changing turn.
        this.combat.setInitiative(combatant._id, modifiedIni);
    }

    _createModifyContextOption(modifyBy) {
        return {
            name: `Modify ${modifyBy}`,
            icon: '<i class="fas fa-edit"></i>',
            callback: li => this._modifiyInitiativeBy(li, modifyBy)
        }
    }

    _getEntryContextOptions() {
        const entryContextOptions = super._getEntryContextOptions();

        const afterIdx = this._getIndexAfterModifyContextOption(entryContextOptions);

        entryContextOptions.splice(afterIdx, 0, this._createModifyContextOption(-10));
        entryContextOptions.splice(afterIdx, 0, this._createModifyContextOption(-5));

        return entryContextOptions;
    }
}


Hooks.on('init', () => {
    CONFIG.ui.combat = ExtendedCombatTracker;
})

// CONFIG.ui.combat = ExtendedCombatTracker;