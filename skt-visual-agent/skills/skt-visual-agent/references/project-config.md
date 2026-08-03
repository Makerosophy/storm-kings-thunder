# SKT project configuration

Resolve paths without guessing or embedding machine-specific locations:

1. When the active workspace contains both `skt-visual-agent/data` and `src/content/blog`, use its root as `campaign_root`.
2. Otherwise, read the first available private JSON configuration from:
   - the file named by `SKT_VISUAL_AGENT_CONFIG`, when set;
   - `skt-visual-agent/config/local.json` in the active workspace;
   - `${XDG_CONFIG_HOME}/skt-visual-agent/config.json`, when `XDG_CONFIG_HOME` is set;
   - the current user's `.config/skt-visual-agent/config.json`.
3. Use `campaign_root/skt-visual-agent/data` for registries and visual style, `campaign_root/skt-visual-agent/scripts` for scripts, and `campaign_root/src/content/blog` for historical continuity.
4. Resolve portrait filenames from `portrait_root` in the private configuration. Never search unrelated user directories for a missing portrait.
5. If `campaign_root`, a required registry, or a required portrait cannot be resolved, report what is missing and stop before generation.

The private configuration follows `skt-visual-agent/config/local.example.json`. Treat the repository, blog, private configuration, and original portraits as read-only during ordinary scene resolution and generation. Never include private paths in prompts or user-visible output unless needed to explain a missing file.
