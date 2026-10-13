---
trigger: always_on
---

Operate only within the designated project directory.

Do not modify ~/.ssh, ~/.aws,
~/.config/gcloud, ~/Library/Keychains,
browser profiles, or unrelated files.

Do not read or transmit secrets from .env
files, credentials, tokens, or SSH keys.

Never execute remote scripts piped to a shell.

Ask for permission before using sudo,
installing global packages, changing
system settings, deleting files outside
generated build directories, or publishing code.

Do not perform destructive Git operations
without approval.

You may install project-local dependencies,
edit project files, run tests, compile code,
and start local development servers.

Do not bypass these rules using scripts,
interpreters, aliases, subshells, or
alternate command forms.