// extends CombatTracker or other modules extension of it.
class ExtendedCombatTracker {
    static _defaultModifiers = [5, 10, -5, -10];
    static _defaultModifiersSettingsSeparator = ';';
    static _defaultNegativeResults = false;

    static defaultModifierSetting = () => {
        return ExtendedCombatTracker._defaultModifiers.join(ExtendedCombatTracker._defaultModifiersSettingsSeparator);
    }

    static defaultNegativeResultsSetting = () => {
        return ExtendedCombatTracker._defaultNegativeResults;
    }

    _getIndexAfterModifyContextOption = (options) => {
        return options.findIndex(option => option.name === 'Modify') + 1;
    }

    _getModifierSettings = () => {
        const settingsString = game.settings.get('combat-ini-modifier', 'modifiers');
        const settings = settingsString
            .split(ExtendedCombatTracker._defaultModifiersSettingsSeparator)
            // settings are strings, numbers are needed.
            .map(modifier => Number(modifier))
            // Disallow non numbers and zero.
            .filter(modifier => !isNaN(modifier) && modifier !== 0);

        return settings.length ? settings : ExtendedCombatTracker._defaultModifiers;
    }

    _getNegativeResultsSetting = () => {
        return game.settings.get('combat-ini-modifier', 'negativeResults');
    }

    _modifiyInitiativeBy = (li, modifyBy) => {
        const allowNegativeResults = this._getNegativeResultsSetting();
        const combatant = game.combat.combatants.get(li.data('combatant-id'));

        // Use typecast style used in FoundryVTT.
        let modifiedIni = Math.round(combatant.initiative * 100) / 100 + modifyBy;

        if (!allowNegativeResults) {
            modifiedIni = modifiedIni < 0 ? 0 : modifiedIni;
        }

        // Don't use Combat.updateCombatant to avoid changing turn.
        game.combat.setInitiative(combatant.id, modifiedIni);
    }

    _createModifyContextOption = (modifyBy) => {
        const modifyByStr = modifyBy > 0 ? `+${modifyBy}` : modifyBy;
        return {
            name: `Modify ${modifyByStr}`,
            icon: '<i class="fas fa-edit"></i>',
            callback: li => this._modifiyInitiativeBy(li, modifyBy)
        }
    }

    enhanceContextOptions = (html, contextOptions) => {
        if (game.user.isGM)
        {
            let index = this._getIndexAfterModifyContextOption(contextOptions);

            const modifiers = this._getModifierSettings();

            modifiers.forEach(modifiedBy => {
                contextOptions.splice(index, 0, this._createModifyContextOption(modifiedBy));
                index += 1;
            })
        }

        return contextOptions;
    }

    registerSettings = () => {
        game.settings.register('combat-ini-modifier', 'modifiers', {
            name: "List of available modifiers",
            hint: "A list of modifiers separated by a semicolon (;)",
            scope: "world",
            config: true,
            default: ExtendedCombatTracker.defaultModifierSetting(),
            type: String
        });

        game.settings.register('combat-ini-modifier', 'negativeResults', {
            name: "Allow negative results",
            hint: "Set this if you need initiative results to go below zero",
            scope: "world",
            config: true,
            default: ExtendedCombatTracker.defaultNegativeResultsSetting(),
            type: Boolean
        });
    }

    registerHooks = () => {
        Hooks.on('getCombatTrackerEntryContext', this.enhanceContextOptions);
        Hooks.on('getPF2eCombatTrackerEntryContext', this.enhanceContextOptions);
    }
}

Hooks.on('init', () => {
    const extendedCombatTracker = new ExtendedCombatTracker();
    extendedCombatTracker.registerSettings();
    extendedCombatTracker.registerHooks();
});
