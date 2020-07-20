// extends CombatTracker or other modules extension of it.
class ExtendedCombatTracker extends CONFIG.ui.combat {
    static _defaultModifiers = [5, 10, -5, -10];
    static _defaultModifiersSettingsSeparator = ';';

    static defaultModifierSetting() {
        return ExtendedCombatTracker._defaultModifiers.join(ExtendedCombatTracker._defaultModifiersSettingsSeparator);
    }

    _getIndexAfterModifyContextOption(options) {
        return options.findIndex(option => option.name === 'Modify') + 1;
    }

    _getModifierSettings() {
        const settingsString = game.settings.get('combat-ini-modifier', 'modifiers');
        const settings = settingsString
            .split(ExtendedCombatTracker._defaultModifiersSettingsSeparator)
            // settings are strings, numbers are needed.
            .map(modifier => Number(modifier))
            // Disallow non numbers and zero.
            .filter(modifier => !isNaN(modifier) && modifier !== 0);

        return settings.length ? settings : ExtendedCombatTracker._defaultModifiers;
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
        const modifyByStr = modifyBy > 0 ? `+${modifyBy}` : modifyBy;
        return {
            name: `Modify ${modifyByStr}`,
            icon: '<i class="fas fa-edit"></i>',
            callback: li => this._modifiyInitiativeBy(li, modifyBy)
        }
    }

    _getEntryContextOptions() {
        const entryContextOptions = super._getEntryContextOptions();

        let index = this._getIndexAfterModifyContextOption(entryContextOptions);

        const modifiers = this._getModifierSettings();

        modifiers.forEach(modifiedBy => {
            entryContextOptions.splice(index, 0, this._createModifyContextOption(modifiedBy));
            index += 1;
        })

        return entryContextOptions;
    }
}


Hooks.on('init', () => {
    CONFIG.ui.combat = ExtendedCombatTracker;

    game.settings.register('combat-ini-modifier', 'modifiers', {
        name: "List of available modifiers",
        hint: "A list of modifiers separated by a semicolon (;)",
        scope: "world",
        config: true,
        default: ExtendedCombatTracker.defaultModifierSetting(),
        type: String
    })
});