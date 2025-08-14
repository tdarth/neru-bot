const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

class ContainerMessage {
    constructor(content = '', ephemeral = false, mentions = { repliedUser: true, parse: [] }) {
        this.content = content;
        this.flags = MessageFlags.IsComponentsV2;
        this.allowedMentions = mentions;
    }

    setContent(text) {
        this.content = text;
        return this;
    }

    setMentions(object) {
        this.allowedMentions = object;
        return this;
    }

    isEphemeral(bool = true) {
        this.flags = MessageFlags.IsComponentsV2;
        if (bool) {
            this.flags |= MessageFlags.Ephemeral;
        }
        return this;
    }

    build() {
        return {
            flags: this.flags,
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(this.content)
                    )
            ],
            allowedMentions: this.allowedMentions
        };
    }
}

module.exports = ContainerMessage;