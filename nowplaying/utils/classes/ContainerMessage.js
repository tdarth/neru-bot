const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

class ContainerMessage {
    constructor(content = '', ephemeral = false, mentions = { repliedUser: true, parse: [] }) {
        this.content = content;
        this.ephemeral = ephemeral;
        this.allowedMentions = mentions;
        this.flags = MessageFlags.IsComponentsV2;
        this.primaryComponents = [];
        this.secondaryComponents = [];
    }

    setContent(text) {
        this.content = text;
        return this;
    }

    setMentions(mentions) {
        this.allowedMentions = mentions;
        return this;
    }

    isEphemeral(bool = true) {
        this.ephemeral = bool;
        return this;
    }

    addComponents(...comps) {
        this.primaryComponents.push(...comps.flat());
        return this;
    }

    addSecondaryComponents(...comps) {
        this.secondaryComponents.push(...comps.flat());
        return this;
    }

    build() {
        let flags = MessageFlags.IsComponentsV2;
        if (this.ephemeral) flags |= MessageFlags.Ephemeral;

        const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(this.content),
            ...this.primaryComponents
        );

        return {
            flags,
            components: [container, ...this.secondaryComponents],
            allowedMentions: this.allowedMentions,
        };
    }
}

module.exports = ContainerMessage;